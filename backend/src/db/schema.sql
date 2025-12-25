-- Категории товаров
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Точки продаж
CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  working_hours TEXT,
  is_active INTEGER DEFAULT 1
);

-- Продавцы точек (для Telegram-уведомлений)
-- Один продавец может быть привязан к нескольким точкам
-- Владелец добавляется во все точки и видит все брони
CREATE TABLE IF NOT EXISTS store_sellers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  telegram_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(store_id, telegram_id)
);

-- Товары
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category_id INTEGER REFERENCES categories(id),
  brand TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Атрибуты товаров (крепость, объём и т.д.)
CREATE TABLE IF NOT EXISTS product_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL
);

-- Наличие товаров на точках
CREATE TABLE IF NOT EXISTS store_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  UNIQUE(store_id, product_id)
);

-- Пользователи (для демо бонусов)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER UNIQUE,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  phone TEXT,
  bonus_points INTEGER DEFAULT 0,
  discount_code TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Брони
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  store_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  delivery_method TEXT,
  delivery_price INTEGER DEFAULT 0,
  recipient_name TEXT,
  recipient_phone TEXT,
  recipient_city TEXT,
  recipient_address TEXT,
  recipient_postal_code TEXT,
  recipient_comment TEXT,
  telegram_username TEXT,
  payment_receipt_url TEXT,
  shipping_info TEXT,
  total_price INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Товары в брони
CREATE TABLE IF NOT EXISTS reservation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time INTEGER NOT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Настройки приложения
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
