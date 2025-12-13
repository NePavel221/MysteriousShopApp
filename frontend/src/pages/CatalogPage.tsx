import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { getProducts, getCategories } from '../api'
import type { Product, Category } from '../types'

const NICOTINE_OPTIONS = ['Все', '20 мг', '40 мг', '50 мг']

export default function CatalogPage() {
    const { categorySlug } = useParams()
    const navigate = useNavigate()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [nicotineFilter, setNicotineFilter] = useState('Все')
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const nicotineParam = nicotineFilter !== 'Все' ? nicotineFilter : undefined
                const [prods, cats] = await Promise.all([
                    getProducts({
                        category: categorySlug,
                        search: search || undefined,
                        nicotine: nicotineParam
                    }),
                    getCategories()
                ])
                setProducts(prods)
                setCategories(cats)

                if (categorySlug) {
                    const cat = cats.find(c => c.slug === categorySlug)
                    setCurrentCategory(cat || null)
                } else {
                    setCurrentCategory(null)
                }
            } catch (error) {
                console.error('Ошибка загрузки:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [categorySlug, search, nicotineFilter])

    // Debounce для поиска
    const [searchInput, setSearchInput] = useState('')
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    // Показывать фильтр по крепости только для жидкостей
    const showNicotineFilter = categorySlug === 'liquids'

    return (
        <div className="page">
            {/* Поиск */}
            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Поиск товаров..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {/* Фильтр по категориям */}
            <div className="filter-scroll">
                <button
                    className={`filter-btn ${!categorySlug ? 'active' : ''}`}
                    onClick={() => navigate('/catalog')}
                >
                    Все
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${categorySlug === cat.slug ? 'active' : ''}`}
                        onClick={() => navigate(`/catalog/${cat.slug}`)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Фильтр по крепости (только для жидкостей) */}
            {showNicotineFilter && (
                <div className="filter-scroll" style={{ paddingTop: 0 }}>
                    {NICOTINE_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            className={`filter-btn ${nicotineFilter === opt ? 'active' : ''}`}
                            onClick={() => setNicotineFilter(opt)}
                            style={{
                                background: nicotineFilter === opt
                                    ? 'linear-gradient(135deg, #00f0ff 0%, #b026ff 100%)'
                                    : undefined
                            }}
                        >
                            {opt === 'Все' ? '💧 Все' : `⚡ ${opt}`}
                        </button>
                    ))}
                </div>
            )}

            {/* Заголовок категории */}
            {currentCategory && (
                <div style={{ padding: '8px 16px 16px' }}>
                    <h2 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '18px',
                        letterSpacing: '2px'
                    }}>
                        {currentCategory.name}
                    </h2>
                </div>
            )}

            {/* Товары */}
            {loading ? (
                <div className="loading">
                    <Spinner size="l" />
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--vc-text-dim)' }}>
                    Товары не найдены
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
