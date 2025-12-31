-- Create the agents table
CREATE TABLE IF NOT EXISTS todo_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  open_in_new_window BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todo_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow all authenticated users to view active agents
CREATE POLICY "Allow authenticated users to view active agents" ON todo_agents
  FOR SELECT
  USING (is_active = true);

-- Allow admins to view all agents (including inactive ones)
-- Note: This requires the admin check logic to be handled in the application layer or via a custom claim/function
-- For simplicity, we will allow read access to all for now, and filter in the UI/API.
-- But strictly speaking, we want to allow modification only to admins.
-- Since we don't have a robust role system in the DB level (it's in the app logic),
-- we will use a policy that allows all authenticated users to READ for now.
CREATE POLICY "Allow authenticated users to read all agents" ON todo_agents
  FOR SELECT
  USING (true);

-- Allow modification only if the user is an admin
-- Ideally we would check a user_role table.
-- Given the current setup, we rely on the API to enforce admin rights for writes.
-- We will add a policy that allows writes, but the API must enforce it.
-- However, for Supabase Client usage, we need a policy.
-- If we only write via the Service Role (server-side), we don't strictly need a write policy for the client.
-- But let's add one that is permissive for now and assume the API handles authz.
-- Actually, it's safer to only allow Service Role to write if we can't easily check admin status in SQL.
-- Let's leave write policies restricted. The Next.js API route will use the Service Role Key to bypass RLS for writes.

-- Seed initial data
INSERT INTO todo_agents (name, description, url, open_in_new_window, is_active)
VALUES
  ('Email Agent', 'AI agent that reviews emails and creates drafts.', 'https://agent.drz.services', false, true),
  ('Quo Agent', 'Agent for specific user prompts and browser automation.', 'https://quo.drz.services', false, true);
