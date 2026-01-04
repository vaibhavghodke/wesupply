const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating order_summary_history table...\n');

db.serialize(() => {
  // Create the order_summary_history table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_summary_history (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_summary TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
      create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err);
      db.close();
      return;
    }
    console.log('✅ Table "order_summary_history" created successfully\n');
    
    // Show table structure
    db.all("PRAGMA table_info(order_summary_history)", (err, columns) => {
      if (err) {
        console.error('Error getting table info:', err);
        db.close();
        return;
      }
      
      console.log('Table Structure:');
      console.log('================');
      columns.forEach(col => {
        let colInfo = `  ${col.name}: ${col.type}`;
        if (col.pk) colInfo += ' (PRIMARY KEY)';
        if (col.notnull) colInfo += ' NOT NULL';
        if (col.dflt_value) colInfo += ` DEFAULT ${col.dflt_value}`;
        console.log(colInfo);
      });
      
      console.log('\n✅ Migration complete!');
      db.close();
    });
  });
});

