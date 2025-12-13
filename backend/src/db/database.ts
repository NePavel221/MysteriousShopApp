import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Путь к файлу базы данных
const dbPath = join(__dirname, '../../data/vapecity.db')

// Создаём подключение
export const db = new Database(dbPath)

// Включаем foreign keys
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Инициализация базы данных
export function initDatabase() {
    console.log('📦 Инициализация базы данных...')

    // Проверяем, есть ли уже данные в базе
    const hasData = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get()

    // Читаем и выполняем схему (CREATE IF NOT EXISTS — безопасно)
    const schemaPath = join(__dirname, 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')
    db.exec(schema)
    console.log('✅ Схема создана')

    // Seed данные загружаем ТОЛЬКО если база пустая
    if (!hasData) {
        const seedPath = join(__dirname, 'seed.sql')
        const seed = readFileSync(seedPath, 'utf-8')
        db.exec(seed)
        console.log('✅ Демо-данные загружены')
    } else {
        console.log('ℹ️ База уже содержит данные, seed пропущен')
    }

    console.log('🎉 База данных готова!')
}

// Типы для TypeScript
export interface Category {
    id: number
    name: string
    slug: string
    icon: string | null
    sort_order: number
}

export interface Store {
    id: number
    name: string
    address: string
    phone: string | null
    working_hours: string | null
    is_active: number
}

export interface Product {
    id: number
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: number | null
    brand: string | null
    created_at: string
}

export interface ProductAttribute {
    id: number
    product_id: number
    attribute_name: string
    attribute_value: string
}

export interface StoreInventory {
    id: number
    store_id: number
    product_id: number
    quantity: number
}

export interface User {
    id: number
    telegram_id: number | null
    first_name: string | null
    last_name: string | null
    username: string | null
    bonus_points: number
    discount_code: string | null
    created_at: string
}
