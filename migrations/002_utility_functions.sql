-- ====================================================================
-- LAUNDRY SYSTEM - UTILITY FUNCTIONS MIGRATION
-- Migration: 002_utility_functions.sql
-- Description: Add utility functions for common operations
-- ====================================================================

-- Function to get customer summary statistics
CREATE OR REPLACE FUNCTION get_customer_summary(p_customer_id uuid)
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
$$ LANGUAGE plpgsql;

-- Function to get branch performance summary
CREATE OR REPLACE FUNCTION get_branch_summary(p_branch_id uuid)
RETURNS TABLE(
  branch_id uuid,
  branch_name text,
  total_orders bigint,
  total_revenue numeric,
  total_services bigint,
  active_services bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as branch_id,
    b.name as branch_name,
    COUNT(o.order_id) as total_orders,
    COALESCE(SUM(o.total_price), 0) as total_revenue,
    COUNT(s.id) as total_services,
    COUNT(CASE WHEN s.status = 'Active' THEN 1 END) as active_services
  FROM view_branches b
  LEFT JOIN view_orders o ON b.id = o.branch_id
  LEFT JOIN view_services s ON b.id = s.branch_id
  WHERE b.id = p_branch_id
  GROUP BY b.id, b.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent orders with customer info
CREATE OR REPLACE FUNCTION get_recent_orders(p_limit integer DEFAULT 10)
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
$$ LANGUAGE plpgsql;

-- Function to search customers by name or contact
CREATE OR REPLACE FUNCTION search_customers_basic(
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
$$ LANGUAGE plpgsql;

-- Function to get order statistics for a date range
CREATE OR REPLACE FUNCTION get_order_stats(
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
$$ LANGUAGE plpgsql;

-- Function to get low stock items from branch_stocks JSONB
CREATE OR REPLACE FUNCTION get_low_stock_items(p_threshold integer DEFAULT 10)
RETURNS TABLE(
  branch_id uuid,
  branch_name text,
  item_name text,
  current_quantity integer,
  status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as branch_id,
    b.name as branch_name,
    stock_item.name as item_name,
    stock_item.quantity as current_quantity,
    CASE 
      WHEN stock_item.quantity = 0 THEN 'Out of Stock'
      WHEN stock_item.quantity <= p_threshold / 2 THEN 'Critical'
      ELSE 'Low Stock'
    END as status
  FROM view_branches b,
  jsonb_to_recordset(b.branch_stocks) as stock_item(
    id uuid,
    name text,
    quantity integer
  )
  WHERE 
    stock_item.quantity IS NOT NULL 
    AND stock_item.name IS NOT NULL
    AND stock_item.quantity <= p_threshold
  ORDER BY stock_item.quantity ASC, b.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get service popularity
CREATE OR REPLACE FUNCTION get_service_popularity(p_limit integer DEFAULT 10)
RETURNS TABLE(
  service_id uuid,
  service_name text,
  branch_name text,
  price numeric,
  order_count bigint,
  total_quantity bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    s.branch_name,
    s.price,
    COUNT(order_item.service_id) as order_count,
    COALESCE(SUM((order_item.quantity)::integer), 0) as total_quantity,
    COALESCE(SUM(order_item.total), 0) as total_revenue
  FROM view_services s
  LEFT JOIN (
    SELECT 
      (item->>'id')::uuid as service_id,
      item->>'quantity' as quantity,
      (item->>'total')::numeric as total
    FROM view_orders o,
    jsonb_array_elements(o.items) as item
  ) order_item ON s.id = order_item.service_id
  GROUP BY s.id, s.name, s.branch_name, s.price
  ORDER BY order_count DESC, total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next order ID
CREATE OR REPLACE FUNCTION generate_next_order_id()
RETURNS text AS $$
DECLARE
  next_num integer;
  formatted_id text;
BEGIN
  -- Get the highest order number from existing orders
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
  
  -- Format with leading zeros (7 digits)
  formatted_id := 'ORD_' || LPAD(next_num::text, 7, '0');
  
  RETURN formatted_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- FUNCTION COMMENTS
-- ====================================================================

COMMENT ON FUNCTION get_customer_summary IS 'Get comprehensive summary for a specific customer';
COMMENT ON FUNCTION get_branch_summary IS 'Get performance summary for a specific branch';
COMMENT ON FUNCTION get_recent_orders IS 'Get most recent orders with customer and branch info';
COMMENT ON FUNCTION search_customers_basic IS 'Search customers by name, phone, or email with relevance ranking';
COMMENT ON FUNCTION get_order_stats IS 'Get order statistics for a date range with optional branch filter';
COMMENT ON FUNCTION get_low_stock_items IS 'Get inventory items below specified threshold';
COMMENT ON FUNCTION get_service_popularity IS 'Get service popularity ranking based on order frequency';
COMMENT ON FUNCTION generate_next_order_id IS 'Generate the next sequential order ID';

-- ====================================================================
-- MIGRATION COMPLETE
-- ====================================================================