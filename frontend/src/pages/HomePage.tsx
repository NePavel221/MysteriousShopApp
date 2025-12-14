import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { getCategories, getStores, getProducts } from '../api'
import { useCart } from '../context/CartContext'
import type { Category, Store, Product } from '../types'

// SVG иконки для категорий
const CategoryIcons: Record<string, JSX.Element> = {
    'liquids': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#00f0ff' }}>
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 13v3" strokeLinecap="round" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
        </svg>
    ),
    'pod-systems': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#b026ff' }}>
            <rect x="6" y="2" width="12" height="20" rx="3" strokeLinecap="round" />
            <rect x="8" y="5" width="8" height="6" rx="1" strokeLinecap="round" />
            <circle cx="12" cy="17" r="2" strokeLinecap="round" />
            <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
        </svg>
    ),
    'disposables': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#ff2d95' }}>
            <rect x="8" y="1" width="8" height="22" rx="4" strokeLinecap="round" />
            <line x1="8" y1="6" x2="16" y2="6" strokeLinecap="round" />
            <line x1="8" y1="18" x2="16" y2="18" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
    ),
    'coils': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#ff9500' }}>
            <circle cx="12" cy="12" r="9" strokeLinecap="round" />
            <path d="M12 6v2M12 16v2M6 12h2M16 12h2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" />
            <path d="M12 9v6" strokeLinecap="round" />
        </svg>
    ),
    'snus': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#00f0ff' }}>
            <circle cx="12" cy="12" r="9" strokeLinecap="round" />
            <circle cx="12" cy="12" r="5" strokeLinecap="round" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" strokeLinecap="round" />
        </svg>
    ),
    'nicotine-patches': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#39ff14' }}>
            <rect x="4" y="4" width="16" height="16" rx="3" strokeLinecap="round" />
            <path d="M9 12h6M12 9v6" strokeLinecap="round" strokeWidth="2" />
            <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
    ),
    'hookah-tobacco': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#b026ff' }}>
            <path d="M12 22v-8" strokeLinecap="round" />
            <path d="M8 14h8" strokeLinecap="round" />
            <ellipse cx="12" cy="10" rx="6" ry="4" strokeLinecap="round" />
            <path d="M9 6c0-2 1.5-4 3-4s3 2 3 4" strokeLinecap="round" />
            <path d="M10 3c1-1 3-1 4 0" strokeLinecap="round" strokeDasharray="1 1" />
        </svg>
    ),
    'hookah-coals': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#ff4500' }}>
            <rect x="3" y="13" width="7" height="7" rx="1" strokeLinecap="round" />
            <rect x="14" y="13" width="7" height="7" rx="1" strokeLinecap="round" />
            <rect x="8.5" y="4" width="7" height="7" rx="1" strokeLinecap="round" />
            <path d="M6 11v-2M18 11v-2M12 2v-0" strokeLinecap="round" strokeWidth="2" stroke="#ff4500" />
        </svg>
    ),
}

const NICOTINE_OPTIONS = ['Все', '20 мг', '40 мг', '50 мг']

export default function HomePage() {
    const navigate = useNavigate()
    const { storeId, storeName, storeAddress, setStore } = useCart()
    const [categories, setCategories] = useState<Category[]>([])
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(true)
    const [showStoreSelector, setShowStoreSelector] = useState(false)

    // Состояние для отображения товаров категории
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [productsLoading, setProductsLoading] = useState(false)
    const [nicotineFilter, setNicotineFilter] = useState('Все')
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                const [cats, strs] = await Promise.all([getCategories(), getStores()])
                setCategories(cats)
                setStores(strs)
            } catch (error) {
                console.error('Ошибка загрузки:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Debounce для поиска
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    // Загрузка товаров при выборе категории
    useEffect(() => {
        if (!selectedCategory) return

        const categorySlug = selectedCategory.slug

        async function loadProducts() {
            setProductsLoading(true)
            try {
                const nicotineParam = nicotineFilter !== 'Все' ? nicotineFilter : undefined
                const prods = await getProducts({
                    category: categorySlug,
                    store_id: storeId || undefined,
                    search: search || undefined,
                    nicotine: nicotineParam
                })
                setProducts(prods)
            } catch (error) {
                console.error('Ошибка загрузки товаров:', error)
            } finally {
                setProductsLoading(false)
            }
        }
        loadProducts()
    }, [selectedCategory, storeId, search, nicotineFilter])

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category)
        setNicotineFilter('Все')
        setSearchInput('')
        setSearch('')
    }

    const handleBack = () => {
        setSelectedCategory(null)
        setProducts([])
        setSearchInput('')
        setSearch('')
    }

    if (loading) {
        return (
            <div className="loading">
                <Spinner size="l" />
            </div>
        )
    }

    // Показывать фильтр по крепости только для жидкостей
    const showNicotineFilter = selectedCategory?.slug === 'liquids'

    // Режим просмотра товаров категории
    if (selectedCategory) {
        return (
            <div className="page">
                {/* Кнопка назад */}
                <button className="back-button" onClick={handleBack}>
                    ←
                </button>

                {/* Заголовок категории */}
                <div className="page-header" style={{ paddingLeft: '60px' }}>
                    <h1 style={{ fontSize: '20px' }}>{selectedCategory.name}</h1>
                    <p>{storeId ? storeName : 'Все точки'}</p>
                </div>

                {/* Поиск */}
                <div className="search-bar" style={{ paddingTop: '8px' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Поиск товаров..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                {/* Фильтр по крепости (только для жидкостей) */}
                {showNicotineFilter && (
                    <div className="filter-scroll">
                        {NICOTINE_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                className={`filter-btn ${nicotineFilter === opt ? 'active' : ''}`}
                                onClick={() => setNicotineFilter(opt)}
                            >
                                {opt === 'Все' ? '💧 Все' : `⚡ ${opt}`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Товары */}
                {productsLoading ? (
                    <div className="loading">
                        <Spinner size="l" />
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--vc-text-dim)' }}>
                        {storeId ? 'Нет товаров на этой точке' : 'Товары не найдены'}
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => navigate(`/product/${product.id}`)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <img
                                    src={product.image_url || 'https://placehold.co/400x400/13131f/666?text=No+Image'}
                                    alt={product.name}
                                    loading="lazy"
                                />
                                <div className="info">
                                    <div className="brand">{product.brand}</div>
                                    <div className="name">{product.name}</div>
                                    <div className="price">{product.price} ₽</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Главная страница с категориями
    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <h1>VapeCity</h1>
                <p>Сеть вейп-шопов • Пермь</p>
            </div>

            {/* Store Selector */}
            <div className="store-selector">
                <div
                    className="store-item selected"
                    onClick={() => setShowStoreSelector(!showStoreSelector)}
                >
                    <div className="name">📍 {storeId ? storeName : 'Все точки'}</div>
                    <div className="address">{storeId ? storeAddress : 'Показать товары со всех магазинов'}</div>
                    <div className="selector-arrow">{showStoreSelector ? '▲' : '▼'}</div>
                </div>
            </div>

            {showStoreSelector && (
                <div className="store-selector store-list">
                    {/* Опция "Все точки" */}
                    <div
                        className={`store-item ${!storeId ? 'selected' : ''}`}
                        onClick={() => {
                            setStore(null, 'Все точки', '')
                            setShowStoreSelector(false)
                        }}
                    >
                        <div className="name">🌐 Все точки</div>
                        <div className="address">Показать товары со всех магазинов</div>
                    </div>
                    {stores.map(store => (
                        <div
                            key={store.id}
                            className={`store-item ${storeId === store.id ? 'selected' : ''}`}
                            onClick={() => {
                                setStore(store.id, store.name, store.address)
                                setShowStoreSelector(false)
                            }}
                        >
                            <div className="name">{store.name}</div>
                            <div className="address">{store.address}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Categories */}
            <div className="category-grid">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="category-card"
                        onClick={() => handleCategoryClick(category)}
                    >
                        <div className="icon">
                            {CategoryIcons[category.slug] || <span>{category.icon}</span>}
                        </div>
                        <div className="name">{category.name}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
