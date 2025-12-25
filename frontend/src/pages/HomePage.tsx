import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@telegram-apps/telegram-ui'
import { getCategories } from '../api'
import type { Category } from '../types'

// Скриншоты для карусели
const screenshots = Array.from({ length: 20 }, (_, i) => `/screenshots/${i + 1}.webp`)

const icons: Record<string, string> = {
    'growth-hormones': '💉',
    'fat-burners': '🔥',
    'pct': '⏱️',
    'nootropics': '🧠',
    'vitamins': '💊',
    'mens-health': '♂️',
    'peptides': '🧬',
    'sarms': '💪',
    'men': '🔥',
    'weight-loss': '⚡',
    'hair': '💇',
    'mushrooms': '🍄',
    'sport': '🏋️',
    'health': '❤️',
    'women': '👸',
    'other': '📦'
}

export default function HomePage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [currentSlide, setCurrentSlide] = useState(0)
    const carouselRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const cats = await getCategories()
                setCategories(cats)
            } catch (error) {
                console.error('Ошибка загрузки:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="loading">
                <Spinner size="l" />
            </div>
        )
    }

    return (
        <div className="home-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');
                
                .home-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #000a14 0%, #001428 50%, #000a14 100%);
                    padding-bottom: 100px;
                    font-family: 'Exo 2', sans-serif;
                    position: relative;
                    overflow: hidden;
                }
                .home-page::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at 30% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 40%),
                                radial-gradient(circle at 70% 80%, rgba(0, 153, 204, 0.08) 0%, transparent 40%);
                    animation: float 20s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-2%, 2%); }
                }
                .home-page .content {
                    position: relative;
                    z-index: 1;
                }
                .home-page .header {
                    padding: 32px 20px;
                    text-align: center;
                }
                .home-page .header h1 {
                    font-size: 28px;
                    font-weight: 300;
                    color: #e0f0ff;
                    margin: 0;
                    letter-spacing: 6px;
                    text-transform: uppercase;
                }
                .home-page .header h1 span {
                    font-weight: 700;
                    color: #00d4ff;
                }
                .home-page .header p {
                    color: #6699aa;
                    font-size: 11px;
                    letter-spacing: 4px;
                    margin-top: 8px;
                }
                .home-page .grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    padding: 16px;
                }
                .home-page .card {
                    background: rgba(0, 212, 255, 0.05);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 212, 255, 0.15);
                    border-radius: 20px;
                    padding: 24px 16px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .home-page .card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, transparent 50%);
                    opacity: 0;
                    transition: opacity 0.4s;
                }
                .home-page .card:active {
                    transform: translateY(-4px);
                    border-color: rgba(0, 212, 255, 0.4);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                                0 0 40px rgba(0, 212, 255, 0.15);
                }
                .home-page .card:active::before {
                    opacity: 1;
                }
                .home-page .card .icon {
                    font-size: 32px;
                    margin-bottom: 12px;
                    filter: drop-shadow(0 4px 8px rgba(0, 212, 255, 0.3));
                }
                .home-page .card .name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #e0f0ff;
                    letter-spacing: 0.5px;
                }
                .home-page .card .line {
                    width: 30px;
                    height: 2px;
                    background: linear-gradient(90deg, #00d4ff, #0099cc);
                    margin: 10px auto 0;
                    border-radius: 1px;
                }

                /* Карусель скриншотов */
                .home-page .carousel-section {
                    padding: 24px 16px;
                    margin-top: 16px;
                }
                .home-page .carousel-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e0f0ff;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    text-align: center;
                    margin-bottom: 16px;
                }
                .home-page .carousel {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 8px 0;
                }
                .home-page .carousel::-webkit-scrollbar {
                    display: none;
                }
                .home-page .carousel-item {
                    flex: 0 0 auto;
                    width: 200px;
                    scroll-snap-align: center;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .home-page .carousel-item:active {
                    transform: scale(1.02);
                    box-shadow: 0 12px 32px rgba(0, 212, 255, 0.2);
                }
                .home-page .carousel-item img {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .home-page .carousel-dots {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 12px;
                }
                .home-page .carousel-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(0, 212, 255, 0.3);
                    transition: all 0.3s;
                }
                .home-page .carousel-dot.active {
                    background: #00d4ff;
                    width: 18px;
                    border-radius: 3px;
                }

            `}</style>

            <div className="content">
                <div className="header">
                    <h1>Mysterious <span>Shop</span></h1>
                    <p>PREMIUM QUALITY</p>
                </div>

                <div className="grid">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="card"
                            onClick={() => navigate(`/products?category=${cat.id}`)}
                        >
                            <div className="icon">{icons[cat.slug] || '📦'}</div>
                            <div className="name">{cat.name}</div>
                            <div className="line" />
                        </div>
                    ))}
                </div>

                <div className="carousel-section">
                    <div className="carousel-title">📱 Скриншоты приложения</div>
                    <div
                        className="carousel"
                        ref={carouselRef}
                        onScroll={(e) => {
                            const el = e.currentTarget
                            const slideWidth = 212 // 200px + 12px gap
                            const newSlide = Math.round(el.scrollLeft / slideWidth)
                            setCurrentSlide(Math.min(newSlide, screenshots.length - 1))
                        }}
                    >
                        {screenshots.map((src, i) => (
                            <div key={i} className="carousel-item">
                                <img src={src} alt={`Скриншот ${i + 1}`} loading="lazy" />
                            </div>
                        ))}
                    </div>
                    <div className="carousel-dots">
                        {screenshots.slice(0, 10).map((_, i) => (
                            <div
                                key={i}
                                className={`carousel-dot ${currentSlide === i ? 'active' : ''}`}
                                onClick={() => {
                                    carouselRef.current?.scrollTo({
                                        left: i * 212,
                                        behavior: 'smooth'
                                    })
                                }}
                            />
                        ))}
                    </div>
                </div>


            </div>
        </div>
    )
}
