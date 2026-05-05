// src/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const { connectDB } = require('./config/database');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());

//cors
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
//-----
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Trop de requêtes' },
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_, res) => res.json({
  success: true,
  service: process.env.SERVICE_NAME,
  status: 'healthy',
  timestamp: new Date().toISOString(),
}));

app.use('/api/v1', routes);

app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

app.use((err, req, res, next) => {
  console.error('[Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
  });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Collect Service on port ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs\n`);
  });
};

start();