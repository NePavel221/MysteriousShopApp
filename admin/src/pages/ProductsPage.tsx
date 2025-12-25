import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
    icon: string
}

interface Props {
    token: string
}

export default function ProductsPage({ token }: Props) {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [search, setSearch] = useState('')
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [loading, setLoading] = useState(true)
    const [linkModal, setLinkModal] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [linkText, setLinkText] = useState('')
    const editorRef = useRef<HTMLDivElement>(null)
    const savedSelection = useRef<Range | null>(null)

    const headers = { Authorization: `Bearer ${token}` }

    // Очистка HTML от лишних атрибутов, но сохранение форматирования
    const cleanHtml = (html: string): string => {
        if (!html) return ''
        const div = document.createElement('div')
        div.innerHTML = html

        // Разрешённые теги (без P и DIV — они создают лишние отступы)
        const allowedTags = ['A', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'BR', 'SPAN']

        // Рекурсивно очищаем
        const clean = (node: Node): void => {
            const children = Array.from(node.childNodes)
            children.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const el = child as HTMLElement

                    // P и DIV заменяем просто на содержимое (без добавления br)
                    if (el.tagName === 'P' || el.tagName === 'DIV') {
                        clean(el) // сначала очищаем содержимое
                        while (el.firstChild) {
                            node.insertBefore(el.firstChild, el)
                        }
                        node.removeChild(el)
                    } else if (!allowedTags.includes(el.tagName)) {
                        // Заменяем неразрешённый тег на его содержимое
                        while (el.firstChild) {
                            node.insertBefore(el.firstChild, el)
                        }
                        node.removeChild(el)
                    } else {
                        // Очищаем атрибуты кроме href для ссылок
                        const attrs = Array.from(el.attributes)
                        attrs.forEach(attr => {
                            if (el.tagName === 'A' && attr.name === 'href') {
                                el.setAttribute('target', '_blank')
                                el.setAttribute('title', el.getAttribute('href') || '')
                            } else if (attr.name !== 'href' && attr.name !== 'target' && attr.name !== 'title') {
                                el.removeAttribute(attr.name)
                            }
                        })
                        clean(el)
                    }
                }
            })
        }

        clean(div)

        // Убираем дублирующиеся br (2+ подряд → 2)
        let result = div.innerHTML
        result = result.replace(/(<br\s*\/?>\s*){2,}/gi, '<br><br>')
        return result
    }

    const loadData = async () => {
        try {
            const [prodsRes, catsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/products`, { headers }),
                fetch(`${API_URL}/api/admin/categories`, { headers })
            ])
            setProducts(await prodsRes.json())
            setCategories(await catsRes.json())
        } catch (e) {
            console.error('Ошибка загрузки:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
    )

    const saveSelection = () => {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            savedSelection.current = sel.getRangeAt(0).cloneRange()
        }
    }

    const restoreSelection = () => {
        if (savedSelection.current) {
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(savedSelection.current)
        }
    }

    const handleSave = async () => {
        if (!editProduct) return
        // Сохраняем HTML напрямую (очищенный от лишнего)
        const rawHtml = editorRef.current?.innerHTML || ''
        const description = cleanHtml(rawHtml)

        try {
            const url = isNew
                ? `${API_URL}/api/admin/products`
                : `${API_URL}/api/admin/products/${editProduct.id}`

            const res = await fetch(url, {
                method: isNew ? 'POST' : 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editProduct, description })
            })

            if (res.ok) {
                const data = await res.json()
                // Если создали новый товар — переключаемся в режим редактирования для загрузки фото
                if (isNew && data.id) {
                    setIsNew(false)
                    setEditProduct({ ...editProduct, id: data.id, description })
                    loadData()
                } else {
                    setEditProduct(null)
                    loadData()
                }
            }
        } catch {
            alert('Ошибка сохранения')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить товар?')) return
        try {
            await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers })
            loadData()
        } catch {
            alert('Ошибка удаления')
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editProduct || !e.target.files?.[0]) return
        const formData = new FormData()
        formData.append('image', e.target.files[0])

        try {
            const res = await fetch(`${API_URL}/api/admin/products/${editProduct.id}/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()
            if (data.image_url) {
                setEditProduct({ ...editProduct, image_url: data.image_url })
                loadData()
            }
        } catch {
            alert('Ошибка загрузки изображения')
        }
    }

    const getImageUrl = (url: string) => {
        if (!url) return 'https://placehold.co/50x50/13131f/666?text=📦'
        if (url.startsWith('/uploads')) return `${API_URL}${url}`
        return url
    }

    const openNew = () => {
        setIsNew(true)
        setEditProduct({
            id: 0, name: '', description: '', price: 0,
            brand: 'Mysterious', category_id: categories[0]?.id || 1,
            category_name: '', image_url: ''
        })
    }

    const openLinkModal = () => {
        saveSelection()
        const sel = window.getSelection()
        setLinkText(sel?.toString() || '')
        setLinkUrl('')
        setLinkModal(true)
    }

    const insertLink = () => {
        if (!linkUrl) return
        setLinkModal(false)

        setTimeout(() => {
            editorRef.current?.focus()
            restoreSelection()
            const text = linkText || linkUrl
            const link = `<a href="${linkUrl}" target="_blank" title="${linkUrl}">${text}</a>`
            document.execCommand('insertHTML', false, link)
        }, 50)
    }

    const handleEditorKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'k':
                    e.preventDefault()
                    openLinkModal()
                    break
                case 'b':
                    e.preventDefault()
                    applyFormat('bold')
                    break
                case 'i':
                    e.preventDefault()
                    applyFormat('italic')
                    break
                case 'u':
                    e.preventDefault()
                    applyFormat('underline')
                    break
            }
        }
    }

    // Применение форматирования к выделенному тексту
    const applyFormat = (command: string) => {
        editorRef.current?.focus()
        document.execCommand(command, false)
    }

    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'A' && e.ctrlKey) {
            e.preventDefault()
            const href = target.getAttribute('href')
            if (href) window.open(href, '_blank')
        }
    }

    // Обработка вставки — сохраняем HTML форматирование
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const html = e.clipboardData.getData('text/html')
        const text = e.clipboardData.getData('text/plain')

        if (html) {
            // Вставляем HTML с форматированием
            const cleaned = cleanHtml(html)
            document.execCommand('insertHTML', false, cleaned)
        } else {
            // Если нет HTML, вставляем текст с сохранением переносов 1:1
            const formatted = text.replace(/\n/g, '<br>')
            document.execCommand('insertHTML', false, formatted)
        }
    }

    if (loading) {
        return <div className="empty-state"><div className="icon">⏳</div><p>Загрузка...</p></div>
    }

    return (
        <div>
            <div className="page-header">
                <h1>📦 Товары</h1>
                <div style={{ display: 'flex', gap: 16 }}>
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input className="search-input" placeholder="Поиск..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={openNew}>+ Добавить</button>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Фото</th><th>Название</th><th>Категория</th><th>Цена</th><th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td><img className="product-image" src={getImageUrl(p.image_url)} alt="" /></td>
                                <td data-label="Название">
                                    <div>
                                        <div className="product-name">{p.name}</div>
                                        <div className="product-brand">{p.brand}</div>
                                    </div>
                                </td>
                                <td data-label="Категория"><span className="category-badge">{p.category_name}</span></td>
                                <td data-label="Цена"><span className="product-price">{p.price} ₽</span></td>
                                <td>
                                    <div className="actions">
                                        <button className="btn btn-secondary btn-sm"
                                            onClick={() => { setIsNew(false); setEditProduct(p) }}>✏️</button>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(p.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty-state"><div className="icon">📦</div><p>Товары не найдены</p></div>
                )}
            </div>


            {editProduct && (
                <div className="modal-overlay" onClick={() => setEditProduct(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isNew ? '✨ Новый товар' : '✏️ Редактирование'}</h2>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Название</label>
                                <input value={editProduct.name}
                                    onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                                    placeholder="Название товара" />
                            </div>
                            <div className="form-group">
                                <label>Бренд</label>
                                <input value={editProduct.brand}
                                    onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })}
                                    placeholder="Бренд" />
                            </div>
                            <div className="form-group">
                                <label>Категория</label>
                                <select value={editProduct.category_id}
                                    onChange={e => setEditProduct({ ...editProduct, category_id: +e.target.value })}>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Цена (₽)</label>
                                <input type="text" inputMode="numeric"
                                    value={editProduct.price || ''}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '')
                                        setEditProduct({ ...editProduct, price: val ? parseInt(val) : 0 })
                                    }}
                                    placeholder="0" />
                            </div>
                            <div className="form-group">
                                <label>Описание <span className="hint">(Ctrl+B жирный, Ctrl+I курсив, Ctrl+U подчёркивание, Ctrl+K ссылка)</span></label>
                                <div className="editor-toolbar">
                                    <button type="button" className="toolbar-btn" onClick={() => applyFormat('bold')} title="Жирный (Ctrl+B)"><b>B</b></button>
                                    <button type="button" className="toolbar-btn" onClick={() => applyFormat('italic')} title="Курсив (Ctrl+I)"><i>I</i></button>
                                    <button type="button" className="toolbar-btn" onClick={() => applyFormat('underline')} title="Подчёркивание (Ctrl+U)"><u>U</u></button>
                                    <button type="button" className="toolbar-btn" onClick={() => applyFormat('strikeThrough')} title="Зачёркнутый"><s>S</s></button>
                                    <button type="button" className="toolbar-btn" onClick={openLinkModal} title="Ссылка (Ctrl+K)">🔗</button>
                                </div>
                                <div ref={editorRef} className="rich-editor" contentEditable
                                    onKeyDown={handleEditorKeyDown} onClick={handleEditorClick}
                                    onPaste={handlePaste}
                                    dangerouslySetInnerHTML={{ __html: editProduct.description }}
                                    data-placeholder="Описание товара..." />
                            </div>
                            <div className="form-group">
                                <label>Изображение {isNew && <span className="hint">(сохранится после создания товара)</span>}</label>
                                <div className="image-upload">
                                    <img className="image-preview" src={getImageUrl(editProduct.image_url)} alt="" />
                                    <label className="upload-btn">📷 Загрузить
                                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isNew} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditProduct(null)}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleSave}>💾 Сохранить</button>
                        </div>
                    </div>
                </div>
            )}

            {linkModal && (
                <div className="modal-overlay" onClick={() => setLinkModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header"><h2>🔗 Вставить ссылку</h2></div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Текст ссылки</label>
                                <input value={linkText} onChange={e => setLinkText(e.target.value)}
                                    placeholder="Текст для отображения" autoFocus />
                            </div>
                            <div className="form-group">
                                <label>URL</label>
                                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                                    placeholder="https://..." onKeyDown={e => e.key === 'Enter' && insertLink()} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setLinkModal(false)}>Отмена</button>
                            <button className="btn btn-primary" onClick={insertLink} disabled={!linkUrl}>✅ Вставить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
