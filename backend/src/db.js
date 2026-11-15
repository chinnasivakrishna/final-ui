// Re-export pool from the layered connection resource
const { pool, testConnection } = require('./resources/connection');

module.exports = {
  pool,
  testConnection,
};
