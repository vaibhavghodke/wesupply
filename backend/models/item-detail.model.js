const db = require('../db');

function queryAll(filters) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM item_details WHERE 1=1';
    const params = [];
    if (filters) {
      const { item_id, item_name, type, company, order_type } = filters;
      if (item_id) { query += ' AND item_id = ?'; params.push(item_id); }
      if (item_name) { query += ' AND item_name = ?'; params.push(item_name); }
      if (type) { query += ' AND type = ?'; params.push(type); }
      if (company) { query += ' AND company = ?'; params.push(company); }
      if (order_type) { query += ' AND order_type = ?'; params.push(order_type); }
    }
    query += ' ORDER BY item_name, type, company, order_type';
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM item_details WHERE item_detail_id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function getByItemName(itemName) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM item_details WHERE item_name = ? ORDER BY type, company, order_type', [itemName], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function createItemDetail(detail) {
  const { item_id, item_name, type, company, quantity, price, order_type } = detail;
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO item_details (item_id, item_name, type, company, quantity, price, order_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(item_id, item_name, type, company, quantity, price, order_type, function(err) {
      stmt.finalize();
      if (err) return reject(err);
      resolve({ item_detail_id: this.lastID, item_id, item_name, type, company, quantity, price, order_type });
    });
  });
}

function updateItemDetail(id, fields) {
  return new Promise((resolve, reject) => {
    const updates = [];
    const params = [];
    ['type','company','quantity','price','order_type'].forEach(k => {
      if (fields[k] !== undefined) { updates.push(`${k} = ?`); params.push(fields[k]); }
    });
    if (updates.length === 0) return resolve(null);
    params.push(id);
    const sql = `UPDATE item_details SET ${updates.join(', ')} WHERE item_detail_id = ?`;
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      if (this.changes === 0) return resolve(null);
      resolve({ item_detail_id: id });
    });
  });
}

function deleteItemDetail(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM item_details WHERE item_detail_id = ?', [id], function(err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

module.exports = { queryAll, getById, getByItemName, createItemDetail, updateItemDetail, deleteItemDetail };
