CREATE TABLE IF NOT EXISTS todo_calendar_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "TODO_USERS"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'web_ical', -- 'web_ical', 'google'
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE todo_calendar_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar sources"
    ON todo_calendar_sources FOR SELECT
    USING (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert their own calendar sources"
    ON todo_calendar_sources FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Users can update their own calendar sources"
    ON todo_calendar_sources FOR UPDATE
    USING (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Users can delete their own calendar sources"
    ON todo_calendar_sources FOR DELETE
    USING (user_id = (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));
