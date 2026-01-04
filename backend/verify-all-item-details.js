const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('Verifying all item-details...\n');

// Get statistics by item
db.all(`
  SELECT 
    item_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT type) as types,
    COUNT(DISTINCT company) as companies,
    MIN(price) as min_price,
    MAX(price) as max_price
  FROM item_details
  GROUP BY item_name
  ORDER BY item_name
`, (err, stats) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  console.log('Summary by Item:');
  console.log('=================');
  stats.forEach(stat => {
    console.log(`\n${stat.item_name}:`);
    console.log(`  Total records: ${stat.total_records}`);
    console.log(`  Types: ${stat.types}`);
    console.log(`  Companies: ${stat.companies}`);
    console.log(`  Price range: ₹${stat.min_price} - ₹${stat.max_price}`);
  });

  // Get overall statistics
  db.get(`
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT item_name) as items,
      COUNT(DISTINCT type) as total_types,
      COUNT(DISTINCT company) as total_companies
    FROM item_details
  `, (err, overall) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('\n\nOverall Statistics:');
    console.log('===================');
    console.log(`  Total records: ${overall.total}`);
    console.log(`  Unique items: ${overall.items}`);
    console.log(`  Unique types: ${overall.total_types}`);
    console.log(`  Unique companies: ${overall.total_companies}`);

    // Show sample records for each item
    console.log('\n\nSample Records (2 per item):');
    console.log('============================');
    
    db.all(`
      SELECT item_name, type, company, quantity, price, order_type
      FROM item_details
      WHERE item_detail_id IN (
        SELECT MIN(item_detail_id) FROM item_details GROUP BY item_name
        UNION
        SELECT MAX(item_detail_id) FROM item_details GROUP BY item_name
      )
      ORDER BY item_name, order_type
    `, (err, samples) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }

      samples.forEach(sample => {
        console.log(`\n${sample.item_name} - ${sample.type}`);
        console.log(`  Company: ${sample.company}`);
        console.log(`  Quantity: ${sample.quantity}, Price: ₹${sample.price}, Order: ${sample.order_type}`);
      });

      db.close();
    });
  });
});

