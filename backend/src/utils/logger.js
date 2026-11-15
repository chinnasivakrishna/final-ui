/**
 * Centralized Application Logger
 * Provides structured logging with levels and sensitive data sanitization
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

const SENSITIVE_KEYS = ['password', 'secret', 'token', 'authorization', 'cookie', 'db_password', 'key'];

function sanitize(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      clean[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  let logStr = `[${timestamp}] [${level}] [web-backend] ${message}`;
  if (meta !== undefined) {
    const cleanMeta = sanitize(meta);
    if (cleanMeta instanceof Error) {
      logStr += `\n${cleanMeta.stack || cleanMeta.message}`;
    } else if (typeof cleanMeta === 'object') {
      try {
        logStr += ` ${JSON.stringify(cleanMeta)}`;
      } catch {
        logStr += ` [Circular]`;
      }
    } else {
      logStr += ` ${cleanMeta}`;
    }
  }
  return logStr;
}

const logger = {
  debug(message, meta) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatMessage('DEBUG', message, meta));
    }
  },
  info(message, meta) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(formatMessage('INFO', message, meta));
    }
  },
  warn(message, meta) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },
  error(message, meta) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },
};

module.exports = logger;

