# Staff Multi-Branch Assignment Implementation

This document describes the changes made to support assigning multiple branches to staff members.

## Database Changes

### 1. Run the SQL Migration

Execute the migration file in your Supabase database:

```bash
# Using Supabase CLI (recommended - already in migrations folder)
supabase db push

# Or run the specific migration file
# Located at: supabase/migrations/20251026114053_update_add_staff_and_view.sql
```

This migration will:
1. **Drop old `add_new_staff` function** - No longer needed as logic moved to application code
2. **Update `view_staffs`** to aggregate multiple `app_users` rows:
   - `branch_ids`: UUID[] - Array of all assigned branch IDs
   - `branch_names`: text[] - Array of corresponding branch names
   - Groups multiple app_users rows per staff into single row with arrays
3. **Update `view_app_users`** to aggregate multiple rows per user:
   - `branch_ids`: UUID[] - Array of all assigned branch IDs
   - `branch_names`: text[] - Array of branch names
   - Groups multiple app_users rows per user_id into single row with arrays

## What Was Changed

### 1. **Database Schema: Multiple `app_users` Rows**
**Important Architecture Change:**
- Each staff can have **multiple rows** in the `app_users` table (one per branch)
- `staff_branches` table is **NOT used**
- Example: Staff assigned to 3 branches = 3 rows in `app_users` with same `user_id`

### 2. **Database View: `view_staffs`**
Aggregates multiple `app_users` rows per staff:
- Uses `array_agg()` to collect all branch IDs and names from multiple app_users rows
- Groups by staff_id to show single row per staff with branch arrays

### 3. **Database View: `view_app_users`**
Aggregates multiple `app_users` rows per user:
- Uses `array_agg()` to collect all branch IDs and names
- Groups by user_id to show single row per user with branch arrays

### 4. **Add Staff Modal** (`src/app/(main)/staffs/components/add-staff-modal.tsx`)
- Changed from single branch selection to multi-select
- Added `isUpdate` prop to differentiate between add and edit modes
- Disabled non-editable fields in update mode:
  - Username (read-only)
  - Password (read-only)
  - Employment Date (read-only)
  - Role (read-only)
- Editable fields in update mode:
  - First Name, Middle Name, Last Name
  - Phone Number
  - Address
  - Branches (multi-select)

### 5. **Add New Staff Action** (`src/app/actions/staff/add_new_staff.ts`)
- Now accepts `p_branch_ids` array instead of single `p_branch_id`
- Inserts **multiple rows** into `app_users` table (one per selected branch)
- Each row has same user_id, username, role but different branch_id
- Example: 3 branches selected = 3 rows in app_users

### 6. **Update Staff Action** (`src/app/actions/staff/update_staff.ts`)
- Only updates editable fields in `staffs` table (name, phone, address)
- Deletes ALL existing `app_users` rows for that staff
- Inserts NEW `app_users` rows (one per selected branch)
- Preserves username, password, role from original data

### 7. **TypeScript Types** (`src/app/types/database.ts`)
- Updated `StaffView` interface to include:
  - `branch_ids: UUID[]` - Array of assigned branches
  - `branch_names: string[]` - Array of branch names

### 8. **Main Staff Page** (`src/app/(main)/staffs/components/main.tsx`)
- Added `isUpdate` state to track add vs edit mode
- Changed `branch_id` to `branch_ids` array in initial values
- Updated `onEdit` handler to pass `branch_ids` from view
- Passes `isUpdate` prop to modal

### 9. **User Context Type** (`src/app/context/UserContext/index.tsx`)
- Updated `UserType` to include:
  - `branch_ids: string[]` - Array of all assigned branches
  - `branch_names: string[]` - Array of branch names
- Updated references to use `user.branch_ids[0]` for first/default branch

### 10. **Staff Shift Provider** (`src/app/components/providers/staff-shift-provider.tsx`)
- Updated to use `user.branch_ids[0]` and `user.branch_names[0]` for default branch

## Important: Architecture - Multiple Rows in app_users

### How It Works
- **`staff_branches` table is NOT used** ❌
- Instead, staff with multiple branches have **multiple rows in `app_users`**
- Each row has the same `user_id` but different `branch_id`

### Example
```sql
-- Staff assigned to 3 branches:
app_users table:
user_id              | username | branch_id           | role_id
---------------------|----------|---------------------|----------
abc-123-def          | john_doe | branch-A            | role-1
abc-123-def          | john_doe | branch-B            | role-1
abc-123-def          | john_doe | branch-C            | role-1

-- View aggregates into:
view_app_users / view_staffs:
user_id     | username | branch_ids                        | branch_names
------------|----------|-----------------------------------|------------------
abc-123-def | john_doe | [branch-A, branch-B, branch-C]    | [Main, Downtown, Uptown]
```

### Both Views Use Same Approach
- **`view_staffs`**: Aggregates multiple `app_users` rows per staff
- **`view_app_users`**: Aggregates multiple `app_users` rows per user
- Both return `branch_ids[]` and `branch_names[]` arrays

## How It Works

### Adding a New Staff
1. User selects multiple branches from dropdown (e.g., 3 branches)
2. System creates auth user via Supabase Auth
3. Inserts **1 record** into `staffs` table
4. Inserts **3 records** into `app_users` table (one per branch, same user_id)
5. Views aggregate these 3 rows into single row with arrays

### Updating an Existing Staff
1. User can only edit: First Name, Middle Name, Last Name, Phone, Address, and Branches
2. System updates the `staffs` table with new info
3. **Deletes ALL existing `app_users` records** for that staff
4. **Inserts NEW `app_users` records** (one per selected branch)
5. Views re-aggregate to show updated branch arrays

### Data Flow
```
app_users table (3 rows for same user_id)
  ↓
  view_staffs / view_app_users (GROUP BY user_id)
  ↓
  Returns single row with branch_ids: UUID[] array
  ↓
  Modal displays as multi-select dropdown
  ↓
  On save: Delete old app_users rows → Insert new app_users rows
```

## Testing Checklist

- [ ] Run the SQL migration file: `supabase db push`
- [ ] Test adding a new staff with 3 branches
- [ ] Verify `app_users` table has 3 rows with same user_id but different branch_id
- [ ] Query `view_app_users` - should see single row with `branch_ids` array of 3 items
- [ ] Query `view_staffs` - should see single row with `branch_ids` array of 3 items
- [ ] Test editing an existing staff
- [ ] Verify only allowed fields are editable (name, phone, address, branches)
- [ ] Test changing branch assignments from 3 to 2 branches
- [ ] Verify old 3 `app_users` rows are deleted and 2 new rows inserted
- [ ] Check authentication still works with multiple `app_users` rows

## Files Modified

1. **supabase/migrations/20251026114053_update_add_staff_and_view.sql** - Database migration
   - Drops old `add_new_staff` function
   - Updates `view_staffs` to aggregate multiple `app_users` rows
   - Updates `view_app_users` to aggregate multiple `app_users` rows

2. **src/app/(main)/staffs/components/add-staff-modal.tsx** - Multi-branch selection and update mode

3. **src/app/actions/staff/add_new_staff.ts** - Inserts multiple `app_users` rows (one per branch)

4. **src/app/actions/staff/update_staff.ts** - Deletes and re-inserts `app_users` rows

5. **src/app/actions/staff/index.ts** - Added export for updateStaff

6. **src/app/(main)/staffs/components/main.tsx** - Branch_ids array handling and isUpdate mode

7. **src/app/types/database.ts** - StaffView with branch_ids arrays

8. **src/app/context/UserContext/index.tsx** - UserType with branch_ids and branch_names arrays

9. **src/app/components/providers/staff-shift-provider.tsx** - Uses branch_ids[0] for first branch

## Files Created

1. **STAFF_MULTI_BRANCH_UPDATE.md** - This documentation file
