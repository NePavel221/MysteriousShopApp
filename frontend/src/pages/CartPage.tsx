import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { useCart } from '../context/CartContext'
import { checkCartAvailability, StoreAvailability } from '../api'

const API_URL = ''

export default function CartPage() {
    const navigate = useNavigate()
    const { items, storeId, storeName, storeAddress, totalPrice, updateQuantity, removeItem, clearCart, setStore } = useCart()
    const [storeAvailability, setStoreAvailability] = useState<StoreAvailability[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedStore, setExpandedStore] = useState<number | null>(null)
    const [showStoreSelection, setShowStoreSelection] = useState(false)

    const getImageUrl = (url: string) => {
        if (!url) return 'https://placehold.co/80x80/1a1a2e/ff00ff?text=?'
        if (url.startsWith('/uploads')) return `${API_URL}${url}`
        return url
    }

    // Загружаем наличие на точках когда переходим к выбору точки
    useEffect(() => {
        if (!showStoreSelection || items.length === 0) return

        async function loadAvailability() {
            setLoading(true)
            try {
                const productIds = items.map(i => i.product_id)
                const availability = await checkCartAvailability(productIds)
                setStoreAvailability(availability)
            } catch (error) {
                console.error('Ошибка загрузки наличия:', error)
            } finally {
                setLoading(false)
            }
        }
        loadAvailability()
    }, [showStoreSelection, items])

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
                    <button className="neon-button" onClick={() => navigate('/')}>
                        🛍️ На главную
                    </button>
                </div>
            </div>
        )
    }

    // Проверяем наличие товара на выбранной точке
    const getItemAvailability = (productId: number) => {
        if (!storeId) return null
        const store = storeAvailability.find(s => s.store_id === storeId)
        if (!store) return null
        const product = store.available_products.find(p => p.product_id === productId)
        return product ? product.quantity : 0
    }

    // Считаем сколько товаров доступно на выбранной точке
    const availableOnSelectedStore = storeId
        ? storeAvailability.find(s => s.store_id === storeId)?.available_count || 0
        : 0

    // ШАГ 2: Выбор точки для получения
    if (showStoreSelection) {
        return (
            <div className="page">
                <div className="cart-header">
                    <button className="back-btn" onClick={() => {
                        setShowStoreSelection(false)
                        setStore(null, '', '')
                    }}>
                        ← Назад
                    </button>
                    <h1>Выбор точки</h1>
                </div>

                {!storeId ? (
                    // Список точек
                    <div className="store-selection-section">
                        <p className="section-hint">Выберите магазин для получения заказа</p>
                        {loading ? (
                            <div className="loading" style={{ minHeight: '100px' }}>
                                <Spinner size="m" />
                            </div>
                        ) : (
                            <div className="store-availability-list">
                                {storeAvailability.map(store => (
                                    <div key={store.store_id} className="store-availability-card">
                                        <div
                                            className="store-availability-header"
                                            onClick={() => setExpandedStore(
                                                expandedStore === store.store_id ? null : store.store_id
                                            )}
                                        >
                                            <div className="store-info">
                                                <div className="store-name">{store.store_name}</div>
                                                <div className="store-address">{store.address}</div>
                                            </div>
                                            <div className={`availability-badge ${store.available_count === store.total_count ? 'full' :
                                                store.available_count > 0 ? 'partial' : 'none'
                                                }`}>
                                                {store.available_count} из {store.total_count}
                                            </div>
                                        </div>

                                        {expandedStore === store.store_id && (
                                            <div className="store-products-detail">
                                                {items.map(item => {
                                                    const available = store.available_products.find(
                                                        p => p.product_id === item.product_id
                                                    )
                                                    return (
                                                        <div key={item.product_id} className={`product-availability-row ${available ? 'available' : 'unavailable'}`}>
                                                            <span className="product-name">{item.name}</span>
                                                            <span className="product-status">
                                                                {available ? `✓ ${available.quantity} шт` : '✕ Нет'}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                                {store.available_count > 0 && (
                                                    <button
                                                        className="neon-button select-store-btn"
                                                        onClick={() => setStore(store.store_id, store.store_name, store.address)}
                                                    >
                                                        Выбрать эту точку
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Точка выбрана — показываем итог и кнопку бронирования
                    <>
                        <div className="selected-store-card">
                            <div className="store-info">
                                <div className="store-name">📍 {storeName}</div>
                                <div className="store-address">{storeAddress}</div>
                            </div>
                            <button
                                className="change-store-btn"
                                onClick={() => setStore(null, '', '')}
                            >
                                Изменить
                            </button>
                        </div>

                        {/* Краткий список товаров */}
                        <div className="checkout-items-summary">
                            {items.map(item => {
                                const availability = getItemAvailability(item.product_id)
                                const isAvailable = availability !== null && availability > 0
                                return (
                                    <div key={item.product_id} className={`checkout-item-row ${!isAvailable ? 'unavailable' : ''}`}>
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-qty">× {item.quantity}</span>
                                        <span className="item-price">{item.price * item.quantity} ₽</span>
                                        {!isAvailable && <span className="item-unavailable">Нет</span>}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Итого:</span>
                                <span className="cart-total-price">{totalPrice} ₽</span>
                            </div>
                            {availableOnSelectedStore < items.length && (
                                <div className="availability-warning">
                                    ⚠️ {items.length - availableOnSelectedStore} товар(ов) нет на этой точке
                                </div>
                            )}
                            <button
                                className="neon-button checkout-btn"
                                onClick={() => navigate('/checkout')}
                                disabled={availableOnSelectedStore === 0}
                            >
                                ✨ Забронировать
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    }

    // ШАГ 1: Просмотр и редактирование товаров в корзине
    return (
        <div className="page">
            <div className="cart-header">
                <h1>🛒 Корзина</h1>
                <button className="clear-cart-btn" onClick={clearCart}>Очистить</button>
            </div>

            {/* Товары корзины */}
            <div className="cart-items">
                {items.map(item => (
                    <div key={item.product_id} className="cart-item">
                        <img src={getImageUrl(item.image_url)} alt="" className="cart-item-image" />
                        <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-brand">{item.brand}</div>
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

            {/* Футер с итогом и кнопкой "Далее" */}
            <div className="cart-footer">
                <div className="cart-total">
                    <span>Итого:</span>
                    <span className="cart-total-price">{totalPrice} ₽</span>
                </div>
                <button
                    className="neon-button checkout-btn"
                    onClick={() => setShowStoreSelection(true)}
                >
                    Далее → Выбрать точку
                </button>
            </div>
        </div>
    )
}
