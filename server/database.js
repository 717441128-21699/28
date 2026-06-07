require('dotenv').config();
const { Pool } = require('pg');

let db = null;
let pool = null;

function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function createStatementWrapper(sql) {
  const pgSql = convertPlaceholders(sql);
  return {
    async get(...params) {
      const res = await pool.query(pgSql, params);
      return res.rows.length > 0 ? res.rows[0] : undefined;
    },
    async all(...params) {
      const res = await pool.query(pgSql, params);
      return res.rows;
    },
    async run(...params) {
      const returningSql = /^INSERT\s/i.test(sql.trim()) && !/RETURNING\s/i.test(sql)
        ? `${pgSql} RETURNING id`
        : pgSql;
      const res = await pool.query(returningSql, params);
      const insertId = res.rows && res.rows[0] ? res.rows[0].id : null;
      return {
        changes: res.rowCount || 0,
        insertId,
      };
    },
  };
}

async function initPostgres() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'cheyipai123',
    database: 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  const dbName = process.env.DB_NAME || 'cheyipai';

  let tempPool = null;
  try {
    tempPool = new Pool(config);
    await tempPool.query('SELECT 1');
    console.log(`✅ 连接 PostgreSQL 成功（${config.host}:${config.port}）`);

    const check = await tempPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (check.rows.length === 0) {
      await tempPool.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`);
      console.log(`✅ 创建数据库 ${dbName}`);
    }
    await tempPool.end();
  } catch (err) {
    if (tempPool) { try { await tempPool.end(); } catch (e) {} }
    console.error('❌ 无法连接到 PostgreSQL 数据库，启动失败：');
    console.error('   Host:', config.host, 'Port:', config.port, 'User:', config.user);
    console.error('   错误详情:', err.message);
    console.error('');
    console.error('💡 请检查：');
    console.error('   1. PostgreSQL 是否已启动？运行：net start postgresql-x64-16');
    console.error('   2. 连接配置是否正确？查看 server/.env');
    console.error('   3. 数据库用户密码是否正确？默认密码 cheyipai123');
    console.error('');
    process.exit(1);
  }

  pool = new Pool({
    ...config,
    database: dbName,
  });

  db = {
    prepare(sql) {
      return createStatementWrapper(sql);
    },
    async exec(sql) {
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await pool.query(stmt);
      }
    },
    isPostgres: true,
    isMySQL: false,
    isSQLite: false,
    pool,
  };

  await createTables();
  console.log(`✅ PostgreSQL 数据库 ${dbName} 初始化完成，表结构就绪`);
  return db;
}

async function createTables() {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
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

    CREATE TABLE IF NOT EXISTS cars (
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
    CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
    CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
    CREATE INDEX IF NOT EXISTS idx_cars_seller ON cars(seller_id);
    CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);

    CREATE TABLE IF NOT EXISTS appointments (
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
    CREATE INDEX IF NOT EXISTS idx_appointments_buyer ON appointments(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_seller ON appointments(seller_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_car ON appointments(car_id);

    CREATE TABLE IF NOT EXISTS orders (
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
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    CREATE TABLE IF NOT EXISTS loans (
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
    CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

    CREATE TABLE IF NOT EXISTS insurances (
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
    CREATE INDEX IF NOT EXISTS idx_insurances_user ON insurances(user_id);

    CREATE TABLE IF NOT EXISTS claims (
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
    CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(user_id);
    CREATE INDEX IF NOT EXISTS idx_claims_insurance ON claims(insurance_id);

    CREATE TABLE IF NOT EXISTS disputes (
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
    CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
    CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);

    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      type VARCHAR(30) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      related_id VARCHAR(64),
      is_read SMALLINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

    CREATE TABLE IF NOT EXISTS exp_records (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      exp INTEGER NOT NULL,
      reason VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_exp_records_user ON exp_records(user_id);

    CREATE TABLE IF NOT EXISTS brands (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      logo VARCHAR(500),
      count INTEGER DEFAULT 0
    );
  `;
  await db.exec(createTablesSQL);
}

async function initDB() {
  return initPostgres();
}

module.exports = { initDB, getDB: () => db };
