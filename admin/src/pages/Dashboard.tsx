import { useState, useEffect } from 'react'
import { getProducts, getStores, getCategories } from '../api'

export default function Dashboard() {
    const [stats, setStats] = useState({ products: 0, stores: 0, categories: 0 })

    useEffect(() => {
        Promise.all([getProducts(), getStores(), getCategories()])
            .then(([products, stores, categories]) => {
                setStats({
                    products: products.length,
                    stores: stores.length,
                    categories: categories.length
                })
            })
    }, [])

    return (
        <div>
            <div className="page-header">
                <h1>📊 Дашборд</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>📦 Товаров</h3>
                    <div className="value">{stats.products}</div>
                </div>
                <div className="stat-card">
                    <h3>🏪 Магазинов</h3>
                    <div className="value">{stats.stores}</div>
                </div>
                <div className="stat-card">
                    <h3>📁 Категорий</h3>
                    <div className="value">{stats.categories}</div>
                </div>
            </div>

            <div className="card">
                <h3>Добро пожаловать в админ-панель VapeCity!</h3>
                <p style={{ marginTop: 12, color: '#666' }}>
                    Здесь вы можете управлять товарами, магазинами и наличием.
                </p>
                <ul style={{ marginTop: 16, marginLeft: 20, color: '#666' }}>
                    <li>📦 Товары — редактирование, загрузка фото</li>
                    <li>🏪 Магазины — адреса, телефоны, часы работы</li>
                    <li>📋 Наличие — количество товаров на точках</li>
                </ul>
            </div>
        </div>
    )
}
