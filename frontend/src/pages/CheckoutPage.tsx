import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Генерация временных слотов
function generateTimeSlots() {
    const slots = []
    for (let h = 10; h <= 21; h++) {
        for (let m = 0; m < 60; m += 30) {
            const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
            slots.push(time)
        }
    }
    return slots
}

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { items, storeId, storeAddress, totalPrice, clearCart } = useCart()
    const [timeFrom, setTimeFrom] = useState('14:00')
    const [timeTo, setTimeTo] = useState('14:30')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const timeSlots = generateTimeSlots()

    // Получаем данные пользователя из Telegram WebApp
    const tg = (window as any).Telegram?.WebApp
    const user = tg?.initDataUnsafe?.user || {
        id: 123456789,
        first_name: 'Демо',
        last_name: 'Пользователь'
    }

    const handleSubmit = async () => {
        if (timeFrom >= timeTo) {
            setError('Время "до" должно быть позже времени "с"')
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
                    store_id: storeId,
                    items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
                    pickup_time_from: timeFrom,
                    pickup_time_to: timeTo
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка создания брони')
            }

            clearCart()
            navigate(`/reservation/${data.id}`, { state: { orderNumber: data.order_number } })
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    // Редирект если корзина пуста
    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart')
        }
    }, [items.length, navigate])

    if (items.length === 0) {
        return null
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>Оформление</h1>
            </div>

            <div className="checkout-section">
                <h3>👤 Ваши данные</h3>
                <div className="checkout-info">
                    <div>{user.first_name} {user.last_name}</div>
                    {user.username && <div className="checkout-username">@{user.username}</div>}
                </div>
            </div>

            <div className="checkout-section">
                <h3>📍 Точка выдачи</h3>
                <div className="checkout-info">{storeAddress}</div>
            </div>

            <div className="checkout-section">
                <h3>⏰ Когда заберёте?</h3>
                <p className="checkout-hint">Бронь действует только на сегодня</p>
                <div className="time-picker">
                    <div className="time-select">
                        <label>С</label>
                        <select value={timeFrom} onChange={e => setTimeFrom(e.target.value)}>
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="time-select">
                        <label>До</label>
                        <select value={timeTo} onChange={e => setTimeTo(e.target.value)}>
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="checkout-section">
                <h3>🛒 Товары ({items.length})</h3>
                <div className="checkout-items">
                    {items.map(item => (
                        <div key={item.product_id} className="checkout-item">
                            <span className="checkout-item-name">{item.name}</span>
                            <span className="checkout-item-qty">×{item.quantity}</span>
                            <span className="checkout-item-price">{item.price * item.quantity} ₽</span>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-footer">
                <div className="checkout-total">
                    <span>Итого:</span>
                    <span>{totalPrice} ₽</span>
                </div>
                <button
                    className="neon-button checkout-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? '⏳ Оформляем...' : '✨ Забронировать'}
                </button>
            </div>
        </div>
    )
}
