const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all orders with optional filters
router.get('/', (req, res) => {
  const { status, created_by, start_date, end_date } = req.query;
  
  let query = 'SELECT * FROM order_summary_history WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (created_by) {
    query += ' AND created_by = ?';
    params.push(created_by);
  }
  if (start_date) {
    query += ' AND create_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND create_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY create_date DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get order by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM order_summary_history WHERE order_id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(row);
  });
});

// Create new order
router.post('/', (req, res) => {
  const { order_summary, contact, status, created_by } = req.body;
  
  if (!order_summary || !contact) {
    return res.status(400).json({ error: 'order_summary and contact are required' });
  }

  const validStatuses = ['pending', 'Open', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const orderStatus = status && validStatuses.includes(status) ? status : 'pending';

  const stmt = db.prepare(
    'INSERT INTO order_summary_history (order_summary, contact, status, created_by) VALUES (?, ?, ?, ?)'
  );
  
  stmt.run(order_summary, contact, orderStatus, created_by || null, function(err) {
    if (err) {
      stmt.finalize();
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      order_id: this.lastID, 
      order_summary, 
      contact, 
      status: orderStatus, 
      created_by: created_by || null,
      create_date: new Date().toISOString()
    });
    stmt.finalize();
  });
});

// Update order
router.put('/:id', (req, res) => {
  const { order_summary, contact, status, created_by } = req.body;
  
  const validStatuses = ['pending', 'Open', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const updates = [];
  const params = [];

  if (order_summary !== undefined) {
    updates.push('order_summary = ?');
    params.push(order_summary);
  }
  if (contact !== undefined) {
    updates.push('contact = ?');
    params.push(contact);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (created_by !== undefined) {
    updates.push('created_by = ?');
    params.push(created_by);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(req.params.id);

  db.run(
    `UPDATE order_summary_history SET ${updates.join(', ')} WHERE order_id = ?`,
    params,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
      res.json({ message: 'Order updated successfully', order_id: req.params.id });
    }
  );
});

// Delete order
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM order_summary_history WHERE order_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ deleted: true, order_id: req.params.id });
  });
});

// Get orders by status
router.get('/status/:status', (req, res) => {
  const validStatuses = ['pending', 'Open', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const status = req.params.status;
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  db.all(
    'SELECT * FROM order_summary_history WHERE status = ? ORDER BY create_date DESC',
    [status],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

