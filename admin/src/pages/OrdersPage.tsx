import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Order {
    id: number
    order_number: string
    status: string
    total_price: number
    delivery_method: string
    delivery_price: number
    recipient_name: string
    recipient_phone: string
    recipient_city: string
    recipient_address: string
    recipient_postal_code: string
    recipient_comment: string
    telegram_username: string
    payment_receipt_url: string | null
    shipping_info: string | null
    created_at: string
    first_name: string
    last_name: string
    telegram_id: number
    items?: Array<{
        name: string
        quantity: number
        price_at_time: number
        image_url: string
    }>
}

const statusConfig: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
    pending: { label: '💳 Ожидает оплаты', color: '#ff9500', next: 'payment_check', nextLabel: 'Чек загружен' },
    payment_check: { label: '🔍 Проверка оплаты', color: '#b026ff', next: 'confirmed', nextLabel: 'Оплата подтверждена' },
    confirmed: { label: '📦 Ожидает отправки', color: '#00d4ff', next: 'shipped', nextLabel: 'Отправлен' },
    shipped: { label: '🚚 Отправлен', color: '#00ff88', next: 'delivered', nextLabel: 'Доставлен' },
    delivered: { label: '✅ Получен', color: '#00ff88' },
    cancelled: { label: '❌ Отменён', color: '#ff4444' }
}

const deliveryNames: Record<string, string> = {
    cdek: 'СДЭК',
    pochta: 'Почта России'
}

interface Props {
    token: string
}

// Функция для получения конфига статуса (с нормализацией)
const getStatusConfig = (status: string) => {
    const normalized = status?.trim().toLowerCase() || ''
    if (normalized.includes('payment_check')) return statusConfig.payment_check
    if (normalized.includes('confirmed')) return statusConfig.confirmed
    if (normalized.includes('shipped')) return statusConfig.shipped
    if (normalized.includes('delivered')) return statusConfig.delivered
    if (normalized.includes('cancelled')) return statusConfig.cancelled
    if (normalized.includes('pending')) return statusConfig.pending
    return statusConfig.pending // fallback
}

export default function OrdersPage({ token }: Props) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [filter, setFilter] = useState<string>('all')
    const [shippingInput, setShippingInput] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900)

    useEffect(() => {
        loadOrders()
        const handleResize = () => setIsMobile(window.innerWidth < 900)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const loadOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (e) {
            console.error('Ошибка загрузки заказов:', e)
        } finally {
            setLoading(false)
        }
    }

    const loadOrderDetails = async (orderId: number) => {
        try {
            const res = await fetch(`${API_URL}/api/reservations/${orderId}`)
            if (res.ok) {
                const data = await res.json()
                // Нормализуем статус (убираем пробелы, приводим к нижнему регистру)
                if (data.status) {
                    data.status = data.status.trim().toLowerCase()
                }
                setSelectedOrder(data)
                setShippingInput(data.shipping_info || '')
            }
        } catch (e) {
            console.error('Ошибка загрузки деталей:', e)
        }
    }

    const updateStatus = async (orderId: number, newStatus: string, shippingInfo?: string) => {
        try {
            const body: any = { status: newStatus }
            if (shippingInfo) body.shipping_info = shippingInfo

            const res = await fetch(`${API_URL}/api/reservations/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                // Обновляем список заказов
                await loadOrders()
                // Обновляем детали выбранного заказа
                if (selectedOrder?.id === orderId) {
                    await loadOrderDetails(orderId)
                }
            }
        } catch (e) {
            console.error('Ошибка обновления:', e)
        }
    }

    const deleteOrder = async (orderId: number) => {
        if (!confirm('Удалить заказ? Это действие нельзя отменить.')) return

        try {
            const res = await fetch(`${API_URL}/api/reservations/${orderId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setSelectedOrder(null)
                await loadOrders()
            }
        } catch (e) {
            console.error('Ошибка удаления:', e)
        }
    }

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true
        if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status)
        return o.status === filter
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div className="orders-page">
            <div className="page-header">
                <h1>📋 Заказы</h1>
                {selectedOrder && isMobile && (
                    <button className="back-btn" onClick={() => setSelectedOrder(null)}>
                        ← Назад
                    </button>
                )}
            </div>

            {(!isMobile || !selectedOrder) && (
                <div className="filters">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        Все ({orders.length})
                    </button>
                    <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                        Активные
                    </button>
                    <button className={`filter-btn ${filter === 'payment_check' ? 'active' : ''}`} onClick={() => setFilter('payment_check')}>
                        🔍 Проверка
                    </button>
                </div>
            )}

            <div className="orders-layout">
                {/* Список заказов - скрываем на мобильном если выбран заказ */}
                {(!isMobile || !selectedOrder) && (
                    <div className="orders-list">
                        {filteredOrders.length === 0 ? (
                            <div className="empty">Нет заказов</div>
                        ) : (
                            filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                                    onClick={() => loadOrderDetails(order.id)}
                                >
                                    <div className="order-card-header">
                                        <span className="order-num">{order.order_number}</span>
                                        <span
                                            className="order-status-badge"
                                            style={{
                                                background: `${getStatusConfig(order.status).color}20`,
                                                color: getStatusConfig(order.status).color
                                            }}
                                        >
                                            {getStatusConfig(order.status).label}
                                        </span>
                                    </div>
                                    <div className="order-card-info">
                                        <span>{order.recipient_name || `${order.first_name} ${order.last_name}`}</span>
                                        <span className="order-price">{order.total_price} ₽</span>
                                    </div>
                                    <div className="order-card-date">{formatDate(order.created_at)}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Детали заказа - на мобильном показываем на весь экран */}
                {selectedOrder && (
                    <div className="order-details">
                        <div className="details-header">
                            <h2>{selectedOrder.order_number}</h2>
                            <span
                                className="status-badge-large"
                                style={{
                                    background: `${getStatusConfig(selectedOrder.status).color}20`,
                                    color: getStatusConfig(selectedOrder.status).color
                                }}
                            >
                                {getStatusConfig(selectedOrder.status).label}
                            </span>
                        </div>

                        <div className="details-section">
                            <h3>👤 Получатель</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">ФИО:</span>
                                    <span>{selectedOrder.recipient_name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Телефон:</span>
                                    <span>{selectedOrder.recipient_phone}</span>
                                </div>
                                {selectedOrder.telegram_username && (
                                    <div className="info-item">
                                        <span className="label">Telegram:</span>
                                        <a href={`https://t.me/${selectedOrder.telegram_username}`} target="_blank" rel="noopener">
                                            @{selectedOrder.telegram_username}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="details-section">
                            <h3>📍 Доставка</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Способ:</span>
                                    <span>{deliveryNames[selectedOrder.delivery_method] || selectedOrder.delivery_method}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Адрес:</span>
                                    <span>{selectedOrder.recipient_postal_code}, {selectedOrder.recipient_city}, {selectedOrder.recipient_address}</span>
                                </div>
                                {selectedOrder.recipient_comment && (
                                    <div className="info-item">
                                        <span className="label">Комментарий:</span>
                                        <span>{selectedOrder.recipient_comment}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedOrder.payment_receipt_url && (
                            <div className="details-section">
                                <h3>💳 Чек оплаты</h3>
                                <img
                                    src={`${API_URL}${selectedOrder.payment_receipt_url}`}
                                    alt="Чек"
                                    className="receipt-image"
                                    onClick={() => window.open(`${API_URL}${selectedOrder.payment_receipt_url}`, '_blank')}
                                />
                            </div>
                        )}

                        {selectedOrder.items && (
                            <div className="details-section">
                                <h3>🛒 Товары</h3>
                                <div className="items-list">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="item-row">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">×{item.quantity}</span>
                                            <span className="item-price">{item.price_at_time * item.quantity} ₽</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="total-row">
                                    <span>Доставка:</span>
                                    <span>{selectedOrder.delivery_price} ₽</span>
                                </div>
                                <div className="total-row final">
                                    <span>Итого:</span>
                                    <span>{selectedOrder.total_price} ₽</span>
                                </div>
                            </div>
                        )}

                        {/* Действия */}
                        <div className="details-section actions">
                            {selectedOrder.status.includes('confirmed') && !selectedOrder.status.includes('payment') && (
                                <div className="shipping-input-group">
                                    <input
                                        type="text"
                                        placeholder="Трек-номер или ссылка на квитанцию"
                                        value={shippingInput}
                                        onChange={e => setShippingInput(e.target.value)}
                                        className="shipping-input"
                                    />
                                    <div className="shipping-hint">Можно указать трек-номер или URL изображения квитанции</div>
                                </div>
                            )}

                            <div className="action-buttons">
                                {/* Кнопка перехода к следующему статусу */}
                                {selectedOrder.status.includes('pending') && (
                                    <button
                                        className="action-btn primary"
                                        onClick={() => updateStatus(selectedOrder.id, 'payment_check')}
                                    >
                                        ✓ Чек загружен
                                    </button>
                                )}
                                {selectedOrder.status.includes('payment_check') && (
                                    <button
                                        className="action-btn primary"
                                        onClick={() => updateStatus(selectedOrder.id, 'confirmed')}
                                    >
                                        ✓ Подтвердить оплату
                                    </button>
                                )}
                                {selectedOrder.status.includes('confirmed') && !selectedOrder.status.includes('payment') && (
                                    <button
                                        className="action-btn primary"
                                        onClick={() => updateStatus(selectedOrder.id, 'shipped', shippingInput)}
                                        disabled={!shippingInput}
                                    >
                                        ✓ Отправлен
                                    </button>
                                )}
                                {selectedOrder.status.includes('shipped') && (
                                    <button
                                        className="action-btn primary"
                                        onClick={() => updateStatus(selectedOrder.id, 'delivered')}
                                    >
                                        ✓ Доставлен
                                    </button>
                                )}

                                {!['cancelled', 'delivered'].includes(selectedOrder.status) && (
                                    <button
                                        className="action-btn danger"
                                        onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                                    >
                                        ✕ Отменить
                                    </button>
                                )}
                                <button
                                    className="action-btn delete"
                                    onClick={() => deleteOrder(selectedOrder.id)}
                                >
                                    🗑 Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .orders-page { padding: 24px; }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .page-header h1 {
                    font-size: 24px;
                    color: var(--gold);
                    margin: 0;
                }
                .back-btn {
                    padding: 8px 16px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--cyan);
                    cursor: pointer;
                    font-size: 14px;
                }
                .filters { 
                    display: flex; 
                    gap: 8px; 
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .filter-btn {
                    padding: 8px 12px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 12px;
                }
                .filter-btn.active {
                    background: var(--gold);
                    color: #000;
                    border-color: var(--gold);
                }
                
                .orders-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                    height: calc(100vh - 180px);
                    min-height: 400px;
                }
                
                @media (min-width: 900px) {
                    .orders-layout {
                        grid-template-columns: minmax(280px, 350px) minmax(400px, 1fr);
                        gap: 20px;
                    }
                }
                
                @media (min-width: 1200px) {
                    .orders-layout {
                        grid-template-columns: 380px 1fr;
                        gap: 24px;
                    }
                }
                
                .orders-list {
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 4px;
                }
                .order-card {
                    background: linear-gradient(145deg, #1a1a2e 0%, #13131f 100%);
                    border: 1px solid rgba(240, 208, 0, 0.25);
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                }
                .order-card:hover { 
                    border-color: var(--gold);
                    box-shadow: 0 4px 20px rgba(240, 208, 0, 0.15);
                    transform: translateY(-2px);
                }
                .order-card.selected {
                    border-color: var(--cyan);
                    background: linear-gradient(145deg, #1a2a3e 0%, #13202f 100%);
                    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
                }
                .order-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .order-num {
                    font-weight: 600;
                    color: var(--cyan);
                    font-size: 15px;
                }
                .order-status-badge {
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-weight: 500;
                }
                .order-card-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    color: #fff;
                }
                .order-price { font-weight: 600; color: var(--gold); font-size: 15px; }
                .order-card-date {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .order-details {
                    background: linear-gradient(145deg, #1a1a2e 0%, #0d0d14 100%);
                    border: 1px solid rgba(240, 208, 0, 0.2);
                    border-radius: 16px;
                    padding: 24px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    min-width: 0;
                    word-wrap: break-word;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                }
                .details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(240, 208, 0, 0.2);
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .details-header h2 {
                    font-size: 22px;
                    color: var(--cyan);
                    margin: 0;
                }
                .status-badge-large {
                    font-size: 12px;
                    padding: 8px 14px;
                    border-radius: 16px;
                    font-weight: 600;
                }
                
                .details-section {
                    margin-bottom: 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 16px;
                }
                .details-section h3 {
                    font-size: 14px;
                    color: var(--gold);
                    margin: 0 0 12px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(240, 208, 0, 0.15);
                }
                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .info-item {
                    display: flex;
                    gap: 8px;
                    font-size: 13px;
                    flex-wrap: wrap;
                    padding: 4px 0;
                }
                .info-item .label {
                    color: var(--text-secondary);
                    min-width: 80px;
                }
                .info-item span:last-child {
                    color: #fff;
                }
                .info-item a {
                    color: var(--cyan);
                    text-decoration: none;
                }
                .info-item a:hover { text-decoration: underline; }
                
                .receipt-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                    cursor: pointer;
                    border: 2px solid rgba(240, 208, 0, 0.3);
                    transition: all 0.2s;
                }
                .receipt-image:hover { 
                    opacity: 0.9;
                    border-color: var(--gold);
                }
                
                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    font-size: 13px;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                .item-name { flex: 1; color: #fff; min-width: 120px; }
                .item-qty { color: var(--text-secondary); }
                .item-price { color: var(--cyan); font-weight: 600; }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .total-row.final {
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                    background: rgba(240, 208, 0, 0.1);
                    border-radius: 8px;
                    margin-top: 8px;
                    padding: 12px;
                }
                .total-row.final span:last-child { color: var(--gold); }
                
                .actions { 
                    margin-top: 20px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 16px;
                }
                .shipping-input-group { margin-bottom: 12px; }
                .shipping-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    box-sizing: border-box;
                }
                .shipping-input:focus {
                    outline: none;
                    border-color: var(--cyan);
                    box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
                }
                .shipping-hint {
                    font-size: 10px;
                    color: var(--text-secondary);
                    margin-top: 6px;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .action-btn {
                    padding: 12px 18px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .action-btn.primary {
                    background: linear-gradient(135deg, #00ff88, #00d4ff);
                    color: #000 !important;
                    font-weight: 700;
                    text-shadow: none;
                    border: 2px solid #00ff88;
                    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
                }
                .action-btn.primary:hover { 
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
                }
                .action-btn.primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                .action-btn.danger {
                    background: rgba(255, 68, 68, 0.15);
                    color: #ff6666;
                    border: 1px solid rgba(255, 68, 68, 0.4);
                }
                .action-btn.danger:hover {
                    background: rgba(255, 68, 68, 0.25);
                    border-color: #ff4444;
                }
                .action-btn.delete {
                    background: rgba(100, 100, 100, 0.15);
                    color: #999;
                    border: 1px solid rgba(100, 100, 100, 0.3);
                }
                .action-btn.delete:hover {
                    background: rgba(255, 68, 68, 0.15);
                    color: #ff6666;
                    border-color: rgba(255, 68, 68, 0.4);
                }
                
                .empty {
                    text-align: center;
                    padding: 60px 40px;
                    color: var(--text-secondary);
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                }
                
                /* Планшеты и маленькие десктопы */
                @media (max-width: 899px) {
                    .orders-page { padding: 16px; }
                    .order-details { padding: 16px; }
                    .details-header h2 { font-size: 20px; }
                    .info-item .label { min-width: 70px; }
                    .details-section { padding: 12px; }
                }
                
                /* Мобильные */
                @media (max-width: 600px) {
                    .orders-page { padding: 12px; }
                    .page-header h1 { font-size: 18px; }
                    .order-details { padding: 12px; }
                    .details-header h2 { font-size: 18px; }
                    .details-header { flex-direction: column; align-items: flex-start; }
                    .action-buttons { flex-direction: column; }
                    .action-btn { width: 100%; text-align: center; }
                    .details-section { padding: 10px; }
                }
            `}</style>
        </div >
    )
}
