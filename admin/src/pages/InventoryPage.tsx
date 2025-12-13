import { useState, useEffect } from 'react'
import { getStores, getInventory, updateInventory } from '../api'

interface Store {
    id: number
    name: string
    address: string
}

interface InventoryItem {
    id: number
    name: string
    brand: string
    quantity: number
}

export default function InventoryPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [selectedStore, setSelectedStore] = useState<number | null>(null)
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState('')

    useEffect(() => {
        getStores().then(data => {
            setStores(data)
            if (data.length > 0) {
                setSelectedStore(data[0].id)
            }
        })
    }, [])

    useEffect(() => {
        if (selectedStore) {
            getInventory(selectedStore).then(setInventory)
        }
    }, [selectedStore])

    // Поиск с поддержкой кириллицы
    const searchLower = search.toLocaleLowerCase('ru')
    const filtered = inventory.filter(item =>
        item.name.toLocaleLowerCase('ru').includes(searchLower) ||
        (item.brand && item.brand.toLocaleLowerCase('ru').includes(searchLower))
    )

    const handleSave = async (productId: number) => {
        if (!selectedStore) return
        const qty = parseInt(editValue) || 0
        await updateInventory(selectedStore, productId, qty)
        setInventory(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity: qty } : item
        ))
        setEditingId(null)
    }

    const handleQuickUpdate = async (productId: number, delta: number) => {
        if (!selectedStore) return
        const item = inventory.find(i => i.id === productId)
        if (!item) return
        const newQty = Math.max(0, item.quantity + delta)
        await updateInventory(selectedStore, productId, newQty)
        setInventory(prev => prev.map(i =>
            i.id === productId ? { ...i, quantity: newQty } : i
        ))
    }

    const getQtyClass = (qty: number) => {
        if (qty === 0) return 'zero'
        if (qty < 5) return 'low'
        return ''
    }

    return (
        <div>
            <div className="page-header">
                <h1>📋 Наличие</h1>
                <div className="header-controls">
                    <select
                        className="store-select"
                        value={selectedStore || ''}
                        onChange={e => setSelectedStore(+e.target.value)}
                    >
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.address}</option>
                        ))}
                    </select>
                    <input
                        className="search-input"
                        placeholder="🔍 Поиск..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {selectedStore && (
                <div className="inventory-info">
                    📍 {stores.find(s => s.id === selectedStore)?.address}
                </div>
            )}

            {/* Таблица для десктопа */}
            <div className="table-container desktop-only">
                <table>
                    <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Бренд</th>
                            <th>Количество</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => (
                            <tr key={item.id} className={item.quantity === 0 ? 'out-of-stock' : ''}>
                                <td>{item.name}</td>
                                <td>{item.brand}</td>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            className="qty-input"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSave(item.id)}
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className={`qty-badge ${getQtyClass(item.quantity)}`}
                                            onClick={() => { setEditingId(item.id); setEditValue(String(item.quantity)) }}
                                        >
                                            {item.quantity} шт.
                                        </span>
                                    )}
                                </td>
                                <td className="actions">
                                    {editingId === item.id ? (
                                        <>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleSave(item.id)}>✓</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>✕</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickUpdate(item.id, -1)}>−</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickUpdate(item.id, 1)}>+</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Карточки для мобильных */}
            <div className="inventory-cards mobile-only">
                {filtered.map(item => (
                    <div key={item.id} className={`inventory-card ${item.quantity === 0 ? 'out-of-stock' : ''}`}>
                        <div className="inventory-card-info">
                            <div className="inventory-card-name">{item.name}</div>
                            <div className="inventory-card-brand">{item.brand}</div>
                        </div>
                        <div className="inventory-card-qty">
                            {editingId === item.id ? (
                                <div className="qty-edit-row">
                                    <input
                                        type="number"
                                        className="qty-input"
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={() => handleSave(item.id)}>✓</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>✕</button>
                                </div>
                            ) : (
                                <div className="qty-control-row">
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleQuickUpdate(item.id, -1)}>−</button>
                                    <span
                                        className={`qty-badge ${getQtyClass(item.quantity)}`}
                                        onClick={() => { setEditingId(item.id); setEditValue(String(item.quantity)) }}
                                    >
                                        {item.quantity}
                                    </span>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleQuickUpdate(item.id, 1)}>+</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
