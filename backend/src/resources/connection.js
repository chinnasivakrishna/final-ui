const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  namedPlaceholders: true,
  enableKeepAlive: config.db.enableKeepAlive,
  keepAliveInitialDelay: config.db.keepAliveInitialDelay,
});

pool.on('connection', (connection) => {
  connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_general_ci', (err) => {
    if (err) {
      logger.warn('Failed to set UTF8MB4 charset on connection:', err.message);
    }
  });
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error:', err);
});

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as connected');
    return Boolean(rows && rows[0]?.connected === 1);
  } catch (err) {
    logger.error('Database connection test failed:', err.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
