-- ============================================
-- 车易拍二手车交易平台 - 数据库表结构 (MySQL 8.0+)
-- ============================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `phone` VARCHAR(20) UNIQUE NOT NULL,
  `password` VARCHAR(255),
  `nickname` VARCHAR(100),
  `avatar` VARCHAR(500) DEFAULT 'https://picsum.photos/seed/default/100/100',
  `credit_score` INT DEFAULT 650,
  `vip_level` VARCHAR(20) DEFAULT 'normal',
  `vip_exp` INT DEFAULT 0,
  `total_deals` INT DEFAULT 0,
  `total_spent` DECIMAL(12,2) DEFAULT 0,
  `is_admin` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `logo` VARCHAR(500),
  `count` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cars`;
CREATE TABLE `cars` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `brand` VARCHAR(50) NOT NULL,
  `model` VARCHAR(50) NOT NULL,
  `year` INT NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `original_price` DECIMAL(12,2),
  `mileage` DECIMAL(8,2) NOT NULL,
  `color` VARCHAR(20),
  `gearbox` VARCHAR(30),
  `displacement` VARCHAR(30),
  `fuel_type` VARCHAR(20),
  `location` VARCHAR(50),
  `images` TEXT,
  `seller_id` VARCHAR(64) NOT NULL,
  `status` VARCHAR(30) DEFAULT 'available',
  `estimated_price_min` DECIMAL(12,2),
  `estimated_price_max` DECIMAL(12,2),
  `market_average` DECIMAL(12,2),
  `same_model_count` INT DEFAULT 0,
  `deal_rate` DECIMAL(5,2) DEFAULT 0,
  `overall_score` INT DEFAULT 85,
  `condition` VARCHAR(20) DEFAULT 'good',
  `tags` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brand` (`brand`),
  INDEX `idx_status` (`status`),
  INDEX `idx_seller` (`seller_id`),
  INDEX `idx_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `car_id` VARCHAR(64) NOT NULL,
  `buyer_id` VARCHAR(64) NOT NULL,
  `seller_id` VARCHAR(64) NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `status` VARCHAR(30) DEFAULT 'pending',
  `buyer_intent` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_buyer` (`buyer_id`),
  INDEX `idx_seller` (`seller_id`),
  INDEX `idx_car` (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `car_id` VARCHAR(64) NOT NULL,
  `buyer_id` VARCHAR(64) NOT NULL,
  `seller_id` VARCHAR(64) NOT NULL,
  `deposit` DECIMAL(12,2) NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `commission` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(30) DEFAULT 'pending',
  `appointment_time` VARCHAR(50),
  `appointment_location` VARCHAR(200),
  `contract_signed` TINYINT DEFAULT 0,
  `transfer_confirmed` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_buyer` (`buyer_id`),
  INDEX `idx_seller` (`seller_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `loans`;
CREATE TABLE `loans` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `car_id` VARCHAR(64),
  `amount` DECIMAL(12,2) NOT NULL,
  `down_payment` DECIMAL(12,2) NOT NULL,
  `periods` INT NOT NULL,
  `monthly_payment` DECIMAL(12,2) NOT NULL,
  `interest_rate` DECIMAL(5,2) DEFAULT 4.5,
  `status` VARCHAR(30) DEFAULT 'pending',
  `next_repay_date` VARCHAR(20),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `insurances`;
CREATE TABLE `insurances` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `car_id` VARCHAR(64),
  `type` VARCHAR(50) NOT NULL,
  `type_name` VARCHAR(100) NOT NULL,
  `premium` DECIMAL(12,2) NOT NULL,
  `coverage` DECIMAL(12,2) NOT NULL,
  `duration` INT DEFAULT 12,
  `status` VARCHAR(30) DEFAULT 'active',
  `effective_date` VARCHAR(20) NOT NULL,
  `expire_date` VARCHAR(20) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `claims`;
CREATE TABLE `claims` (
  `id` VARCHAR(64) PRIMARY KEY,
  `insurance_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `description` TEXT NOT NULL,
  `evidence` TEXT,
  `status` VARCHAR(30) DEFAULT 'pending',
  `review_note` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` DATETIME,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_insurance` (`insurance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `disputes`;
CREATE TABLE `disputes` (
  `id` VARCHAR(64) PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `initiator_id` VARCHAR(64) NOT NULL,
  `respondent_id` VARCHAR(64) NOT NULL,
  `reason` TEXT NOT NULL,
  `evidence` TEXT,
  `status` VARCHAR(30) DEFAULT 'pending',
  `handler` VARCHAR(64),
  `handler_note` TEXT,
  `escalated` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` DATETIME,
  INDEX `idx_status` (`status`),
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `related_id` VARCHAR(64),
  `is_read` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `exp_records`;
CREATE TABLE `exp_records` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `exp` INT NOT NULL,
  `reason` VARCHAR(200) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
