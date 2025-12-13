import TelegramBot from 'node-telegram-bot-api'
import { db } from '../db/database.js'

let bot: TelegramBot | null = null
let currentToken: string | null = null

const mainKeyboard = {
    keyboard: [
        [{ text: '📋 Брони' }]
    ],
    resize_keyboard: true,
    persistent: true
}

const statusLabels: Record<string, string> = {
    pending: '⏳ Ожидает',
    confirmed: '✅ Подтверждена',
    completed: '🎉 Выдана',
    cancelled: '❌ Отменена'
}

const ITEMS_PER_PAGE = 9 // 3 ряда по 3 кнопки

function formatReservationFull(res: any, items?: any[]): string {
    let text = `🆔 <b>Бронь ${res.order_number}</b>\n`
    text += `📊 Статус: ${statusLabels[res.status] || res.status}\n\n`
    text += `👤 <b>Клиент:</b> ${res.first_name || ''} ${res.last_name || ''}\n`
    if (res.phone) text += `📱 ${res.phone}\n`
    if (res.username) text += `💬 @${res.username}\n`
    text += `\n⏰ <b>Время:</b> ${res.pickup_time_from} — ${res.pickup_time_to}\n`
    text += `📍 <b>Точка:</b> ${res.store_address || res.store_name || ''}\n\n`
    if (items && items.length > 0) {
        text += `🛒 <b>Товары:</b>\n`
        for (const item of items) {
            text += `• ${item.name} ×${item.quantity} — ${item.price_at_time * item.quantity} ₽\n`
        }
        text += `\n`
    }
    text += `💰 <b>Итого: ${res.total_price} ₽</b>`
    return text
}

function getSellerStores(telegramId: number): any[] {
    return db.prepare(`
        SELECT s.id, s.name, s.address FROM store_sellers ss 
        JOIN stores s ON ss.store_id = s.id WHERE ss.telegram_id = ?
    `).all(telegramId) as any[]
}

function getTodayReservationsForStore(storeId: number) {
    const today = new Date().toISOString().split('T')[0]
    return db.prepare(`
        SELECT r.id, r.order_number, r.status FROM reservations r
        WHERE DATE(r.created_at) = ? AND r.store_id = ? AND r.status IN ('pending', 'confirmed')
        ORDER BY r.pickup_time_from
    `).all(today, storeId)
}

function getActiveReservationsForStore(storeId: number) {
    return db.prepare(`
        SELECT r.id, r.order_number, r.status FROM reservations r
        WHERE r.store_id = ? AND r.status IN ('pending', 'confirmed')
        ORDER BY r.created_at DESC LIMIT 50
    `).all(storeId)
}


function countTodayReservationsForStore(storeId: number): number {
    const today = new Date().toISOString().split('T')[0]
    const row = db.prepare(`
        SELECT COUNT(*) as cnt FROM reservations 
        WHERE DATE(created_at) = ? AND store_id = ? AND status IN ('pending', 'confirmed')
    `).get(today, storeId) as any
    return row?.cnt || 0
}

function countActiveReservationsForStore(storeId: number): number {
    const row = db.prepare(`
        SELECT COUNT(*) as cnt FROM reservations 
        WHERE store_id = ? AND status IN ('pending', 'confirmed')
    `).get(storeId) as any
    return row?.cnt || 0
}

function getReservationDetails(id: number) {
    const reservation = db.prepare(`
        SELECT r.*, u.first_name, u.last_name, u.phone, u.username, s.address as store_address, s.name as store_name
        FROM reservations r JOIN users u ON r.user_id = u.id JOIN stores s ON r.store_id = s.id WHERE r.id = ?
    `).get(id)
    const items = db.prepare(`
        SELECT ri.*, p.name, p.brand FROM reservation_items ri 
        JOIN products p ON ri.product_id = p.id WHERE ri.reservation_id = ?
    `).all(id)
    return { reservation, items }
}

function getReservationStoreId(id: number): number | null {
    const row = db.prepare(`SELECT store_id FROM reservations WHERE id = ?`).get(id) as any
    return row?.store_id || null
}

function updateReservationStatus(id: number, status: string) {
    db.prepare(`UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, id)
}

function getStoreSellersIds(storeId: number): number[] {
    const rows = db.prepare(`SELECT telegram_id FROM store_sellers WHERE store_id = ?`).all(storeId) as any[]
    return rows.map(r => r.telegram_id)
}

// Создание кнопок броней с пагинацией
function buildReservationButtons(reservations: any[], page: number, backAction: string, storeId: number): any[][] {
    const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)
    const start = page * ITEMS_PER_PAGE
    const pageItems = reservations.slice(start, start + ITEMS_PER_PAGE)

    const buttons: any[][] = []
    for (let i = 0; i < pageItems.length; i += 3) {
        const row = pageItems.slice(i, i + 3).map(r => ({
            text: `${r.order_number} ${r.status === 'confirmed' ? '✅' : '⏳'}`,
            callback_data: `view_${r.id}_${backAction}_${storeId}`
        }))
        buttons.push(row)
    }

    // Навигация по страницам
    if (totalPages > 1) {
        const navRow: any[] = []
        if (page > 0) {
            navRow.push({ text: '◀️ Назад', callback_data: `page_${backAction}_${storeId}_${page - 1}` })
        }
        navRow.push({ text: `${page + 1}/${totalPages}`, callback_data: 'noop' })
        if (page < totalPages - 1) {
            navRow.push({ text: 'Вперёд ▶️', callback_data: `page_${backAction}_${storeId}_${page + 1}` })
        }
        buttons.push(navRow)
    }

    buttons.push([{ text: '« К точкам', callback_data: `back_${backAction}` }])
    return buttons
}

function setupBotHandlers(botInstance: TelegramBot) {
    botInstance.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id
        const stores = getSellerStores(chatId)

        let text = `👋 <b>Привет!</b>\n\n`
        text += `Я бот VapeCity для продавцов. Буду присылать тебе уведомления о новых бронях, `
        text += `чтобы ты всегда знал, когда клиент придёт за заказом.\n\n`

        if (stores.length > 0) {
            text += `📍 <b>Твои точки:</b>\n`
            text += stores.map(s => `• ${s.address}`).join('\n')
            text += `\n\n`
            text += `Используй кнопки внизу, чтобы посмотреть текущие брони. `
            text += `Когда клиент придёт — нажми "Выдать". Если бронь отменяется — "Отменить".`
        } else {
            text += `⚠️ Ты пока не привязан ни к одной точке. `
            text += `Попроси администратора добавить тебя в систему.`
        }

        botInstance.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup: mainKeyboard })
    })


    botInstance.on('message', (msg) => {
        const chatId = msg.chat.id
        const text = msg.text

        if (text === '📋 Брони') {
            const stores = getSellerStores(chatId)
            if (stores.length === 0) {
                botInstance.sendMessage(chatId, '⚠️ Ты не привязан ни к одной точке', { reply_markup: mainKeyboard })
                return
            }
            const hasAny = stores.some(s => countTodayReservationsForStore(s.id) > 0)
            if (!hasAny) {
                botInstance.sendMessage(chatId, '📭 Сегодня броней нет', { reply_markup: mainKeyboard })
                return
            }
            // Если точка одна — сразу показываем брони
            if (stores.length === 1) {
                const store = stores[0]
                const reservations = getTodayReservationsForStore(store.id) as any[]
                const buttons = buildReservationButtons(reservations, 0, 'today', store.id)
                botInstance.sendMessage(chatId, `📋 <b>Брони на сегодня (${reservations.length})</b>`, {
                    parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons }
                })
            } else {
                // Несколько точек — показываем выбор
                const buttons = stores.map(store => {
                    const count = countTodayReservationsForStore(store.id)
                    return [{ text: `📍 ${store.address} (${count})`, callback_data: `today_store_${store.id}_0` }]
                })
                botInstance.sendMessage(chatId, '📋 <b>Выбери точку:</b>', {
                    parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons }
                })
            }
        }
    })

    botInstance.on('callback_query', async (query) => {
        const chatId = query.message?.chat.id
        const data = query.data
        if (!chatId || !data) return

        // Пустое действие для номера страницы
        if (data === 'noop') {
            botInstance.answerCallbackQuery(query.id)
            return
        }

        // Выбрали точку для броней на сегодня
        if (data.startsWith('today_store_')) {
            const parts = data.replace('today_store_', '').split('_')
            const storeId = parseInt(parts[0])
            const page = parseInt(parts[1]) || 0
            const reservations = getTodayReservationsForStore(storeId) as any[]
            if (reservations.length === 0) {
                botInstance.answerCallbackQuery(query.id, { text: 'Нет броней' })
                return
            }
            const buttons = buildReservationButtons(reservations, page, 'today', storeId)
            botInstance.sendMessage(chatId, `📋 <b>Брони на сегодня (${reservations.length})</b>`, {
                parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons }
            })
            botInstance.answerCallbackQuery(query.id)
        }

        // Пагинация
        else if (data.startsWith('page_')) {
            const parts = data.replace('page_', '').split('_')
            const storeId = parseInt(parts[1])
            const page = parseInt(parts[2])
            const reservations = getTodayReservationsForStore(storeId) as any[]
            const buttons = buildReservationButtons(reservations, page, 'today', storeId)
            botInstance.sendMessage(chatId, `📋 <b>Брони на сегодня (${reservations.length})</b>`, {
                parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons }
            })
            botInstance.answerCallbackQuery(query.id)
        }


        // Назад к списку точек
        else if (data === 'back_today') {
            const stores = getSellerStores(chatId)
            const buttons = stores.map(store => {
                const count = countTodayReservationsForStore(store.id)
                return [{ text: `📍 ${store.address} (${count})`, callback_data: `today_store_${store.id}_0` }]
            })
            botInstance.sendMessage(chatId, '📋 <b>Выбери точку:</b>', {
                parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons }
            })
            botInstance.answerCallbackQuery(query.id)
        }



        // Просмотр брони (с информацией откуда вернуться)
        else if (data.startsWith('view_')) {
            const parts = data.replace('view_', '').split('_')
            const id = parseInt(parts[0])
            const backType = parts[1] // today или active
            const storeId = parts[2]
            const { reservation, items } = getReservationDetails(id) as any
            if (!reservation) {
                botInstance.answerCallbackQuery(query.id, { text: 'Бронь не найдена' })
                return
            }
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '✅ Выдать', callback_data: `ask_complete_${id}_${backType}_${storeId}` },
                        { text: '❌ Отменить', callback_data: `ask_cancel_${id}_${backType}_${storeId}` }
                    ],
                    [{ text: '« Назад к броням', callback_data: `${backType}_store_${storeId}_0` }]
                ]
            }
            botInstance.sendMessage(chatId, formatReservationFull(reservation, items), {
                parse_mode: 'HTML', reply_markup: keyboard
            })
            botInstance.answerCallbackQuery(query.id)
        }

        // Подтверждение выдачи
        else if (data.startsWith('ask_complete_')) {
            const parts = data.replace('ask_complete_', '').split('_')
            const id = parts[0]
            const backType = parts[1]
            const storeId = parts[2]
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '✅ Да, выдать', callback_data: `complete_${id}_${backType}_${storeId}` },
                        { text: '❌ Нет', callback_data: `view_${id}_${backType}_${storeId}` }
                    ]
                ]
            }
            botInstance.sendMessage(chatId, '❓ <b>Точно выдать заказ?</b>\n\nКлиент забрал товар?', {
                parse_mode: 'HTML', reply_markup: keyboard
            })
            botInstance.answerCallbackQuery(query.id)
        }

        // Подтверждение отмены
        else if (data.startsWith('ask_cancel_')) {
            const parts = data.replace('ask_cancel_', '').split('_')
            const id = parts[0]
            const backType = parts[1]
            const storeId = parts[2]
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '✅ Да, отменить', callback_data: `cancel_${id}_${backType}_${storeId}` },
                        { text: '❌ Нет', callback_data: `view_${id}_${backType}_${storeId}` }
                    ]
                ]
            }
            botInstance.sendMessage(chatId, '❓ <b>Точно отменить бронь?</b>\n\nКлиент не придёт?', {
                parse_mode: 'HTML', reply_markup: keyboard
            })
            botInstance.answerCallbackQuery(query.id)
        }

        // Выдать заказ
        else if (data.startsWith('complete_')) {
            const parts = data.replace('complete_', '').split('_')
            const id = parseInt(parts[0])
            const backType = parts[1]
            const storeId = parts[2]
            updateReservationStatus(id, 'completed')
            botInstance.answerCallbackQuery(query.id, { text: '✅ Заказ выдан!' })
            const keyboard = {
                inline_keyboard: [
                    [{ text: '« Назад к броням', callback_data: `${backType}_store_${storeId}_0` }]
                ]
            }
            botInstance.sendMessage(chatId, '🎉 <b>Заказ выдан!</b>\n\nОтличная работа!', {
                parse_mode: 'HTML', reply_markup: keyboard
            })
        }

        // Отменить бронь
        else if (data.startsWith('cancel_') && !data.startsWith('cancel_confirm')) {
            const parts = data.replace('cancel_', '').split('_')
            const id = parseInt(parts[0])
            const backType = parts[1]
            const storeId = parts[2]
            updateReservationStatus(id, 'cancelled')
            botInstance.answerCallbackQuery(query.id, { text: '❌ Бронь отменена' })
            const keyboard = {
                inline_keyboard: [
                    [{ text: '« Назад к броням', callback_data: `${backType}_store_${storeId}_0` }]
                ]
            }
            botInstance.sendMessage(chatId, '❌ <b>Бронь отменена</b>', {
                parse_mode: 'HTML', reply_markup: keyboard
            })
        }

        // Подтвердить бронь (из уведомления)
        else if (data.startsWith('confirm_')) {
            const id = parseInt(data.replace('confirm_', ''))
            updateReservationStatus(id, 'confirmed')
            botInstance.answerCallbackQuery(query.id, { text: '✅ Бронь подтверждена!' })
            botInstance.sendMessage(chatId, '✅ <b>Бронь подтверждена!</b>\n\nКлиент ждёт.', { parse_mode: 'HTML' })
        }
    })
}


function getTokenFromDB(): string | null {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'bot_token'").get() as any
    return row?.value || null
}

export function startBot(token?: string): boolean {
    const newToken = token || getTokenFromDB()
    if (!newToken) {
        console.log('⚠️ Токен бота не настроен')
        return false
    }
    if (newToken === currentToken && bot) {
        console.log('ℹ️ Бот уже работает с этим токеном')
        return true
    }
    if (bot) {
        console.log('🔄 Перезапуск бота...')
        bot.stopPolling()
        bot = null
    }
    try {
        bot = new TelegramBot(newToken, { polling: true })
        currentToken = newToken
        setupBotHandlers(bot)
        console.log('🤖 Telegram-бот VapeCity запущен!')
        return true
    } catch (err: any) {
        console.error('❌ Ошибка запуска бота:', err.message)
        bot = null
        currentToken = null
        return false
    }
}

export function stopBot() {
    if (bot) {
        bot.stopPolling()
        bot = null
        currentToken = null
        console.log('🛑 Бот остановлен')
    }
}

export function isBotRunning(): boolean {
    return bot !== null
}

export function notifyNewReservation(reservationId: number) {
    if (!bot) {
        console.log('⚠️ Бот не запущен, уведомление не отправлено')
        return
    }
    const { reservation, items } = getReservationDetails(reservationId) as any
    if (!reservation) return
    const sellerIds = getStoreSellersIds(reservation.store_id)
    if (sellerIds.length === 0) {
        console.log(`⚠️ Нет продавцов для точки ${reservation.store_id}`)
        return
    }
    let text = `🆕 <b>Новая бронь ${reservation.order_number}</b>\n\n`
    text += `👤 ${reservation.first_name || ''} ${reservation.last_name || ''}\n`
    text += `⏰ ${reservation.pickup_time_from} — ${reservation.pickup_time_to}\n`
    text += `📍 ${reservation.store_address}\n`
    text += `💰 <b>${reservation.total_price} ₽</b>`
    const keyboard = {
        inline_keyboard: [[
            { text: '👁 Подробнее', callback_data: `view_${reservationId}_today_${reservation.store_id}` },
            { text: '✅ Принять', callback_data: `confirm_${reservationId}` }
        ]]
    }
    for (const sellerId of sellerIds) {
        bot.sendMessage(sellerId, text, { parse_mode: 'HTML', reply_markup: keyboard })
            .catch(err => console.error(`Ошибка: ${err.message}`))
    }
    console.log(`📨 Уведомление отправлено ${sellerIds.length} продавцам`)
}

// startBot() вызывается из index.ts после initDatabase()

export default bot
