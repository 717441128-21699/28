const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
const dbPath = path.join(__dirname, 'data.sqlite');

function createStatementWrapper(stmt) {
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
      if (db && db._save) db._save();
      return { changes: db && db.getRowsModified ? db.getRowsModified() : 1 };
    }
  };
}

async function initDB() {
  const SQL = await initSqlJs();

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
  db.prepare = function (sql) {
    const stmt = originalPrepare(sql);
    return createStatementWrapper(stmt);
  };

  const originalExec = db.exec.bind(db);
  db.exec = function (sql) {
    originalExec(sql);
    if (db._save) db._save();
  };

  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      password TEXT,
      nickname TEXT,
      avatar TEXT DEFAULT 'https://picsum.photos/seed/default/100/100',
      credit_score INTEGER DEFAULT 650,
      vip_level TEXT DEFAULT 'normal',
      vip_exp INTEGER DEFAULT 0,
      total_deals INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      mileage REAL NOT NULL,
      color TEXT,
      gearbox TEXT,
      displacement TEXT,
      fuel_type TEXT,
      location TEXT,
      images TEXT,
      seller_id TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      estimated_price_min REAL,
      estimated_price_max REAL,
      market_average REAL,
      same_model_count INTEGER DEFAULT 0,
      deal_rate REAL DEFAULT 0,
      overall_score INTEGER DEFAULT 85,
      condition TEXT DEFAULT 'good',
      tags TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      car_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      buyer_intent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      car_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      deposit REAL NOT NULL,
      total_price REAL NOT NULL,
      commission REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      appointment_time TEXT,
      appointment_location TEXT,
      contract_signed INTEGER DEFAULT 0,
      transfer_confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      car_id TEXT,
      amount REAL NOT NULL,
      down_payment REAL NOT NULL,
      periods INTEGER NOT NULL,
      monthly_payment REAL NOT NULL,
      interest_rate REAL DEFAULT 4.5,
      status TEXT DEFAULT 'pending',
      next_repay_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS insurances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      car_id TEXT,
      type TEXT NOT NULL,
      type_name TEXT NOT NULL,
      premium REAL NOT NULL,
      coverage REAL NOT NULL,
      duration INTEGER DEFAULT 12,
      status TEXT DEFAULT 'active',
      effective_date TEXT NOT NULL,
      expire_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      insurance_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT,
      status TEXT DEFAULT 'pending',
      review_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      initiator_id TEXT NOT NULL,
      respondent_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      evidence TEXT,
      status TEXT DEFAULT 'pending',
      handler TEXT,
      handler_note TEXT,
      escalated INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      related_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS exp_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exp INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      count INTEGER DEFAULT 0
    );
  `;

  db.exec(createTablesSQL);
  console.log('✅ 数据库表初始化完成');
}

module.exports = { initDB, getDB: () => db };
