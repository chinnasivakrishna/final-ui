const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const { testConnection, pool } = require('./src/resources/connection');
const apiRoutes = require('./src/main/routes/api.routes');
const customerRoutes = require('./src/main/routes/customer.routes');

const app = express();

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// CORS Configuration
const corsOptions = {
  origin: config.cors.origin === '*' ? '*' : config.cors.origin.split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-org-code'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: config.uploads.maxBodySize }));
app.use(express.urlencoded({ extended: true, limit: config.uploads.maxBodySize }));

// Serve static uploads (checking shared backend directory and local directory)
if (fs.existsSync(config.uploads.sharedDir)) {
  app.use('/uploads', express.static(config.uploads.sharedDir));
}
if (fs.existsSync(config.uploads.localDir)) {
  app.use('/uploads', express.static(config.uploads.localDir));
}

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health Check Routes
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  const statusCode = dbConnected ? 200 : 503;
  res.status(statusCode).json({
    status: dbConnected ? 'online' : 'degraded',
    service: 'web-backend',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/db', async (req, res) => {
  const dbConnected = await testConnection();
  if (dbConnected) {
    return res.status(200).json({
      success: true,
      status: 'connected',
      service: 'web-backend',
      timestamp: new Date().toISOString(),
    });
  }
  return res.status(503).json({
    success: false,
    status: 'disconnected',
    service: 'web-backend',
    message: 'Could not establish connection to database server',
    timestamp: new Date().toISOString(),
  });
});

// Primary Web Backend API Routes mounted strictly under /api
app.use('/api', customerRoutes);
app.use('/api', apiRoutes);

// Static frontend serving for single-domain deployment (Hostinger / cPanel)
const frontendCandidates = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../web-ui/dist'),
];

const clientDist = frontendCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html')));

if (clientDist) {
  logger.info(`Serving static frontend build from: ${clientDist}`);
  app.use(express.static(clientDist));

  // SPA fallback: any non-API, non-uploads, non-health GET request serves index.html
  app.get('*', (req, res, next) => {
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/uploads') ||
      req.originalUrl.startsWith('/health')
    ) {
      return next();
    }
    // Do not send HTML for missing static assets (images, fonts, scripts, stylesheets)
    if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|map|woff2?|ttf|eot|pdf)$/i.test(req.path)) {
      return res.status(404).end();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Fallback 404 handler for API routes or unhandled requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, _next) => {
  logger.error('Unhandled server error:', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });

  if (res.headersSent) {
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    message: config.isProduction ? 'Internal Server Error' : (err.message || 'An unexpected error occurred'),
  });
});

let server = null;
if (require.main === module) {
  server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} (${config.env})`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}, initiating graceful shutdown...`);
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await pool.end();
          logger.info('Database pool closed.');
        } catch (dbErr) {
          logger.error('Error closing database pool:', dbErr.message);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
