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
  ('bot_token', '8405418134:AAHlxcq_Xe7nn--RZP2bvezfrXNvjMP1dU0');

-- =====================
-- КАТЕГОРИИ
-- =====================
INSERT INTO categories (id, name, slug, icon, sort_order) VALUES
  (1, 'Жидкости', 'liquids', '💧', 1),
  (2, 'POD-системы', 'pod-systems', '📱', 2),
  (3, 'Одноразки', 'disposables', '🚬', 3),
  (4, 'Картриджи и испарители', 'cartridges', '🔧', 4),
  (5, 'Снюс', 'snus', '📦', 5),
  (6, 'Табак для кальяна', 'hookah-tobacco', '🌿', 6);

-- =====================
-- МАГАЗИНЫ (9 точек VapeCity в Перми)
-- =====================
INSERT INTO stores (id, name, address, phone, working_hours) VALUES
  (1, 'VapeCity Артемьевская', 'ул. Артемьевская, 6', '+7 (342) 200-00-01', '10:00 - 22:00'),
  (2, 'VapeCity Барамзиной', 'ул. Татьяны Барамзиной, 38', '+7 (342) 200-00-02', '10:00 - 22:00'),
  (3, 'VapeCity Ленина', 'ул. Ленина, 50А', '+7 (342) 200-00-03', '10:00 - 00:00'),
  (4, 'VapeCity Гагарина', 'бульвар Гагарина, 53', '+7 (342) 200-00-04', '10:00 - 22:00'),
  (5, 'VapeCity Сеченова', 'ул. Сеченова, 7', '+7 (342) 200-00-05', '10:00 - 22:00'),
  (6, 'VapeCity Докучаева', 'ул. Докучаева, 52 к2', '+7 (342) 200-00-06', '10:00 - 22:00'),
  (7, 'VapeCity Хабаровская', 'ул. Хабаровская, 161', '+7 (342) 200-00-07', '10:00 - 22:00'),
  (8, 'VapeCity Калинина', 'ул. Калинина, 66', '+7 (342) 200-00-08', '10:00 - 22:00'),
  (9, 'VapeCity Рыбалко', 'ул. Маршала Рыбалко, 109', '+7 (342) 200-00-09', '10:00 - 22:00');

-- =====================
-- ЖИДКОСТИ (category_id = 1)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Брызги 20mg', 'Жидкость 20mg. Освежающие лимонады.', 370, 1, 'Брызги', 'https://placehold.co/400x400/00f0ff/white?text=Bryzgi'),
  ('Angry Vape 20 Strong', 'Жидкость 20 Strong. Агрессивные вкусы.', 400, 1, 'Angry Vape', 'https://placehold.co/400x400/dc2626/white?text=Angry'),
  ('Bad Rabbit 20mg', 'Жидкость 20mg. Сладкая линейка.', 450, 1, 'Bad Rabbit', 'https://placehold.co/400x400/ff69b4/white?text=Bad+Rabbit'),
  ('Sour Bad Rabbit 20mg', 'Жидкость 20mg. Кислая линейка.', 450, 1, 'Bad Rabbit', 'https://placehold.co/400x400/ffff00/black?text=Sour+Rabbit'),
  ('Bitcoin', 'Жидкость с яркими вкусами.', 500, 1, 'Bitcoin', 'https://placehold.co/400x400/ff9500/white?text=Bitcoin'),
  ('Catswill 20 Strong', 'Жидкость 20 Strong. Мягкие фруктовые вкусы.', 450, 1, 'Catswill', 'https://placehold.co/400x400/b026ff/white?text=Catswill'),
  ('Catswill 0 Strong', 'Жидкость без никотина.', 450, 1, 'Catswill', 'https://placehold.co/400x400/b026ff/white?text=Catswill+0'),
  ('Catswill Malaysian 20 Strong', 'Малазийская линейка 20 Strong.', 450, 1, 'Catswill', 'https://placehold.co/400x400/39ff14/white?text=Catswill+MY');


INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Dabbler 20mg', 'Жидкость 20mg.', 400, 1, 'Dabbler', 'https://placehold.co/400x400/00f0ff/white?text=Dabbler'),
  ('Dota 20 Strong', 'Жидкость 20 Strong. Яркие игровые вкусы.', 350, 1, 'Dota', 'https://placehold.co/400x400/b026ff/white?text=Dota'),
  ('Duall 20mg', 'Жидкость 20mg. Двойные миксы.', 350, 1, 'Duall', 'https://placehold.co/400x400/ff2d95/white?text=Duall'),
  ('Duall 20 Strong', 'Жидкость 20 Strong. Двойные миксы.', 350, 1, 'Duall', 'https://placehold.co/400x400/ff2d95/white?text=Duall+S'),
  ('Iceberg 20mg', 'Жидкость 20mg. Ледяная свежесть.', 850, 1, 'Iceberg', 'https://placehold.co/400x400/00f0ff/white?text=Iceberg'),
  ('Iceberg 20 Strong', 'Жидкость 20 Strong. Ледяная свежесть.', 850, 1, 'Iceberg', 'https://placehold.co/400x400/00f0ff/white?text=Iceberg+S'),
  ('IceCool 8', 'Жидкость крепость 8.', 450, 1, 'IceCool', 'https://placehold.co/400x400/00f0ff/white?text=IceCool+8'),
  ('IceCool 10', 'Жидкость крепость 10.', 450, 1, 'IceCool', 'https://placehold.co/400x400/00f0ff/white?text=IceCool+10'),
  ('INOY 20mg', 'Жидкость 20mg.', 500, 1, 'INOY', 'https://placehold.co/400x400/b026ff/white?text=INOY'),
  ('MAD Fatality 20 Strong', 'Жидкость 20 Strong.', 400, 1, 'MAD', 'https://placehold.co/400x400/dc2626/white?text=MAD'),
  ('Malasian Podonki 20 Strong', 'Малазийская линейка 20 Strong.', 400, 1, 'Podonki', 'https://placehold.co/400x400/39ff14/white?text=Podonki+MY'),
  ('Monster Vapor 20mg', 'Жидкость 20mg. Энергетические вкусы.', 400, 1, 'Monster Vapor', 'https://placehold.co/400x400/39ff14/white?text=Monster'),
  ('Monster Vapor 20 Strong', 'Жидкость 20 Strong. Энергетические вкусы.', 400, 1, 'Monster Vapor', 'https://placehold.co/400x400/39ff14/white?text=Monster+S'),
  ('Narcoz 20mg', 'Жидкость 20mg. Мощный холодок.', 400, 1, 'Narcoz', 'https://placehold.co/400x400/b026ff/white?text=Narcoz'),
  ('Narcoz 20 Strong', 'Жидкость 20 Strong. Мощный холодок.', 400, 1, 'Narcoz', 'https://placehold.co/400x400/b026ff/white?text=Narcoz+S'),
  ('Oggo Max 20mg', 'Жидкость 20mg.', 445, 1, 'Oggo', 'https://placehold.co/400x400/ff9500/white?text=Oggo'),
  ('Podonki Vintage 20 Strong', 'Винтажная линейка 20 Strong.', 350, 1, 'Podonki', 'https://placehold.co/400x400/8b4513/white?text=Vintage'),
  ('Podonki Xylinet 20 Strong', 'Коллаб линейка 20 Strong.', 400, 1, 'Podonki', 'https://placehold.co/400x400/00f0ff/white?text=Xylinet'),
  ('Red', 'Жидкость Red.', 400, 1, 'Red', 'https://placehold.co/400x400/dc2626/white?text=Red'),
  ('Skala 20mg', 'Жидкость 20mg.', 400, 1, 'Skala', 'https://placehold.co/400x400/737373/white?text=Skala'),
  ('Skala 20 Strong', 'Жидкость 20 Strong.', 400, 1, 'Skala', 'https://placehold.co/400x400/737373/white?text=Skala+S'),
  ('Slime 10mg', 'Жидкость 10mg.', 450, 1, 'Slime', 'https://placehold.co/400x400/39ff14/white?text=Slime'),
  ('Stalker', 'Жидкость Stalker.', 500, 1, 'Stalker', 'https://placehold.co/400x400/39ff14/white?text=Stalker'),
  ('The Skandalist Hard 20 Strong', 'Жидкость 20 Strong.', 500, 1, 'Skandalist', 'https://placehold.co/400x400/dc2626/white?text=Skandalist'),
  ('Toyz 20mg', 'Жидкость 20mg. Яркие конфетные вкусы.', 400, 1, 'Toyz', 'https://placehold.co/400x400/ff2d95/white?text=Toyz'),
  ('Toyz 20 Strong', 'Жидкость 20 Strong. Яркие конфетные вкусы.', 400, 1, 'Toyz', 'https://placehold.co/400x400/ff2d95/white?text=Toyz+S'),
  ('Trava 20mg', 'Жидкость 20mg. Натуральные травяные ноты.', 400, 1, 'Trava', 'https://placehold.co/400x400/39ff14/white?text=Trava'),
  ('Trava 20 Strong', 'Жидкость 20 Strong. Натуральные травяные ноты.', 400, 1, 'Trava', 'https://placehold.co/400x400/39ff14/white?text=Trava+S'),
  ('Vandal 20mg', 'Жидкость 20mg.', 400, 1, 'Vandal', 'https://placehold.co/400x400/b026ff/white?text=Vandal'),
  ('Vandal 20 Strong', 'Жидкость 20 Strong.', 400, 1, 'Vandal', 'https://placehold.co/400x400/b026ff/white?text=Vandal+S'),
  ('Waka 20 Strong', 'Жидкость 20 Strong. Тропические миксы.', 550, 1, 'Waka', 'https://placehold.co/400x400/ff9500/white?text=Waka'),
  ('Жмых Mono', 'Жидкость Жмых.', 350, 1, 'Жмых', 'https://placehold.co/400x400/ff9500/white?text=Zhmyh'),
  ('Ачёнет', 'Жидкость Ачёнет.', 400, 1, 'Ачёнет', 'https://placehold.co/400x400/ff2d95/white?text=Achonet');

-- =====================
-- POD-СИСТЕМЫ GeekVape (category_id = 2)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Aegis Boost 2', 'Противоударный под второго поколения.', 3800, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+Boost+2'),
  ('Aegis Hero', 'Компактный Aegis для MTL.', 2500, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+Hero'),
  ('Aegis Hero 2', 'Второе поколение Hero.', 2900, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+Hero+2'),
  ('Aegis Hero 5', 'Пятое поколение Hero. Blaze Red / Frost Mint.', 3000, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+Hero+5'),
  ('Aegis Hero Classic', 'Классическая версия. Crystal Blue / Purple.', 2900, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Hero+Classic'),
  ('Aegis Hero Q', 'Версия Q. Blue / Cyan / Rainbow.', 2000, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+Hero+Q'),
  ('Aegis Nano', 'Миниатюрный противоударный под.', 2300, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+Nano'),
  ('Aegis One', 'Базовая модель Aegis.', 1800, 2, 'GeekVape', 'https://placehold.co/400x400/ff4500/white?text=Aegis+One');


-- POD-СИСТЕМЫ Vaporesso
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Vaporesso Apex', 'Флагман. Havy Blue / Pear White / Show Pink / Sky Blue.', 2490, 2, 'Vaporesso', 'https://placehold.co/400x400/00f0ff/white?text=Apex'),
  ('Vaporesso Gen SE 80W', 'Мод 80W. Hot Pink / Storm Blue.', 3500, 2, 'Vaporesso', 'https://placehold.co/400x400/ff2d95/white?text=Gen+SE'),
  ('Vaporesso XROS 2', 'Второе поколение XROS.', 2000, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+2'),
  ('Vaporesso XROS 3', 'Третье поколение XROS.', 2100, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+3'),
  ('Vaporesso XROS 3 Mini', 'Компактная версия XROS 3.', 1500, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+3+Mini'),
  ('Vaporesso XROS 4 Nano', 'Нано версия XROS 4.', 2500, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+4+Nano'),
  ('Vaporesso XROS 5', 'Пятое поколение. 8 цветов.', 2400, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+5'),
  ('Vaporesso XROS 5 Mini', 'Компактная версия XROS 5. 6 цветов.', 1800, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+5+Mini'),
  ('Vaporesso XROS CUBE', 'Кубическая форма XROS.', 1700, 2, 'Vaporesso', 'https://placehold.co/400x400/b026ff/white?text=XROS+CUBE'),
  ('Vaporesso XROS Pro', 'Профессиональная версия. Orange / Sapphire.', 2300, 2, 'Vaporesso', 'https://placehold.co/400x400/ff2d95/white?text=XROS+Pro'),
  ('Vaporesso XROS Pro 2', 'Второе поколение Pro. 6 цветов.', 2700, 2, 'Vaporesso', 'https://placehold.co/400x400/ff2d95/white?text=XROS+Pro+2'),
  ('ECO Nano', 'Эко-версия Vaporesso.', 1500, 2, 'Vaporesso', 'https://placehold.co/400x400/39ff14/white?text=ECO+Nano');

-- POD-СИСТЕМЫ Smoant
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Knight 80', 'Мощный под до 80W.', 3000, 2, 'Smoant', 'https://placehold.co/400x400/ff9500/white?text=Knight+80'),
  ('Pasito Mini', 'Компактный Pasito.', 2300, 2, 'Smoant', 'https://placehold.co/400x400/ff9500/white?text=Pasito+Mini'),
  ('Pasito Pro', 'Профессиональная версия Pasito.', 2800, 2, 'Smoant', 'https://placehold.co/400x400/ff9500/white?text=Pasito+Pro'),
  ('Smoant Pasito 2', 'Второе поколение. 6 цветов.', 2900, 2, 'Smoant', 'https://placehold.co/400x400/ff9500/white?text=Pasito+2');

-- POD-СИСТЕМЫ Voopoo
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Vmate E', 'Компактный Vmate.', 1800, 2, 'Voopoo', 'https://placehold.co/400x400/1a1a2e/white?text=Vmate+E'),
  ('Vmate i2', 'Версия i2.', 1500, 2, 'Voopoo', 'https://placehold.co/400x400/1a1a2e/white?text=Vmate+i2'),
  ('Vmate Pro', 'Профессиональная версия Vmate.', 2200, 2, 'Voopoo', 'https://placehold.co/400x400/1a1a2e/white?text=Vmate+Pro'),
  ('Vthru Pro', 'Профессиональная версия Vthru.', 2300, 2, 'Voopoo', 'https://placehold.co/400x400/1a1a2e/white?text=Vthru+Pro');

-- =====================
-- ОДНОРАЗКИ (category_id = 3)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Dojo 7000', 'Одноразка на 7000 затяжек.', 900, 3, 'Dojo', 'https://placehold.co/400x400/b026ff/white?text=Dojo+7K'),
  ('Dojo 12000', 'Одноразка на 12000 затяжек.', 1200, 3, 'Dojo', 'https://placehold.co/400x400/b026ff/white?text=Dojo+12K'),
  ('Iceberg 1200', 'Компактная одноразка на 1200 затяжек.', 600, 3, 'Iceberg', 'https://placehold.co/400x400/00f0ff/white?text=Iceberg+1.2K'),
  ('Iceberg 8000', 'Одноразка на 8000 затяжек.', 1000, 3, 'Iceberg', 'https://placehold.co/400x400/00f0ff/white?text=Iceberg+8K'),
  ('Lost Mary 16000', 'Одноразка на 16000 затяжек.', 1600, 3, 'Lost Mary', 'https://placehold.co/400x400/ff69b4/white?text=LM+16K'),
  ('Lost Mary Mixer 20000', 'Одноразка с миксером на 20000 затяжек.', 1700, 3, 'Lost Mary', 'https://placehold.co/400x400/ff69b4/white?text=LM+Mixer'),
  ('Lost Mary X-Link 20000', 'Устройство X-Link на 20000 затяжек.', 1700, 3, 'Lost Mary', 'https://placehold.co/400x400/ff69b4/white?text=LM+X-Link'),
  ('Lost Mary X-Link Cart', 'Сменный картридж для X-Link.', 1000, 3, 'Lost Mary', 'https://placehold.co/400x400/ff69b4/white?text=X-Link+Cart'),
  ('Plonq 1500', 'Одноразка на 1500 затяжек.', 850, 3, 'Plonq', 'https://placehold.co/400x400/ff2d95/white?text=Plonq+1.5K'),
  ('Plonq 6000', 'Одноразка на 6000 затяжек.', 1500, 3, 'Plonq', 'https://placehold.co/400x400/ff2d95/white?text=Plonq+6K'),
  ('Wotofo Nexbar 18000', 'Одноразка на 18000 затяжек.', 1500, 3, 'Wotofo', 'https://placehold.co/400x400/39ff14/white?text=Nexbar+18K');


-- =====================
-- КАРТРИДЖИ И ИСПАРИТЕЛИ Vaporesso (category_id = 4)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('XROS Cartridge 2ml 0.6', 'Картридж для XROS 2ml, сопротивление 0.6.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+0.6'),
  ('XROS Cartridge 2ml 0.8', 'Картридж для XROS 2ml, сопротивление 0.8.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+0.8'),
  ('XROS Cartridge 2ml 1.0', 'Картридж для XROS 2ml, сопротивление 1.0.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+1.0'),
  ('XROS Cartridge 2ml 1.2', 'Картридж для XROS 2ml, сопротивление 1.2.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+1.2'),
  ('XROS Cartridge 3ml 0.4', 'Картридж для XROS 3ml, сопротивление 0.4.', 270, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+3ml+0.4'),
  ('XROS Cartridge 3ml 0.6', 'Картридж для XROS 3ml, сопротивление 0.6.', 270, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+3ml+0.6'),
  ('XROS Cartridge 3ml 0.8', 'Картридж для XROS 3ml, сопротивление 0.8.', 270, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=XROS+3ml+0.8'),
  ('Apex Cartridge 5ml 0.8', 'Картридж для Apex 5ml.', 340, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=Apex+Cart'),
  ('GTX Coil 0.15', 'Испаритель GTX 0.15.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/404040/white?text=GTX+0.15'),
  ('GTX Coil 0.2', 'Испаритель GTX 0.2.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/404040/white?text=GTX+0.2'),
  ('GTX Coil 0.3', 'Испаритель GTX 0.3.', 250, 4, 'Vaporesso', 'https://placehold.co/400x400/404040/white?text=GTX+0.3'),
  ('Luxe Q/QS Cartridge', 'Картридж для Luxe Q/QS.', 300, 4, 'Vaporesso', 'https://placehold.co/400x400/737373/white?text=Luxe+Q');

-- КАРТРИДЖИ GeekVape
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Aegis Hero 2 Tank', 'Картридж-бак для Aegis Hero 2.', 600, 4, 'GeekVape', 'https://placehold.co/400x400/525252/white?text=Hero+2+Tank'),
  ('Aegis Hero Q Cartridge 0.6', 'Картридж для Hero Q 0.6.', 280, 4, 'GeekVape', 'https://placehold.co/400x400/525252/white?text=Hero+Q+0.6'),
  ('Aegis Hero Q Cartridge 0.8', 'Картридж для Hero Q 0.8.', 280, 4, 'GeekVape', 'https://placehold.co/400x400/525252/white?text=Hero+Q+0.8'),
  ('Aegis Nano Cartridge', 'Картридж для Aegis Nano.', 300, 4, 'GeekVape', 'https://placehold.co/400x400/525252/white?text=Nano+Cart'),
  ('Aegis B Coil 0.2', 'Испаритель серии B 0.2.', 250, 4, 'GeekVape', 'https://placehold.co/400x400/404040/white?text=B+0.2'),
  ('Aegis B Coil 0.3', 'Испаритель серии B 0.3.', 250, 4, 'GeekVape', 'https://placehold.co/400x400/404040/white?text=B+0.3'),
  ('Aegis B Coil 0.4', 'Испаритель серии B 0.4.', 250, 4, 'GeekVape', 'https://placehold.co/400x400/404040/white?text=B+0.4'),
  ('Aegis B Coil 0.6', 'Испаритель серии B 0.6.', 250, 4, 'GeekVape', 'https://placehold.co/400x400/404040/white?text=B+0.6'),
  ('Aegis B Coil 1.2', 'Испаритель серии B 1.2.', 250, 4, 'GeekVape', 'https://placehold.co/400x400/404040/white?text=B+1.2');

-- КАРТРИДЖИ Smoant
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Knight 80 Tank', 'Картридж-бак для Knight 80.', 1300, 4, 'Smoant', 'https://placehold.co/400x400/525252/white?text=Knight+Tank'),
  ('RBA Pasito 2 / Knight 80', 'Обслуживаемая база RBA.', 700, 4, 'Smoant', 'https://placehold.co/400x400/525252/white?text=RBA'),
  ('Smoant K-1 Coil 0.3', 'Испаритель серии K-1 0.3.', 250, 4, 'Smoant', 'https://placehold.co/400x400/404040/white?text=K-1'),
  ('Smoant K-2 Coil 0.4', 'Испаритель серии K-2 0.4.', 250, 4, 'Smoant', 'https://placehold.co/400x400/404040/white?text=K-2'),
  ('Smoant K-3 Coil 0.6', 'Испаритель серии K-3 0.6.', 250, 4, 'Smoant', 'https://placehold.co/400x400/404040/white?text=K-3'),
  ('Smoant P-2 Coil 0.6', 'Испаритель серии P-2 0.6.', 200, 4, 'Smoant', 'https://placehold.co/400x400/404040/white?text=P-2');

-- КАРТРИДЖИ прочие
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Jellybox Coil', 'Испаритель для Jellybox.', 250, 4, 'Rincoe', 'https://placehold.co/400x400/404040/white?text=Jellybox'),
  ('Manto AIO Coil', 'Испаритель для Manto AIO.', 250, 4, 'Rincoe', 'https://placehold.co/400x400/404040/white?text=Manto'),
  ('Minifit Cartridge', 'Картридж для Minifit.', 150, 4, 'Justfog', 'https://placehold.co/400x400/737373/white?text=Minifit'),
  ('PnP Coil', 'Универсальный испаритель PnP.', 300, 4, 'Voopoo', 'https://placehold.co/400x400/404040/white?text=PnP'),
  ('Ursa Cartridge 0.8', 'Картридж для Ursa 0.8.', 350, 4, 'Lost Vape', 'https://placehold.co/400x400/737373/white?text=Ursa'),
  ('Vmate Cartridge', 'Картридж для Vmate.', 270, 4, 'Voopoo', 'https://placehold.co/400x400/737373/white?text=Vmate+Cart');

-- =====================
-- СНЮС (category_id = 5)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('Siberia Slim', 'Никотиновые подушечки Siberia Slim.', 450, 5, 'Siberia', 'https://placehold.co/400x400/dc2626/white?text=Siberia'),
  ('Siberia Black Slim', 'Никотиновые подушечки Siberia Black.', 500, 5, 'Siberia', 'https://placehold.co/400x400/1a1a2e/white?text=Siberia+Black'),
  ('Kasta', 'Никотиновые подушечки Kasta.', 400, 5, 'Kasta', 'https://placehold.co/400x400/ff2d95/white?text=Kasta'),
  ('Loop Пластинки', 'Никотиновые пластинки Loop.', 300, 5, 'Loop', 'https://placehold.co/400x400/b026ff/white?text=Loop'),
  ('The Simpsons', 'Никотиновые подушечки Simpsons.', 450, 5, 'Simpsons', 'https://placehold.co/400x400/ffff00/black?text=Simpsons');

-- =====================
-- ТАБАК ДЛЯ КАЛЬЯНА (category_id = 6)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('BlackBurn HIT Tobacco', 'Табак BlackBurn HIT.', 300, 6, 'BlackBurn', 'https://placehold.co/400x400/1a1a2e/white?text=BB+HIT'),
  ('BlackBurn Tobacco', 'Табак BlackBurn классический.', 270, 6, 'BlackBurn', 'https://placehold.co/400x400/1a1a2e/white?text=BlackBurn'),
  ('Darkside Core Tobacco', 'Табак Darkside Core.', 320, 6, 'Darkside', 'https://placehold.co/400x400/b026ff/white?text=DS+Core'),
  ('Darkside Shot Tobacco', 'Табак Darkside Shot.', 320, 6, 'Darkside', 'https://placehold.co/400x400/b026ff/white?text=DS+Shot'),
  ('Overdose Tobacco 25g', 'Табак Overdose 25г.', 320, 6, 'Overdose', 'https://placehold.co/400x400/dc2626/white?text=Overdose'),
  ('Уголь для кальяна', 'Кокосовый уголь для кальяна.', 200, 6, 'Уголь', 'https://placehold.co/400x400/404040/white?text=Coal');

-- =====================
-- АККУМУЛЯТОРЫ (в POD-системы)
-- =====================
INSERT INTO products (name, description, price, category_id, brand, image_url) VALUES
  ('АКБ 18650 25R', 'Аккумулятор 18650 Samsung 25R.', 450, 2, 'Samsung', 'https://placehold.co/400x400/39ff14/white?text=18650+25R');

-- =====================
-- АТРИБУТЫ КРЕПОСТИ ДЛЯ ЖИДКОСТЕЙ
-- =====================
INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'nicotine', '20 мг' FROM products WHERE category_id = 1 AND (name LIKE '%20mg%' OR name LIKE '%20 Strong%');

INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'nicotine', '10 мг' FROM products WHERE category_id = 1 AND name LIKE '%10mg%';

INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'nicotine', '0 мг' FROM products WHERE category_id = 1 AND name LIKE '%0 Strong%';

INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
SELECT id, 'volume', '30 мл' FROM products WHERE category_id = 1;

-- =====================
-- НАЛИЧИЕ НА ТОЧКЕ БАРАМЗИНОЙ (id=2) — демо
-- =====================
INSERT INTO store_inventory (store_id, product_id, quantity)
SELECT 2, id, (ABS(RANDOM()) % 10) + 1 FROM products;

-- =====================
-- ДЕМО-ПОЛЬЗОВАТЕЛЬ
-- =====================
INSERT INTO users (telegram_id, first_name, bonus_points, discount_code) VALUES
  (123456789, 'Демо', 350, '847291');
