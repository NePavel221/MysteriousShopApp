# Mysterious Shop

Telegram Mini App для магазина Mysterious Shop.

## Функционал

- 📦 Каталог товаров с категориями
- 🔍 Поиск и фильтры
- 🛒 Корзина и оформление заказов
- 💰 Бонусная программа

## Технологии

- **Frontend:** React + Vite + TypeScript + Telegram UI
- **Backend:** Express.js + SQLite
- **База данных:** SQLite (better-sqlite3)

## Запуск

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Структура

```
MysteriousShopApp/
├── frontend/     # React приложение
├── backend/      # Express API + SQLite
└── README.md
```

## API Endpoints

- `GET /api/categories` — список категорий
- `GET /api/stores` — список точек
- `GET /api/products` — товары (с фильтрами)
- `GET /api/products/:id` — детали товара
- `GET /api/users/:telegramId` — данные пользователя
