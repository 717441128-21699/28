-- ============================================
-- 车易拍二手车交易平台 - 数据库表结构 (PostgreSQL 15+)
-- ============================================

DROP TABLE IF EXISTS exp_records CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS insurances CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255),
  nickname VARCHAR(100),
  avatar VARCHAR(500) DEFAULT 'https://picsum.photos/seed/default/100/100',
  credit_score INTEGER DEFAULT 650,
  vip_level VARCHAR(20) DEFAULT 'normal',
  vip_exp INTEGER DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  is_admin SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brands (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  logo VARCHAR(500),
  count INTEGER DEFAULT 0
);

CREATE TABLE cars (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  mileage DECIMAL(8,2) NOT NULL,
  color VARCHAR(20),
  gearbox VARCHAR(30),
  displacement VARCHAR(30),
  fuel_type VARCHAR(20),
  location VARCHAR(50),
  images TEXT,
  seller_id VARCHAR(64) NOT NULL,
  status VARCHAR(30) DEFAULT 'available',
  estimated_price_min DECIMAL(12,2),
  estimated_price_max DECIMAL(12,2),
  market_average DECIMAL(12,2),
  same_model_count INTEGER DEFAULT 0,
  deal_rate DECIMAL(5,2) DEFAULT 0,
  overall_score INTEGER DEFAULT 85,
  condition VARCHAR(20) DEFAULT 'good',
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_seller ON cars(seller_id);
CREATE INDEX idx_cars_price ON cars(price);

CREATE TABLE appointments (
  id VARCHAR(64) PRIMARY KEY,
  car_id VARCHAR(64) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL,
  seller_id VARCHAR(64) NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(200) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  buyer_intent SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_appointments_buyer ON appointments(buyer_id);
CREATE INDEX idx_appointments_seller ON appointments(seller_id);
CREATE INDEX idx_appointments_car ON appointments(car_id);

CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  car_id VARCHAR(64) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL,
  seller_id VARCHAR(64) NOT NULL,
  deposit DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  commission DECIMAL(12,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  appointment_time VARCHAR(50),
  appointment_location VARCHAR(200),
  contract_signed SMALLINT DEFAULT 0,
  transfer_confirmed SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE loans (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  car_id VARCHAR(64),
  amount DECIMAL(12,2) NOT NULL,
  down_payment DECIMAL(12,2) NOT NULL,
  periods INTEGER NOT NULL,
  monthly_payment DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 4.5,
  status VARCHAR(30) DEFAULT 'pending',
  next_repay_date VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);

CREATE TABLE insurances (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  car_id VARCHAR(64),
  type VARCHAR(50) NOT NULL,
  type_name VARCHAR(100) NOT NULL,
  premium DECIMAL(12,2) NOT NULL,
  coverage DECIMAL(12,2) NOT NULL,
  duration INTEGER DEFAULT 12,
  status VARCHAR(30) DEFAULT 'active',
  effective_date VARCHAR(20) NOT NULL,
  expire_date VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_insurances_user ON insurances(user_id);

CREATE TABLE claims (
  id VARCHAR(64) PRIMARY KEY,
  insurance_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  review_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);
CREATE INDEX idx_claims_user ON claims(user_id);
CREATE INDEX idx_claims_insurance ON claims(insurance_id);

CREATE TABLE disputes (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  initiator_id VARCHAR(64) NOT NULL,
  respondent_id VARCHAR(64) NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  handler VARCHAR(64),
  handler_note TEXT,
  escalated SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_order ON disputes(order_id);

CREATE TABLE messages (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  related_id VARCHAR(64),
  is_read SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_read ON messages(is_read);

CREATE TABLE exp_records (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  exp INTEGER NOT NULL,
  reason VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_exp_records_user ON exp_records(user_id);
