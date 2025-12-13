import { Router } from 'express'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'
import { db } from '../db/database.js'

const router = Router()
const JWT_SECRET = 'vapecity-admin-secret-key'
const ADMIN_LOGIN = '123'
const ADMIN_PASSWORD = '123'

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const productId = req.params.id
        const ext = path.extname(file.originalname) || '.jpg'
        cb(null, `product-${productId}${ext}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Только JPG, PNG, WEBP'))
        }
    }
})

// Middleware для проверки JWT
function authMiddleware(req: any, res: any, next: any) {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' })
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.admin = decoded
        next()
    } catch {
        return res.status(401).json({ error: 'Неверный токен' })
    }
}

// =====================
// АВТОРИЗАЦИЯ
// =====================

// POST /api/admin/login
router.post('/login', (req, res) => {
    const { login, password } = req.body
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' })
        res.json({ token, message: 'Успешный вход' })
    } else {
        res.status(401).json({ error: 'Неверный логин или пароль' })
    }
})

// GET /api/admin/check — проверка токена
router.get('/check', authMiddleware, (req, res) => {
    res.json({ valid: true })
})

// =====================
// ТОВАРЫ
// =====================

// GET /api/admin/products — список всех товаров
router.get('/products', authMiddleware, (req, res) => {
    try {
        const products = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `).all()
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения товаров' })
    }
})

// PUT /api/admin/products/:id — обновление товара
router.put('/products/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const { name, description, price, brand, category_id } = req.body

        db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, brand = ?, category_id = ?
      WHERE id = ?
    `).run(name, description, price, brand, category_id, id)

        res.json({ success: true, message: 'Товар обновлён' })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления товара' })
    }
})

// POST /api/admin/products — создание товара
router.post('/products', authMiddleware, (req, res) => {
    try {
        const { name, description, price, brand, category_id } = req.body

        const result = db.prepare(`
      INSERT INTO products (name, description, price, brand, category_id, image_url)
      VALUES (?, ?, ?, ?, ?, '')
    `).run(name, description, price, brand, category_id)

        res.json({ success: true, id: result.lastInsertRowid })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания товара' })
    }
})

// DELETE /api/admin/products/:id — удаление товара
router.delete('/products/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params

        // Удаляем файл изображения если есть
        const uploadDir = path.join(process.cwd(), 'uploads')
        const files = fs.readdirSync(uploadDir).filter(f => f.startsWith(`product-${id}.`))
        files.forEach(f => fs.unlinkSync(path.join(uploadDir, f)))

        // Удаляем из БД
        db.prepare('DELETE FROM store_inventory WHERE product_id = ?').run(id)
        db.prepare('DELETE FROM product_attributes WHERE product_id = ?').run(id)
        db.prepare('DELETE FROM products WHERE id = ?').run(id)

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления товара' })
    }
})

// POST /api/admin/products/:id/image — загрузка изображения
router.post('/products/:id/image', authMiddleware, upload.single('image'), (req, res) => {
    try {
        const { id } = req.params
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' })
        }

        const imageUrl = `/uploads/${req.file.filename}`
        db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run(imageUrl, id)

        res.json({ success: true, image_url: imageUrl })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки изображения' })
    }
})

// DELETE /api/admin/products/:id/image — удаление изображения
router.delete('/products/:id/image', authMiddleware, (req, res) => {
    try {
        const { id } = req.params

        const uploadDir = path.join(process.cwd(), 'uploads')
        const files = fs.readdirSync(uploadDir).filter(f => f.startsWith(`product-${id}.`))
        files.forEach(f => fs.unlinkSync(path.join(uploadDir, f)))

        db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run('', id)

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления изображения' })
    }
})

// GET /api/admin/products/:id/attributes — атрибуты товара
router.get('/products/:id/attributes', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const attributes = db.prepare(`
            SELECT attribute_name as name, attribute_value as value 
            FROM product_attributes WHERE product_id = ?
        `).all(id)
        res.json(attributes)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения атрибутов' })
    }
})

// PUT /api/admin/products/:id/attributes — обновить атрибуты товара
router.put('/products/:id/attributes', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const { attributes } = req.body // [{ name: 'nicotine', value: '20 мг' }, ...]

        // Удаляем старые атрибуты
        db.prepare('DELETE FROM product_attributes WHERE product_id = ?').run(id)

        // Добавляем новые
        const insert = db.prepare(`
            INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
            VALUES (?, ?, ?)
        `)
        for (const attr of attributes) {
            if (attr.name && attr.value) {
                insert.run(id, attr.name, attr.value)
            }
        }

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения атрибутов' })
    }
})

// =====================
// МАГАЗИНЫ
// =====================

// GET /api/admin/stores
router.get('/stores', authMiddleware, (req, res) => {
    try {
        const stores = db.prepare('SELECT * FROM stores ORDER BY id').all()
        res.json(stores)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения магазинов' })
    }
})

// PUT /api/admin/stores/:id
router.put('/stores/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const { name, address, phone, working_hours } = req.body

        db.prepare(`
      UPDATE stores SET name = ?, address = ?, phone = ?, working_hours = ? WHERE id = ?
    `).run(name, address, phone, working_hours, id)

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления магазина' })
    }
})

// POST /api/admin/stores
router.post('/stores', authMiddleware, (req, res) => {
    try {
        const { name, address, phone, working_hours } = req.body
        const result = db.prepare(`
      INSERT INTO stores (name, address, phone, working_hours) VALUES (?, ?, ?, ?)
    `).run(name, address, phone, working_hours)
        res.json({ success: true, id: result.lastInsertRowid })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания магазина' })
    }
})

// DELETE /api/admin/stores/:id
router.delete('/stores/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        db.prepare('DELETE FROM store_inventory WHERE store_id = ?').run(id)
        db.prepare('DELETE FROM store_sellers WHERE store_id = ?').run(id)
        db.prepare('DELETE FROM stores WHERE id = ?').run(id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления магазина' })
    }
})

// =====================
// ПРОДАВЦЫ ТОЧЕК
// =====================

// GET /api/admin/stores/:id/sellers — список продавцов точки
router.get('/stores/:id/sellers', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const sellers = db.prepare(`
            SELECT * FROM store_sellers WHERE store_id = ? ORDER BY created_at DESC
        `).all(id)
        res.json(sellers)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения продавцов' })
    }
})

// POST /api/admin/stores/:id/sellers — добавить продавца
router.post('/stores/:id/sellers', authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const { telegram_id, name, description } = req.body

        if (!telegram_id || !name) {
            return res.status(400).json({ error: 'Укажите Telegram ID и имя' })
        }

        const result = db.prepare(`
            INSERT INTO store_sellers (store_id, telegram_id, name, description)
            VALUES (?, ?, ?, ?)
        `).run(id, telegram_id, name, description || null)

        res.json({ success: true, id: result.lastInsertRowid })
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Этот продавец уже добавлен' })
        }
        res.status(500).json({ error: 'Ошибка добавления продавца' })
    }
})

// DELETE /api/admin/stores/:storeId/sellers/:sellerId — удалить продавца
router.delete('/stores/:storeId/sellers/:sellerId', authMiddleware, (req, res) => {
    try {
        const { sellerId } = req.params
        db.prepare('DELETE FROM store_sellers WHERE id = ?').run(sellerId)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления продавца' })
    }
})

// =====================
// НАЛИЧИЕ
// =====================

// GET /api/admin/inventory/:storeId
router.get('/inventory/:storeId', authMiddleware, (req, res) => {
    try {
        const { storeId } = req.params
        const inventory = db.prepare(`
      SELECT p.id, p.name, p.brand, COALESCE(si.quantity, 0) as quantity
      FROM products p
      LEFT JOIN store_inventory si ON p.id = si.product_id AND si.store_id = ?
      ORDER BY p.name
    `).all(storeId)
        res.json(inventory)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения наличия' })
    }
})

// PUT /api/admin/inventory/:storeId/:productId
router.put('/inventory/:storeId/:productId', authMiddleware, (req, res) => {
    try {
        const { storeId, productId } = req.params
        const { quantity } = req.body

        // Upsert
        const existing = db.prepare(
            'SELECT * FROM store_inventory WHERE store_id = ? AND product_id = ?'
        ).get(storeId, productId)

        if (existing) {
            db.prepare(
                'UPDATE store_inventory SET quantity = ? WHERE store_id = ? AND product_id = ?'
            ).run(quantity, storeId, productId)
        } else {
            db.prepare(
                'INSERT INTO store_inventory (store_id, product_id, quantity) VALUES (?, ?, ?)'
            ).run(storeId, productId, quantity)
        }

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления наличия' })
    }
})

// =====================
// КАТЕГОРИИ
// =====================

// GET /api/admin/categories
router.get('/categories', authMiddleware, (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all()
        res.json(categories)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения категорий' })
    }
})

// =====================
// НАСТРОЙКИ
// =====================

// GET /api/admin/settings
router.get('/settings', authMiddleware, async (req, res) => {
    try {
        const botToken = db.prepare("SELECT value FROM settings WHERE key = 'bot_token'").get() as any
        const { isBotRunning } = await import('../bot/telegram-bot.js')
        res.json({
            bot_token: botToken?.value || '',
            bot_running: isBotRunning()
        })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения настроек' })
    }
})

// PUT /api/admin/settings
router.put('/settings', authMiddleware, async (req, res) => {
    try {
        const { bot_token } = req.body

        // Upsert bot_token
        const existing = db.prepare("SELECT * FROM settings WHERE key = 'bot_token'").get()
        if (existing) {
            db.prepare("UPDATE settings SET value = ? WHERE key = 'bot_token'").run(bot_token)
        } else {
            db.prepare("INSERT INTO settings (key, value) VALUES ('bot_token', ?)").run(bot_token)
        }

        // Динамически перезапускаем бота с новым токеном
        const { startBot } = await import('../bot/telegram-bot.js')
        const botStarted = startBot(bot_token)

        res.json({
            success: true,
            bot_running: botStarted,
            message: botStarted ? 'Токен сохранён, бот перезапущен!' : 'Токен сохранён, но бот не запустился (проверьте токен)'
        })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения настроек' })
    }
})

export default router
