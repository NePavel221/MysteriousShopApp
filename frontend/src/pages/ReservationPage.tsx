import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const API_URL = ''

interface Reservation {
    id: number
    order_number: string
    status: string
    store_name: string
    store_address: string
    pickup_time_from: string
    pickup_time_to: string
    total_price: number
    created_at: string
    items: Array<{
        name: string
        brand: string
        quantity: number
        price_at_time: number
    }>
}

const statusLabels: Record<string, string> = {
    pending: '⏳ Ожидает',
    confirmed: '✅ Подтверждена',
    completed: '🎉 Выдана',
    cancelled: '❌ Отменена'
}

export default function ReservationPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [reservation, setReservation] = useState<Reservation | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)

    const isNew = location.state?.orderNumber

    useEffect(() => {
        fetch(`${API_URL}/api/reservations/${id}`)
            .then(r => r.json())
            .then(data => {
                setReservation(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    const handleCancel = async () => {
        if (!confirm('Отменить бронь?')) return

        setCancelling(true)
        const tg = (window as any).Telegram?.WebApp
        const telegramId = tg?.initDataUnsafe?.user?.id || 123456789

        try {
            await fetch(`${API_URL}/api/reservations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled', telegram_id: telegramId })
            })
            setReservation(prev => prev ? { ...prev, status: 'cancelled' } : null)
        } catch (e) {
            alert('Ошибка отмены')
        } finally {
            setCancelling(false)
        }
    }

    if (loading) {
        return <div className="page loading">Загрузка...</div>
    }

    if (!reservation) {
        return (
            <div className="page">
                <div className="empty-cart">
                    <h2>Бронь не найдена</h2>
                    <button className="neon-button" onClick={() => navigate('/')}>На главную</button>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            {isNew && (
                <div className="reservation-success">
                    <div className="success-icon">✅</div>
                    <h2>Бронь оформлена!</h2>
                </div>
            )}

            <div className="reservation-number">{reservation.order_number}</div>
            <div className={`reservation-status status-${reservation.status}`}>
                {statusLabels[reservation.status]}
            </div>

            <div className="reservation-section">
                <h3>📍 Точка выдачи</h3>
                <div className="reservation-info">
                    <div className="reservation-store">{reservation.store_name}</div>
                    <div className="reservation-address">{reservation.store_address}</div>
                </div>
            </div>

            <div className="reservation-section">
                <h3>⏰ Время</h3>
                <div className="reservation-info">
                    {reservation.pickup_time_from} — {reservation.pickup_time_to}
                </div>
            </div>

            <div className="reservation-section">
                <h3>🛒 Товары</h3>
                <div className="reservation-items">
                    {reservation.items.map((item, i) => (
                        <div key={i} className="reservation-item">
                            <span className="reservation-item-name">{item.name}</span>
                            <span className="reservation-item-qty">×{item.quantity}</span>
                            <span className="reservation-item-price">{item.price_at_time * item.quantity} ₽</span>
                        </div>
                    ))}
                </div>
                <div className="reservation-total">
                    <span>Итого:</span>
                    <span>{reservation.total_price} ₽</span>
                </div>
            </div>

            <div className="reservation-actions">
                {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                    <button
                        className="cancel-btn"
                        onClick={handleCancel}
                        disabled={cancelling}
                    >
                        {cancelling ? 'Отмена...' : 'Отменить бронь'}
                    </button>
                )}
                <button className="neon-button" onClick={() => navigate('/catalog')}>
                    В каталог
                </button>
            </div>
        </div>
    )
}
