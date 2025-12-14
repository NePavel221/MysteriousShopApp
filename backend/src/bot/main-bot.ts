import TelegramBot from 'node-telegram-bot-api'

// Токен основного бота для клиентов
const MAIN_BOT_TOKEN = '8566150759:AAGI-5Vdq1Vcup4I-3D_cA58Gt-nKp8zmXg'

let mainBot: TelegramBot | null = null

// Стикер приветствия (дружелюбный)
const WELCOME_STICKER = 'CAACAgIAAxkBAAEBJ_Zl8K8AAXKvAAHxAAGKAAFnAAHqAAHqAAEAAQADAgADdwADNQQ'

export function startMainBot(): boolean {
    if (mainBot) {
        console.log('ℹ️ Основной бот уже запущен')
        return true
    }

    try {
        mainBot = new TelegramBot(MAIN_BOT_TOKEN, { polling: true })
        setupMainBotHandlers(mainBot)
        console.log('🛒 Основной бот VapeCity для клиентов запущен!')
        return true
    } catch (err: any) {
        console.error('❌ Ошибка запуска основного бота:', err.message)
        mainBot = null
        return false
    }
}

function setupMainBotHandlers(bot: TelegramBot) {
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id
        const firstName = msg.from?.first_name || 'друг'

        // Отправляем стикер
        try {
            await bot.sendSticker(chatId, WELCOME_STICKER)
        } catch (e) {
            // Стикер не критичен
        }

        const welcomeText = `Привет, ${firstName}! 👋

Добро пожаловать в <b>VapeCity</b> — твой помощник для покупок в наших магазинах!

🎁 <b>Бонусная программа</b>
Копи баллы с каждой покупки и трать их на скидки. 1 балл = 1 рубль!

📦 <b>Бронирование товаров</b>
Выбери товар в приложении, забронируй и забери в удобное время. Никаких очередей!

🔍 <b>Каталог</b>
Смотри наличие товаров на всех точках города. Фильтруй по категориям и магазинам.

📍 <b>Наши точки</b>
Узнай адреса, часы работы и наличие товаров в каждом магазине.

Нажми кнопку <b>«Приложение»</b> ниже, чтобы начать! 🚀`

        await bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML' })
    })
}


export function stopMainBot() {
    if (mainBot) {
        mainBot.stopPolling()
        mainBot = null
        console.log('🛑 Основной бот остановлен')
    }
}

export function isMainBotRunning(): boolean {
    return mainBot !== null
}

export default mainBot
