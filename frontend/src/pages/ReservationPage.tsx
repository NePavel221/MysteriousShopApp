import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const API_URL = ''

interface Reservation {
    id: number
    order_number: string
    status: string
    delivery_method: string
    delivery_price: number
    recipient_name: string
    recipient_phone: string
    recipient_city: string
    recipient_address: string
    recipient_postal_code: string
    recipient_comment: string
    telegram_username: string
    total_price: number
    created_at: string
    formatted_date: string
    payment_receipt_url: string | null
    shipping_info: string | null
    items: Array<{
        name: string
        brand: string
        quantity: number
        price_at_time: number
        image_url: string
    }>
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'Ожидает оплаты', color: '#ff9500', icon: '💳' },
    payment_check: { label: 'Проверка оплаты', color: '#b026ff', icon: '🔍' },
    confirmed: { label: 'Ожидает отправки', color: '#00d4ff', icon: '📦' },
    shipped: { label: 'Отправлен', color: '#00ff88', icon: '🚚' },
    delivered: { label: 'Получен', color: '#00ff88', icon: '✅' },
    cancelled: { label: 'Отменён', color: '#ff4444', icon: '❌' }
}

const deliveryNames: Record<string, string> = {
    cdek: 'СДЭК',
    pochta: 'Почта России'
}

// Реквизиты для оплаты
const PAYMENT_REQUISITES = {
    card: '2200 7007 1234 5678',
    bank: 'Сбербанк',
    recipient: 'Иван И.'
}

export default function ReservationPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [reservation, setReservation] = useState<Reservation | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showReceiptModal, setShowReceiptModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        recipient_name: '',
        recipient_phone: '',
        telegram_username: '',
        recipient_city: '',
        recipient_address: '',
        recipient_postal_code: '',
        recipient_comment: ''
    })
    const [saving, setSaving] = useState(false)

    const isNew = location.state?.orderNumber

    useEffect(() => {
        fetch(`${API_URL}/api/reservations/${id}`)
            .then(r => r.json())
            .then(data => {
                setReservation(data)
                // Инициализируем данные для редактирования
                setEditData({
                    recipient_name: data.recipient_name || '',
                    recipient_phone: data.recipient_phone || '',
                    telegram_username: data.telegram_username || '',
                    recipient_city: data.recipient_city || '',
                    recipient_address: data.recipient_address || '',
                    recipient_postal_code: data.recipient_postal_code || '',
                    recipient_comment: data.recipient_comment || ''
                })
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !reservation) return

        setUploading(true)
        const formData = new FormData()
        formData.append('receipt', file)

        try {
            const res = await fetch(`${API_URL}/api/reservations/${reservation.id}/receipt`, {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                const data = await res.json()
                setReservation(prev => prev ? {
                    ...prev,
                    status: 'payment_check',
                    payment_receipt_url: data.receipt_url
                } : null)
                setShowReceiptModal(true)
            }
        } catch (e) {
            alert('Ошибка загрузки чека')
        } finally {
            setUploading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text.replace(/\s/g, ''))
        alert('Скопировано!')
    }

    // Проверка, является ли строка URL изображения
    const isImageUrl = (str: string) => {
        if (!str) return false
        return str.match(/\.(jpg|jpeg|png|gif|webp)$/i) || str.startsWith('/uploads/')
    }

    // Сохранение отредактированных данных
    const handleSaveEdit = async () => {
        if (!reservation) return
        setSaving(true)
        try {
            const res = await fetch(`${API_URL}/api/reservations/${reservation.id}/recipient`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            })
            if (res.ok) {
                setReservation(prev => prev ? { ...prev, ...editData } : null)
                setIsEditing(false)
            } else {
                alert('Ошибка сохранения')
            }
        } catch (e) {
            alert('Ошибка сохранения')
        } finally {
            setSaving(false)
        }
    }

    // Можно ли редактировать (только до подтверждения оплаты)
    const canEdit = reservation && ['pending', 'payment_check'].includes(reservation.status)

    if (loading) {
        return <div className="page loading">Загрузка...</div>
    }

    if (!reservation) {
        return (
            <div className="page">
                <div className="empty-cart">
                    <h2>Заказ не найден</h2>
                    <button className="neon-button" onClick={() => navigate('/')}>На главную</button>
                </div>
            </div>
        )
    }

    const status = statusConfig[reservation.status] || statusConfig.pending

    return (
        <div className="reservation-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                
                .reservation-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                    padding: 20px 16px 120px;
                    font-family: 'Exo 2', sans-serif;
                }
                .success-banner {
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .success-icon { font-size: 48px; margin-bottom: 8px; }
                .success-title { font-size: 20px; font-weight: 600; color: #00ff88; }
                .success-hint { font-size: 13px; color: #6699aa; margin-top: 8px; }
                
                .order-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .order-number {
                    font-size: 28px;
                    font-weight: 700;
                    color: #00d4ff;
                }
                .order-date {
                    font-size: 13px;
                    color: #6699aa;
                    margin-top: 4px;
                }
                .order-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-top: 12px;
                }
                
                .section {
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
                .section-content {
                    font-size: 14px;
                    color: #e0f0ff;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
                }
                .info-row:last-child { border-bottom: none; }
                .info-label { color: #6699aa; }
                .info-value { color: #e0f0ff; font-weight: 500; }
                
                .payment-card {
                    background: rgba(255, 149, 0, 0.1);
                    border: 1px solid rgba(255, 149, 0, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 12px;
                }
                .payment-title {
                    font-size: 13px;
                    color: #ff9500;
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                .card-number {
                    font-size: 20px;
                    font-weight: 600;
                    color: #e0f0ff;
                    letter-spacing: 2px;
                    cursor: pointer;
                    padding: 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    text-align: center;
                }
                .card-number:active { opacity: 0.7; }
                .card-hint {
                    font-size: 11px;
                    color: #6699aa;
                    text-align: center;
                    margin-top: 8px;
                }
                .card-info {
                    font-size: 12px;
                    color: #6699aa;
                    margin-top: 8px;
                }
                
                .upload-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #ff9500 0%, #cc7700 100%);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 12px;
                    font-family: 'Exo 2', sans-serif;
                }
                .upload-btn:disabled { opacity: 0.6; }
                .upload-btn:active { transform: scale(0.98); }
                
                .receipt-preview {
                    margin-top: 12px;
                    text-align: center;
                }
                .receipt-preview img {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                }
                .receipt-status {
                    font-size: 12px;
                    color: #b026ff;
                    margin-top: 8px;
                }
                
                .shipping-info {
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 12px;
                }
                .shipping-title {
                    font-size: 13px;
                    color: #00ff88;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                .tracking-number {
                    font-size: 16px;
                    font-weight: 600;
                    color: #e0f0ff;
                }
                
                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .item-card {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }
                .item-image {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                    background: rgba(0, 212, 255, 0.1);
                }
                .item-details { flex: 1; }
                .item-name {
                    font-size: 14px;
                    color: #e0f0ff;
                    font-weight: 500;
                }
                .item-qty {
                    font-size: 12px;
                    color: #6699aa;
                    margin-top: 4px;
                }
                .item-price {
                    font-size: 14px;
                    color: #00d4ff;
                    font-weight: 600;
                    margin-top: 4px;
                }
                
                .total-section {
                    background: rgba(0, 212, 255, 0.08);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 16px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #6699aa;
                }
                .total-row.final {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(0, 212, 255, 0.2);
                    font-size: 18px;
                    font-weight: 600;
                    color: #e0f0ff;
                }
                .total-row.final span:last-child { color: #00d4ff; }
                
                .action-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Exo 2', sans-serif;
                }
                .action-btn:active { transform: scale(0.98); }
                
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
                    border: 1px solid rgba(176, 38, 255, 0.3);
                    border-radius: 20px;
                    padding: 32px 24px;
                    max-width: 340px;
                    width: 100%;
                    text-align: center;
                }
                .modal-icon { font-size: 64px; margin-bottom: 16px; }
                .modal-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #b026ff;
                    margin: 0 0 12px 0;
                }
                .modal-text {
                    font-size: 14px;
                    color: #a0c0d0;
                    line-height: 1.6;
                    margin: 0 0 20px 0;
                }
                .modal-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #b026ff 0%, #8800cc 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Exo 2', sans-serif;
                    cursor: pointer;
                }
                .modal-btn:active { transform: scale(0.98); }
                
                /* Редактирование */
                .edit-btn {
                    background: rgba(0, 212, 255, 0.15);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 8px;
                    padding: 6px 12px;
                    color: #00d4ff;
                    font-size: 12px;
                    cursor: pointer;
                    font-family: 'Exo 2', sans-serif;
                }
                .edit-btn:active { transform: scale(0.98); }
                .edit-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 8px;
                    color: #e0f0ff;
                    font-size: 14px;
                    font-family: 'Exo 2', sans-serif;
                    margin-bottom: 8px;
                    box-sizing: border-box;
                }
                .edit-input:focus {
                    outline: none;
                    border-color: #00d4ff;
                }
                .edit-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .save-btn {
                    flex: 1;
                    padding: 10px;
                    background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Exo 2', sans-serif;
                }
                .cancel-btn {
                    flex: 1;
                    padding: 10px;
                    background: rgba(100, 100, 100, 0.3);
                    border: 1px solid rgba(100, 100, 100, 0.5);
                    border-radius: 8px;
                    color: #888;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Exo 2', sans-serif;
                }
                .shipping-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    margin-top: 8px;
                }
            `}</style>

            {isNew && (
                <div className="success-banner">
                    <div className="success-icon">✅</div>
                    <div className="success-title">Заказ оформлен!</div>
                    <div className="success-hint">Оплатите заказ и загрузите чек</div>
                </div>
            )}

            <div className="order-header">
                <div className="order-number">{reservation.order_number}</div>
                <div className="order-date">{reservation.formatted_date}</div>
                <div
                    className="order-status"
                    style={{
                        background: `${status.color}20`,
                        color: status.color
                    }}
                >
                    {status.icon} {status.label}
                </div>
            </div>

            {/* Блок оплаты - показываем только если статус pending */}
            {reservation.status === 'pending' && (
                <div className="section">
                    <div className="section-title">💳 Оплата</div>

                    <div className="payment-info-box" style={{
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '12px',
                        fontSize: '13px',
                        color: '#a0c0d0',
                        lineHeight: '1.5'
                    }}>
                        📋 <strong style={{ color: '#00d4ff' }}>Как оплатить:</strong><br />
                        1. Переведите сумму на карту ниже<br />
                        2. Сделайте скриншот чека<br />
                        3. Загрузите чек — мы проверим и отправим заказ
                    </div>

                    <div className="payment-card">
                        <div className="payment-title">Переведите {reservation.total_price} ₽ на карту:</div>
                        <div
                            className="card-number"
                            onClick={() => copyToClipboard(PAYMENT_REQUISITES.card)}
                        >
                            {PAYMENT_REQUISITES.card}
                        </div>
                        <div className="card-hint">Нажмите чтобы скопировать</div>
                        <div className="card-info">
                            {PAYMENT_REQUISITES.bank} • {PAYMENT_REQUISITES.recipient}
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadReceipt}
                        style={{ display: 'none' }}
                        id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload">
                        <div className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                            {uploading ? '⏳ Загрузка...' : '📸 Загрузить скриншот чека'}
                        </div>
                    </label>
                </div>
            )}

            {/* Чек загружен - проверка */}
            {reservation.status === 'payment_check' && reservation.payment_receipt_url && (
                <div className="section">
                    <div className="section-title">🔍 Проверка оплаты</div>
                    <div className="receipt-preview">
                        <img src={`${API_URL}${reservation.payment_receipt_url}`} alt="Чек" />
                        <div className="receipt-status">Чек отправлен на проверку</div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadReceipt}
                        style={{ display: 'none' }}
                        id="receipt-replace"
                    />
                    <label htmlFor="receipt-replace">
                        <div className={`upload-btn replace-btn ${uploading ? 'disabled' : ''}`} style={{
                            background: 'rgba(176, 38, 255, 0.2)',
                            border: '1px solid rgba(176, 38, 255, 0.4)',
                            color: '#b026ff'
                        }}>
                            {uploading ? '⏳ Загрузка...' : '🔄 Заменить чек'}
                        </div>
                    </label>
                </div>
            )}

            {/* Информация об отправке */}
            {(reservation.status === 'shipped' || reservation.status === 'delivered') && reservation.shipping_info && (
                <div className="section">
                    <div className="section-title">🚚 Отправка</div>
                    <div className="shipping-info">
                        {isImageUrl(reservation.shipping_info) ? (
                            <>
                                <div className="shipping-title">Квитанция об отправке:</div>
                                <img
                                    src={reservation.shipping_info.startsWith('/') ? `${API_URL}${reservation.shipping_info}` : reservation.shipping_info}
                                    alt="Квитанция"
                                    className="shipping-image"
                                    onClick={() => window.open(reservation.shipping_info!.startsWith('/') ? `${API_URL}${reservation.shipping_info}` : reservation.shipping_info!, '_blank')}
                                    style={{ cursor: 'pointer' }}
                                />
                            </>
                        ) : (
                            <>
                                <div className="shipping-title">Трек-номер:</div>
                                <div className="tracking-number">{reservation.shipping_info}</div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Данные получателя */}
            <div className="section">
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>👤 Получатель</span>
                    {canEdit && !isEditing && (
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>
                            ✏️ Изменить
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="section-content">
                        <input
                            type="text"
                            className="edit-input"
                            placeholder="ФИО получателя"
                            value={editData.recipient_name}
                            onChange={e => setEditData(prev => ({ ...prev, recipient_name: e.target.value }))}
                        />
                        <input
                            type="tel"
                            className="edit-input"
                            placeholder="Телефон"
                            value={editData.recipient_phone}
                            onChange={e => setEditData(prev => ({ ...prev, recipient_phone: e.target.value }))}
                        />
                        <input
                            type="text"
                            className="edit-input"
                            placeholder="Telegram @username"
                            value={editData.telegram_username}
                            onChange={e => setEditData(prev => ({ ...prev, telegram_username: e.target.value }))}
                        />
                        <input
                            type="text"
                            className="edit-input"
                            placeholder="Город"
                            value={editData.recipient_city}
                            onChange={e => setEditData(prev => ({ ...prev, recipient_city: e.target.value }))}
                        />
                        <input
                            type="text"
                            className="edit-input"
                            placeholder="Индекс"
                            value={editData.recipient_postal_code}
                            onChange={e => setEditData(prev => ({ ...prev, recipient_postal_code: e.target.value }))}
                        />
                        <input
                            type="text"
                            className="edit-input"
                            placeholder="Адрес"
                            value={editData.recipient_address}
                            onChange={e => setEditData(prev => ({ ...prev, recipient_address: e.target.value }))}
                        />
                        <input
                            type="text"
                            className="edit-input"
                            placeholder="Комментарий"
                            value={editData.recipient_comment}
                            onChange={e => setEditData(prev => ({ ...prev, recipient_comment: e.target.value }))}
                        />
                        <div className="edit-actions">
                            <button className="save-btn" onClick={handleSaveEdit} disabled={saving}>
                                {saving ? '⏳' : '✓ Сохранить'}
                            </button>
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="section-content">
                        <div className="info-row">
                            <span className="info-label">ФИО</span>
                            <span className="info-value">{reservation.recipient_name}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Телефон</span>
                            <span className="info-value">{reservation.recipient_phone}</span>
                        </div>
                        {reservation.telegram_username && (
                            <div className="info-row">
                                <span className="info-label">Telegram</span>
                                <span className="info-value">@{reservation.telegram_username}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Адрес доставки */}
            <div className="section">
                <div className="section-title">📍 Доставка</div>
                <div className="section-content">
                    <div className="info-row">
                        <span className="info-label">Способ</span>
                        <span className="info-value">{deliveryNames[reservation.delivery_method] || reservation.delivery_method}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Город</span>
                        <span className="info-value">{reservation.recipient_city}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Индекс</span>
                        <span className="info-value">{reservation.recipient_postal_code}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Адрес</span>
                        <span className="info-value">{reservation.recipient_address}</span>
                    </div>
                    {reservation.recipient_comment && (
                        <div className="info-row">
                            <span className="info-label">Комментарий</span>
                            <span className="info-value">{reservation.recipient_comment}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Товары */}
            <div className="section">
                <div className="section-title">🛒 Товары ({reservation.items.length})</div>
                <div className="items-list">
                    {reservation.items.map((item, i) => (
                        <div key={i} className="item-card">
                            {item.image_url && (
                                <img
                                    src={`${API_URL}${item.image_url}`}
                                    alt={item.name}
                                    className="item-image"
                                />
                            )}
                            <div className="item-details">
                                <div className="item-name">{item.name}</div>
                                <div className="item-qty">×{item.quantity}</div>
                                <div className="item-price">{item.price_at_time * item.quantity} ₽</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Итого */}
            <div className="total-section">
                <div className="total-row">
                    <span>Товары</span>
                    <span>{reservation.total_price - (reservation.delivery_price || 0)} ₽</span>
                </div>
                <div className="total-row">
                    <span>Доставка</span>
                    <span>{reservation.delivery_price || 0} ₽</span>
                </div>
                <div className="total-row final">
                    <span>Итого</span>
                    <span>{reservation.total_price} ₽</span>
                </div>
            </div>

            <button className="action-btn" onClick={() => navigate('/')}>
                В каталог
            </button>

            {/* Модальное окно после загрузки чека */}
            {showReceiptModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon">📤</div>
                        <h2 className="modal-title">Чек отправлен!</h2>
                        <p className="modal-text">
                            Ваш чек отправлен администратору на проверку.
                            В течение дня оплата будет подтверждена и статус заказа изменится.
                            <br /><br />
                            После подтверждения оплаты заказ будет отправлен по указанному адресу.
                            Когда посылка будет отправлена — здесь появится трек-номер или квитанция.
                        </p>
                        <button
                            className="modal-btn"
                            onClick={() => setShowReceiptModal(false)}
                        >
                            Понятно
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
