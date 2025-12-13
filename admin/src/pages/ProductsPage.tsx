import { useState, useEffect, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { getProducts, getCategories, updateProduct, createProduct, deleteProduct, uploadProductImage, deleteProductImage, getProductAttributes, updateProductAttributes } from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const NICOTINE_OPTIONS = ['', '20 мг', '40 мг', '50 мг']

interface Product {
    id: number
    name: string
    description: string
    price: number
    brand: string
    category_id: number
    category_name: string
    image_url: string
}

interface Category {
    id: number
    name: string
    slug: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [search, setSearch] = useState('')
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [nicotine, setNicotine] = useState('')

    // Image cropper state
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 })
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    const loadData = () => {
        Promise.all([getProducts(), getCategories()])
            .then(([prods, cats]) => {
                setProducts(prods)
                setCategories(cats)
            })
    }

    useEffect(() => { loadData() }, [])

    // Загрузка атрибутов при открытии редактирования
    useEffect(() => {
        if (editProduct && !isNew) {
            getProductAttributes(editProduct.id).then((attrs: any[]) => {
                const nic = attrs.find(a => a.name === 'nicotine')
                setNicotine(nic?.value || '')
            })
        } else {
            setNicotine('')
        }
    }, [editProduct, isNew])

    const searchLower = search.toLocaleLowerCase('ru')
    const filtered = products.filter(p =>
        p.name.toLocaleLowerCase('ru').includes(searchLower) ||
        (p.brand && p.brand.toLocaleLowerCase('ru').includes(searchLower))
    )

    const handleSave = async () => {
        if (!editProduct) return
        try {
            let productId = editProduct.id
            if (isNew) {
                const res = await createProduct(editProduct)
                productId = res.id
            } else {
                await updateProduct(editProduct.id, editProduct)
            }

            // Сохраняем атрибуты (крепость)
            const currentCat = categories.find(c => c.id === editProduct.category_id)
            if (currentCat?.slug === 'liquids' && nicotine) {
                await updateProductAttributes(productId, [{ name: 'nicotine', value: nicotine }])
            } else if (!isNew) {
                await updateProductAttributes(productId, [])
            }

            setEditProduct(null)
            loadData()
        } catch (e) {
            alert('Ошибка сохранения')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить товар?')) return
        await deleteProduct(id)
        loadData()
    }

    // Обработка выбора файла — открываем кроппер
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            setImageSrc(reader.result as string)
            setCropModalOpen(true)
            setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    // Создание обрезанного изображения
    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        if (!imgRef.current || !completedCrop) return null

        const image = imgRef.current
        const canvas = document.createElement('canvas')
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        canvas.width = completedCrop.width
        canvas.height = completedCrop.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0,
            completedCrop.width,
            completedCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
        })
    }, [completedCrop])

    // Сохранение обрезанного изображения
    const handleCropSave = async () => {
        if (!editProduct) return
        const blob = await getCroppedImg()
        if (!blob) {
            alert('Ошибка обрезки')
            return
        }
        const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
        const res = await uploadProductImage(editProduct.id, file)
        if (res.image_url) {
            setEditProduct({ ...editProduct, image_url: res.image_url })
            loadData()
        }
        setCropModalOpen(false)
        setImageSrc(null)
    }

    const handleImageDelete = async () => {
        if (!editProduct) return
        await deleteProductImage(editProduct.id)
        setEditProduct({ ...editProduct, image_url: '' })
        loadData()
    }

    const getImageUrl = (url: string) => {
        if (!url) return 'https://placehold.co/60x60/eee/999?text=Нет'
        if (url.startsWith('/uploads')) return `${API_URL}${url}`
        return url
    }

    const currentCategory = editProduct ? categories.find(c => c.id === editProduct.category_id) : null
    const showNicotine = currentCategory?.slug === 'liquids'

    return (
        <div>
            <div className="page-header">
                <h1>📦 Товары</h1>
                <div className="header-controls">
                    <input
                        className="search-input"
                        placeholder="🔍 Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => {
                        setIsNew(true)
                        setEditProduct({ id: 0, name: '', description: '', price: 0, brand: '', category_id: 1, category_name: '', image_url: '' })
                    }}>
                        + Добавить
                    </button>
                </div>
            </div>

            {/* Таблица для десктопа */}
            <div className="table-container desktop-only">
                <table>
                    <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Название</th>
                            <th>Бренд</th>
                            <th>Категория</th>
                            <th>Цена</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td><img className="image-preview" src={getImageUrl(p.image_url)} alt="" /></td>
                                <td>{p.name}</td>
                                <td>{p.brand}</td>
                                <td>{p.category_name}</td>
                                <td>{p.price} ₽</td>
                                <td className="actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setIsNew(false); setEditProduct(p) }}>✏️</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Карточки для мобильных */}
            <div className="products-cards mobile-only">
                {filtered.map(p => (
                    <div className="product-card" key={p.id}>
                        <img className="product-card-image" src={getImageUrl(p.image_url)} alt="" />
                        <div className="product-card-info">
                            <div className="product-card-name">{p.name}</div>
                            <div className="product-card-brand">{p.brand}</div>
                            <div className="product-card-category">{p.category_name}</div>
                            <div className="product-card-price">{p.price} ₽</div>
                        </div>
                        <div className="product-card-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => { setIsNew(false); setEditProduct(p) }}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Модалка редактирования */}
            {editProduct && (
                <div className="modal-overlay" onClick={() => setEditProduct(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{isNew ? 'Новый товар' : 'Редактирование'}</h2>

                        <div className="form-group">
                            <label>Название</label>
                            <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Бренд</label>
                            <input value={editProduct.brand} onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Категория</label>
                            <select value={editProduct.category_id} onChange={e => setEditProduct({ ...editProduct, category_id: +e.target.value })}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Крепость — только для жидкостей */}
                        {showNicotine && (
                            <div className="form-group">
                                <label>Крепость (никотин)</label>
                                <select value={nicotine} onChange={e => setNicotine(e.target.value)}>
                                    <option value="">Не указана</option>
                                    {NICOTINE_OPTIONS.filter(o => o).map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Цена (₽)</label>
                            <input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: +e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Описание</label>
                            <textarea rows={3} value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
                        </div>

                        {!isNew && (
                            <div className="form-group">
                                <label>Изображение</label>
                                <div className="image-upload">
                                    <img className="image-preview" src={getImageUrl(editProduct.image_url)} alt="" />
                                    <input type="file" id="image-input" accept="image/*" onChange={handleFileSelect} />
                                    <label htmlFor="image-input">📷 Загрузить</label>
                                    {editProduct.image_url && <button className="btn btn-danger btn-sm" onClick={handleImageDelete}>🗑️</button>}
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditProduct(null)}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка обрезки изображения */}
            {cropModalOpen && imageSrc && (
                <div className="modal-overlay" onClick={() => setCropModalOpen(false)}>
                    <div className="modal crop-modal" onClick={e => e.stopPropagation()}>
                        <h2>✂️ Обрезка изображения</h2>
                        <p style={{ color: '#888', marginBottom: 16 }}>Выделите квадратную область для превью товара</p>

                        <div className="crop-container">
                            <ReactCrop
                                crop={crop}
                                onChange={c => setCrop(c)}
                                onComplete={c => setCompletedCrop(c)}
                                aspect={1}
                            >
                                <img ref={imgRef} src={imageSrc} alt="Crop" style={{ maxWidth: '100%', maxHeight: '60vh' }} />
                            </ReactCrop>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => { setCropModalOpen(false); setImageSrc(null) }}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleCropSave}>✅ Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
