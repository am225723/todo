-- 1. Create table for Push Subscriptions
CREATE TABLE IF NOT EXISTS todo_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "TODO_USERS"(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    keys_p256dh TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure unique subscription per endpoint to avoid duplicates
    UNIQUE(endpoint)
);

-- 2. Enable RLS
ALTER TABLE todo_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Policies for todo_push_subscriptions

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own push subscriptions"
    ON todo_push_subscriptions FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
    ON todo_push_subscriptions FOR SELECT
    USING (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete their own push subscriptions"
    ON todo_push_subscriptions FOR DELETE
    USING (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));


-- 4. Fix RLS for todo_notification_logs
-- The error 42501 happened because the system tried to insert logs without proper RLS or using anon key.
-- We are switching to Admin Client for system logs, but we should still allow users to read their logs.

-- Check if policy exists and drop it to recreate (or just create if not exists, but safe to drop)
DROP POLICY IF EXISTS "Users can view their own notification logs" ON todo_notification_logs;
DROP POLICY IF EXISTS "Users can insert their own notification logs" ON todo_notification_logs;

-- Allow users to view their own logs
CREATE POLICY "Users can view their own notification logs"
    ON todo_notification_logs FOR SELECT
    USING (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));

-- Allow users to insert their own logs (if client-side logging is ever needed)
CREATE POLICY "Users can insert their own notification logs"
    ON todo_notification_logs FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));
