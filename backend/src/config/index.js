const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env strictly with override
dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

/**
 * Validate required environment configuration
 */
function validateConfig(config) {
  const missing = [];
  if (!config.db.host) missing.push('DB_HOST');
  if (!config.db.user) missing.push('DB_USER');
  if (!config.db.password) missing.push('DB_PASSWORD');
  if (!config.db.name) missing.push('DB_NAME');

  if (missing.length > 0) {
    const errorMsg = `[Config] Missing required environment variables: ${missing.join(', ')}`;
    if (config.env === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn(`\x1b[33m${errorMsg}\x1b[0m`);
    }
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: parseInt(process.env.PORT, 10) || 8789,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  db: {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || '',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },
  uploads: {
    sharedDir: process.env.SHARED_UPLOADS_DIR || path.join(__dirname, '../../../backend/public/uploads'),
    localDir: process.env.LOCAL_UPLOADS_DIR || path.join(__dirname, '../../public/uploads'),
    maxBodySize: process.env.MAX_BODY_SIZE || '10mb',
  },
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    jwtSecret: process.env.JWT_SECRET || 'taiton_auth_jwt_secret_2026_prod_token_sec',
  },
};

validateConfig(config);

module.exports = Object.freeze(config);

