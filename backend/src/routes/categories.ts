import { Router } from 'express'
import { db, Category } from '../db/database.js'

const router = Router()

// GET /api/categories — список всех категорий
router.get('/', (req, res) => {
    try {
        const categories = db.prepare(`
      SELECT * FROM categories 
      ORDER BY sort_order ASC
    `).all() as Category[]

        res.json(categories)
    } catch (error) {
        console.error('Ошибка получения категорий:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

// GET /api/categories/:slug — категория по slug
router.get('/:slug', (req, res) => {
    try {
        const { slug } = req.params
        const category = db.prepare(`
      SELECT * FROM categories WHERE slug = ?
    `).get(slug) as Category | undefined

        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' })
        }

        res.json(category)
    } catch (error) {
        console.error('Ошибка получения категории:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

export default router
