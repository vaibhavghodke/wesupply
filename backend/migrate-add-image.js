const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Image values to assign to each row (in order)
const imageValues = [
  'cement',
  'red-bricks',
  'aac-blocks',
  'waterproofing',
  'tile-adhesive',
  'grouts',
  'blocks-fixer',
  'bundles'
];

console.log('Starting migration: Adding image column...\n');

db.serialize(() => {
  // Step 1: Add the image column if it doesn't exist
  db.run(`ALTER TABLE items ADD COLUMN image TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding column:', err);
      db.close();
      return;
    }
    
    if (err && err.message.includes('duplicate column')) {
      console.log('ℹ️  Column "image" already exists, skipping column creation');
    } else {
      console.log('✅ Column "image" added successfully');
    }

    // Step 2: Get all items
    db.all('SELECT id, name FROM items ORDER BY id', (err, rows) => {
      if (err) {
        console.error('Error fetching items:', err);
        db.close();
        return;
      }

      console.log(`\nFound ${rows.length} items in database`);
      
      if (rows.length === 0) {
        console.log('No items to update.');
        db.close();
        return;
      }

      // Step 3: Update each row with image value
      let completed = 0;
      const totalRows = rows.length;
      
      if (totalRows === 0) {
        console.log('No items to update.');
        db.close();
        return;
      }

      rows.forEach((row, index) => {
        const imageValue = imageValues[index] || null;
        
        if (imageValue) {
          db.run(
            'UPDATE items SET image = ? WHERE id = ?',
            [imageValue, row.id],
            function(updateErr) {
              completed++;
              if (updateErr) {
                console.error(`❌ Error updating item ${row.id}:`, updateErr);
              } else {
                console.log(`✅ Updated item ${row.id} (${row.name}) with image: ${imageValue}`);
              }

              // Close database after all updates are complete
              if (completed === totalRows) {
                console.log(`\n✅ Migration complete! Processed ${completed} items.`);
                db.close();
              }
            }
          );
        } else {
          completed++;
          console.log(`⚠️  No image value for item ${row.id} (${row.name}) - index ${index} exceeds available image values`);
          
          if (completed === totalRows) {
            console.log(`\n✅ Migration complete! Processed ${completed} items.`);
            db.close();
          }
        }
      });
    });
  });
});

