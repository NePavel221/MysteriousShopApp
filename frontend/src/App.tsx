import { Routes, Route, NavLink } from 'react-router-dom'
import { AppRoot } from '@telegram-apps/telegram-ui'
import '@telegram-apps/telegram-ui/dist/styles.css'

import { CartProvider, useCart } from './context/CartContext'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ReservationPage from './pages/ReservationPage'

function CartBadge() {
    const { totalItems } = useCart()
    if (totalItems === 0) return null
    return <span className="cart-badge">{totalItems}</span>
}

function AppContent() {
    return (
        <div className="app">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:categorySlug" element={<CatalogPage />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/reservation/:id" element={<ReservationPage />} />
            </Routes>

            {/* Нижняя навигация — 3 вкладки */}
            <nav className="tab-bar">
                <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
                    <span className="icon">🏠</span>
                    <span>Главная</span>
                </NavLink>
                <NavLink to="/cart" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
                    <span className="icon">🛒</span>
                    <CartBadge />
                    <span>Корзина</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
                    <span className="icon">👤</span>
                    <span>Профиль</span>
                </NavLink>
            </nav>
        </div>
    )
}

function App() {
    return (
        <AppRoot appearance="dark" platform="ios">
            <CartProvider>
                <AppContent />
            </CartProvider>
        </AppRoot>
    )
}

export default App
