const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const itemsRouter = require('./routes/items');
const itemDetailsRouter = require('./routes/item-details');
const orderSummaryHistoryRouter = require('./routes/order-summary-history');
const usersRouter = require('./routes/users');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());

// Basic rate limiter to mitigate brute force / DoS attempts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS with whitelist (allows undefined origin for tools like curl/postman)
const whitelist = [process.env.CORS_ORIGIN || 'http://localhost:4200'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) return callback(null, true);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  }
}));

// Built-in body parser
app.use(express.json({ limit: '10kb' }));

app.use('/api/items', itemsRouter);
app.use('/api/item-details', itemDetailsRouter);
app.use('/api/order-summary-history', orderSummaryHistoryRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Export the app for programmatic use (tests/smoke runners).
module.exports = app;

// If run directly, start the HTTP server.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Error handler is intentionally required at bottom to catch errors from routes
// (will be added as a separate module)
try {
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (e) {
  // If middleware file is not present yet, ignore; tests may still run.
}
