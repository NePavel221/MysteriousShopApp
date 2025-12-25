import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { getProducts, getCategories } from '../api'
import type { Product, Category } from '../types'

export default function AllProductsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [inStockOnly, setInStockOnly] = useState(false)

    // Читаем категорию из URL
    const selectedCategory = searchParams.get('category') || ''

    const setSelectedCategory = (catId: string) => {
        if (catId) {
            setSearchParams({ category: catId })
        } else {
            setSearchParams({})
        }
    }

    useEffect(() => {
        async function loadData() {
            try {
                const [prods, cats] = await Promise.all([
                    getProducts({}),
                    getCategories()
                ])
                setProducts(prods)
                setCategories(cats)
            } catch (error) {
                console.error('Ошибка загрузки:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Фильтрация товаров
    const filteredProducts = products.filter(product => {
        // Поиск по названию
        if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
            return false
        }
        // Фильтр по категории
        if (selectedCategory && product.category_id?.toString() !== selectedCategory) {
            return false
        }
        return true
    })

    if (loading) {
        return (
            <div className="loading">
                <Spinner size="l" />
            </div>
        )
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>Все товары</h1>
                <p>{filteredProducts.length} позиций</p>
            </div>

            {/* Поиск */}
            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Поиск товаров..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Фильтры */}
            <div className="filter-scroll">
                <button
                    className={`filter-btn ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('')}
                >
                    Все
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id.toString())}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Фильтр наличия */}
            <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
                <button
                    className={`filter-btn ${!inStockOnly ? 'active' : ''}`}
                    onClick={() => setInStockOnly(false)}
                >
                    Все товары
                </button>
                <button
                    className={`filter-btn ${inStockOnly ? 'active' : ''}`}
                    onClick={() => setInStockOnly(true)}
                >
                    ✓ В наличии
                </button>
            </div>

            {/* Товары */}
            {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--theme-text-dim)' }}>
                    Товары не найдены
                </div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => navigate(`/product/${product.id}`)}
                            style={{ animationDelay: `${index * 0.03}s` }}
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
