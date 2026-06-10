
-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS accessories_store;
USE accessories_store;

-- إنشاء جدول المجلدات
CREATE TABLE IF NOT EXISTS folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    folder_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- إدخال بيانات المجلدات
INSERT INTO folders (name) VALUES
('الاكسسوارات'),
('المكياج'),
('الساعات'),
('الحقائب'),
('المجوهرات');

-- إدخال بيانات المنتجات
INSERT INTO products (name, price, image, folder_id) VALUES
('قلادة فاخرة', 500.00, 'ak/montaj/1.png', 1),
('حلق ماسي', 300.00, 'ak/montaj/3.jpg', 1),
('أحمر شفاه', 50.00, 'mk/montaj/1.png', 2),
('ساعة ذهبية', 1500.00, 'sa/montaj/1.jpg', 3),
('حقيبة جلدية', 1200.00, 'kh/kh.jpg', 4),
('خاتم ألماسي', 2500.00, 'mg/mg.jpeg', 5);
