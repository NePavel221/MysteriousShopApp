import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const API_URL = ''

type DeliveryMethod = 'cdek' | 'pochta'

const deliveryMethods = {
    cdek: {
        name: 'СДЭК',
        icon: '📦',
        price: 350,
        days: '2-4 дня',
        description: 'Курьерская доставка до двери или пункта выдачи'
    },
    pochta: {
        name: 'Почта России',
        icon: '✉️',
        price: 250,
        days: '5-10 дней',
        description: 'Доставка в ближайшее почтовое отделение'
    }
}

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { items, totalPrice, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)

    // Способ доставки
    const [delivery, setDelivery] = useState<DeliveryMethod>('cdek')

    // Данные получателя
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        telegramUsername: '',
        city: '',
        address: '',
        postalCode: '',
        comment: ''
    })

    // Получаем данные из Telegram
    const tg = (window as any).Telegram?.WebApp
    const user = tg?.initDataUnsafe?.user || {
        id: 123456789,
        first_name: 'Гость',
        last_name: ''
    }

    // Предзаполняем имя из Telegram
    useEffect(() => {
        if (user.first_name) {
            setFormData(prev => ({
                ...prev,
                fullName: `${user.first_name} ${user.last_name || ''}`.trim()
            }))
        }
    }, [user.first_name, user.last_name])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!formData.fullName.trim()) return 'Укажите ФИО получателя'
        if (!formData.phone.trim()) return 'Укажите номер телефона'
        // Более мягкая валидация телефона - просто проверяем что есть цифры
        const phoneDigits = formData.phone.replace(/\D/g, '')
        if (phoneDigits.length < 10) return 'Номер телефона должен содержать минимум 10 цифр'
        if (!formData.city.trim()) return 'Укажите город'
        if (!formData.postalCode.trim()) return 'Укажите почтовый индекс'
        if (!formData.address.trim()) return 'Укажите адрес доставки'
        return null
    }

    const handleSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name || '',
                    username: user.username || '',
                    delivery_method: delivery,
                    delivery_price: deliveryMethods[delivery].price,
                    recipient: formData,
                    telegram_username: formData.telegramUsername.replace('@', ''),
                    items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка создания заказа')
            }

            clearCart()
            setCreatedOrderId(data.id)
            setShowSuccessModal(true)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    // Редирект если корзина пуста (но не если показываем модалку)
    useEffect(() => {
        if (items.length === 0 && !showSuccessModal) {
            navigate('/cart')
        }
    }, [items.length, navigate, showSuccessModal])

    if (items.length === 0 && !showSuccessModal) return null

    const deliveryPrice = deliveryMethods[delivery].price
    const finalTotal = totalPrice + deliveryPrice

    return (
        <div className="checkout-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                
                .checkout-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                    padding: 20px 16px 120px;
                    font-family: 'Exo 2', sans-serif;
                }
                .checkout-header {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .checkout-header h1 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #e0f0ff;
                    margin: 0;
                }
                .checkout-section {
                    background: rgba(0, 212, 255, 0.05);
                    border: 1px solid rgba(0, 212, 255, 0.15);
                    border-radius: 16px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #00d4ff;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .delivery-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .delivery-option {
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid rgba(0, 212, 255, 0.2);
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .delivery-option.active {
                    border-color: #00d4ff;
                    background: rgba(0, 212, 255, 0.1);
                }
                .delivery-option:active {
                    transform: scale(0.98);
                }
                .delivery-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .delivery-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #e0f0ff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .delivery-price {
                    font-size: 14px;
                    font-weight: 600;
                    color: #00d4ff;
                }
                .delivery-info {
                    font-size: 12px;
                    color: #6699aa;
                }
                .delivery-days {
                    color: #00ff88;
                    margin-left: 8px;
                }
                .form-group {
                    margin-bottom: 12px;
                }
                .form-label {
                    display: block;
                    font-size: 12px;
                    color: #6699aa;
                    margin-bottom: 6px;
                }
                .form-label.required::after {
                    content: ' *';
                    color: #ff4444;
                }
                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 10px;
                    color: #e0f0ff;
                    font-size: 15px;
                    font-family: 'Exo 2', sans-serif;
                    outline: none;
                    transition: border-color 0.3s;
                    box-sizing: border-box;
                }
                .form-input:focus {
                    border-color: #00d4ff;
                }
                .form-input::placeholder {
                    color: #4a6070;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .form-textarea {
                    resize: none;
                    min-height: 60px;
                }
                .order-items {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .order-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
                }
                .order-item:last-child {
                    border-bottom: none;
                }
                .item-name {
                    font-size: 14px;
                    color: #e0f0ff;
                    flex: 1;
                }
                .item-qty {
                    font-size: 12px;
                    color: #6699aa;
                    margin: 0 12px;
                }
                .item-price {
                    font-size: 14px;
                    font-weight: 600;
                    color: #00d4ff;
                }
                .checkout-summary {
                    background: rgba(0, 212, 255, 0.08);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 16px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #6699aa;
                }
                .summary-row.total {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(0, 212, 255, 0.2);
                    font-size: 18px;
                    font-weight: 600;
                    color: #e0f0ff;
                }
                .summary-row.total span:last-child {
                    color: #00d4ff;
                }
                .checkout-error {
                    background: rgba(255, 68, 68, 0.15);
                    border: 1px solid rgba(255, 68, 68, 0.3);
                    border-radius: 10px;
                    padding: 12px 16px;
                    color: #ff6b6b;
                    font-size: 13px;
                    margin-bottom: 16px;
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
                .checkout-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                /* Модальное окно */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: linear-gradient(135deg, #001428 0%, #002040 100%);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 20px;
                    padding: 32px 24px;
                    max-width: 340px;
                    width: 100%;
                    text-align: center;
                }
                .modal-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }
                .modal-title {
                    font-size: 22px;
                    font-weight: 600;
                    color: #00ff88;
                    margin: 0 0 12px 0;
                }
                .modal-text {
                    font-size: 14px;
                    color: #a0c0d0;
                    line-height: 1.5;
                    margin: 0 0 20px 0;
                }
                .modal-steps {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                    text-align: left;
                }
                .modal-step {
                    font-size: 13px;
                    color: #e0f0ff;
                    padding: 6px 0;
                }
                .modal-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Exo 2', sans-serif;
                    cursor: pointer;
                }
                .modal-btn:active {
                    transform: scale(0.98);
                }
            `}</style>

            <div className="checkout-header">
                <h1>Оформление заказа</h1>
            </div>

            {/* Способ доставки */}
            <div className="checkout-section">
                <div className="section-title">🚚 Способ доставки</div>
                <div className="delivery-options">
                    {(Object.keys(deliveryMethods) as DeliveryMethod[]).map(method => (
                        <div
                            key={method}
                            className={`delivery-option ${delivery === method ? 'active' : ''}`}
                            onClick={() => setDelivery(method)}
                        >
                            <div className="delivery-header">
                                <span className="delivery-name">
                                    {deliveryMethods[method].icon} {deliveryMethods[method].name}
                                </span>
                                <span className="delivery-price">{deliveryMethods[method].price} ₽</span>
                            </div>
                            <div className="delivery-info">
                                {deliveryMethods[method].description}
                                <span className="delivery-days">{deliveryMethods[method].days}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Данные получателя */}
            <div className="checkout-section">
                <div className="section-title">👤 Данные получателя</div>

                <div className="form-group">
                    <label className="form-label required">ФИО получателя</label>
                    <input
                        type="text"
                        name="fullName"
                        className="form-input"
                        placeholder="Иванов Иван Иванович"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label required">Телефон</label>
                    <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        placeholder="+7 999 123 45 67"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Telegram (для связи)</label>
                    <input
                        type="text"
                        name="telegramUsername"
                        className="form-input"
                        placeholder="@username"
                        value={formData.telegramUsername}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label required">Город</label>
                        <input
                            type="text"
                            name="city"
                            className="form-input"
                            placeholder="Москва"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label required">Индекс</label>
                        <input
                            type="text"
                            name="postalCode"
                            className="form-input"
                            placeholder="123456"
                            value={formData.postalCode}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label required">Адрес доставки</label>
                    <input
                        type="text"
                        name="address"
                        className="form-input"
                        placeholder={delivery === 'cdek' ? 'Улица, дом, квартира или пункт выдачи СДЭК' : 'Улица, дом, квартира'}
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Комментарий к заказу</label>
                    <textarea
                        name="comment"
                        className="form-input form-textarea"
                        placeholder="Дополнительная информация..."
                        value={formData.comment}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Товары */}
            <div className="checkout-section">
                <div className="section-title">🛒 Ваш заказ ({items.length})</div>
                <div className="order-items">
                    {items.map(item => (
                        <div key={item.product_id} className="order-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-qty">×{item.quantity}</span>
                            <span className="item-price">{item.price * item.quantity} ₽</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Итого */}
            <div className="checkout-summary">
                <div className="summary-row">
                    <span>Товары</span>
                    <span>{totalPrice} ₽</span>
                </div>
                <div className="summary-row">
                    <span>Доставка ({deliveryMethods[delivery].name})</span>
                    <span>{deliveryPrice} ₽</span>
                </div>
                <div className="summary-row total">
                    <span>Итого</span>
                    <span>{finalTotal} ₽</span>
                </div>
            </div>

            {error && <div className="checkout-error">⚠️ {error}</div>}

            <button
                className="checkout-btn"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? '⏳ Оформляем...' : `Оформить заказ на ${finalTotal} ₽`}
            </button>

            {/* Модальное окно успешного создания заказа */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">✅</div>
                        <h2 className="modal-title">Заказ оформлен!</h2>
                        <p className="modal-text">
                            Теперь перейдите в профиль, чтобы увидеть ваш заказ,
                            проверить корректность данных и оплатить.
                        </p>
                        <div className="modal-steps">
                            <div className="modal-step">1️⃣ Проверьте данные получателя</div>
                            <div className="modal-step">2️⃣ Оплатите по реквизитам</div>
                            <div className="modal-step">3️⃣ Загрузите чек об оплате</div>
                        </div>
                        <button
                            className="modal-btn"
                            onClick={() => navigate(`/reservation/${createdOrderId}`)}
                        >
                            Перейти к заказу
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
