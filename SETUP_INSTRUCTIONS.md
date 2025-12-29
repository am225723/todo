# Setup Instructions

## 1. SQL Setup

Run the following SQL commands in your Supabase SQL Editor to ensure the `todo_tasks` table exists and has the necessary columns.

```sql
-- Create todo_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES "TODO_USERS"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    is_agent_task BOOLEAN DEFAULT FALSE,
    agent_url TEXT,
    open_in_new_window BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns for file uploads if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todo_tasks' AND column_name = 'attachment_url') THEN
        ALTER TABLE todo_tasks ADD COLUMN attachment_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todo_tasks' AND column_name = 'attachment_type') THEN
        ALTER TABLE todo_tasks ADD COLUMN attachment_type TEXT; -- 'image' or 'pdf'
    END IF;
END $$;
```

## 2. Calendar Setup (New)

To enable the Calendar feature, you **must** run the SQL contained in the `calendar_setup.sql` file in your Supabase SQL Editor.

This creates the `todo_calendar_sources` table and sets up the necessary security policies.

## 3. Storage Setup

1.  Go to the **Storage** section in your Supabase Dashboard.
2.  Create a new bucket named `task-attachments`.
3.  Make sure the bucket is **Public** (or configure policies if private).
4.  Add the following policies for the `task-attachments` bucket:

```sql
-- Enable RLS on objects (usually enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'task-attachments' );

-- Allow users to view their own files (or all files if you prefer)
-- For simplicity, allowing public read access if the bucket is public.
-- If the bucket is private:
CREATE POLICY "Users can view task attachments"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'task-attachments' );
```

## 4. Edge Functions

No new Edge Functions are required for this update. The logic is handled within the Next.js API Routes (`src/app/api/tasks/route.ts`).
