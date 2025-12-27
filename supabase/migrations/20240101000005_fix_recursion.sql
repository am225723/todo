-- Create a secure function to check admin status
-- This function runs with the privileges of the creator (SECURITY DEFINER)
-- allowing it to bypass RLS on TODO_USERS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM "TODO_USERS"
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Update TODO_USERS Policies
DROP POLICY IF EXISTS "Admins can view all users" ON "TODO_USERS";
CREATE POLICY "Admins can view all users" ON "TODO_USERS"
    FOR SELECT USING (check_is_admin() = true);

-- Update TODO_USER_PROFILES Policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON "TODO_USER_PROFILES";
CREATE POLICY "Admins can view all profiles" ON "TODO_USER_PROFILES"
    FOR SELECT USING (check_is_admin() = true);

-- Update todo_tasks Policies
DROP POLICY IF EXISTS "Admins can manage all tasks" ON "todo_tasks";
CREATE POLICY "Admins can manage all tasks" ON "todo_tasks"
    FOR ALL USING (check_is_admin() = true);
