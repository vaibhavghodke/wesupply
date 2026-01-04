const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all item details
router.get('/', (req, res) => {
  const { item_id, item_name, type, company, order_type } = req.query;
  
  let query = 'SELECT * FROM item_details WHERE 1=1';
  const params = [];

  if (item_id) {
    query += ' AND item_id = ?';
    params.push(item_id);
  }
  if (item_name) {
    query += ' AND item_name = ?';
    params.push(item_name);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (company) {
    query += ' AND company = ?';
    params.push(company);
  }
  if (order_type) {
    query += ' AND order_type = ?';
    params.push(order_type);
  }

  query += ' ORDER BY item_name, type, company, order_type';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get item details by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM item_details WHERE item_detail_id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Get item details by item name
router.get('/item/:itemName', (req, res) => {
  db.all('SELECT * FROM item_details WHERE item_name = ? ORDER BY type, company, order_type', 
    [req.params.itemName], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create item detail
router.post('/', (req, res) => {
  const { item_id, item_name, type, company, quantity, price, order_type } = req.body;
  
  if (!item_id || !item_name || !type || !company || !quantity || !price || !order_type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (order_type !== 'retail' && order_type !== 'wholesale') {
    return res.status(400).json({ error: 'order_type must be either "retail" or "wholesale"' });
  }

  const stmt = db.prepare(
    'INSERT INTO item_details (item_id, item_name, type, company, quantity, price, order_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  
  stmt.run(item_id, item_name, type, company, quantity, price, order_type, function(err) {
    if (err) {
      stmt.finalize();
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      item_detail_id: this.lastID, 
      item_id, 
      item_name, 
      type, 
      company, 
      quantity, 
      price, 
      order_type 
    });
    stmt.finalize();
  });
});

// Update item detail
router.put('/:id', (req, res) => {
  const { type, company, quantity, price, order_type } = req.body;
  
  if (order_type && order_type !== 'retail' && order_type !== 'wholesale') {
    return res.status(400).json({ error: 'order_type must be either "retail" or "wholesale"' });
  }

  const updates = [];
  const params = [];

  if (type !== undefined) {
    updates.push('type = ?');
    params.push(type);
  }
  if (company !== undefined) {
    updates.push('company = ?');
    params.push(company);
  }
  if (quantity !== undefined) {
    updates.push('quantity = ?');
    params.push(quantity);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    params.push(price);
  }
  if (order_type !== undefined) {
    updates.push('order_type = ?');
    params.push(order_type);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(req.params.id);

  db.run(
    `UPDATE item_details SET ${updates.join(', ')} WHERE item_detail_id = ?`,
    params,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Updated successfully', item_detail_id: req.params.id });
    }
  );
});

// Delete item detail
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM item_details WHERE item_detail_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, item_detail_id: req.params.id });
  });
});

module.exports = router;

