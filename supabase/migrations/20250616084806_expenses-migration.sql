-- ====================================================================
-- EXPENSES MODULE - DATABASE MIGRATION
-- Add this to your Supabase SQL Editor after the main schema
-- ====================================================================

-- ====================================================================
-- 1. CREATE EXPENSE CATEGORY ENUM
-- ====================================================================

CREATE TYPE "public"."expense_category_enum" AS ENUM (
    'Supplies',
    'Equipment',
    'Utilities',
    'Rent',
    'Salaries',
    'Marketing',
    'Maintenance',
    'Transportation',
    'Insurance',
    'Other'
);

ALTER TYPE "public"."expense_category_enum" OWNER TO "postgres";

-- ====================================================================
-- 2. CREATE EXPENSES TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" NUMERIC NOT NULL CHECK (amount > 0),
    "category" "public"."expense_category_enum" NOT NULL,
    "expense_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "receipt_url" TEXT,
    "branch_id" UUID REFERENCES "public"."branches"("id") ON DELETE SET NULL,
    "vendor_name" TEXT,
    "vendor_contact" TEXT,
    "payment_method" TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Other')),
    "reference_number" TEXT,
    "is_recurring" BOOLEAN DEFAULT FALSE,
    "recurring_frequency" TEXT CHECK (recurring_frequency IN ('Weekly', 'Monthly', 'Quarterly', 'Yearly') OR recurring_frequency IS NULL),
    "next_due_date" DATE,
    "status" TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Paid')),
    "approved_by" UUID REFERENCES "auth"."users"("id"),
    "approved_at" TIMESTAMPTZ,
    "paid_at" TIMESTAMPTZ,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "created_by" UUID REFERENCES "auth"."users"("id"),
    "updated_by" UUID REFERENCES "auth"."users"("id")
);

ALTER TABLE "public"."expenses" OWNER TO "postgres";

-- Add primary key
ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");

-- ====================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ====================================================================

CREATE INDEX IF NOT EXISTS "idx_expenses_branch_id" ON "public"."expenses" USING btree ("branch_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_category" ON "public"."expenses" USING btree ("category");
CREATE INDEX IF NOT EXISTS "idx_expenses_expense_date" ON "public"."expenses" USING btree ("expense_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_expenses_status" ON "public"."expenses" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_expenses_amount" ON "public"."expenses" USING btree ("amount");
CREATE INDEX IF NOT EXISTS "idx_expenses_created_at" ON "public"."expenses" USING btree ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_expenses_recurring" ON "public"."expenses" USING btree ("is_recurring", "next_due_date") WHERE is_recurring = TRUE;

-- ====================================================================
-- 4. CREATE VIEW FOR EXPENSES WITH BRANCH INFO
-- ====================================================================

CREATE OR REPLACE VIEW "public"."view_expenses" AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.amount,
    e.category,
    e.expense_date,
    e.receipt_url,
    e.branch_id,
    b.name as branch_name,
    e.vendor_name,
    e.vendor_contact,
    e.payment_method,
    e.reference_number,
    e.is_recurring,
    e.recurring_frequency,
    e.next_due_date,
    e.status,
    e.approved_by,
    e.approved_at,
    e.paid_at,
    e.notes,
    e.created_at,
    e.updated_at,
    e.created_by,
    e.updated_by,
    -- Computed fields
    CASE 
        WHEN e.approved_by IS NOT NULL THEN 'Approved'
        WHEN e.status = 'Rejected' THEN 'Rejected'
        ELSE 'Pending Approval'
    END as approval_status
FROM "public"."expenses" e
LEFT JOIN "public"."branches" b ON e.branch_id = b.id;

ALTER TABLE "public"."view_expenses" OWNER TO "postgres";

-- ====================================================================
-- 5. CREATE EXPENSE FUNCTIONS
-- ====================================================================

-- Function to upsert expense
CREATE OR REPLACE FUNCTION "public"."upsert_expense"(
    "p_title" TEXT,
    "p_amount" NUMERIC,
    "p_category" "public"."expense_category_enum",
    "p_expense_id" UUID DEFAULT NULL,
    "p_description" TEXT DEFAULT NULL,
    "p_expense_date" DATE DEFAULT CURRENT_DATE,
    "p_receipt_url" TEXT DEFAULT NULL,
    "p_branch_id" UUID DEFAULT NULL,
    "p_vendor_name" TEXT DEFAULT NULL,
    "p_vendor_contact" TEXT DEFAULT NULL,
    "p_payment_method" TEXT DEFAULT 'Cash',
    "p_reference_number" TEXT DEFAULT NULL,
    "p_is_recurring" BOOLEAN DEFAULT FALSE,
    "p_recurring_frequency" TEXT DEFAULT NULL,
    "p_next_due_date" DATE DEFAULT NULL,
    "p_status" TEXT DEFAULT 'Pending',
    "p_notes" TEXT DEFAULT NULL,
    "p_created_by" UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    IF p_expense_id IS NULL THEN
        -- Insert new expense
        INSERT INTO expenses (
            title, description, amount, category, expense_date, receipt_url,
            branch_id, vendor_name, vendor_contact, payment_method, reference_number,
            is_recurring, recurring_frequency, next_due_date, status, notes,
            created_by, updated_by
        ) VALUES (
            p_title, p_description, p_amount, p_category, p_expense_date, p_receipt_url,
            p_branch_id, p_vendor_name, p_vendor_contact, p_payment_method, p_reference_number,
            p_is_recurring, p_recurring_frequency, p_next_due_date, p_status, p_notes,
            p_created_by, p_created_by
        ) RETURNING id INTO result_id;
    ELSE
        -- Update existing expense
        UPDATE expenses SET
            title = p_title,
            description = p_description,
            amount = p_amount,
            category = p_category,
            expense_date = p_expense_date,
            receipt_url = p_receipt_url,
            branch_id = p_branch_id,
            vendor_name = p_vendor_name,
            vendor_contact = p_vendor_contact,
            payment_method = p_payment_method,
            reference_number = p_reference_number,
            is_recurring = p_is_recurring,
            recurring_frequency = p_recurring_frequency,
            next_due_date = p_next_due_date,
            status = p_status,
            notes = p_notes,
            updated_by = p_created_by,
            updated_at = NOW()
        WHERE id = p_expense_id;
        
        result_id := p_expense_id;
    END IF;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."upsert_expense" OWNER TO "postgres";

-- Function to approve expense
CREATE OR REPLACE FUNCTION "public"."approve_expense"(
    "p_expense_id" UUID,
    "p_approved_by" UUID,
    "p_status" TEXT DEFAULT 'Approved'
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE expenses SET
        status = p_status,
        approved_by = p_approved_by,
        approved_at = NOW(),
        updated_by = p_approved_by,
        updated_at = NOW()
    WHERE id = p_expense_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."approve_expense" OWNER TO "postgres";

-- Function to mark expense as paid
CREATE OR REPLACE FUNCTION "public"."mark_expense_paid"(
    "p_expense_id" UUID,
    "p_updated_by" UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE expenses SET
        status = 'Paid',
        paid_at = NOW(),
        updated_by = p_updated_by,
        updated_at = NOW()
    WHERE id = p_expense_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."mark_expense_paid" OWNER TO "postgres";

-- Function to get expense statistics
CREATE OR REPLACE FUNCTION "public"."get_expense_stats"(
    "p_start_date" DATE DEFAULT NULL,
    "p_end_date" DATE DEFAULT NULL,
    "p_branch_id" UUID DEFAULT NULL
)
RETURNS TABLE(
    total_expenses BIGINT,
    total_amount NUMERIC,
    avg_expense_amount NUMERIC,
    pending_expenses BIGINT,
    approved_expenses BIGINT,
    paid_expenses BIGINT,
    rejected_expenses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_expenses,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(AVG(e.amount), 0) as avg_expense_amount,
        COUNT(CASE WHEN e.status = 'Pending' THEN 1 END) as pending_expenses,
        COUNT(CASE WHEN e.status = 'Approved' THEN 1 END) as approved_expenses,
        COUNT(CASE WHEN e.status = 'Paid' THEN 1 END) as paid_expenses,
        COUNT(CASE WHEN e.status = 'Rejected' THEN 1 END) as rejected_expenses
    FROM view_expenses e
    WHERE 
        (p_start_date IS NULL OR e.expense_date >= p_start_date) 
        AND (p_end_date IS NULL OR e.expense_date <= p_end_date)
        AND (p_branch_id IS NULL OR e.branch_id = p_branch_id);
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_expense_stats" OWNER TO "postgres";

-- Function to get expenses by category
CREATE OR REPLACE FUNCTION "public"."get_expenses_by_category"(
    "p_start_date" DATE DEFAULT NULL,
    "p_end_date" DATE DEFAULT NULL,
    "p_branch_id" UUID DEFAULT NULL
)
RETURNS TABLE(
    category TEXT,
    expense_count BIGINT,
    total_amount NUMERIC,
    avg_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.category::TEXT,
        COUNT(*) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(AVG(e.amount), 0) as avg_amount
    FROM view_expenses e
    WHERE 
        (p_start_date IS NULL OR e.expense_date >= p_start_date) 
        AND (p_end_date IS NULL OR e.expense_date <= p_end_date)
        AND (p_branch_id IS NULL OR e.branch_id = p_branch_id)
        AND e.status IN ('Approved', 'Paid')
    GROUP BY e.category
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_expenses_by_category" OWNER TO "postgres";

-- Function to get recurring expenses due
CREATE OR REPLACE FUNCTION "public"."get_recurring_expenses_due"(
    "p_days_ahead" INTEGER DEFAULT 7
)
RETURNS TABLE(
    expense_id UUID,
    title TEXT,
    amount NUMERIC,
    category TEXT,
    next_due_date DATE,
    branch_name TEXT,
    recurring_frequency TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.amount,
        e.category::TEXT,
        e.next_due_date,
        e.branch_name,
        e.recurring_frequency
    FROM view_expenses e
    WHERE 
        e.is_recurring = TRUE 
        AND e.next_due_date IS NOT NULL
        AND e.next_due_date <= CURRENT_DATE + INTERVAL '1 day' * p_days_ahead
        AND e.status != 'Rejected'
    ORDER BY e.next_due_date ASC;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION "public"."get_recurring_expenses_due" OWNER TO "postgres";

-- ====================================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ====================================================================

ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all for authenticated users" ON "public"."expenses" 
FOR ALL USING (auth.role() = 'authenticated');

-- ====================================================================
-- 7. GRANT PERMISSIONS
-- ====================================================================

-- Grant table permissions
GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";

-- Grant view permissions
GRANT ALL ON TABLE "public"."view_expenses" TO "anon";
GRANT ALL ON TABLE "public"."view_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."view_expenses" TO "service_role";

-- Grant function permissions
GRANT ALL ON FUNCTION "public"."upsert_expense" TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_expense" TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_expense" TO "service_role";

GRANT ALL ON FUNCTION "public"."approve_expense" TO "anon";
GRANT ALL ON FUNCTION "public"."approve_expense" TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_expense" TO "service_role";

GRANT ALL ON FUNCTION "public"."mark_expense_paid" TO "anon";
GRANT ALL ON FUNCTION "public"."mark_expense_paid" TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_expense_paid" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_expense_stats" TO "anon";
GRANT ALL ON FUNCTION "public"."get_expense_stats" TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_expense_stats" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_expenses_by_category" TO "anon";
GRANT ALL ON FUNCTION "public"."get_expenses_by_category" TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_expenses_by_category" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_recurring_expenses_due" TO "anon";
GRANT ALL ON FUNCTION "public"."get_recurring_expenses_due" TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recurring_expenses_due" TO "service_role";

-- ====================================================================
-- 8. INSERT SAMPLE DATA (Optional)
-- ====================================================================

-- Insert sample expenses
INSERT INTO expenses (
    title, description, amount, category, expense_date, 
    branch_id, vendor_name, payment_method, status, created_by
) 
SELECT 
    'Office Supplies',
    'Monthly office supplies purchase including detergent and fabric softener',
    250.00,
    'Supplies',
    CURRENT_DATE - INTERVAL '2 days',
    b.id,
    'Supply Store Inc.',
    'Cash',
    'Paid',
    NULL
FROM branches b LIMIT 1;

INSERT INTO expenses (
    title, description, amount, category, expense_date, 
    branch_id, vendor_name, payment_method, status, is_recurring,
    recurring_frequency, next_due_date, created_by
) 
SELECT 
    'Monthly Rent',
    'Branch office rent payment',
    2500.00,
    'Rent',
    CURRENT_DATE - INTERVAL '1 month',
    b.id,
    'Property Management Co.',
    'Bank Transfer',
    'Paid',
    TRUE,
    'Monthly',
    CURRENT_DATE + INTERVAL '1 month',
    NULL
FROM branches b LIMIT 1;

-- ====================================================================
-- EXPENSES MODULE SETUP COMPLETE
-- ====================================================================

-- Test queries to verify installation:
-- SELECT * FROM view_expenses LIMIT 5;
-- SELECT * FROM get_expense_stats();
-- SELECT * FROM get_expenses_by_category();
-- SELECT * FROM get_recurring_expenses_due(30);