import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'

const API_URL = ''

interface Order {
    id: number
    order_number: string
    status: string
    total_price: number
    created_at: string
    items_count: number
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '💳 Ожидает оплаты', color: '#ff9500' },
    payment_check: { label: '🔍 Проверка оплаты', color: '#b026ff' },
    confirmed: { label: '📦 Ожидает отправки', color: '#00d4ff' },
    shipped: { label: '🚚 Отправлен', color: '#00ff88' },
    delivered: { label: '✅ Получен', color: '#00ff88' },
    cancelled: { label: '❌ Отменён', color: '#ff4444' }
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [bonusPoints, setBonusPoints] = useState(0)

    // Получаем данные из Telegram WebApp
    const getTelegramUser = () => {
        // @ts-ignore - Telegram WebApp API
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            // @ts-ignore
            return window.Telegram.WebApp.initDataUnsafe.user
        }
        return {
            id: 123456789,
            first_name: 'Гость',
            last_name: '',
            username: 'guest'
        }
    }

    const tgUser = getTelegramUser()

    useEffect(() => {
        async function loadData() {
            try {
                // Загружаем заказы пользователя
                const ordersRes = await fetch(`${API_URL}/api/reservations/user/${tgUser.id}`)
                if (ordersRes.ok) {
                    const data = await ordersRes.json()
                    setOrders(data)
                }

                // Загружаем бонусы
                const userRes = await fetch(`${API_URL}/api/users/${tgUser.id}`)
                if (userRes.ok) {
                    const userData = await userRes.json()
                    setBonusPoints(userData.bonus_points || 0)
                }
            } catch (error) {
                console.error('Ошибка загрузки:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [tgUser.id])

    if (loading) {
        return (
            <div className="loading" style={{ minHeight: '100vh' }}>
                <Spinner size="l" />
            </div>
        )
    }

    return (
        <div className="profile-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                
                .profile-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                    padding-bottom: 100px;
                    font-family: 'Exo 2', sans-serif;
                }
                .profile-header {
                    padding: 32px 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
                }
                .profile-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    font-size: 32px;
                }
                .profile-name {
                    font-size: 24px;
                    font-weight: 600;
                    color: #e0f0ff;
                    margin-bottom: 4px;
                }
                .profile-username {
                    font-size: 14px;
                    color: #6699aa;
                }
                .bonus-card {
                    margin: 20px 16px;
                    padding: 24px;
                    background: rgba(0, 212, 255, 0.08);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 20px;
                    text-align: center;
                }
                .bonus-label {
                    font-size: 12px;
                    color: #6699aa;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .bonus-value {
                    font-size: 48px;
                    font-weight: 700;
                    color: #00d4ff;
                    line-height: 1;
                }
                .bonus-suffix {
                    font-size: 14px;
                    color: #6699aa;
                    margin-top: 4px;
                }
                .bonus-info {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(0, 212, 255, 0.1);
                    font-size: 13px;
                    color: #6699aa;
                }
                .section-title {
                    padding: 20px 16px 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #e0f0ff;
                    letter-spacing: 1px;
                }
                .orders-list {
                    padding: 0 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .order-card {
                    background: rgba(0, 212, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 212, 255, 0.15);
                    border-radius: 16px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .order-card:active {
                    transform: scale(0.98);
                    border-color: rgba(0, 212, 255, 0.4);
                }
                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .order-number {
                    font-weight: 600;
                    color: #00d4ff;
                    font-size: 14px;
                }
                .order-status {
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-weight: 500;
                }
                .order-details {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                }
                .order-date {
                    color: #6699aa;
                }
                .order-price {
                    font-weight: 600;
                    color: #e0f0ff;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #6699aa;
                }
                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }
                .empty-text {
                    font-size: 14px;
                }
            `}</style>

            {/* Шапка профиля */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {tgUser.first_name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-name">
                    {tgUser.first_name} {tgUser.last_name || ''}
                </div>
                {tgUser.username && (
                    <div className="profile-username">@{tgUser.username}</div>
                )}
            </div>

            {/* Бонусы */}
            <div className="bonus-card">
                <div className="bonus-label">Ваши бонусы</div>
                <div className="bonus-value">{bonusPoints}</div>
                <div className="bonus-suffix">баллов</div>
                <div className="bonus-info">
                    💎 5% кэшбэк с каждой покупки
                </div>
            </div>

            {/* Мои заказы */}
            <div className="section-title">📦 Мои заказы</div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <div className="empty-text">У вас пока нет заказов</div>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="order-card"
                            onClick={() => navigate(`/reservation/${order.id}`)}
                        >
                            <div className="order-header">
                                <span className="order-number">#{order.order_number}</span>
                                <span
                                    className="order-status"
                                    style={{
                                        background: `${statusLabels[order.status]?.color}20`,
                                        color: statusLabels[order.status]?.color
                                    }}
                                >
                                    {statusLabels[order.status]?.label || order.status}
                                </span>
                            </div>
                            <div className="order-details">
                                <span className="order-date">
                                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                                </span>
                                <span className="order-price">{order.total_price} ₽</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
