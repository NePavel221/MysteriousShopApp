import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { getProduct } from '../api'
import { useCart } from '../context/CartContext'
import type { ProductDetails } from '../types'

export default function ProductPage() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { addItem, storeId, items } = useCart()
    const [product, setProduct] = useState<ProductDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [added, setAdded] = useState(false)

    useEffect(() => {
        async function loadProduct() {
            if (!productId) return
            try {
                const data = await getProduct(parseInt(productId))
                setProduct(data)
            } catch (error) {
                console.error('Ошибка загрузки товара:', error)
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [productId])

    if (loading) {
        return (
            <div className="loading" style={{ minHeight: '100vh' }}>
                <Spinner size="l" />
            </div>
        )
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                Товар не найден
            </div>
        )
    }

    // Группируем атрибуты по типу
    const nicotineOptions = product.attributes
        .filter(a => a.attribute_name === 'nicotine')
        .map(a => a.attribute_value)

    const volumeOptions = product.attributes
        .filter(a => a.attribute_name === 'volume')
        .map(a => a.attribute_value)

    return (
        <div className="product-detail">
            {/* Кнопка назад */}
            <button className="back-button" onClick={() => navigate(-1)}>
                ←
            </button>

            {/* Изображение */}
            <img
                className="image"
                src={product.image_url || 'https://placehold.co/400x400/1a1a2e/white?text=No+Image'}
                alt={product.name}
            />

            {/* Контент */}
            <div className="content">
                <div className="brand">{product.brand}</div>
                <h1 className="name">{product.name}</h1>
                <div className="price">{product.price} ₽</div>

                {/* Описание */}
                {product.description && (
                    <p className="description">{product.description}</p>
                )}

                {/* Атрибуты: крепость */}
                {nicotineOptions.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '14px', marginBottom: '8px', color: '#8b8b8b' }}>
                            Крепость:
                        </div>
                        <div className="attributes">
                            {nicotineOptions.map((opt, i) => (
                                <span key={i} className="attribute-tag">{opt}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Атрибуты: объём */}
                {volumeOptions.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '14px', marginBottom: '8px', color: '#8b8b8b' }}>
                            Объём:
                        </div>
                        <div className="attributes">
                            {volumeOptions.map((opt, i) => (
                                <span key={i} className="attribute-tag">{opt}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Наличие на точках */}
                <div className="availability-section">
                    <h3>📍 Наличие в магазинах</h3>
                    {product.availability.length === 0 ? (
                        <div style={{ color: '#8b8b8b', padding: '12px 0' }}>
                            Нет в наличии
                        </div>
                    ) : (
                        product.availability.map(item => (
                            <div key={item.store_id} className="availability-item">
                                <div>
                                    <div className="store-name">{item.store_name}</div>
                                    <div className="store-address">{item.address}</div>
                                </div>
                                <div className="quantity">
                                    {item.quantity} шт
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Кнопка добавления в корзину */}
                {storeId && product.availability.some(a => a.store_id === storeId && a.quantity > 0) && (
                    <button
                        className={`neon-button add-to-cart-btn ${added ? 'added' : ''}`}
                        onClick={() => {
                            addItem(product)
                            setAdded(true)
                            setTimeout(() => setAdded(false), 1500)
                        }}
                    >
                        {added ? '✓ Добавлено' : '🛒 В корзину'}
                    </button>
                )}

                {!storeId && (
                    <div className="select-store-hint">
                        Выберите точку на главной, чтобы добавить в корзину
                    </div>
                )}
            </div>
        </div>
    )
}
