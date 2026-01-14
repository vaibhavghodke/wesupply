const db = require('../db');

function queryAll(filters) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM order_summary_history WHERE 1=1';
    const params = [];
    if (filters) {
      const { status, created_by, start_date, end_date } = filters;
      if (status) { query += ' AND status = ?'; params.push(status); }
      if (created_by) { query += ' AND created_by = ?'; params.push(created_by); }
      if (start_date) { query += ' AND create_date >= ?'; params.push(start_date); }
      if (end_date) { query += ' AND create_date <= ?'; params.push(end_date); }
    }
    query += ' ORDER BY create_date DESC';
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM order_summary_history WHERE order_id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function createOrder(order) {
  const { order_summary, contact, status, created_by } = order;
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO order_summary_history (order_summary, contact, status, created_by) VALUES (?, ?, ?, ?)');
    stmt.run(order_summary, contact, status, created_by || null, function(err) {
      stmt.finalize();
      if (err) return reject(err);
      resolve({ order_id: this.lastID, order_summary, contact, status, created_by: created_by || null, create_date: new Date().toISOString() });
    });
  });
}

function updateOrder(id, fields) {
  return new Promise((resolve, reject) => {
    const updates = [];
    const params = [];
    ['order_summary','contact','status','created_by'].forEach(k => {
      if (fields[k] !== undefined) { updates.push(`${k} = ?`); params.push(fields[k]); }
    });
    if (updates.length === 0) return resolve(null);
    params.push(id);
    const sql = `UPDATE order_summary_history SET ${updates.join(', ')} WHERE order_id = ?`;
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      if (this.changes === 0) return resolve(null);
      resolve({ order_id: id });
    });
  });
}

function deleteOrder(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM order_summary_history WHERE order_id = ?', [id], function(err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

function listByStatus(status) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM order_summary_history WHERE status = ? ORDER BY create_date DESC', [status], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

module.exports = { queryAll, getById, createOrder, updateOrder, deleteOrder, listByStatus };
