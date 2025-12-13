import { Router } from 'express'
import { db } from '../db/database.js'
import { notifyNewReservation } from '../bot/telegram-bot.js'

const router = Router()

// Генерация номера заказа #XXXX
function generateOrderNumber(): string {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `#${num}`
}

// POST /api/reservations — создать бронь
router.post('/', (req, res) => {
    try {
        const { telegram_id, store_id, items, pickup_time_from, pickup_time_to } = req.body

        // Валидация
        if (!telegram_id || !store_id || !items || !items.length) {
            return res.status(400).json({ error: 'Не все поля заполнены' })
        }

        if (!pickup_time_from || !pickup_time_to) {
            return res.status(400).json({ error: 'Укажите время прихода' })
        }

        // Получаем или создаём пользователя
        let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegram_id) as any
        if (!user) {
            const { first_name, last_name, username, phone } = req.body
            const result = db.prepare(`
        INSERT INTO users (telegram_id, first_name, last_name, username, phone)
        VALUES (?, ?, ?, ?, ?)
      `).run(telegram_id, first_name || '', last_name || '', username || '', phone || '')
            user = { id: result.lastInsertRowid }
        }

        // Проверяем магазин
        const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(store_id)
        if (!store) {
            return res.status(400).json({ error: 'Магазин не найден' })
        }

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

        // Генерируем уникальный номер заказа
        let orderNumber = generateOrderNumber()
        let attempts = 0
        while (attempts < 10) {
            const existing = db.prepare('SELECT id FROM reservations WHERE order_number = ?').get(orderNumber)
            if (!existing) break
            orderNumber = generateOrderNumber()
            attempts++
        }

        // Создаём бронь
        const reservationResult = db.prepare(`
      INSERT INTO reservations (order_number, user_id, store_id, status, pickup_time_from, pickup_time_to, total_price)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)
    `).run(orderNumber, user.id, store_id, pickup_time_from, pickup_time_to, totalPrice)

        const reservationId = reservationResult.lastInsertRowid

        // Добавляем товары в бронь
        const insertItem = db.prepare(`
      INSERT INTO reservation_items (reservation_id, product_id, quantity, price_at_time)
      VALUES (?, ?, ?, ?)
    `)

        for (const item of items) {
            const price = priceMap.get(item.product_id) || 0
            insertItem.run(reservationId, item.product_id, item.quantity, price)
        }

        // Отправляем уведомление в Telegram
        try {
            notifyNewReservation(Number(reservationId))
        } catch (e) {
            console.error('Ошибка отправки уведомления:', e)
        }

        res.status(201).json({
            id: reservationId,
            order_number: orderNumber,
            status: 'pending',
            total_price: totalPrice
        })
    } catch (error) {
        console.error('Ошибка создания брони:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/reservations/:id — детали брони
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params

        const reservation = db.prepare(`
      SELECT r.*, s.name as store_name, s.address as store_address,
             u.first_name, u.last_name, u.phone, u.telegram_id
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

        res.json({ ...reservation, items })
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
        const { status, telegram_id } = req.body

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
        if (!validStatuses.includes(status)) {
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

        db.prepare(`
      UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id)

        res.json({ success: true, status })
    } catch (error) {
        console.error('Ошибка обновления брони:', error)
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
