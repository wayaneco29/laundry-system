const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration - Update these with your Supabase credentials
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:GQDW6SaQLQFPQBZj@db.atqjxayqandzeuyyxolr.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
};

// Migration files in order
const migrations = [
  '001_performance_indexes.sql',
  '002_utility_functions.sql'
];

async function runMigrations() {
  const client = new Client(config);
  
  console.log('🚀 Starting Laundry System Database Migrations...\n');
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database\n');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('📋 Checking migration status...\n');
    
    for (const migrationFile of migrations) {
      // Check if migration already executed
      const result = await client.query(
        'SELECT filename FROM migrations WHERE filename = $1',
        [migrationFile]
      );
      
      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${migrationFile} (already executed)`);
        continue;
      }
      
      console.log(`🔄 Running migration: ${migrationFile}`);
      
      try {
        // Read migration file
        const migrationPath = path.join(__dirname, migrationFile);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute migration
        await client.query(migrationSQL);
        
        // Record migration as executed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [migrationFile]
        );
        
        console.log(`✅ Migration ${migrationFile} completed successfully`);
        
      } catch (error) {
        console.error(`❌ Migration ${migrationFile} failed:`, error.message);
        throw error;
      }
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
    // Test some of the new functions
    console.log('\n🧪 Testing new functions...');
    
    try {
      const testResult = await client.query('SELECT generate_next_order_id()');
      console.log(`✅ Next Order ID: ${testResult.rows[0].generate_next_order_id}`);
    } catch (err) {
      console.log(`⚠️  Order ID test failed: ${err.message}`);
    }
    
    try {
      const recentOrders = await client.query('SELECT * FROM get_recent_orders(3)');
      console.log(`✅ Recent orders function: Found ${recentOrders.rows.length} orders`);
    } catch (err) {
      console.log(`⚠️  Recent orders test failed: ${err.message}`);
    }
    
    try {
      const lowStock = await client.query('SELECT * FROM get_low_stock_items(20)');
      console.log(`✅ Low stock function: Found ${lowStock.rows.length} items`);
    } catch (err) {
      console.log(`⚠️  Low stock test failed: ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migrations
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };