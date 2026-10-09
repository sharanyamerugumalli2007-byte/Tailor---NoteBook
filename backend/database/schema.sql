-- Tailor Notebook MySQL 8 Database Schema

CREATE DATABASE IF NOT EXISTS tailor_notebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tailor_notebook;

-- Users table (Admins, Staff, and Registered Customers)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'customer') DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Customers table (Customer details linked optionally to users)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  gender ENUM('female', 'male', 'other') DEFAULT 'female',
  notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customers_user (user_id),
  INDEX idx_customers_phone (phone),
  INDEX idx_customers_email (email)
) ENGINE=InnoDB;

-- Services Catalog
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'stitching',
  short_description VARCHAR(255),
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estimated_days INT NOT NULL DEFAULT 5,
  image_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_services_active (is_active)
) ENGINE=InnoDB;

-- Measurements Profiles
CREATE TABLE IF NOT EXISTS measurements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  user_id INT NULL,
  title VARCHAR(100) DEFAULT 'Standard Profile',
  garment_type VARCHAR(50) DEFAULT 'general',
  unit ENUM('in', 'cm') DEFAULT 'in' NOT NULL,
  bust DECIMAL(6,2) NULL,
  waist DECIMAL(6,2) NULL,
  hip DECIMAL(6,2) NULL,
  shoulder DECIMAL(6,2) NULL,
  sleeve_length DECIMAL(6,2) NULL,
  armhole DECIMAL(6,2) NULL,
  shirt_length DECIMAL(6,2) NULL,
  pant_length DECIMAL(6,2) NULL,
  neck DECIMAL(6,2) NULL,
  inseam DECIMAL(6,2) NULL,
  outseam DECIMAL(6,2) NULL,
  thigh DECIMAL(6,2) NULL,
  knee DECIMAL(6,2) NULL,
  other_measurements TEXT,
  notes TEXT,
  is_current TINYINT(1) DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_measurements_customer (customer_id),
  INDEX idx_measurements_user (user_id)
) ENGINE=InnoDB;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  user_id INT NULL,
  service_id INT NULL,
  measurement_id INT NULL,
  garment_type VARCHAR(100) NOT NULL,
  fabric_source ENUM('customer_provided', 'tailor_provided') DEFAULT 'customer_provided',
  fabric_type VARCHAR(100),
  color VARCHAR(50),
  sleeve_style VARCHAR(100),
  neck_design VARCHAR(100),
  length_spec VARCHAR(50),
  fit_preference ENUM('Regular Fit', 'Relaxed Fit', 'Custom Fit', 'Slim Fit') DEFAULT 'Custom Fit',
  customization_notes TEXT,
  reference_image VARCHAR(500),
  measurement_snapshot JSON NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  customization_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  advance_required DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  advance_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  remaining_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED') DEFAULT 'PENDING' NOT NULL,
  status ENUM('ORDER_PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CORRECTION_REQUIRED', 'CANCELLED', 'REJECTED') DEFAULT 'ORDER_PLACED' NOT NULL,
  delivery_address TEXT,
  delivery_city VARCHAR(100),
  delivery_state VARCHAR(100),
  delivery_postal_code VARCHAR(20),
  delivery_notes TEXT,
  preferred_delivery_date DATE NULL,
  expected_delivery_date DATE NULL,
  tracking_number VARCHAR(100) NULL,
  carrier VARCHAR(100) NULL,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE SET NULL,
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_number (order_number),
  INDEX idx_orders_status (status),
  INDEX idx_orders_payment_status (payment_status)
) ENGINE=InnoDB;

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_type VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  changed_by VARCHAR(100) DEFAULT 'System',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_status_history_order (order_id, changed_at)
) ENGINE=InnoDB;

-- Tracking Updates / Shipment Events
CREATE TABLE IF NOT EXISTS tracking_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(150),
  description TEXT NOT NULL,
  carrier VARCHAR(100),
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_tracking_order (order_id)
) ENGINE=InnoDB;

-- Payments Table (UPI Advance & Final Payments)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  customer_id INT NOT NULL,
  user_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'UPI' NOT NULL,
  transaction_reference VARCHAR(150),
  payment_proof VARCHAR(500),
  status ENUM('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED') DEFAULT 'SUBMITTED' NOT NULL,
  reviewed_by INT NULL,
  reviewer_name VARCHAR(120),
  review_notes TEXT,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_payments_order (order_id),
  INDEX idx_payments_customer (customer_id),
  INDEX idx_payments_status (status)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'ORDER', 'PAYMENT', 'SHIPPING', 'SYSTEM') DEFAULT 'INFO' NOT NULL,
  link VARCHAR(255) NULL,
  is_read TINYINT(1) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB;

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('NEW', 'READ', 'REPLIED') DEFAULT 'NEW' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_contact_status (status)
) ENGINE=InnoDB;

-- System Settings
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB;
