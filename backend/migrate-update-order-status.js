const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('Updating order_summary_history table to include "Open" status...\n');

// SQLite doesn't support modifying CHECK constraints directly
// We need to recreate the table with the new constraint
db.serialize(() => {
  // Step 1: Create new table with updated constraint
  db.run(`
    CREATE TABLE IF NOT EXISTS order_summary_history_new (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_summary TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'Open', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
      create_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating new table:', err);
      db.close();
      return;
    }
    console.log('✅ Created new table structure');

    // Step 2: Copy data from old table
    db.run(`
      INSERT INTO order_summary_history_new 
      SELECT * FROM order_summary_history
    `, (err) => {
      if (err) {
        console.error('Error copying data:', err);
        db.close();
        return;
      }
      console.log('✅ Copied existing data');

      // Step 3: Drop old table
      db.run('DROP TABLE order_summary_history', (err) => {
        if (err) {
          console.error('Error dropping old table:', err);
          db.close();
          return;
        }
        console.log('✅ Dropped old table');

        // Step 4: Rename new table
        db.run('ALTER TABLE order_summary_history_new RENAME TO order_summary_history', (err) => {
          if (err) {
            console.error('Error renaming table:', err);
            db.close();
            return;
          }
          console.log('✅ Renamed table');
          console.log('\n✅ Migration complete! "Open" status is now available.');
          db.close();
        });
      });
    });
  });
});

