-- Delete existing users (if any)
DELETE FROM todo_users WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');

-- Insert new users with properly hashed PINs
INSERT INTO todo_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (
  'thedoctor@drzelisko.com',
  'Douglas Zelisko',
  '$2b$12$D3SzkYG0wRwE9qQTKA/z2OWL129.W1Zb2f1pwfXwStBcZZEB.kEV2',
  'client',
  true,
  NOW()
);

INSERT INTO todo_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (
  'aleix@drzelisko.com',
  'Aleixander Puerta',
  '$2b$12$gXPjjaVGmxmLnfEFVqAKAOL4gfCfvwhCf334sFLTCXHueXLfFEuOa',
  'admin',
  true,
  NOW()
);

-- Verify users were created
SELECT email, full_name, role, is_active, LEFT(pin_hash, 20) as pin_hash_preview FROM todo_users WHERE email IN ('thedoctor@drzelisko.com', 'aleix@drzelisko.com');
