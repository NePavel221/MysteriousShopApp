-- Очистка старых данных
DELETE FROM store_inventory;
DELETE FROM product_attributes;
DELETE FROM products;
DELETE FROM stores;
DELETE FROM categories;
DELETE FROM users;
DELETE FROM settings;

-- =====================
-- НАСТРОЙКИ
-- =====================
INSERT INTO settings (key, value) VALUES
  ('bot_token', 'YOUR_BOT_TOKEN_HERE');

-- =====================
-- КАТЕГОРИИ — Pharma Theme
-- =====================
INSERT INTO categories (id, name, slug, icon, sort_order) VALUES
  (1, 'Гормоны роста', 'growth-hormones', '💉', 1),
  (2, 'Жиросжигатели', 'fat-burners', '🔥', 2),
  (3, 'ПКТ', 'pct', '⏱️', 3),
  (4, 'Ноотропы', 'nootropics', '🧠', 4),
  (5, 'Витамины', 'vitamins', '💊', 5),
  (6, 'Мужское здоровье', 'mens-health', '♂️', 6),
  (7, 'Пептиды', 'peptides', '🧬', 7),
  (8, 'SARMs', 'sarms', '💪', 8);

-- =====================
-- МАГАЗИН (Telegram доставка)
-- =====================
INSERT INTO stores (id, name, address, phone, working_hours) VALUES
  (1, 'Mysterious Shop', 'Доставка по РФ', '@mysterious_shop', '24/7'),
  (2, 'Mysterious Shop Express', 'Экспресс доставка Москва', '@mysterious_express', '10:00 - 22:00');

-- =====================
-- ГОРМОНЫ РОСТА (category_id = 1)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Ибутаморен MK-677 25mg', 'Стимулятор гормона роста. 60 капсул по 25мг. Увеличивает выработку ГР и IGF-1.', 4500, 1, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=MK-677'),
  ('Ибутаморен MK-677 10mg', 'Стимулятор гормона роста. 90 капсул по 10мг. Начальная дозировка.', 3200, 1, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=MK-677+10'),
  ('HGH Fragment 176-191', 'Фрагмент гормона роста для жиросжигания. 5мг.', 2800, 1, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=HGH+Frag'),
  ('CJC-1295 DAC', 'Пептид для стимуляции ГР. 2мг. Пролонгированное действие.', 3500, 1, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=CJC-1295');

-- =====================
-- ЖИРОСЖИГАТЕЛИ (category_id = 2)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Кленбутерол 40mcg', 'Мощный жиросжигатель. 100 таблеток. Термогенный эффект.', 1200, 2, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=Clen+40'),
  ('Кленбутерол 60mcg', 'Усиленная формула. 100 таблеток.', 1500, 2, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=Clen+60'),
  ('T3 Цитомель 25mcg', 'Гормон щитовидной железы. 100 таблеток. Ускоряет метаболизм.', 1800, 2, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=T3'),
  ('Йохимбин 5mg', 'Натуральный жиросжигатель. 90 капсул. Блокатор альфа-рецепторов.', 900, 2, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=Yohimbine'),
  ('ECA Stack', 'Эфедрин + Кофеин + Аспирин. 60 капсул. Классическая связка.', 2200, 2, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=ECA');

-- =====================
-- ПКТ (category_id = 3)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Тамоксифен 20mg', 'Антиэстроген для ПКТ. 60 таблеток. Восстановление после курса.', 1100, 3, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Tamox'),
  ('Кломифен 50mg', 'Стимулятор тестостерона. 30 таблеток. Для ПКТ.', 1400, 3, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Clomid'),
  ('Анастрозол 1mg', 'Ингибитор ароматазы. 30 таблеток. Контроль эстрогена.', 1600, 3, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Anastrozole'),
  ('ХГЧ 5000 МЕ', 'Хорионический гонадотропин. 1 флакон. Поддержка на курсе.', 2500, 3, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=HCG');

-- =====================
-- НООТРОПЫ (category_id = 4)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Церебролизин 5ml', 'Нейропептидный комплекс. 10 ампул. Улучшение когнитивных функций.', 3800, 4, 'Mysterious', 'https://placehold.co/400x400/b026ff/white?text=Cerebrolysin'),
  ('Пирацетам 800mg', 'Классический ноотроп. 60 таблеток. Улучшение памяти.', 450, 4, 'Mysterious', 'https://placehold.co/400x400/b026ff/white?text=Piracetam'),
  ('Фенибут 250mg', 'Анксиолитик и ноотроп. 60 таблеток. Снижение тревожности.', 600, 4, 'Mysterious', 'https://placehold.co/400x400/b026ff/white?text=Phenibut'),
  ('Модафинил 200mg', 'Стимулятор бодрствования. 30 таблеток. Концентрация и фокус.', 4500, 4, 'Mysterious', 'https://placehold.co/400x400/b026ff/white?text=Modafinil'),
  ('Семакс 0.1%', 'Пептидный ноотроп. Спрей 3мл. Нейропротекция.', 1200, 4, 'Mysterious', 'https://placehold.co/400x400/b026ff/white?text=Semax');

-- =====================
-- ВИТАМИНЫ (category_id = 5)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Витамин D3 5000 МЕ', 'Холекальциферол. 120 капсул. Поддержка иммунитета.', 800, 5, 'Mysterious', 'https://placehold.co/400x400/39ff14/0a0a0a?text=D3'),
  ('Омега-3 1000mg', 'Рыбий жир высокой очистки. 90 капсул. EPA/DHA.', 1100, 5, 'Mysterious', 'https://placehold.co/400x400/39ff14/0a0a0a?text=Omega-3'),
  ('Цинк 50mg', 'Цинк пиколинат. 120 таблеток. Поддержка тестостерона.', 600, 5, 'Mysterious', 'https://placehold.co/400x400/39ff14/0a0a0a?text=Zinc'),
  ('Магний B6', 'Магний + Витамин B6. 90 таблеток. Нервная система.', 550, 5, 'Mysterious', 'https://placehold.co/400x400/39ff14/0a0a0a?text=Mg+B6'),
  ('Мультивитамины для мужчин', 'Комплекс витаминов и минералов. 60 таблеток.', 1400, 5, 'Mysterious', 'https://placehold.co/400x400/39ff14/0a0a0a?text=Multi');

-- =====================
-- МУЖСКОЕ ЗДОРОВЬЕ (category_id = 6)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Сиалис 20mg', 'Тадалафил. 10 таблеток. Длительное действие до 36 часов.', 2200, 6, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Cialis'),
  ('Виагра 100mg', 'Силденафил. 10 таблеток. Быстрое действие.', 1800, 6, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Viagra'),
  ('Дапоксетин 60mg', 'Для продления полового акта. 10 таблеток.', 1500, 6, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Dapoxetine'),
  ('Миноксидил 5%', 'Средство для роста волос. Раствор 60мл.', 1200, 6, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Minoxidil'),
  ('Финастерид 1mg', 'Против выпадения волос. 30 таблеток.', 900, 6, 'Mysterious', 'https://placehold.co/400x400/00d4ff/0a0a0a?text=Finasteride');

-- =====================
-- ПЕПТИДЫ (category_id = 7)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('BPC-157 5mg', 'Пептид для восстановления. Заживление травм.', 2800, 7, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=BPC-157'),
  ('TB-500 2mg', 'Тимозин бета-4. Регенерация тканей.', 3200, 7, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=TB-500'),
  ('Меланотан 2 10mg', 'Пептид для загара. Также повышает либидо.', 2500, 7, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=MT-2'),
  ('GHRP-6 5mg', 'Стимулятор гормона роста. Повышает аппетит.', 1800, 7, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=GHRP-6'),
  ('Ипаморелин 5mg', 'Селективный стимулятор ГР. Без побочек GHRP.', 2200, 7, 'Mysterious', 'https://placehold.co/400x400/f0d000/0a0a0a?text=Ipamorelin');

-- =====================
-- SARMs (category_id = 8)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Остарин MK-2866 25mg', 'SARM для набора сухой массы. 60 капсул.', 4200, 8, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=Ostarine'),
  ('Лигандрол LGD-4033 10mg', 'Мощный SARM для массы. 60 капсул.', 4800, 8, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=LGD-4033'),
  ('Радарин RAD-140 10mg', 'SARM для силы и массы. 60 капсул.', 5200, 8, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=RAD-140'),
  ('Кардарин GW-501516 20mg', 'Для выносливости и жиросжигания. 60 капсул.', 4000, 8, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=Cardarine'),
  ('Андарин S4 25mg', 'SARM для сушки. 60 капсул.', 3800, 8, 'Mysterious', 'https://placehold.co/400x400/ff6b00/white?text=Andarine');

-- =====================
-- АТРИБУТЫ ДОЗИРОВКИ
-- =====================
INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'dosage', '25 мг' FROM products WHERE name LIKE '%25mg%' OR name LIKE '%25мг%';

INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'dosage', '50 мг' FROM products WHERE name LIKE '%50mg%' OR name LIKE '%50мг%';

INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'dosage', '100 мг' FROM products WHERE name LIKE '%100mg%' OR name LIKE '%100мг%';

-- =====================
-- НАЛИЧИЕ НА СКЛАДЕ
-- =====================
INSERT INTO store_inventory (store_id, product_id, quantity)
SELECT 1, id, (ABS(RANDOM()) % 20) + 5 FROM products;

INSERT INTO store_inventory (store_id, product_id, quantity)
SELECT 2, id, (ABS(RANDOM()) % 10) + 2 FROM products;

-- =====================
-- ДЕМО-ПОЛЬЗОВАТЕЛЬ
-- =====================
INSERT INTO users (telegram_id, first_name, bonus_points, discount_code) VALUES
  (123456789, 'Демо', 500, 'MYSTERY10');
