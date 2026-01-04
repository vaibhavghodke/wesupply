const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating item-details table...\n');

// Sample data for cement types with companies
const cementTypes = [
  'Ordinary Portland Cement (OPC)',
  'Portland Pozzolana Cement (PPC)',
  'Rapid Hardening Cement',
  'Low Heat Cement',
  'Sulphate Resisting Cement',
  'White Cement',
  'High Alumina Cement'
];

const cementCompanies = [
  'UltraTech Cement',
  'Ambuja Cements',
  'ACC Limited',
  'Shree Cement',
  'Dalmia Bharat',
  'Ramco Cements',
  'Birla Corporation',
  'JK Cement',
  'India Cements',
  'Orient Cement'
];

db.serialize(() => {
  // Step 1: Create the item-details table
  db.run(`
    CREATE TABLE IF NOT EXISTS item_details (
      item_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      type TEXT NOT NULL,
      company TEXT NOT NULL,
      quantity TEXT NOT NULL,
      price REAL NOT NULL,
      order_type TEXT NOT NULL CHECK(order_type IN ('retail', 'wholesale')),
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err);
      db.close();
      return;
    }
    console.log('✅ Table "item_details" created successfully\n');

    // Step 2: Get the Cement item ID
    db.get("SELECT id, name FROM items WHERE name = 'Cement'", (err, cementItem) => {
      if (err) {
        console.error('Error fetching Cement item:', err);
        db.close();
        return;
      }

      if (!cementItem) {
        console.log('⚠️  Cement item not found in items table');
        db.close();
        return;
      }

      console.log(`Found Cement item: ID=${cementItem.id}, Name=${cementItem.name}`);
      console.log('\nInserting sample data for cement types...\n');

      // Step 3: Insert sample data for each cement type and company combination
      const inserts = [];
      const totalInserts = cementTypes.length * cementCompanies.length * 2; // 2 for retail and wholesale
      let completed = 0;

      const checkComplete = () => {
        completed++;
        if (completed % 20 === 0) {
          console.log(`  Progress: ${completed}/${totalInserts} records inserted...`);
        }
        if (completed === totalInserts) {
          console.log(`\n✅ Migration complete! Inserted ${completed} item detail records.`);
          console.log(`   - ${cementTypes.length} cement types`);
          console.log(`   - ${cementCompanies.length} companies`);
          console.log(`   - 2 order types (retail & wholesale) per combination\n`);
          db.close();
        }
      };

      cementTypes.forEach((type, typeIndex) => {
        cementCompanies.forEach((company, companyIndex) => {
          // Insert retail price
          const retailPrice = 350 + (typeIndex * 20) + (companyIndex * 5) + Math.floor(Math.random() * 50);
          
          db.run(
            `INSERT INTO item_details (item_id, item_name, type, company, quantity, price, order_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cementItem.id, cementItem.name, type, company, 'bags', retailPrice, 'retail'],
            function(insertErr) {
              if (insertErr) {
                console.error(`❌ Error inserting retail for ${type} - ${company}:`, insertErr);
              }
              checkComplete();
            }
          );

          // Insert wholesale price (typically 10-15% lower)
          const wholesalePrice = Math.round(retailPrice * 0.88); // 12% discount
          db.run(
            `INSERT INTO item_details (item_id, item_name, type, company, quantity, price, order_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cementItem.id, cementItem.name, type, company, 'bags', wholesalePrice, 'wholesale'],
            function(insertErr2) {
              if (insertErr2) {
                console.error(`❌ Error inserting wholesale for ${type} - ${company}:`, insertErr2);
              }
              checkComplete();
            }
          );
        });
      });
    });
  });
});

