const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const itemsRouter = require('./routes/items');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/items', itemsRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Export the app for programmatic use (tests/smoke runners).
module.exports = app;

// If run directly, start the HTTP server.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
