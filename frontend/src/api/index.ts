import type { Category, Store, Product, ProductDetails, User } from '../types'

const API_BASE = '/api'

// Категории
export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`)
    if (!res.ok) throw new Error('Ошибка загрузки категорий')
    return res.json()
}

// Точки
export async function getStores(): Promise<Store[]> {
    const res = await fetch(`${API_BASE}/stores`)
    if (!res.ok) throw new Error('Ошибка загрузки точек')
    return res.json()
}

export async function getStore(id: number): Promise<Store> {
    const res = await fetch(`${API_BASE}/stores/${id}`)
    if (!res.ok) throw new Error('Точка не найдена')
    return res.json()
}

// Товары
interface ProductsParams {
    category?: string
    store_id?: number
    search?: string
    nicotine?: string
}

export async function getProducts(params?: ProductsParams): Promise<Product[]> {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.store_id) searchParams.set('store_id', params.store_id.toString())
    if (params?.search) searchParams.set('search', params.search.trim())
    if (params?.nicotine) searchParams.set('nicotine', params.nicotine)

    const url = `${API_BASE}/products${searchParams.toString() ? '?' + searchParams : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Ошибка загрузки товаров')
    return res.json()
}

export async function getProduct(id: number): Promise<ProductDetails> {
    const res = await fetch(`${API_BASE}/products/${id}`)
    if (!res.ok) throw new Error('Товар не найден')
    return res.json()
}

// Проверка наличия товаров корзины на точках
export interface StoreAvailability {
    store_id: number
    store_name: string
    address: string
    available_count: number
    total_count: number
    available_products: { product_id: number; quantity: number }[]
}

export async function checkCartAvailability(productIds: number[]): Promise<StoreAvailability[]> {
    const res = await fetch(`${API_BASE}/products/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds })
    })
    if (!res.ok) throw new Error('Ошибка проверки наличия')
    return res.json()
}

// Пользователи
export async function getUser(telegramId: number): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${telegramId}`)
    if (!res.ok) throw new Error('Ошибка загрузки пользователя')
    return res.json()
}

export async function updateUser(telegramId: number, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${telegramId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Ошибка обновления пользователя')
    return res.json()
}

export async function generateDiscountCode(telegramId: number): Promise<{ discount_code: string }> {
    const res = await fetch(`${API_BASE}/users/${telegramId}/generate-code`)
    if (!res.ok) throw new Error('Ошибка генерации кода')
    return res.json()
}
