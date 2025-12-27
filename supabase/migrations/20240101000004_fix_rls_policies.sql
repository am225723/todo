
-- Enable RLS
ALTER TABLE "TODO_USERS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TODO_USER_PROFILES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "todo_tasks" ENABLE ROW LEVEL SECURITY;

-- TODO_USERS Policies
CREATE POLICY "Users can view own data" ON "TODO_USERS"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON "TODO_USERS"
    FOR SELECT USING (
        (SELECT is_admin FROM "TODO_USERS" WHERE id = auth.uid()) = true
    );

-- TODO_USER_PROFILES Policies
CREATE POLICY "Users can view own profile" ON "TODO_USER_PROFILES"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON "TODO_USER_PROFILES"
    FOR SELECT USING (
        (SELECT is_admin FROM "TODO_USERS" WHERE id = auth.uid()) = true
    );

-- todo_tasks Policies
CREATE POLICY "Users can manage own tasks" ON "todo_tasks"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tasks" ON "todo_tasks"
    FOR ALL USING (
        (SELECT is_admin FROM "TODO_USERS" WHERE id = auth.uid()) = true
    );
