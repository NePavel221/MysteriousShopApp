import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../api'

interface Settings {
    bot_token: string
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({ bot_token: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const data = await getSettings()
            setSettings(data)
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            await updateSettings(settings)
            setMessage({ type: 'success', text: '✅ Настройки сохранены! Перезапустите сервер для применения нового токена.' })
        } catch (e) {
            setMessage({ type: 'error', text: '❌ Ошибка сохранения' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1>⚙️ Настройки</h1>
            </div>

            <div className="settings-card">
                <h3>🤖 Telegram-бот</h3>
                <p className="settings-description">
                    Бот отправляет уведомления продавцам о новых бронях.
                    Создайте бота через @BotFather в Telegram и вставьте токен сюда.
                </p>

                <div className="form-group">
                    <label>Токен бота</label>
                    <input
                        type="text"
                        value={settings.bot_token}
                        onChange={e => setSettings({ ...settings, bot_token: e.target.value })}
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                    <small className="form-hint">
                        Получить токен: откройте @BotFather → /newbot → следуйте инструкциям
                    </small>
                </div>

                {message && (
                    <div className={`settings-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Сохранение...' : '💾 Сохранить'}
                </button>
            </div>

            <div className="settings-card">
                <h3>ℹ️ Информация</h3>
                <div className="info-list">
                    <div className="info-item">
                        <span className="info-label">API:</span>
                        <code>http://localhost:3001</code>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Мини-апп:</span>
                        <code>http://localhost:5173</code>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Админка:</span>
                        <code>http://localhost:5174</code>
                    </div>
                </div>
            </div>
        </div>
    )
}
