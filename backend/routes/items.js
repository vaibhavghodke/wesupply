const express = require('express');
const router = express.Router();
const db = require('../db');

// Create item
router.post('/', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const stmt = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
  stmt.run(name, description || null, function(err) {
    if (err) {
      stmt.finalize();
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, description: description || null });
    stmt.finalize();
  });
});

// Read all
router.get('/', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Read one
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Update
router.put('/:id', (req, res) => {
  const { name, description } = req.body;
  db.run(
    'UPDATE items SET name = ?, description = ? WHERE id = ?',
    [name, description, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ id: req.params.id, name, description });
    }
  );
});

// Delete
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM items WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  });
});

module.exports = router;
