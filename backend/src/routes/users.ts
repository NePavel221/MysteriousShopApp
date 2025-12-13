import { Router } from 'express'
import { db, User } from '../db/database.js'

const router = Router()

// GET /api/users/:telegramId — данные пользователя по Telegram ID
router.get('/:telegramId', (req, res) => {
  try {
    const { telegramId } = req.params

    let user = db.prepare(`
      SELECT * FROM users WHERE telegram_id = ?
    `).get(telegramId) as User | undefined

    // Если пользователь не найден — создаём нового с демо-бонусами
    if (!user) {
      // Код скидки — только 6 цифр
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const result = db.prepare(`
        INSERT INTO users (telegram_id, bonus_points, discount_code)
        VALUES (?, 100, ?)
      `).run(telegramId, code)

      user = db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).get(result.lastInsertRowid) as User
    }

    res.json(user)
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/users/:telegramId — обновить данные пользователя
router.post('/:telegramId', (req, res) => {
  try {
    const { telegramId } = req.params
    const { first_name, last_name, username } = req.body

    // Проверяем существует ли пользователь
    let user = db.prepare(`
      SELECT * FROM users WHERE telegram_id = ?
    `).get(telegramId) as User | undefined

    if (user) {
      // Обновляем
      db.prepare(`
        UPDATE users 
        SET first_name = ?, last_name = ?, username = ?
        WHERE telegram_id = ?
      `).run(first_name || null, last_name || null, username || null, telegramId)
    } else {
      // Создаём с кодом из 6 цифр
      const code = String(Math.floor(100000 + Math.random() * 900000))
      db.prepare(`
        INSERT INTO users (telegram_id, first_name, last_name, username, bonus_points, discount_code)
        VALUES (?, ?, ?, ?, 100, ?)
      `).run(telegramId, first_name || null, last_name || null, username || null, code)
    }

    // Возвращаем обновлённые данные
    user = db.prepare(`
      SELECT * FROM users WHERE telegram_id = ?
    `).get(telegramId) as User

    res.json(user)
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/users/:telegramId/generate-code — сгенерировать новый код скидки
router.get('/:telegramId/generate-code', (req, res) => {
  try {
    const { telegramId } = req.params

    // Генерируем новый код — только 6 цифр
    const newCode = String(Math.floor(100000 + Math.random() * 900000))

    db.prepare(`
      UPDATE users SET discount_code = ? WHERE telegram_id = ?
    `).run(newCode, telegramId)

    const user = db.prepare(`
      SELECT * FROM users WHERE telegram_id = ?
    `).get(telegramId) as User | undefined

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json({ discount_code: user.discount_code })
  } catch (error) {
    console.error('Ошибка генерации кода:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

export default router
