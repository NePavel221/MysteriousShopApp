import TelegramBot from 'node-telegram-bot-api'

const BOT_TOKEN = process.env.BOT_TOKEN || '7760049365:AAE6q5z_ocnu9DNpyXwdKeej-m6_iVuttCo'
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://mysterious-shop.mooo.com'

let bot: TelegramBot | null = null

export function startBot() {
    if (!BOT_TOKEN) {
        console.log('⚠️ BOT_TOKEN не задан, бот не запущен')
        return
    }

    try {
        bot = new TelegramBot(BOT_TOKEN, { polling: true })
        setupHandlers(bot)
        console.log('🤖 Mysterious Shop бот запущен!')
    } catch (error) {
        console.error('❌ Ошибка запуска бота:', error)
    }
}

function setupHandlers(bot: TelegramBot) {
    // Команда /start
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id
        const firstName = msg.from?.first_name || 'друг'

        const welcomeText = `🧪 Привет, ${firstName}!

Добро пожаловать в <b>Mysterious Shop</b> — магазин биохакинга и здоровья!

Здесь ты найдёшь:

💪 <b>SARM и пептиды</b> — для роста мышц и восстановления

⚡ <b>Средства для похудения</b> — эффективные жиросжигатели

🧠 <b>Ноотропы</b> — для концентрации и памяти

🍄 <b>Грибы и травы</b> — натуральные адаптогены

💊 <b>Витамины и БАДы</b> — для общего здоровья

❤️ <b>Здоровье</b> — поддержка организма

Нажми кнопку ниже, чтобы открыть магазин 👇`

        await bot.sendMessage(chatId, welcomeText, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🛒 Открыть магазин',
                        web_app: { url: WEBAPP_URL }
                    }
                ]]
            }
        })
    })

    // Любое другое сообщение
    bot.on('message', async (msg) => {
        if (msg.text?.startsWith('/')) return // Игнорируем команды

        const chatId = msg.chat.id
        await bot.sendMessage(chatId, '👆 Нажми кнопку выше или напиши /start чтобы открыть магазин!')
    })
}

export function stopBot() {
    if (bot) {
        bot.stopPolling()
        bot = null
    }
}
