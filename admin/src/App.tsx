import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type Page = 'products' | 'categories' | 'orders'

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
    const [page, setPage] = useState<Page>('orders')

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/api/admin/check`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (!res.ok) {
                    setToken(null)
                    localStorage.removeItem('admin_token')
                }
            })
        }
    }, [token])

    const handleLogin = (newToken: string) => {
        setToken(newToken)
        localStorage.setItem('admin_token', newToken)
    }

    const handleLogout = () => {
        setToken(null)
        localStorage.removeItem('admin_token')
    }

    if (!token) {
        return <LoginPage onLogin={handleLogin} />
    }

    return (
        <div className="app">
            <nav className="sidebar">
                <div className="logo">
                    <span className="logo-icon">🔮</span>
                    <span className="logo-text">Mysterious</span>
                </div>

                <div className="nav-items">
                    <button
                        className={`nav-item ${page === 'orders' ? 'active' : ''}`}
                        onClick={() => setPage('orders')}
                    >
                        <span className="nav-icon">📋</span>
                        <span>Заказы</span>
                    </button>
                    <button
                        className={`nav-item ${page === 'products' ? 'active' : ''}`}
                        onClick={() => setPage('products')}
                    >
                        <span className="nav-icon">📦</span>
                        <span>Товары</span>
                    </button>
                    <button
                        className={`nav-item ${page === 'categories' ? 'active' : ''}`}
                        onClick={() => setPage('categories')}
                    >
                        <span className="nav-icon">📁</span>
                        <span>Категории</span>
                    </button>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Выйти</span>
                </button>
            </nav>

            <main className="content">
                {page === 'orders' && <OrdersPage token={token} />}
                {page === 'products' && <ProductsPage token={token} />}
                {page === 'categories' && <CategoriesPage token={token} />}
            </main>
        </div>
    )
}

export default App
