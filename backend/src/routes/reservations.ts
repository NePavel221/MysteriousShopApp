import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { db } from '../db/database.js'

const router = Router()

// Настройка multer для загрузки чеков
const receiptStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'receipts')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, `receipt-${req.params.id}-${Date.now()}${ext}`)
    }
})

const uploadReceipt = multer({
    storage: receiptStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Только изображения'))
        }
    }
})

// Генерация номера заказа #XXXX
function generateOrderNumber(): string {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `#${num}`
}

// POST /api/reservations — создать заказ
router.post('/', (req, res) => {
    try {
        const { telegram_id, items, delivery_method, delivery_price, recipient, telegram_username } = req.body

        // Валидация
        if (!telegram_id || !items || !items.length) {
            return res.status(400).json({ error: 'Не все поля заполнены' })
        }

        // Для доставки проверяем данные получателя
        if (delivery_method && recipient) {
            if (!recipient.fullName || !recipient.phone || !recipient.city || !recipient.address) {
                return res.status(400).json({ error: 'Заполните все данные получателя' })
            }
        }

        // Получаем или создаём пользователя
        let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id) as any
        if (!user) {
            const { first_name, last_name, username } = req.body
            const result = db.prepare(`
        INSERT INTO users (telegram_id, first_name, last_name, username, phone)
        VALUES (?, ?, ?, ?, ?)
      `).run(telegram_id, first_name || '', last_name || '', username || '', recipient?.phone || '')
            user = { id: result.lastInsertRowid }
        }

        // Получаем первый магазин как склад (для совместимости)
        const store = db.prepare('SELECT * FROM stores LIMIT 1').get() as any
        const store_id = store?.id || 1

        // Считаем итоговую сумму
        let totalPrice = 0
        const productIds = items.map((i: any) => i.product_id)
        const products = db.prepare(`
      SELECT id, price FROM products WHERE id IN (${productIds.map(() => '?').join(',')})
    `).all(...productIds) as any[]

        const priceMap = new Map(products.map(p => [p.id, p.price]))
        for (const item of items) {
            const price = priceMap.get(item.product_id) || 0
            totalPrice += price * item.quantity
        }

        // Добавляем стоимость доставки
        if (delivery_price) {
            totalPrice += delivery_price
        }

        // Генерируем уникальный номер заказа
        let orderNumber = generateOrderNumber()
        let attempts = 0
        while (attempts < 10) {
            const existing = db.prepare('SELECT id FROM reservations WHERE order_number = ?').get(orderNumber)
            if (!existing) break
            orderNumber = generateOrderNumber()
            attempts++
        }

        // Создаём заказ с новыми полями
        const reservationResult = db.prepare(`
      INSERT INTO reservations (
        order_number, user_id, store_id, status, total_price,
        pickup_time_from, pickup_time_to,
        delivery_method, delivery_price,
        recipient_name, recipient_phone, recipient_city, 
        recipient_address, recipient_postal_code, recipient_comment,
        telegram_username
      )
      VALUES (?, ?, ?, 'pending', ?, '', '', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            orderNumber, user.id, store_id, totalPrice,
            delivery_method || 'cdek', delivery_price || 0,
            recipient?.fullName || '', recipient?.phone || '', recipient?.city || '',
            recipient?.address || '', recipient?.postalCode || '', recipient?.comment || '',
            telegram_username || ''
        )

        const reservationId = reservationResult.lastInsertRowid

        // Добавляем товары в заказ
        const insertItem = db.prepare(`
      INSERT INTO reservation_items (reservation_id, product_id, quantity, price_at_time)
      VALUES (?, ?, ?, ?)
    `)

        for (const item of items) {
            const price = priceMap.get(item.product_id) || 0
            insertItem.run(reservationId, item.product_id, item.quantity, price)
        }

        res.status(201).json({
            id: reservationId,
            order_number: orderNumber,
            status: 'pending',
            total_price: totalPrice
        })
    } catch (error) {
        console.error('Ошибка создания заказа:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/reservations/:id — детали брони
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params

        const reservation = db.prepare(`
      SELECT r.*, s.name as store_name, s.address as store_address,
             u.first_name, u.last_name, u.phone as user_phone, u.telegram_id, u.username
      FROM reservations r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ? OR r.order_number = ?
    `).get(id, id) as any

        if (!reservation) {
            return res.status(404).json({ error: 'Бронь не найдена' })
        }

        const items = db.prepare(`
      SELECT ri.*, p.name, p.brand, p.image_url
      FROM reservation_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.reservation_id = ?
    `).all(reservation.id)

        // Форматируем дату
        const createdDate = new Date(reservation.created_at)
        const formattedDate = createdDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        res.json({
            ...reservation,
            items,
            formatted_date: formattedDate
        })
    } catch (error) {
        console.error('Ошибка получения брони:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/users/:tgId/reservations — брони пользователя
router.get('/user/:tgId', (req, res) => {
    try {
        const { tgId } = req.params
        const { status } = req.query

        let query = `
      SELECT r.*, s.name as store_name, s.address as store_address
      FROM reservations r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE u.telegram_id = ?
    `
        const params: any[] = [tgId]

        if (status) {
            const statuses = (status as string).split(',')
            query += ` AND r.status IN (${statuses.map(() => '?').join(',')})`
            params.push(...statuses)
        }

        query += ' ORDER BY r.created_at DESC'

        const reservations = db.prepare(query).all(...params)

        res.json(reservations)
    } catch (error) {
        console.error('Ошибка получения броней:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// PATCH /api/reservations/:id — изменить статус
router.patch('/:id', (req, res) => {
    try {
        const { id } = req.params
        const { status, telegram_id, shipping_info } = req.body

        const validStatuses = ['pending', 'payment_check', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус' })
        }

        // Проверяем существование брони
        const reservation = db.prepare(`
      SELECT r.*, u.telegram_id
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(id) as any

        if (!reservation) {
            return res.status(404).json({ error: 'Бронь не найдена' })
        }

        // Пользователь может только отменить свою бронь
        if (telegram_id && reservation.telegram_id !== telegram_id && status === 'cancelled') {
            return res.status(403).json({ error: 'Нет прав на отмену этой брони' })
        }

        // Обновляем поля
        const updates: string[] = ['updated_at = CURRENT_TIMESTAMP']
        const params: any[] = []

        if (status) {
            updates.push('status = ?')
            params.push(status)
        }
        if (shipping_info !== undefined) {
            updates.push('shipping_info = ?')
            params.push(shipping_info)
        }

        params.push(id)

        db.prepare(`
      UPDATE reservations SET ${updates.join(', ')} WHERE id = ?
    `).run(...params)

        res.json({ success: true, status: status || reservation.status })
    } catch (error) {
        console.error('Ошибка обновления брони:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// PATCH /api/reservations/:id/recipient — обновить данные получателя
router.patch('/:id/recipient', (req, res) => {
    try {
        const { id } = req.params
        const { recipient_name, recipient_phone, telegram_username, recipient_city, recipient_address, recipient_postal_code, recipient_comment } = req.body

        // Проверяем существование заказа
        const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as any
        if (!reservation) {
            return res.status(404).json({ error: 'Заказ не найден' })
        }

        // Можно редактировать только до подтверждения оплаты
        if (!['pending', 'payment_check'].includes(reservation.status)) {
            return res.status(403).json({ error: 'Нельзя изменить данные после подтверждения оплаты' })
        }

        // Обновляем данные
        db.prepare(`
            UPDATE reservations SET
                recipient_name = ?,
                recipient_phone = ?,
                telegram_username = ?,
                recipient_city = ?,
                recipient_address = ?,
                recipient_postal_code = ?,
                recipient_comment = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            recipient_name || reservation.recipient_name,
            recipient_phone || reservation.recipient_phone,
            telegram_username || reservation.telegram_username,
            recipient_city || reservation.recipient_city,
            recipient_address || reservation.recipient_address,
            recipient_postal_code || reservation.recipient_postal_code,
            recipient_comment !== undefined ? recipient_comment : reservation.recipient_comment,
            id
        )

        res.json({ success: true })
    } catch (error) {
        console.error('Ошибка обновления данных получателя:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// POST /api/reservations/:id/receipt — загрузить чек об оплате
router.post('/:id/receipt', uploadReceipt.single('receipt'), (req, res) => {
    try {
        const { id } = req.params
        const file = req.file

        if (!file) {
            return res.status(400).json({ error: 'Файл не загружен' })
        }

        // Проверяем существование заказа и получаем старый чек
        const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as any
        if (!reservation) {
            return res.status(404).json({ error: 'Заказ не найден' })
        }

        // Удаляем старый чек если есть
        if (reservation.payment_receipt_url) {
            const oldFilePath = path.join(process.cwd(), reservation.payment_receipt_url)
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath)
                    console.log('Удалён старый чек:', oldFilePath)
                } catch (e) {
                    console.error('Ошибка удаления старого чека:', e)
                }
            }
        }

        const receiptUrl = `/uploads/receipts/${file.filename}`

        // Обновляем заказ
        db.prepare(`
            UPDATE reservations 
            SET payment_receipt_url = ?, status = 'payment_check', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(receiptUrl, id)

        res.json({
            success: true,
            receipt_url: receiptUrl,
            status: 'payment_check'
        })
    } catch (error) {
        console.error('Ошибка загрузки чека:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// DELETE /api/reservations/:id — удалить заказ
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params

        // Проверяем существование заказа
        const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as any
        if (!reservation) {
            return res.status(404).json({ error: 'Заказ не найден' })
        }

        // Удаляем чек если есть
        if (reservation.payment_receipt_url) {
            const filePath = path.join(process.cwd(), reservation.payment_receipt_url)
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath)
                } catch (e) {
                    console.error('Ошибка удаления чека:', e)
                }
            }
        }

        // Удаляем товары заказа
        db.prepare('DELETE FROM reservation_items WHERE reservation_id = ?').run(id)

        // Удаляем заказ
        db.prepare('DELETE FROM reservations WHERE id = ?').run(id)

        res.json({ success: true })
    } catch (error) {
        console.error('Ошибка удаления заказа:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/reservations/store/:storeId — брони магазина (для админки/бота)
router.get('/store/:storeId', (req, res) => {
    try {
        const { storeId } = req.params
        const { status, date } = req.query

        let query = `
      SELECT r.*, u.first_name, u.last_name, u.phone, u.telegram_id
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `
        const params: any[] = [storeId]

        if (status) {
            const statuses = (status as string).split(',')
            query += ` AND r.status IN (${statuses.map(() => '?').join(',')})`
            params.push(...statuses)
        }

        if (date) {
            query += ` AND DATE(r.created_at) = ?`
            params.push(date)
        }

        query += ' ORDER BY r.created_at DESC'

        const reservations = db.prepare(query).all(...params)

        res.json(reservations)
    } catch (error) {
        console.error('Ошибка получения броней магазина:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

export default router
