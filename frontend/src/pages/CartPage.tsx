import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function CartPage() {
    const navigate = useNavigate()
    const { items, storeAddress, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

    const getImageUrl = (url: string) => {
        if (!url) return 'https://placehold.co/80x80/1a1a2e/ff00ff?text=?'
        if (url.startsWith('/uploads')) return `${API_URL}${url}`
        return url
    }

    if (items.length === 0) {
        return (
            <div className="page">
                <div className="empty-cart">
                    <svg className="empty-cart-svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <h2>Корзина пуста</h2>
                    <p>Добавьте товары из каталога</p>
                    <button className="neon-button" onClick={() => navigate('/catalog')}>
                        🛍️ В каталог
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="cart-header">
                <h1>🛒 Корзина</h1>
                <button className="clear-cart-btn" onClick={clearCart}>Очистить</button>
            </div>

            <div className="cart-store">
                📍 {storeAddress}
            </div>

            <div className="cart-items">
                {items.map(item => (
                    <div key={item.product_id} className="cart-item">
                        <img src={getImageUrl(item.image_url)} alt="" className="cart-item-image" />
                        <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-brand">{item.brand}</div>
                            <div className="cart-item-price">{item.price} ₽</div>
                        </div>
                        <div className="cart-item-controls">
                            <button className="qty-btn" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                        </div>
                        <button className="remove-btn" onClick={() => removeItem(item.product_id)}>✕</button>
                    </div>
                ))}
            </div>

            <div className="cart-footer">
                <div className="cart-total">
                    <span>Итого:</span>
                    <span className="cart-total-price">{totalPrice} ₽</span>
                </div>
                <button className="neon-button checkout-btn" onClick={() => navigate('/checkout')}>
                    ✨ Оформить бронь
                </button>
            </div>
        </div>
    )
}
