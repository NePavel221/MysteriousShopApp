import { useState, useEffect } from 'react'
import { checkAuth } from './api'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProductsPage from './pages/ProductsPage'
import StoresPage from './pages/StoresPage'
import InventoryPage from './pages/InventoryPage'
import './App.css'

type Page = 'dashboard' | 'products' | 'stores' | 'inventory'

function App() {
    const [isAuth, setIsAuth] = useState<boolean | null>(null)
    const [currentPage, setCurrentPage] = useState<Page>('dashboard')

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (!token) {
            setIsAuth(false)
            return
        }
        checkAuth()
            .then(() => setIsAuth(true))
            .catch(() => setIsAuth(false))
    }, [])

    if (isAuth === null) {
        return <div className="loading">Загрузка...</div>
    }

    if (!isAuth) {
        return <LoginPage onLogin={() => setIsAuth(true)} />
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        setIsAuth(false)
    }

    return (
        <div className="admin-app">
            <nav className="sidebar">
                <div className="logo">
                    <h2>VapeCity</h2>
                    <span>Админ-панель</span>
                </div>
                <ul className="nav-menu">
                    <li className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>
                        📊 Дашборд
                    </li>
                    <li className={currentPage === 'products' ? 'active' : ''} onClick={() => setCurrentPage('products')}>
                        📦 Товары
                    </li>
                    <li className={currentPage === 'stores' ? 'active' : ''} onClick={() => setCurrentPage('stores')}>
                        🏪 Магазины
                    </li>
                    <li className={currentPage === 'inventory' ? 'active' : ''} onClick={() => setCurrentPage('inventory')}>
                        📋 Наличие
                    </li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>
                    🚪 Выйти
                </button>
            </nav>
            <main className="content">
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'products' && <ProductsPage />}
                {currentPage === 'stores' && <StoresPage />}
                {currentPage === 'inventory' && <InventoryPage />}
            </main>
        </div>
    )
}

export default App
