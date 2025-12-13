import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Button } from '@telegram-apps/telegram-ui'
import { getUser, generateDiscountCode } from '../api'
import type { User } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '⏳ Ожидает', color: '#ff9500' },
    confirmed: { label: '✅ Подтверждена', color: '#39ff14' },
    completed: { label: '🎉 Выдана', color: '#00f0ff' },
    cancelled: { label: '❌ Отменена', color: '#ff2d95' }
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [generatingCode, setGeneratingCode] = useState(false)

    // Получаем Telegram ID (в реальном приложении из Telegram WebApp)
    const getTelegramId = (): number => {
        // @ts-ignore - Telegram WebApp API
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            // @ts-ignore
            return window.Telegram.WebApp.initDataUnsafe.user.id
        }
        // Демо ID для тестирования вне Telegram
        return 123456789
    }

    // Получаем имя пользователя из Telegram
    const getTelegramUser = () => {
        // @ts-ignore
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            // @ts-ignore
            return window.Telegram.WebApp.initDataUnsafe.user
        }
        return { first_name: 'Демо', last_name: 'Пользователь' }
    }

    useEffect(() => {
        async function loadData() {
            try {
                const telegramId = getTelegramId()
                const [userData, reservationsData] = await Promise.all([
                    getUser(telegramId),
                    fetch(`${API_URL}/api/reservations/user/${telegramId}`).then(r => r.json())
                ])
                setUser(userData)
                setReservations(reservationsData)
            } catch (error) {
                console.error('Ошибка загрузки:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleGenerateCode = async () => {
        if (!user) return
        setGeneratingCode(true)
        try {
            const telegramId = getTelegramId()
            const result = await generateDiscountCode(telegramId)
            setUser({ ...user, discount_code: result.discount_code })
        } catch (error) {
            console.error('Ошибка генерации кода:', error)
        } finally {
            setGeneratingCode(false)
        }
    }

    if (loading) {
        return (
            <div className="loading" style={{ minHeight: '100vh' }}>
                <Spinner size="l" />
            </div>
        )
    }

    const tgUser = getTelegramUser()

    return (
        <div className="page">
            {/* Шапка профиля */}
            <div className="page-header">
                <h1>👤 {tgUser.first_name} {tgUser.last_name || ''}</h1>
                <p>Участник программы лояльности</p>
            </div>

            {/* Карточка бонусов */}
            <div className="bonus-card">
                <div className="label">Ваши бонусы</div>
                <div className="points">{user?.bonus_points || 0}</div>
                <div className="label">баллов</div>

                {/* Код скидки */}
                <div className="discount-code">
                    <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
                        Ваш код скидки
                    </div>
                    <div className="code">{user?.discount_code || '—'}</div>
                </div>
            </div>

            {/* Кнопка обновления кода */}
            <div style={{ padding: '0 16px' }}>
                <Button
                    size="l"
                    stretched
                    loading={generatingCode}
                    onClick={handleGenerateCode}
                >
                    🔄 Обновить код скидки
                </Button>
            </div>

            {/* Информация о программе */}
            <div style={{ padding: '24px 16px' }}>
                <h3 style={{ marginBottom: '12px' }}>💡 Как это работает</h3>
                <div style={{
                    background: 'var(--tgui--secondary_bg_color, #16213e)',
                    borderRadius: '16px',
                    padding: '16px'
                }}>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#b0b0b0', marginBottom: '12px' }}>
                        <strong style={{ color: 'white' }}>1 балл = 1 рубль</strong><br />
                        Накапливайте баллы с каждой покупки и оплачивайте ими до 30% стоимости товаров.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#b0b0b0', marginBottom: '12px' }}>
                        <strong style={{ color: 'white' }}>Код скидки</strong><br />
                        Покажите код продавцу при оплате, чтобы начислить или списать баллы.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#b0b0b0' }}>
                        <strong style={{ color: 'white' }}>Кэшбэк 5%</strong><br />
                        С каждой покупки возвращаем 5% бонусами на ваш счёт.
                    </p>
                </div>
            </div>

            {/* История броней */}
            <div style={{ padding: '0 16px 24px' }}>
                <h3 style={{ marginBottom: '12px' }}>📋 Мои брони</h3>
                {reservations.length === 0 ? (
                    <div style={{
                        background: 'var(--vc-card)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        color: 'var(--vc-text-dim)'
                    }}>
                        У вас пока нет броней
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reservations.map(res => (
                            <div
                                key={res.id}
                                className="reservation-card"
                                onClick={() => navigate(`/reservation/${res.id}`)}
                                style={{
                                    background: 'var(--vc-card)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255, 45, 149, 0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--vc-neon-magenta)' }}>
                                        {res.order_number}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: `${statusLabels[res.status]?.color}20`,
                                        color: statusLabels[res.status]?.color
                                    }}>
                                        {statusLabels[res.status]?.label}
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--vc-text-dim)', marginBottom: '4px' }}>
                                    📍 {res.store_address}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--vc-text-dim)' }}>
                                        ⏰ {res.pickup_time_from} — {res.pickup_time_to}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{res.total_price} ₽</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Демо-уведомление */}
            <div style={{
                margin: '0 16px 16px',
                padding: '12px 16px',
                background: 'rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#667eea'
            }}>
                ℹ️ Это демо-версия. В полной версии данные синхронизируются с системой UDS.
            </div>
        </div>
    )
}
