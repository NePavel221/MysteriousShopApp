import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Category {
    id: number
    name: string
    slug: string
    icon: string
    sort_order: number
}

interface Props {
    token: string
}

export default function CategoriesPage({ token }: Props) {
    const [categories, setCategories] = useState<Category[]>([])
    const [editCategory, setEditCategory] = useState<Category | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [loading, setLoading] = useState(true)

    const headers = { Authorization: `Bearer ${token}` }

    const loadData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/categories`, { headers })
            setCategories(await res.json())
        } catch (e) {
            console.error('Ошибка загрузки:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    const handleSave = async () => {
        if (!editCategory) return

        try {
            const url = isNew
                ? `${API_URL}/api/admin/categories`
                : `${API_URL}/api/admin/categories/${editCategory.id}`

            const res = await fetch(url, {
                method: isNew ? 'POST' : 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(editCategory)
            })

            if (res.ok) {
                setEditCategory(null)
                loadData()
            }
        } catch (e) {
            alert('Ошибка сохранения')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить категорию? Товары в ней останутся без категории.')) return

        try {
            await fetch(`${API_URL}/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers
            })
            loadData()
        } catch (e) {
            alert('Ошибка удаления')
        }
    }

    const openNew = () => {
        setIsNew(true)
        setEditCategory({
            id: 0,
            name: '',
            slug: '',
            icon: '📦',
            sort_order: categories.length + 1
        })
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[а-яё]/g, char => {
                const map: Record<string, string> = {
                    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
                    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
                    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
                    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
                }
                return map[char] || char
            })
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    if (loading) {
        return <div className="empty-state"><div className="icon">⏳</div><p>Загрузка...</p></div>
    }

    return (
        <div>
            <div className="page-header">
                <h1>📁 Категории</h1>
                <button className="btn btn-primary" onClick={openNew}>
                    + Добавить
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Иконка</th>
                            <th>Название</th>
                            <th>Slug</th>
                            <th>Порядок</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontSize: 24 }}>{c.icon}</td>
                                <td data-label="Название">
                                    <div className="product-name">{c.name}</div>
                                </td>
                                <td data-label="Slug">
                                    <code style={{ color: 'var(--neon-cyan)', fontSize: 12 }}>{c.slug}</code>
                                </td>
                                <td data-label="Порядок">{c.sort_order}</td>
                                <td>
                                    <div className="actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => { setIsNew(false); setEditCategory(c) }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {categories.length === 0 && (
                    <div className="empty-state">
                        <div className="icon">📁</div>
                        <p>Категории не найдены</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {editCategory && (
                <div className="modal-overlay" onClick={() => setEditCategory(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isNew ? '✨ Новая категория' : '✏️ Редактирование'}</h2>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Иконка (emoji)</label>
                                <input
                                    value={editCategory.icon}
                                    onChange={e => setEditCategory({ ...editCategory, icon: e.target.value })}
                                    placeholder="📦"
                                    style={{ fontSize: 24, textAlign: 'center' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Название</label>
                                <input
                                    value={editCategory.name}
                                    onChange={e => {
                                        const name = e.target.value
                                        setEditCategory({
                                            ...editCategory,
                                            name,
                                            slug: isNew ? generateSlug(name) : editCategory.slug
                                        })
                                    }}
                                    placeholder="Название категории"
                                />
                            </div>

                            <div className="form-group">
                                <label>Slug (URL)</label>
                                <input
                                    value={editCategory.slug}
                                    onChange={e => setEditCategory({ ...editCategory, slug: e.target.value })}
                                    placeholder="category-slug"
                                />
                            </div>

                            <div className="form-group">
                                <label>Порядок сортировки</label>
                                <input
                                    type="number"
                                    value={editCategory.sort_order}
                                    onChange={e => setEditCategory({ ...editCategory, sort_order: +e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditCategory(null)}>
                                Отмена
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                💾 Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
