import { Router } from 'express'
import { db, Product, ProductAttribute } from '../db/database.js'

const router = Router()

// GET /api/products — список товаров с фильтрами
router.get('/', (req, res) => {
  try {
    const { category, store_id, search, limit = '50' } = req.query

    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    // Фильтр по категории
    if (category) {
      query += ` AND c.slug = ?`
      params.push(category)
    }

    // Фильтр по наличию на точке
    if (store_id) {
      query += ` AND p.id IN (
        SELECT product_id FROM store_inventory 
        WHERE store_id = ? AND quantity > 0
      )`
      params.push(store_id)
    }

    // Поиск по названию (регистронезависимый для кириллицы)
    if (search) {
      // Используем GLOB с преобразованием в нижний регистр через JavaScript
      // SQLite LIKE не поддерживает регистронезависимый поиск для кириллицы
      const searchLower = String(search).toLowerCase()
      const searchUpper = String(search).toUpperCase()
      // Первая буква может быть в любом регистре
      const firstLower = searchLower.charAt(0)
      const firstUpper = searchUpper.charAt(0)
      const rest = String(search).slice(1).toLowerCase()

      // Ищем оба варианта: с большой и маленькой буквы
      query += ` AND (p.name LIKE ? OR p.name LIKE ? OR p.brand LIKE ? OR p.brand LIKE ?)`
      params.push(`%${firstUpper}${rest}%`, `%${firstLower}${rest}%`, `%${firstUpper}${rest}%`, `%${firstLower}${rest}%`)
    }

    // Фильтр по крепости никотина (для жидкостей)
    const { nicotine } = req.query
    if (nicotine) {
      query += ` AND p.id IN (
        SELECT product_id FROM product_attributes 
        WHERE attribute_name = 'nicotine' AND attribute_value = ?
      )`
      params.push(nicotine)
    }

    query += ` ORDER BY c.sort_order, p.name LIMIT ?`
    params.push(parseInt(limit as string))

    const products = db.prepare(query).all(...params)

    res.json(products)
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/products/:id — детали товара
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params

    // Основная информация о товаре
    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id) as (Product & { category_name: string; category_slug: string }) | undefined

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    // Атрибуты товара
    const attributes = db.prepare(`
      SELECT attribute_name, attribute_value 
      FROM product_attributes 
      WHERE product_id = ?
    `).all(id) as ProductAttribute[]

    // Наличие на точках
    const availability = db.prepare(`
      SELECT 
        s.id as store_id,
        s.name as store_name,
        s.address,
        si.quantity
      FROM store_inventory si
      JOIN stores s ON si.store_id = s.id
      WHERE si.product_id = ? AND si.quantity > 0
      ORDER BY s.id
    `).all(id)

    res.json({
      ...product,
      attributes,
      availability
    })
  } catch (error) {
    console.error('Ошибка получения товара:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/products/check-availability — проверка наличия товаров корзины на точках
router.post('/check-availability', (req, res) => {
  try {
    const { product_ids } = req.body

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({ error: 'Требуется массив product_ids' })
    }

    // Получаем все точки
    const stores = db.prepare(`
      SELECT id, name, address FROM stores WHERE is_active = 1 ORDER BY id
    `).all() as { id: number; name: string; address: string }[]

    // Для каждой точки считаем сколько товаров из корзины есть в наличии
    const result = stores.map(store => {
      const placeholders = product_ids.map(() => '?').join(',')
      const availableProducts = db.prepare(`
        SELECT product_id, quantity 
        FROM store_inventory 
        WHERE store_id = ? AND product_id IN (${placeholders}) AND quantity > 0
      `).all(store.id, ...product_ids) as { product_id: number; quantity: number }[]

      return {
        store_id: store.id,
        store_name: store.name,
        address: store.address,
        available_count: availableProducts.length,
        total_count: product_ids.length,
        available_products: availableProducts
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Ошибка проверки наличия:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
