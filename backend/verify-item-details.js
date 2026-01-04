const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('Verifying item-details table...\n');

// Get table structure
db.all("PRAGMA table_info(item_details)", (err, columns) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log('Table Structure:');
  console.log('================');
  columns.forEach(col => {
    console.log(`  ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}${col.notnull ? ' NOT NULL' : ''}`);
  });
  
  // Get sample records
  db.all('SELECT * FROM item_details LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    console.log('\nSample Records (first 5):');
    console.log('==========================');
    rows.forEach(row => {
      console.log(`  ID: ${row.item_detail_id}, Item: ${row.item_name}, Type: ${row.type}`);
      console.log(`    Company: ${row.company}, Quantity: ${row.quantity}, Price: ₹${row.price}, Order: ${row.order_type}`);
    });
    
    // Get statistics
    db.get('SELECT COUNT(*) as total, COUNT(DISTINCT item_name) as items, COUNT(DISTINCT type) as types, COUNT(DISTINCT company) as companies FROM item_details', (err, stats) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      console.log('\nStatistics:');
      console.log('===========');
      console.log(`  Total records: ${stats.total}`);
      console.log(`  Unique items: ${stats.items}`);
      console.log(`  Unique types: ${stats.types}`);
      console.log(`  Unique companies: ${stats.companies}`);
      
      db.close();
    });
  });
});

