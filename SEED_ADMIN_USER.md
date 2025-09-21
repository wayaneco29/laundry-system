# Admin User Seed Setup Guide

This guide will help you create an admin user for your laundry system with all required dependencies.

## 🚀 Quick Setup

### Step 1: Create Auth User (Required First!)

You **MUST** create an authentication user first through one of these methods:

#### Option A: Supabase Dashboard (Recommended for setup)
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add user"**
4. Enter:
   - **Email**: `admin@laundry-system.com`
   - **Password**: Your desired password
   - **Auto Confirm User**: ✅ Check this
5. Copy the generated **User ID** (UUID)

#### Option B: Supabase Auth API
```bash
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@laundry-system.com",
    "password": "your_secure_password",
    "email_confirm": true,
    "user_metadata": {
      "role": "admin"
    }
  }'
```

### Step 2: Update Seed Script

1. Open `supabase/seed.sql`
2. Find line 23 and replace the UUID with your actual auth user ID:
   ```sql
   admin_user_id UUID := 'YOUR_ACTUAL_AUTH_USER_ID_HERE';  -- ← UPDATE THIS!
   ```

### Step 3: Run the Seed Script

#### Option A: Using Supabase CLI
```bash
npx supabase db seed
```

#### Option B: Using SQL Editor in Dashboard
1. Go to Supabase Dashboard > **SQL Editor**
2. Copy and paste the contents of `supabase/seed.sql`
3. Click **"Run"**

#### Option C: Using psql
```bash
psql "postgresql://postgres:[password]@[host]:[port]/postgres" -f supabase/seed.sql
```

## 📋 What Gets Created

The seed script creates:

### 1. Main Branch
- **Name**: Main Branch - Headquarters
- **Address**: 123 Main Street, Business District, City
- **Description**: Primary headquarters branch for admin operations

### 2. ADMIN Role
- **Name**: ADMIN
- **Purpose**: Full system access and administration privileges

### 3. App User Record
- **Username**: admin
- **Email**: admin@laundry-system.com
- **Role**: ADMIN
- **Branch**: Main Branch - Headquarters

### 4. Staff Record
- **Name**: System Administrator
- **Phone**: +1234567890
- **Employment Date**: Current date

## 🔍 Verification

After running the seed script, you can verify the setup:

### Check the created records:
```sql
-- View the complete admin user setup
SELECT * FROM public.view_app_users 
WHERE email = 'admin@laundry-system.com';

-- Check individual tables
SELECT * FROM public.branches WHERE name = 'Main Branch - Headquarters';
SELECT * FROM public.roles WHERE name = 'ADMIN';
SELECT * FROM public.app_users WHERE username = 'admin';
SELECT * FROM public.staffs WHERE first_name = 'System';
```

### Test Login
1. Go to your application's login page
2. Enter:
   - **Email**: `admin@laundry-system.com`
   - **Password**: The password you set when creating the auth user
3. You should be logged in with admin privileges

## 🔧 Customization

You can modify the seed script to customize:

- **Branch details** (lines 44-47): Name, description, address
- **Admin contact info** (lines 137-143): Name, phone, address
- **User credentials** (lines 102-103): Username, email

## 🚨 Important Notes

1. **Auth User Required**: The auth user MUST exist before running the seed script
2. **Update UUID**: Don't forget to update the `admin_user_id` with your actual auth user ID
3. **Production Security**: In production, use strong passwords and proper authentication flows
4. **Re-runnable**: The script is safe to run multiple times (uses `ON CONFLICT` clauses)

## 🐛 Troubleshooting

### Error: "User ID not found"
- Ensure you created the auth user first
- Verify the UUID in the seed script matches your auth user ID

### Error: "Permission denied"
- Make sure you're using the service role key or have admin privileges
- Check your RLS policies if enabled

### Error: "Relation does not exist"
- Run the database migrations first: `npx supabase db push`
- Ensure all required tables are created

## 📝 Next Steps

After successful setup:

1. **Test the admin login** to ensure everything works
2. **Create additional branches** if needed
3. **Add more staff users** through the application interface
4. **Configure system settings** through the admin panel

---

**✅ Your admin user is now ready to use!**