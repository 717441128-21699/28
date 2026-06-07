const express = require('express');
const cors = require('cors');
const { initDB, getDB } = require('./database');

(async function startServer() {
  await initDB();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (req, res) => {
    res.json({ code: 0, message: '车易拍后端服务运行中', data: { time: new Date().toISOString() } });
  });

  app.use('/api/users', require('./routes/users'));
  app.use('/api/cars', require('./routes/cars'));
  app.use('/api/transactions', require('./routes/transactions'));
  app.use('/api/finance', require('./routes/finance'));
  app.use('/api/disputes', require('./routes/disputes'));
  app.use('/api/admin', require('./routes/admin'));

  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误', error: err.message });
  });

  app.listen(PORT, () => {
    console.log(`\n🚗 车易拍后端服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔗 API前缀: http://localhost:${PORT}/api`);
    console.log(`💡 健康检查: http://localhost:${PORT}/api/health\n`);
  });
})();

module.exports = { getDB };
