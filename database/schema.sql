CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400),
  role ENUM('ADMIN','USER','OWNER') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL,
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  rating INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  UNIQUE KEY one_rating_per_user_store (user_id, store_id),
  CHECK (rating BETWEEN 1 AND 5)
);
USE store_rating_db;
SHOW TABLES;

USE store_rating_db;

SELECT id, name, email, role
FROM users;

UPDATE users
SET role = 'ADMIN'
WHERE email = 'Test_user_@gmail.com';

SELECT id, name, email, role
FROM users;

UPDATE users
SET role = 'ADMIN'
WHERE id = 1;

SELECT id, name, email, role
FROM users;

UPDATE users
SET role = 'USER'
WHERE email = 'testuser@gmail.com';
SELECT id, name, email, role
FROM users;

USE store_rating_db;

SELECT id, name, email, role
FROM users;

UPDATE users
SET password = '$2b$10$ZSN9MK5SV3fUoo9uaaxMy.ZVBBs8G.5hXWTITD1zdYKbMSbNFVsFG'
WHERE email = 'owner@gmail.com';

UPDATE users
SET role='USER'
WHERE email='testuser@gmail.com';
-- After creating the tables, create users through the Admin API
-- or register a normal user and promote it manually for local testing:
-- UPDATE users SET role='ADMIN' WHERE email='your-email@example.com';
