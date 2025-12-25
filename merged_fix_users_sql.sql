-- Complete user setup for merged login fix
-- Run this in Supabase SQL Editor after merging the PR

-- Delete existing users (clean slate)
DELETE FROM todo_users WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');
DELETE FROM todo_user_profiles WHERE user_id IN (
  SELECT id FROM todo_users WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com')
);

-- Insert Douglas Zelisko (Client) with PIN 4207
INSERT INTO todo_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (
  'thedoctor@drzelisko.com',
  'Douglas Zelisko',
  '$2b$12$D3SzkYG0wRwE9qQTKA/z2OWL129.W1Zb2f1pwfXwStBcZZEB.kEV2',
  'client',
  true,
  NOW()
);

-- Insert Aleixander Puerta (Admin) with PIN 4539
INSERT INTO todo_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (
  'aleix@drzelisko.com',
  'Aleixander Puerta',
  '$2b$12$gXPjjaVGmxmLnfEFVqAKAOL4gfCfvwhCf334sFLTCXHueXLfFEuOa',
  'admin',
  true,
  NOW()
);

-- Create user profiles for display names
INSERT INTO todo_user_profiles (user_id, display_name, created_at, updated_at)
SELECT id, full_name, NOW(), NOW() 
FROM todo_users
WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');

-- Verify everything was created correctly
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.is_active,
    p.display_name as profile_display_name,
    LEFT(u.pin_hash, 20) as pin_hash_preview
FROM todo_users u
LEFT JOIN todo_user_profiles p ON u.id = p.user_id
WHERE u.email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com')
ORDER BY u.created_at;