import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Props {
    onLogin: (token: string) => void
}

export default function LoginPage({ onLogin }: Props) {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            })

            const data = await res.json()

            if (res.ok && data.token) {
                onLogin(data.token)
            } else {
                setError(data.error || 'Ошибка входа')
            }
        } catch {
            setError('Ошибка соединения с сервером')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="icon">🔮</div>
                    <h1>Mysterious Shop</h1>
                    <p>Панель администратора</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Логин</label>
                        <input
                            type="text"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            placeholder="Введите логин"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={loading}
                    >
                        {loading ? '⏳ Вход...' : '🚀 Войти'}
                    </button>
                </form>
            </div>
        </div>
    )
}
