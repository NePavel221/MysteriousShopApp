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
    category_name?: string
    category_slug?: string
    category_icon?: string
}

export interface ProductAttribute {
    attribute_name: string
    attribute_value: string
}

export interface ProductAvailability {
    store_id: number
    store_name: string
    address: string
    quantity: number
}

export interface ProductDetails extends Product {
    attributes: ProductAttribute[]
    availability: ProductAvailability[]
}

export interface User {
    id: number
    telegram_id: number | null
    first_name: string | null
    last_name: string | null
    username: string | null
    bonus_points: number
    discount_code: string | null
}
