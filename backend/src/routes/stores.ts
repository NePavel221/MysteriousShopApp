import { Router } from 'express'
import { db, Store } from '../db/database.js'

const router = Router()

// GET /api/stores — список всех точек
router.get('/', (req, res) => {
    try {
        const stores = db.prepare(`
      SELECT * FROM stores 
      WHERE is_active = 1
      ORDER BY id ASC
    `).all() as Store[]

        res.json(stores)
    } catch (error) {
        console.error('Ошибка получения точек:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/stores/:id — точка по ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params
        const store = db.prepare(`
      SELECT * FROM stores WHERE id = ?
    `).get(id) as Store | undefined

        if (!store) {
            return res.status(404).json({ error: 'Точка не найдена' })
        }

        res.json(store)
    } catch (error) {
        console.error('Ошибка получения точки:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/stores/:id/inventory — наличие товаров на точке
router.get('/:id/inventory', (req, res) => {
    try {
        const { id } = req.params

        const inventory = db.prepare(`
      SELECT 
        p.*,
        si.quantity,
        c.name as category_name,
        c.slug as category_slug
      FROM store_inventory si
      JOIN products p ON si.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE si.store_id = ? AND si.quantity > 0
      ORDER BY c.sort_order, p.name
    `).all(id)

        res.json(inventory)
    } catch (error) {
        console.error('Ошибка получения наличия:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

export default router
