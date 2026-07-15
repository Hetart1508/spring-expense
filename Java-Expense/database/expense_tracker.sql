-- ====================================================================
-- DATABASE SEED AND SCHEMA SCRIPT FOR JAVA-EXPENSE APPS
-- Target Relational Engine: MySQL 8.x / MariaDB
-- ====================================================================

-- 1. Create isolation catalog space
CREATE DATABASE IF NOT EXISTS `expense_tracker` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `expense_tracker`;

-- 2. Clean teardown sequence to prevent primary key foreign constraints collision on execution resets
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- ====================================================================
-- TABLE STRUCTURE: users
-- ====================================================================
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE STRUCTURE: categories
-- ====================================================================
CREATE TABLE `categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `type` VARCHAR(20) NOT NULL, -- INCOME vs EXPENSE
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_category_type` CHECK (`type` IN ('INCOME', 'EXPENSE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE STRUCTURE: transactions
-- ====================================================================
CREATE TABLE `transactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `type` VARCHAR(20) NOT NULL, -- INCOME vs EXPENSE
  `category_id` BIGINT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `description` TEXT NULL,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT 'CASH', -- CASH, UPI, CARD, BANK_TRANSFER, OTHER
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_transaction_user` (`user_id`),
  INDEX `idx_transaction_date` (`transaction_date`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_transaction_type` CHECK (`type` IN ('INCOME', 'EXPENSE')),
  CONSTRAINT `chk_transaction_amount` CHECK (`amount` > 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- CORE INITIAL SEED DATA: Predefined Categories
-- ====================================================================
-- Users cannot create, modify, or delete category metadata directly from the frontend.
-- These must be pre-loaded inside the schema to guarantee standard ledger classifications.
INSERT INTO `categories` (`id`, `name`, `type`) VALUES
(1, 'Salary', 'INCOME'),
(2, 'Freelance', 'INCOME'),
(3, 'Investments', 'INCOME'),
(4, 'Gifts Received', 'INCOME'),
(5, 'Other Income', 'INCOME'),
(6, 'Food & Groceries', 'EXPENSE'),
(7, 'Rent & Housing', 'EXPENSE'),
(8, 'Utilities', 'EXPENSE'),
(9, 'Transportation & Fuel', 'EXPENSE'),
(10, 'Entertainment', 'EXPENSE'),
(11, 'Healthcare & Medical', 'EXPENSE'),
(12, 'Education', 'EXPENSE'),
(13, 'Shopping', 'EXPENSE'),
(14, 'Travel & Dining', 'EXPENSE'),
(15, 'Other Expense', 'EXPENSE');

-- ====================================================================
-- OPTIONAL: Seed Demo Users and Sample Records for Testing
-- ====================================================================
-- Default password: "password123" (Pre-hashed via BCrypt)
INSERT INTO `users` (`id`, `name`, `password`, `role`) VALUES
(1, 'hetarth_student', '$2a$10$tZ2pBv6I3xN6gPFrKk0pS.k1D.2kQ7B6KqshYxR3N.pM7E8O9XFHe', 'USER');

INSERT INTO `transactions` (`id`, `name`, `amount`, `type`, `category_id`, `transaction_date`, `description`, `payment_method`, `user_id`) VALUES
(1, 'Monthly Job Salary Credit', 5000.00, 'INCOME', 1, '2026-07-01', 'Direct deposit from main job', 'BANK_TRANSFER', 1),
(2, 'Apartment Lease Rental Payment', 1200.00, 'EXPENSE', 7, '2026-07-02', 'Rent payment for July', 'BANK_TRANSFER', 1),
(3, 'Supermarket Groceries Refill', 154.30, 'EXPENSE', 6, '2026-07-03', 'Organic fruits, milk, vegetables, chicken', 'CARD', 1),
(4, 'Freelance Dashboard Design Contract', 850.00, 'INCOME', 2, '2026-07-05', 'Milestone 1 design deliverable payment', 'UPI', 1),
(5, 'Electricity & Power Bill', 85.20, 'EXPENSE', 8, '2026-07-06', 'AC utility payment for summer high usage', 'UPI', 1),
(6, 'Weekend Dining and Movie', 65.00, 'EXPENSE', 10, '2026-07-10', 'Dinner at Italian cafe and movie tickets', 'CASH', 1),
(7, 'Gas Station Refill', 45.00, 'EXPENSE', 9, '2026-07-11', 'Sedan car fuel tank top up', 'CARD', 1);
