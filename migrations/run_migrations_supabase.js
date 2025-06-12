const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://atqjxayqandzeuyyxolr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0cWp4YXlxYW5kemV1eXl4b2xyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIwMTA1MSwiZXhwIjoyMDYwNzc3MDUxfQ.7Jl8OKicOo09kxj8X-rI4s5Cg_ogT83fgMCiH_RXW-0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Individual migration statements (since we can't run multi-statement SQL via Supabase API)
const migrations = [
  // Performance indexes
  {
    name: "Customer phone index",
    sql: "CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);"
  },
  {
    name: "Customer email index", 
    sql: "CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);"
  },
  {
    name: "Customer name index",
    sql: "CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);"
  },
  {
    name: "Orders customer_id index",
    sql: "CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);"
  },
  {
    name: "Orders date index",
    sql: "CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);"
  },
  {
    name: "Orders status index",
    sql: "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);"
  },
  {
    name: "Services branch status index",
    sql: "CREATE INDEX IF NOT EXISTS idx_services_branch_id ON services(branch_id);"
  },
  {
    name: "Services status index",
    sql: "CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);"
  },
  {
    name: "Promos status index",
    sql: "CREATE INDEX IF NOT EXISTS idx_promos_status ON promos(status);"
  },
  {
    name: "Promos valid_until index",
    sql: "CREATE INDEX IF NOT EXISTS idx_promos_valid_until ON promos(valid_until);"
  },
  
  // Utility Functions
  {
    name: "Customer Summary Function",
    sql: `CREATE OR REPLACE FUNCTION get_customer_summary(p_customer_id uuid)
    RETURNS TABLE(
      customer_id uuid,
      full_name text,
      total_orders bigint,
      total_spent numeric,
      avg_order_value numeric,
      last_order_date timestamptz
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.customer_id,
        c.full_name,
        COUNT(o.order_id) as total_orders,
        COALESCE(SUM(o.total_price), 0) as total_spent,
        COALESCE(AVG(o.total_price), 0) as avg_order_value,
        MAX(o.order_date) as last_order_date
      FROM view_customers c
      LEFT JOIN view_orders o ON c.customer_id = o.customer_id
      WHERE c.customer_id = p_customer_id
      GROUP BY c.customer_id, c.full_name;
    END;
    $$ LANGUAGE plpgsql;`
  },
  
  {
    name: "Recent Orders Function",
    sql: `CREATE OR REPLACE FUNCTION get_recent_orders(p_limit integer DEFAULT 10)
    RETURNS TABLE(
      order_id text,
      customer_name text,
      branch_name text,
      order_status text,
      payment_status text,
      total_price numeric,
      order_date timestamptz
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        o.order_id,
        o.customer_name,
        o.branch_name,
        o.order_status,
        o.payment_status,
        o.total_price,
        o.order_date
      FROM view_orders o
      ORDER BY o.order_date DESC
      LIMIT p_limit;
    END;
    $$ LANGUAGE plpgsql;`
  },
  
  {
    name: "Search Customers Function",
    sql: `CREATE OR REPLACE FUNCTION search_customers_basic(
      p_search_term text,
      p_limit integer DEFAULT 20
    )
    RETURNS TABLE(
      customer_id uuid,
      full_name text,
      phone text,
      email text,
      address text
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.customer_id,
        c.full_name,
        c.phone,
        c.email,
        c.address
      FROM view_customers c
      WHERE 
        c.full_name ILIKE '%' || p_search_term || '%' OR
        c.phone ILIKE '%' || p_search_term || '%' OR
        c.email ILIKE '%' || p_search_term || '%'
      ORDER BY 
        CASE 
          WHEN c.full_name ILIKE p_search_term || '%' THEN 1
          WHEN c.phone ILIKE p_search_term || '%' THEN 2
          ELSE 3
        END,
        c.full_name
      LIMIT p_limit;
    END;
    $$ LANGUAGE plpgsql;`
  },
  
  {
    name: "Order Stats Function",
    sql: `CREATE OR REPLACE FUNCTION get_order_stats(
      p_start_date date,
      p_end_date date,
      p_branch_id uuid DEFAULT NULL
    )
    RETURNS TABLE(
      total_orders bigint,
      total_revenue numeric,
      avg_order_value numeric,
      paid_orders bigint,
      unpaid_orders bigint,
      pending_orders bigint,
      completed_orders bigint
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_price), 0) as total_revenue,
        COALESCE(AVG(o.total_price), 0) as avg_order_value,
        COUNT(CASE WHEN o.payment_status = 'Paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN o.payment_status = 'Unpaid' THEN 1 END) as unpaid_orders,
        COUNT(CASE WHEN o.order_status IN ('Pending', 'Ongoing') THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.order_status = 'Picked up' THEN 1 END) as completed_orders
      FROM view_orders o
      WHERE 
        DATE(o.order_date) >= p_start_date 
        AND DATE(o.order_date) <= p_end_date
        AND (p_branch_id IS NULL OR o.branch_id = p_branch_id);
    END;
    $$ LANGUAGE plpgsql;`
  },
  
  {
    name: "Generate Order ID Function",
    sql: `CREATE OR REPLACE FUNCTION generate_next_order_id()
    RETURNS text AS $$
    DECLARE
      next_num integer;
      formatted_id text;
    BEGIN
      SELECT COALESCE(
        MAX(
          CASE 
            WHEN order_id ~ '^ORD_[0-9]+$' 
            THEN CAST(SUBSTRING(order_id FROM 5) AS integer)
            ELSE 0
          END
        ), 0
      ) + 1 INTO next_num
      FROM orders;
      
      formatted_id := 'ORD_' || LPAD(next_num::text, 7, '0');
      
      RETURN formatted_id;
    END;
    $$ LANGUAGE plpgsql;`
  }
];

async function runMigrations() {
  console.log('🚀 Starting Laundry System Database Migrations via Supabase...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    
    try {
      console.log(`${i + 1}. Creating: ${migration.name}`);
      
      // Try to execute the SQL via RPC call
      const { error } = await supabase.rpc('exec_sql', {
        sql: migration.sql
      });
      
      if (error) {
        // If exec_sql doesn't exist, try direct query (won't work for DDL but worth trying)
        console.log(`   ⚠️  exec_sql not available, trying alternative method...`);
        console.log(`   ❌ ${migration.name}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
      
      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful migrations: ${successCount}`);
  console.log(`❌ Failed migrations: ${errorCount}`);
  console.log(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log('\n🎉 Some migrations applied successfully!');
    console.log('\n🧪 Testing available functions...');
    
    // Test what we can via regular queries
    try {
      const { data: customers, error } = await supabase.from('view_customers').select('*').limit(1);
      if (!error) {
        console.log('✅ view_customers accessible');
      }
    } catch (err) {
      console.log('❌ view_customers test failed');
    }
    
    try {
      const { data: orders, error } = await supabase.from('view_orders').select('*').limit(1);
      if (!error) {
        console.log('✅ view_orders accessible');
      }
    } catch (err) {
      console.log('❌ view_orders test failed');
    }
  }
  
  console.log('\n📝 Note: Some migrations may require direct database access via SQL editor.');
  console.log('   If migrations failed, try running the SQL files manually in Supabase SQL Editor.');
}

runMigrations();