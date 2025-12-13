const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
    return localStorage.getItem('admin_token')
}

async function request(endpoint: string, options: RequestInit = {}) {
    const token = getToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
    if (res.status === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
        throw new Error('Unauthorized')
    }
    return res.json()
}

// Auth
export const login = (login: string, password: string) =>
    request('/admin/login', { method: 'POST', body: JSON.stringify({ login, password }) })

export const checkAuth = () => request('/admin/check')

// Products
export const getProducts = () => request('/admin/products')
export const updateProduct = (id: number, data: any) =>
    request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const createProduct = (data: any) =>
    request('/admin/products', { method: 'POST', body: JSON.stringify(data) })
export const deleteProduct = (id: number) =>
    request(`/admin/products/${id}`, { method: 'DELETE' })

export const uploadProductImage = async (id: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const token = getToken()
    const res = await fetch(`${API_URL}/admin/products/${id}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    return res.json()
}

export const deleteProductImage = (id: number) =>
    request(`/admin/products/${id}/image`, { method: 'DELETE' })

// Stores
export const getStores = () => request('/admin/stores')
export const updateStore = (id: number, data: any) =>
    request(`/admin/stores/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const createStore = (data: any) =>
    request('/admin/stores', { method: 'POST', body: JSON.stringify(data) })
export const deleteStore = (id: number) =>
    request(`/admin/stores/${id}`, { method: 'DELETE' })

// Inventory
export const getInventory = (storeId: number) => request(`/admin/inventory/${storeId}`)
export const updateInventory = (storeId: number, productId: number, quantity: number) =>
    request(`/admin/inventory/${storeId}/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) })

// Categories
export const getCategories = () => request('/admin/categories')

// Store Sellers (для Telegram-уведомлений)
export const getStoreSellers = (storeId: number) => request(`/admin/stores/${storeId}/sellers`)
export const addStoreSeller = (storeId: number, data: { telegram_id: number; name: string; description: string | null }) =>
    request(`/admin/stores/${storeId}/sellers`, { method: 'POST', body: JSON.stringify(data) })
export const deleteStoreSeller = (storeId: number, sellerId: number) =>
    request(`/admin/stores/${storeId}/sellers/${sellerId}`, { method: 'DELETE' })

// Settings
export const getSettings = () => request('/admin/settings')
export const updateSettings = (data: { bot_token: string }) =>
    request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) })

// Product Attributes
export const getProductAttributes = (productId: number) => request(`/admin/products/${productId}/attributes`)
export const updateProductAttributes = (productId: number, attributes: { name: string; value: string }[]) =>
    request(`/admin/products/${productId}/attributes`, { method: 'PUT', body: JSON.stringify({ attributes }) })
