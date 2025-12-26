-- ====================================================
-- DEFINITIVE USER SETUP FOR TODO APP
-- Run this SQL in Supabase SQL Editor
-- ====================================================

-- Step 1: Check if tables exist
DO $$
BEGIN
    -- Create "TODO_USERS" table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'todo_users') THEN
        CREATE TABLE "TODO_USERS" (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255),
            pin_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'client',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE
        );
        RAISE NOTICE 'Created "TODO_USERS" table';
    ELSE
        RAISE NOTICE '"TODO_USERS" table already exists';
    END IF;
    
    -- Create "TODO_USER_PROFILES" table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'todo_user_profiles') THEN
        CREATE TABLE "TODO_USER_PROFILES" (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES "TODO_USERS"(id) ON DELETE CASCADE,
            display_name VARCHAR(255),
            bio TEXT,
            avatar_url TEXT,
            preferences JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created "TODO_USER_PROFILES" table';
    ELSE
        RAISE NOTICE '"TODO_USER_PROFILES" table already exists';
    END IF;
END $$;

-- Step 2: Clean up any existing test users
DELETE FROM "TODO_USER_PROFILES" WHERE user_id IN (
    SELECT id FROM "TODO_USERS" WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com')
);
DELETE FROM "TODO_USERS" WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');

-- Step 3: Create Douglas Zelisko (Client) with PIN 4207
INSERT INTO "TODO_USERS" (email, full_name, pin_hash, role, is_active, created_at, updated_at) VALUES (
  'thedoctor@drzelisko.com',
  'Douglas Zelisko',
  '$2b$12$D3SzkYG0wRwE9qQTKA/z2OWL129.W1Zb2f1pwfXwStBcZZEB.kEV2',
  'client',
  true,
  NOW(),
  NOW()
);

-- Step 4: Create Aleixander Puerta (Admin) with PIN 4539
INSERT INTO "TODO_USERS" (email, full_name, pin_hash, role, is_active, created_at, updated_at) VALUES (
  'aleix@drzelisko.com',
  'Aleixander Puerta',
  '$2b$12$gXPjjaVGmxmLnfEFVqAKAOL4gfCfvwhCf334sFLTCXHueXLfFEuOa',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Step 5: Create user profiles for display names
INSERT INTO "TODO_USER_PROFILES" (user_id, display_name, created_at, updated_at)
SELECT id, full_name, NOW(), NOW() 
FROM "TODO_USERS" 
WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');

-- Step 6: Verification - Show all users
SELECT '=== USERS CREATED ===' as info;
    
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    u.created_at,
    LEFT(u.pin_hash, 25) as pin_hash_preview,
    p.display_name as profile_name
FROM "TODO_USERS" u
LEFT JOIN "TODO_USER_PROFILES" p ON u.id = p.user_id
ORDER BY u.created_at DESC;