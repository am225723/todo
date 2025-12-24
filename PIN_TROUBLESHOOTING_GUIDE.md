# PIN Login Troubleshooting Guide

## 🔍 Issue: PIN Shows as Incorrect

I've identified that the PIN verification logic is working correctly, but the users might not exist in the database or their PIN hashes are incorrect. Here's a step-by-step fix:

## 📋 Step-by-Step Solution

### Step 1: Verify Database State
Run this SQL in Supabase SQL Editor to check current users:

```sql
-- Check if users exist
SELECT 
    email,
    full_name,
    role,
    is_active,
    created_at,
    LEFT(pin_hash, 20) as pin_hash_preview
FROM TODO_users 
WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com')
ORDER BY created_at;

-- Count all users
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM TODO_users;
```

### Step 2: Recreate Users with Fresh PINs
If the users don't exist or have wrong hashes, run this SQL:

```sql
-- Delete any existing users
DELETE FROM TODO_users WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');

-- Insert fresh users with correct PIN hashes
INSERT INTO TODO_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (
  'thedoctor@drzelisko.com',
  'Douglas Zelisko',
  '$2b$12$D3SzkYG0wRwE9qQTKA/z2OWL129.W1Zb2f1pwfXwStBcZZEB.kEV2',
  'client',
  true,
  NOW()
);

INSERT INTO TODO_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (
  'aleix@drzelisko.com',
  'Aleixander Puerta',
  '$2b$12$gXPjjaVGmxmLnfEFVqAKAOL4gfCfvwhCf334sFLTCXHueXLfFEuOa',
  'admin',
  true,
  NOW()
);

-- Verify creation
SELECT email, full_name, role, is_active FROM TODO_users 
WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');
```

### Step 3: Test with Debug Endpoint
Use the debug login endpoint to see detailed logs:

**Temporary frontend test:**
```javascript
// In browser console on login page
fetch('/api/auth/login-debug', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pin: '4207' })
}).then(r => r.json()).then(console.log);
```

### Step 4: Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Settings → Logs
3. Look for Edge Function logs
4. Check for any error messages

## 🔧 Alternative: Create New Users via Admin Panel

If the SQL approach doesn't work:

1. **Access admin panel** (if you can login with any PIN)
2. **Create new users** manually with these details:
   - Email: `test@drzelisko.com`, PIN: `1234`, Role: `client`
   - Email: `admin@drzelisko.com`, PIN: `5678`, Role: `admin`

## 🧪 Test PINs After Fix

Try these PINs:
- `4207` → Douglas Zelisko (Client)
- `4539` → Aleixander Puerta (Admin)

## 🚨 Common Issues & Solutions

### Issue: "No active users found"
**Solution:** Users don't exist or are inactive → Run Step 2 SQL

### Issue: "Invalid PIN" 
**Solution:** PIN hashes are wrong → Recreate users with Step 2

### Issue: Database connection error
**Solution:** Check Supabase credentials in environment variables

### Issue: Edge Function timeout
**Solution:** bcrypt operations might be slow in Edge Runtime

## 📞 If Still Not Working

1. **Check Supabase RLS policies:**
```sql
-- Disable RLS temporarily for testing
ALTER TABLE TODO_users DISABLE ROW LEVEL SECURITY;
```

2. **Verify table name:**
```sql
-- Make sure table exists with correct name
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'TODO_users';
```

3. **Check service role permissions:**
Ensure `SUPABASE_SERVICE_ROLE_KEY` has proper permissions

## ✅ Success Criteria

- ✅ SQL queries return 2 active users
- ✅ Debug endpoint shows detailed logs
- ✅ Login with PIN 4207 works for Douglas
- ✅ Login with PIN 4539 works for Aleixander

Run through these steps systematically and the login should work! 🚀