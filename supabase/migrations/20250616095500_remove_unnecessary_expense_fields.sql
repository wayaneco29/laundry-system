-- ====================================================================
-- Remove Unnecessary Expense Fields - Migration
-- Remove receipt_url and reference_number fields from expenses table
-- ====================================================================

-- First, drop the view that depends on these columns
DROP VIEW IF EXISTS "public"."view_expenses";

-- Drop the columns from the expenses table
ALTER TABLE "public"."expenses" 
DROP COLUMN IF EXISTS "receipt_url",
DROP COLUMN IF EXISTS "reference_number";

-- Recreate the view_expenses view without the dropped columns
CREATE OR REPLACE VIEW "public"."view_expenses" AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.amount,
    e.category,
    e.expense_date,
    e.branch_id,
    b.name as branch_name,
    e.vendor_name,
    e.vendor_contact,
    e.payment_method,
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

-- Update the upsert_expense function to remove the dropped parameters
CREATE OR REPLACE FUNCTION "public"."upsert_expense"(
    "p_title" TEXT,
    "p_amount" NUMERIC,
    "p_category" "public"."expense_category_enum",
    "p_expense_id" UUID DEFAULT NULL,
    "p_description" TEXT DEFAULT NULL,
    "p_expense_date" DATE DEFAULT CURRENT_DATE,
    "p_branch_id" UUID DEFAULT NULL,
    "p_vendor_name" TEXT DEFAULT NULL,
    "p_vendor_contact" TEXT DEFAULT NULL,
    "p_payment_method" TEXT DEFAULT 'Cash',
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
            title, description, amount, category, expense_date,
            branch_id, vendor_name, vendor_contact, payment_method,
            is_recurring, recurring_frequency, next_due_date, status, notes,
            created_by, updated_by
        ) VALUES (
            p_title, p_description, p_amount, p_category, p_expense_date,
            p_branch_id, p_vendor_name, p_vendor_contact, p_payment_method,
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
            branch_id = p_branch_id,
            vendor_name = p_vendor_name,
            vendor_contact = p_vendor_contact,
            payment_method = p_payment_method,
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

-- ====================================================================
-- Migration Complete
-- Removed: receipt_url, reference_number fields
-- Updated: view_expenses, upsert_expense function
-- ====================================================================