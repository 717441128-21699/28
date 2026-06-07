require('dotenv').config();
const fs = require('fs');
const path = require('path');

let db = null;
let pool = null;

function createStatementWrapper(sql) {
  return {
    async get(...params) {
      const [rows] = await pool.execute(sql, params);
      return rows.length > 0 ? rows[0] : undefined;
    },
    async all(...params) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    async run(...params) {
      const [result] = await pool.execute(sql, params);
      return {
        changes: result.affectedRows || 0,
        insertId: result.insertId || null,
      };
    },
  };
}

async function initSQLiteFallback() {
  console.log('⚠️  MySQL 连接失败，启动 SQLite 兼容模式（仅用于开发）');
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'data.sqlite');

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  function save() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
  db._save = save;

  const originalPrepare = db.prepare.bind(db);
  db.prepare = function (stmtSql) {
    const stmt = originalPrepare(stmtSql);
    return {
      get(...params) {
        if (params.length > 0) stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.reset();
          return row;
        }
        stmt.reset();
        return undefined;
      },
      all(...params) {
        const rows = [];
        if (params.length > 0) stmt.bind(params);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.reset();
        return rows;
      },
      run(...params) {
        if (params.length > 0) stmt.bind(params);
        stmt.step();
        stmt.reset();
        if (db._save) db._save();
        return { changes: db.getRowsModified ? db.getRowsModified() : 1 };
      },
    };
  };

  const originalExec = db.exec.bind(db);
  db.exec = function (execSql) {
    originalExec(execSql);
    if (db._save) db._save();
  };

  db.isSQLite = true;
  db.isMySQL = false;

  await createSQLiteTables();
  console.log('✅ SQLite 兼容模式初始化完成（data.sqlite）');
  return db;
}

async function createSQLiteTables() {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, phone TEXT UNIQUE NOT NULL, password TEXT, nickname TEXT,
      avatar TEXT DEFAULT 'https://picsum.photos/seed/default/100/100',
      credit_score INTEGER DEFAULT 650, vip_level TEXT DEFAULT 'normal',
      vip_exp INTEGER DEFAULT 0, total_deals INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0, is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, brand TEXT NOT NULL, model TEXT NOT NULL,
      year INTEGER NOT NULL, price REAL NOT NULL, original_price REAL, mileage REAL NOT NULL,
      color TEXT, gearbox TEXT, displacement TEXT, fuel_type TEXT, location TEXT,
      images TEXT, seller_id TEXT NOT NULL, status TEXT DEFAULT 'available',
      estimated_price_min REAL, estimated_price_max REAL, market_average REAL,
      same_model_count INTEGER DEFAULT 0, deal_rate REAL DEFAULT 0,
      overall_score INTEGER DEFAULT 85, condition TEXT DEFAULT 'good', tags TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY, car_id TEXT NOT NULL, buyer_id TEXT NOT NULL, seller_id TEXT NOT NULL,
      time TEXT NOT NULL, location TEXT NOT NULL, status TEXT DEFAULT 'pending',
      buyer_intent INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, car_id TEXT NOT NULL, buyer_id TEXT NOT NULL, seller_id TEXT NOT NULL,
      deposit REAL NOT NULL, total_price REAL NOT NULL, commission REAL NOT NULL,
      status TEXT DEFAULT 'pending', appointment_time TEXT, appointment_location TEXT,
      contract_signed INTEGER DEFAULT 0, transfer_confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, car_id TEXT, amount REAL NOT NULL,
      down_payment REAL NOT NULL, periods INTEGER NOT NULL, monthly_payment REAL NOT NULL,
      interest_rate REAL DEFAULT 4.5, status TEXT DEFAULT 'pending',
      next_repay_date TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS insurances (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, car_id TEXT, type TEXT NOT NULL,
      type_name TEXT NOT NULL, premium REAL NOT NULL, coverage REAL NOT NULL,
      duration INTEGER DEFAULT 12, status TEXT DEFAULT 'active',
      effective_date TEXT NOT NULL, expire_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY, insurance_id TEXT NOT NULL, user_id TEXT NOT NULL,
      amount REAL NOT NULL, description TEXT NOT NULL, evidence TEXT,
      status TEXT DEFAULT 'pending', review_note TEXT,
      created_at TEXT DEFAULT (datetime('now')), reviewed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, initiator_id TEXT NOT NULL,
      respondent_id TEXT NOT NULL, reason TEXT NOT NULL, evidence TEXT,
      status TEXT DEFAULT 'pending', handler TEXT, handler_note TEXT,
      escalated INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), resolved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL,
      title TEXT NOT NULL, content TEXT NOT NULL, related_id TEXT,
      is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS exp_records (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, exp INTEGER NOT NULL,
      reason TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, count INTEGER DEFAULT 0
    );
  `;
  db.exec(createTablesSQL);
}

async function initMySQL() {
  const mysql = require('mysql2/promise');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  };

  let tempConn = null;
  try {
    tempConn = await mysql.createConnection(config);
    const dbName = process.env.DB_NAME || 'cheyipai';
    await tempConn.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await tempConn.end();
  } catch (err) {
    if (tempConn) { try { await tempConn.end(); } catch (e) {} }
    console.warn('⚠️  无法连接到 MySQL:', err.message);
    if (process.env.USE_SQLITE_FALLBACK === 'true') {
      return initSQLiteFallback();
    }
    throw err;
  }

  pool = mysql.createPool({
    ...config,
    database: process.env.DB_NAME || 'cheyipai',
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
    isMySQL: true,
    isSQLite: false,
    pool,
  };

  await createMySQLTables();
  console.log(`✅ MySQL 数据库初始化完成（${process.env.DB_NAME || 'cheyipai'}）`);
  return db;
}

async function createMySQLTables() {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255),
      nickname VARCHAR(100),
      avatar VARCHAR(500) DEFAULT 'https://picsum.photos/seed/default/100/100',
      credit_score INT DEFAULT 650,
      vip_level VARCHAR(20) DEFAULT 'normal',
      vip_exp INT DEFAULT 0,
      total_deals INT DEFAULT 0,
      total_spent DECIMAL(12,2) DEFAULT 0,
      is_admin TINYINT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS cars (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      brand VARCHAR(50) NOT NULL,
      model VARCHAR(50) NOT NULL,
      year INT NOT NULL,
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
      same_model_count INT DEFAULT 0,
      deal_rate DECIMAL(5,2) DEFAULT 0,
      overall_score INT DEFAULT 85,
      \`condition\` VARCHAR(20) DEFAULT 'good',
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_brand (brand),
      INDEX idx_status (status),
      INDEX idx_seller (seller_id),
      INDEX idx_price (price)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(64) PRIMARY KEY,
      car_id VARCHAR(64) NOT NULL,
      buyer_id VARCHAR(64) NOT NULL,
      seller_id VARCHAR(64) NOT NULL,
      time VARCHAR(50) NOT NULL,
      location VARCHAR(200) NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      buyer_intent TINYINT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_buyer (buyer_id),
      INDEX idx_seller (seller_id),
      INDEX idx_car (car_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
      contract_signed TINYINT DEFAULT 0,
      transfer_confirmed TINYINT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_buyer (buyer_id),
      INDEX idx_seller (seller_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS loans (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      car_id VARCHAR(64),
      amount DECIMAL(12,2) NOT NULL,
      down_payment DECIMAL(12,2) NOT NULL,
      periods INT NOT NULL,
      monthly_payment DECIMAL(12,2) NOT NULL,
      interest_rate DECIMAL(5,2) DEFAULT 4.5,
      status VARCHAR(30) DEFAULT 'pending',
      next_repay_date VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS insurances (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      car_id VARCHAR(64),
      type VARCHAR(50) NOT NULL,
      type_name VARCHAR(100) NOT NULL,
      premium DECIMAL(12,2) NOT NULL,
      coverage DECIMAL(12,2) NOT NULL,
      duration INT DEFAULT 12,
      status VARCHAR(30) DEFAULT 'active',
      effective_date VARCHAR(20) NOT NULL,
      expire_date VARCHAR(20) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS claims (
      id VARCHAR(64) PRIMARY KEY,
      insurance_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT,
      status VARCHAR(30) DEFAULT 'pending',
      review_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      INDEX idx_user (user_id),
      INDEX idx_insurance (insurance_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
      escalated TINYINT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      INDEX idx_status (status),
      INDEX idx_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      type VARCHAR(30) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      related_id VARCHAR(64),
      is_read TINYINT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_read (is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS exp_records (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      exp INT NOT NULL,
      reason VARCHAR(200) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS brands (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      logo VARCHAR(500),
      count INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await db.exec(createTablesSQL);
}

async function initDB() {
  return initMySQL();
}

module.exports = { initDB, getDB: () => db };
