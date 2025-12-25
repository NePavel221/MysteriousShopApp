import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const API_URL = ''

export default function CartPage() {
    const navigate = useNavigate()
    const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

    const getImageUrl = (url: string) => {
        if (!url) return 'https://placehold.co/80x80/001428/00d4ff?text=?'
        if (url.startsWith('/uploads')) return `${API_URL}${url}`
        return url
    }

    if (items.length === 0) {
        return (
            <div className="cart-page empty">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                    
                    .cart-page {
                        min-height: 100vh;
                        background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                        padding: 20px 16px 120px;
                        font-family: 'Exo 2', sans-serif;
                    }
                    .cart-page.empty {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        padding-top: 80px;
                    }
                    .empty-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                        opacity: 0.5;
                    }
                    .empty-title {
                        font-size: 22px;
                        font-weight: 600;
                        color: #e0f0ff;
                        margin-bottom: 8px;
                    }
                    .empty-text {
                        font-size: 14px;
                        color: #6699aa;
                        margin-bottom: 24px;
                    }
                    .empty-btn {
                        padding: 14px 32px;
                        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                        border: none;
                        border-radius: 12px;
                        color: #000;
                        font-size: 15px;
                        font-weight: 600;
                        font-family: 'Exo 2', sans-serif;
                        cursor: pointer;
                    }
                `}</style>
                <div className="empty-icon">🛒</div>
                <div className="empty-title">Корзина пуста</div>
                <div className="empty-text">Добавьте товары из каталога</div>
                <button className="empty-btn" onClick={() => navigate('/')}>
                    На главную
                </button>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                
                .cart-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                    padding: 20px 16px 180px;
                    font-family: 'Exo 2', sans-serif;
                }
                .cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .cart-header h1 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #e0f0ff;
                    margin: 0;
                }
                .clear-btn {
                    background: none;
                    border: 1px solid rgba(255, 68, 68, 0.3);
                    color: #ff6b6b;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-family: 'Exo 2', sans-serif;
                    cursor: pointer;
                }
                .cart-items {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .cart-item {
                    background: rgba(0, 212, 255, 0.05);
                    border: 1px solid rgba(0, 212, 255, 0.15);
                    border-radius: 16px;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .cart-item-image {
                    width: 70px;
                    height: 70px;
                    border-radius: 10px;
                    object-fit: cover;
                    background: rgba(0, 212, 255, 0.1);
                }
                .cart-item-info {
                    flex: 1;
                    min-width: 0;
                }
                .cart-item-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e0f0ff;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .cart-item-price {
                    font-size: 15px;
                    font-weight: 600;
                    color: #00d4ff;
                }
                .cart-item-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    padding: 4px;
                }
                .qty-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .qty-btn:active {
                    background: rgba(0, 212, 255, 0.4);
                }
                .qty-value {
                    width: 28px;
                    text-align: center;
                    font-size: 15px;
                    font-weight: 600;
                    color: #e0f0ff;
                }
                .remove-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: rgba(255, 68, 68, 0.15);
                    color: #ff6b6b;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-left: 8px;
                }
                .cart-footer {
                    position: fixed;
                    bottom: 70px;
                    left: 0;
                    right: 0;
                    background: linear-gradient(180deg, transparent 0%, #000a14 20%);
                    padding: 20px 16px;
                }
                .cart-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    font-size: 18px;
                    color: #e0f0ff;
                }
                .cart-total-price {
                    font-size: 24px;
                    font-weight: 700;
                    color: #00d4ff;
                }
                .checkout-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 16px;
                    font-weight: 600;
                    font-family: 'Exo 2', sans-serif;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .checkout-btn:active {
                    transform: scale(0.98);
                }
            `}</style>

            <div className="cart-header">
                <h1>🛒 Корзина</h1>
                <button className="clear-btn" onClick={clearCart}>Очистить</button>
            </div>

            <div className="cart-items">
                {items.map(item => (
                    <div key={item.product_id} className="cart-item">
                        <img src={getImageUrl(item.image_url)} alt="" className="cart-item-image" />
                        <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-price">{item.price * item.quantity} ₽</div>
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
                <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                    Оформить заказ
                </button>
            </div>
        </div>
    )
}
