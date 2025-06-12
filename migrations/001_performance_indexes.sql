-- ====================================================================
-- LAUNDRY SYSTEM - PERFORMANCE INDEXES MIGRATION
-- Migration: 001_performance_indexes.sql
-- Description: Add performance indexes based on existing queries
-- ====================================================================

-- Customer table indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_total_price ON orders(total_price);

-- Services table indexes
CREATE INDEX IF NOT EXISTS idx_services_branch_id ON services(branch_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);

-- Staffs table indexes
CREATE INDEX IF NOT EXISTS idx_staffs_branch_id ON staffs(branch_id);
CREATE INDEX IF NOT EXISTS idx_staffs_employment_date ON staffs(employment_date);

-- Branches table indexes
CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);
CREATE INDEX IF NOT EXISTS idx_branches_created_at ON branches(created_at DESC);

-- Promos table indexes
CREATE INDEX IF NOT EXISTS idx_promos_status ON promos(status);
CREATE INDEX IF NOT EXISTS idx_promos_valid_until ON promos(valid_until);
CREATE INDEX IF NOT EXISTS idx_promos_code ON promos(code);

-- Order items table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_service_id ON order_items(service_id);

-- Branch stocks indexes (if separate table)
CREATE INDEX IF NOT EXISTS idx_branch_stocks_branch_id ON branch_stocks(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_stocks_quantity ON branch_stocks(quantity);

-- ====================================================================
-- COMMENTS
-- ====================================================================

COMMENT ON INDEX idx_customers_phone IS 'Performance index for customer phone number searches';
COMMENT ON INDEX idx_customers_email IS 'Performance index for customer email searches';
COMMENT ON INDEX idx_orders_date IS 'Performance index for order date queries and sorting';
COMMENT ON INDEX idx_orders_status IS 'Composite index for order and payment status filtering';
COMMENT ON INDEX idx_services_branch_id IS 'Performance index for branch-specific service queries';

-- ====================================================================
-- MIGRATION COMPLETE
-- ====================================================================