const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('Populating item-details for all items...\n');

// Define types, companies, and quantities for each item
const itemDetails = {
  'Red Bricks': {
    types: [
      'First Class Bricks',
      'Second Class Bricks',
      'Third Class Bricks',
      'Fourth Class Bricks',
      'Fly Ash Bricks',
      'Hollow Bricks',
      'Wire Cut Bricks'
    ],
    companies: [
      'Bharat Bricks',
      'Clay Craft',
      'Wienerberger',
      'Brickwell',
      'Magicrete',
      'Buildwell Bricks',
      'Clay Tiles India'
    ],
    quantity: 'brass',
    basePrice: 3500
  },
  'AAC blocks - cement bricks': {
    types: [
      'Standard AAC Blocks',
      'Autoclaved Aerated Concrete Blocks',
      'Lightweight AAC Blocks',
      'Thermal Insulation Blocks',
      'Load Bearing AAC Blocks'
    ],
    companies: [
      'Magicrete',
      'Aerocon',
      'HIL Limited',
      'JK Lakshmi Cement',
      'Siporex',
      'Buildmate'
    ],
    quantity: 'cubic meter',
    basePrice: 3500
  },
  'Waterproofing matrail': {
    types: [
      'Bituminous Waterproofing',
      'Polyurethane Waterproofing',
      'Acrylic Waterproofing',
      'Cementitious Waterproofing',
      'Liquid Waterproofing Membrane',
      'EPDM Waterproofing'
    ],
    companies: [
      'Dr. Fixit',
      'Fosroc',
      'Sika',
      'Pidilite',
      'BASF',
      'CICO Technologies',
      'Asian Paints'
    ],
    quantity: 'liters',
    basePrice: 450
  },
  'Tile Adhesives': {
    types: [
      'Cementitious Tile Adhesive',
      'Dispersion Tile Adhesive',
      'Reaction Resin Tile Adhesive',
      'Epoxy Tile Adhesive',
      'Thin-set Mortar'
    ],
    companies: [
      'Dr. Fixit',
      'Fosroc',
      'Sika',
      'Pidilite',
      'BASF',
      'MYK Laticrete',
      'Saint-Gobain'
    ],
    quantity: 'kg',
    basePrice: 35
  },
  'Grouts - filling the gaps between tiles': {
    types: [
      'Cement-based Grout',
      'Epoxy Grout',
      'Furan Grout',
      'Sanded Grout',
      'Unsanded Grout',
      'Colored Grout'
    ],
    companies: [
      'Dr. Fixit',
      'Fosroc',
      'Sika',
      'Pidilite',
      'MYK Laticrete',
      'Saint-Gobain',
      'Ardex'
    ],
    quantity: 'kg',
    basePrice: 25
  },
  'Blocks fixer - solutions': {
    types: [
      'Block Joining Mortar',
      'Thin Bed Mortar',
      'Ready Mix Mortar',
      'Block Adhesive',
      'Construction Adhesive'
    ],
    companies: [
      'Dr. Fixit',
      'Fosroc',
      'Sika',
      'Pidilite',
      'BASF',
      'JK Cement',
      'UltraTech'
    ],
    quantity: 'kg',
    basePrice: 30
  },
  'Bundle Products': {
    types: [
      'Complete Bathroom Set',
      'Kitchen Package',
      'Electrical Bundle',
      'Plumbing Bundle',
      'Tiles & Adhesives Bundle',
      'Paint & Primer Bundle'
    ],
    companies: [
      'Asian Paints',
      'Berger Paints',
      'Havells',
      'Finolex',
      'Kajaria',
      'Somany',
      'Johnson Tiles'
    ],
    quantity: 'set',
    basePrice: 5000
  }
};

db.serialize(() => {
  // Get all items except Cement (already populated)
  db.all("SELECT id, name FROM items WHERE name != 'Cement' ORDER BY id", (err, items) => {
    if (err) {
      console.error('Error fetching items:', err);
      db.close();
      return;
    }

    if (items.length === 0) {
      console.log('No items found to populate.');
      db.close();
      return;
    }

    console.log(`Found ${items.length} items to populate:\n`);
    items.forEach(item => {
      console.log(`  - ${item.name} (ID: ${item.id})`);
    });
    console.log('');

    let totalInserts = 0;
    let completed = 0;
    let expectedInserts = 0;

    // Calculate total inserts
    items.forEach(item => {
      const details = itemDetails[item.name];
      if (details) {
        expectedInserts += details.types.length * details.companies.length * 2; // retail + wholesale
      }
    });

    totalInserts = expectedInserts;
    console.log(`Total records to insert: ${totalInserts}\n`);
    console.log('Inserting data...\n');

    const checkComplete = () => {
      completed++;
      if (completed % 50 === 0) {
        console.log(`  Progress: ${completed}/${totalInserts} records inserted...`);
      }
      if (completed === totalInserts) {
        console.log(`\n✅ Migration complete! Inserted ${completed} item detail records.`);
        db.close();
      }
    };

    items.forEach((item) => {
      const details = itemDetails[item.name];
      
      if (!details) {
        console.log(`⚠️  No details defined for: ${item.name}`);
        return;
      }

      console.log(`Processing: ${item.name} (${details.types.length} types × ${details.companies.length} companies × 2 order types)...`);

      details.types.forEach((type, typeIndex) => {
        details.companies.forEach((company, companyIndex) => {
          // Calculate price with variation
          const priceVariation = (typeIndex * 50) + (companyIndex * 20) + Math.floor(Math.random() * 100);
          const retailPrice = details.basePrice + priceVariation;
          const wholesalePrice = Math.round(retailPrice * 0.88); // 12% discount

          // Insert retail
          db.run(
            `INSERT INTO item_details (item_id, item_name, type, company, quantity, price, order_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.id, item.name, type, company, details.quantity, retailPrice, 'retail'],
            function(insertErr) {
              if (insertErr) {
                console.error(`❌ Error inserting retail for ${item.name} - ${type} - ${company}:`, insertErr);
              }
              checkComplete();
            }
          );

          // Insert wholesale
          db.run(
            `INSERT INTO item_details (item_id, item_name, type, company, quantity, price, order_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.id, item.name, type, company, details.quantity, wholesalePrice, 'wholesale'],
            function(insertErr2) {
              if (insertErr2) {
                console.error(`❌ Error inserting wholesale for ${item.name} - ${type} - ${company}:`, insertErr2);
              }
              checkComplete();
            }
          );
        });
      });
    });
  });
});

