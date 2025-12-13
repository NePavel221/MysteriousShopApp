import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
    product_id: number
    name: string
    brand: string
    price: number
    image_url: string
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    storeId: number | null
    storeName: string
    storeAddress: string
    addItem: (product: any) => void
    removeItem: (productId: number) => void
    updateQuantity: (productId: number, quantity: number) => void
    clearCart: () => void
    setStore: (id: number, name: string, address: string) => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [storeId, setStoreId] = useState<number | null>(null)
    const [storeName, setStoreName] = useState('')
    const [storeAddress, setStoreAddress] = useState('')

    // Загрузка из localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vapecity_cart')
        if (saved) {
            try {
                const data = JSON.parse(saved)
                setItems(data.items || [])
                setStoreId(data.storeId || null)
                setStoreName(data.storeName || '')
                setStoreAddress(data.storeAddress || '')
            } catch (e) {
                console.error('Ошибка загрузки корзины:', e)
            }
        }
    }, [])

    // Сохранение в localStorage
    useEffect(() => {
        localStorage.setItem('vapecity_cart', JSON.stringify({
            items, storeId, storeName, storeAddress
        }))
    }, [items, storeId, storeName, storeAddress])

    const addItem = (product: any) => {
        setItems(prev => {
            const existing = prev.find(i => i.product_id === product.id)
            if (existing) {
                return prev.map(i =>
                    i.product_id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                brand: product.brand || '',
                price: product.price,
                image_url: product.image_url || '',
                quantity: 1
            }]
        })
    }

    const removeItem = (productId: number) => {
        setItems(prev => prev.filter(i => i.product_id !== productId))
    }

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems(prev => prev.map(i =>
            i.product_id === productId ? { ...i, quantity } : i
        ))
    }

    const clearCart = () => {
        setItems([])
    }

    const setStore = (id: number, name: string, address: string) => {
        if (storeId && storeId !== id && items.length > 0) {
            if (!confirm('При смене точки корзина будет очищена. Продолжить?')) {
                return
            }
            setItems([])
        }
        setStoreId(id)
        setStoreName(name)
        setStoreAddress(address)
    }

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    return (
        <CartContext.Provider value={{
            items, storeId, storeName, storeAddress,
            addItem, removeItem, updateQuantity, clearCart, setStore,
            totalItems, totalPrice
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within CartProvider')
    return context
}
