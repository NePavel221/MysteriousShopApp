import { useState } from 'react'
import { login } from '../api'

interface Props {
    onLogin: () => void
}

export default function LoginPage({ onLogin }: Props) {
    const [loginValue, setLoginValue] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await login(loginValue, password)
            if (res.token) {
                localStorage.setItem('admin_token', res.token)
                onLogin()
            } else {
                setError(res.error || 'Ошибка входа')
            }
        } catch {
            setError('Ошибка соединения с сервером')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1>🔐 VapeCity</h1>
                <p>Вход в админ-панель</p>

                {error && <div className="login-error">{error}</div>}

                <input
                    type="text"
                    placeholder="Логин"
                    value={loginValue}
                    onChange={(e) => setLoginValue(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    )
}
