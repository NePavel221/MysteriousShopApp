import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

import { initDatabase, db } from './db/database.js'
import categoriesRouter from './routes/categories.js'
import storesRouter from './routes/stores.js'
import productsRouter from './routes/products.js'
import usersRouter from './routes/users.js'
import adminRouter from './routes/admin.js'
import reservationsRouter from './routes/reservations.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Создаём папку data если не существует
const dataDir = join(__dirname, '../data')
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
}

// Инициализируем базу данных ПЕРВЫМ ДЕЛОМ
initDatabase()

// Теперь запускаем Telegram-бота (после инициализации БД)
import('./bot/telegram-bot.js').then(({ startBot }) => {
    startBot()
})

// Автоотмена старых броней (запускается каждый час)
function cancelExpiredReservations() {
    const today = new Date().toISOString().split('T')[0]
    const result = db.prepare(`
        UPDATE reservations 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
        WHERE status IN ('pending', 'confirmed') AND DATE(created_at) < ?
    `).run(today)
    if (result.changes > 0) {
        console.log(`🗑️ Автоотмена: ${result.changes} просроченных броней`)
    }
}

// Запускаем сразу при старте и потом каждый час
cancelExpiredReservations()
setInterval(cancelExpiredReservations, 60 * 60 * 1000)

// Создаём папку uploads если не существует
const uploadsDir = join(process.cwd(), 'uploads')
if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true })
}

// Раздача загруженных файлов
app.use('/uploads', express.static(uploadsDir))

// API Routes
app.use('/api/categories', categoriesRouter)
app.use('/api/stores', storesRouter)
app.use('/api/products', productsRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/reservations', reservationsRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// В production раздаём статику фронтенда
if (process.env.NODE_ENV === 'production') {
    const frontendPath = join(__dirname, '../../frontend/dist')
    app.use(express.static(frontendPath))

    // Все остальные запросы отдаём index.html (для SPA)
    app.get('*', (req, res) => {
        res.sendFile(join(frontendPath, 'index.html'))
    })
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`
🚀 VapeCity API запущен!
📍 http://localhost:${PORT}
📦 API: http://localhost:${PORT}/api

Endpoints:
  GET /api/categories     — список категорий
  GET /api/stores         — список точек
  GET /api/products       — товары (фильтры: ?category=, ?store_id=, ?search=)
  GET /api/products/:id   — детали товара
  GET /api/users/:tgId    — данные пользователя
  `)
})
