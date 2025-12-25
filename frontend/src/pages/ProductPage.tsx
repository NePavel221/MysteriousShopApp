import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { getProduct } from '../api'
import { useCart } from '../context/CartContext'
import type { ProductDetails } from '../types'

export default function ProductPage() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { addItem } = useCart()
    const [product, setProduct] = useState<ProductDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [added, setAdded] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [expanded, setExpanded] = useState(false)

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

    // Проверяем наличие (суммируем по всем складам)
    const totalStock = product.availability.reduce((sum, a) => sum + a.quantity, 0)
    const inStock = totalStock > 0

    return (
        <div className="product-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                
                .product-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                    padding-bottom: 100px;
                    font-family: 'Exo 2', sans-serif;
                }
                .product-page .back-btn {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 212, 255, 0.15);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 12px;
                    color: #00d4ff;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .product-page .image-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    background: rgba(0, 212, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .product-page .image {
                    max-width: 80%;
                    max-height: 80%;
                    object-fit: contain;
                }
                .product-page .content {
                    padding: 20px 16px;
                }
                .product-page .brand {
                    font-size: 12px;
                    color: #00d4ff;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .product-page .name {
                    font-size: 22px;
                    font-weight: 600;
                    color: #e0f0ff;
                    margin: 0 0 12px;
                }
                .product-page .price {
                    font-size: 28px;
                    font-weight: 700;
                    color: #00d4ff;
                    margin-bottom: 16px;
                }
                .product-page .description {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #6699aa;
                    margin-bottom: 20px;
                    white-space: pre-wrap;
                }
                .product-page .description.collapsed {
                    max-height: 120px;
                    overflow: hidden;
                    position: relative;
                }
                .product-page .description.collapsed::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 40px;
                    background: linear-gradient(transparent, #000a14);
                }
                .product-page .desc-link {
                    color: #00d4ff;
                    text-decoration: underline;
                }
                .product-page .description a {
                    color: #00d4ff;
                    text-decoration: underline;
                }
                .product-page .description b,
                .product-page .description strong {
                    color: #e0f0ff;
                    font-weight: 600;
                }
                .product-page .description i,
                .product-page .description em {
                    font-style: italic;
                }
                .product-page .description u {
                    text-decoration: underline;
                }
                .product-page .description s,
                .product-page .description strike {
                    text-decoration: line-through;
                }
                .product-page .expand-btn {
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    color: #00d4ff;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    cursor: pointer;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .product-page .expand-btn:active {
                    background: rgba(0, 212, 255, 0.2);
                }
                .product-page .stock-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 20px;
                }
                .product-page .stock-badge.in-stock {
                    background: rgba(0, 255, 136, 0.15);
                    color: #00ff88;
                    border: 1px solid rgba(0, 255, 136, 0.3);
                }
                .product-page .stock-badge.out-of-stock {
                    background: rgba(255, 68, 68, 0.15);
                    color: #ff6b6b;
                    border: 1px solid rgba(255, 68, 68, 0.3);
                }
                .product-page .add-section {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }
                .product-page .qty-selector {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    border-radius: 12px;
                    padding: 4px;
                }
                .product-page .qty-btn {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                    border-radius: 8px;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .product-page .qty-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .product-page .qty-btn:active:not(:disabled) {
                    background: rgba(0, 212, 255, 0.4);
                }
                .product-page .qty-value {
                    width: 40px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: 600;
                    color: #e0f0ff;
                }
                .product-page .add-btn {
                    flex: 1;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Exo 2', sans-serif;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .product-page .add-btn:active {
                    transform: scale(0.98);
                }
                .product-page .add-btn.added {
                    background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                }
                .product-page .add-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="image-container">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <img
                    className="image"
                    src={product.image_url || 'https://placehold.co/400x400/001428/00d4ff?text=No+Image'}
                    alt={product.name}
                />
            </div>

            <div className="content">
                <div className="brand">{product.brand}</div>
                <h1 className="name">{product.name}</h1>
                <div className="price">{product.price} ₽</div>

                {product.description && (
                    <>
                        <div
                            className={`description ${!expanded && product.description.length > 400 ? 'collapsed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                        {product.description.length > 400 && (
                            <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
                                {expanded ? '▲ Свернуть' : '▼ Показать полностью'}
                            </button>
                        )}
                    </>
                )}

                <div className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {inStock ? `✓ В наличии (${totalStock} шт)` : '✕ Нет в наличии'}
                </div>

                {inStock && (
                    <div className="add-section">
                        <div className="qty-selector">
                            <button
                                className="qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                −
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                className="qty-btn"
                                onClick={() => setQuantity(q => Math.min(totalStock, q + 1))}
                                disabled={quantity >= totalStock}
                            >
                                +
                            </button>
                        </div>

                        <button
                            className={`add-btn ${added ? 'added' : ''}`}
                            onClick={() => {
                                for (let i = 0; i < quantity; i++) {
                                    addItem(product)
                                }
                                setAdded(true)
                                setQuantity(1)
                                setTimeout(() => setAdded(false), 1500)
                            }}
                        >
                            {added ? '✓ Добавлено' : `🛒 В корзину • ${product.price * quantity} ₽`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
