import { useState, useEffect } from 'react'
import { getStores, updateStore, createStore, deleteStore, getStoreSellers, addStoreSeller, deleteStoreSeller, getSettings, updateSettings } from '../api'

interface Store {
    id: number
    name: string
    address: string
    phone: string
    working_hours: string
}

interface Seller {
    id: number
    store_id: number
    telegram_id: number
    name: string
    description: string | null
}

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [editStore, setEditStore] = useState<Store | null>(null)
    const [isNew, setIsNew] = useState(false)

    // Управление продавцами
    const [sellersStore, setSellersStore] = useState<Store | null>(null)
    const [sellers, setSellers] = useState<Seller[]>([])
    const [newSeller, setNewSeller] = useState({ telegram_id: '', name: '', description: '' })
    const [showIdHelp, setShowIdHelp] = useState(false)

    // Настройки бота
    const [botToken, setBotToken] = useState('')
    const [botRunning, setBotRunning] = useState(false)
    const [botSaving, setBotSaving] = useState(false)
    const [botMessage, setBotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [botExpanded, setBotExpanded] = useState(false)
    const [showTokenHelp, setShowTokenHelp] = useState(false)

    const loadStores = () => {
        getStores().then(setStores)
    }

    useEffect(() => {
        loadStores()
        getSettings().then(s => {
            setBotToken(s.bot_token || '')
            setBotRunning(s.bot_running || false)
        })
    }, [])

    const handleSaveBotToken = async () => {
        setBotSaving(true)
        setBotMessage(null)
        try {
            const res = await updateSettings({ bot_token: botToken })
            setBotRunning(res.bot_running || false)
            setBotMessage({
                type: res.bot_running ? 'success' : 'error',
                text: res.message || (res.bot_running ? '✅ Бот запущен!' : '❌ Ошибка запуска бота')
            })
        } catch {
            setBotMessage({ type: 'error', text: '❌ Ошибка сохранения' })
        } finally {
            setBotSaving(false)
        }
    }

    const handleSave = async () => {
        if (!editStore) return
        try {
            if (isNew) {
                await createStore(editStore)
            } else {
                await updateStore(editStore.id, editStore)
            }
            setEditStore(null)
            loadStores()
        } catch {
            alert('Ошибка сохранения')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить магазин?')) return
        await deleteStore(id)
        loadStores()
    }

    const openSellersModal = async (store: Store) => {
        setSellersStore(store)
        const data = await getStoreSellers(store.id)
        setSellers(data)
        setNewSeller({ telegram_id: '', name: '', description: '' })
    }

    const handleAddSeller = async () => {
        if (!sellersStore || !newSeller.telegram_id || !newSeller.name) {
            alert('Укажите Telegram ID и имя')
            return
        }
        try {
            await addStoreSeller(sellersStore.id, {
                telegram_id: parseInt(newSeller.telegram_id),
                name: newSeller.name,
                description: newSeller.description || null
            })
            const data = await getStoreSellers(sellersStore.id)
            setSellers(data)
            setNewSeller({ telegram_id: '', name: '', description: '' })
        } catch (e: any) {
            alert(e.message || 'Ошибка добавления')
        }
    }

    const handleDeleteSeller = async (sellerId: number) => {
        if (!sellersStore) return
        if (!confirm('Удалить сотрудника?')) return
        await deleteStoreSeller(sellersStore.id, sellerId)
        const data = await getStoreSellers(sellersStore.id)
        setSellers(data)
    }

    return (
        <div>
            <div className="page-header">
                <h1>🏪 Магазины</h1>
                <button className="btn btn-primary" onClick={() => {
                    setIsNew(true)
                    setEditStore({ id: 0, name: '', address: '', phone: '', working_hours: '10:00-22:00' })
                }}>
                    + Добавить точку
                </button>
            </div>

            {/* Точки продаж */}
            <div className="stores-grid">
                {stores.map(store => (
                    <div key={store.id} className="store-card">
                        <h3>{store.name}</h3>
                        <p>📍 {store.address}</p>
                        <p>📞 {store.phone}</p>
                        <p>🕐 {store.working_hours}</p>
                        <div className="store-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => openSellersModal(store)}>
                                👥 Сотрудники
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setIsNew(false); setEditStore(store) }}>
                                ✏️
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(store.id)}>
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Сворачиваемый блок бота */}
            <div className="bot-accordion">
                <div className="bot-accordion-header" onClick={() => setBotExpanded(!botExpanded)}>
                    <div className="bot-accordion-title">
                        <span>🤖 Telegram-бот</span>
                        <span className={`bot-status ${botRunning ? 'active' : 'inactive'}`}>
                            {botRunning ? '● Работает' : '○ Не настроен'}
                        </span>
                    </div>
                    <span className="bot-accordion-arrow">{botExpanded ? '▲' : '▼'}</span>
                </div>

                {botExpanded && (
                    <div className="bot-accordion-content">
                        <p style={{ color: '#666', marginBottom: 16 }}>
                            Бот отправляет уведомления сотрудникам о новых бронях.
                            Настройте один раз — и он будет работать автоматически.
                        </p>

                        <div className="form-group">
                            <label>
                                Токен бота
                                <span className="help-icon" onClick={() => setShowTokenHelp(!showTokenHelp)} title="Как получить?">?</span>
                            </label>
                            {showTokenHelp && (
                                <div className="help-tooltip">
                                    <strong>Как получить токен бота:</strong>
                                    <ol>
                                        <li>Откройте Telegram</li>
                                        <li>Найдите <a href="https://t.me/BotFather" target="_blank" rel="noreferrer">@BotFather</a></li>
                                        <li>Отправьте команду /newbot</li>
                                        <li>Придумайте имя и username для бота</li>
                                        <li>BotFather пришлёт токен — скопируйте его сюда</li>
                                    </ol>
                                </div>
                            )}
                            <input
                                type="text"
                                value={botToken}
                                onChange={e => setBotToken(e.target.value)}
                                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <button className="btn btn-primary" onClick={handleSaveBotToken} disabled={botSaving}>
                                {botSaving ? 'Сохранение...' : '💾 Сохранить и запустить'}
                            </button>
                        </div>

                        {botMessage && (
                            <div className={`settings-message ${botMessage.type}`} style={{ marginTop: 12 }}>
                                {botMessage.text}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Модалка редактирования магазина */}
            {editStore && (
                <div className="modal-overlay" onClick={() => setEditStore(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{isNew ? 'Новая точка' : 'Редактирование'}</h2>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={editStore.name} onChange={e => setEditStore({ ...editStore, name: e.target.value })} placeholder="VapeCity на Ленина" />
                        </div>
                        <div className="form-group">
                            <label>Адрес</label>
                            <input value={editStore.address} onChange={e => setEditStore({ ...editStore, address: e.target.value })} placeholder="ул. Ленина, 50А" />
                        </div>
                        <div className="form-group">
                            <label>Телефон</label>
                            <input value={editStore.phone} onChange={e => setEditStore({ ...editStore, phone: e.target.value })} placeholder="+7 (342) 123-45-67" />
                        </div>
                        <div className="form-group">
                            <label>Часы работы</label>
                            <input value={editStore.working_hours} onChange={e => setEditStore({ ...editStore, working_hours: e.target.value })} placeholder="10:00-22:00" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditStore(null)}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка сотрудников */}
            {sellersStore && (
                <div className="modal-overlay" onClick={() => setSellersStore(null)}>
                    <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                        <h2>👥 Сотрудники — {sellersStore.name}</h2>
                        <p style={{ color: '#888', marginBottom: 16 }}>Эти сотрудники получают уведомления о бронях</p>

                        <div className="seller-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        Telegram ID *
                                        <span className="help-icon" onClick={() => setShowIdHelp(!showIdHelp)}>?</span>
                                    </label>
                                    {showIdHelp && (
                                        <div className="help-tooltip">
                                            <strong>Как узнать ID:</strong>
                                            <ol>
                                                <li>Откройте <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer">@userinfobot</a></li>
                                                <li>Нажмите Start</li>
                                                <li>Бот покажет ID (число вида 123456789)</li>
                                            </ol>
                                        </div>
                                    )}
                                    <input type="number" value={newSeller.telegram_id} onChange={e => setNewSeller({ ...newSeller, telegram_id: e.target.value })} placeholder="123456789" />
                                </div>
                                <div className="form-group">
                                    <label>Имя *</label>
                                    <input value={newSeller.name} onChange={e => setNewSeller({ ...newSeller, name: e.target.value })} placeholder="Иван Петров" />
                                </div>
                                <div className="form-group">
                                    <label>Должность</label>
                                    <input value={newSeller.description} onChange={e => setNewSeller({ ...newSeller, description: e.target.value })} placeholder="Продавец" />
                                </div>
                                <button className="btn btn-primary" onClick={handleAddSeller}>+ Добавить</button>
                            </div>
                        </div>

                        {sellers.length === 0 ? (
                            <div className="empty-state">⚠️ Нет сотрудников. Уведомления не будут отправляться.</div>
                        ) : (
                            <div className="sellers-list">
                                {sellers.map(seller => (
                                    <div key={seller.id} className="seller-card">
                                        <div className="seller-info">
                                            <div className="seller-name">{seller.name}</div>
                                            <div className="seller-meta">ID: {seller.telegram_id}{seller.description && ` • ${seller.description}`}</div>
                                        </div>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSeller(seller.id)}>🗑️</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setSellersStore(null)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
