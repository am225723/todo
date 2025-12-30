-- Add recurrence columns to todo_tasks if they don't exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'todo_tasks'
        AND column_name = 'is_recurring'
    ) THEN
        ALTER TABLE todo_tasks ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'todo_tasks'
        AND column_name = 'recurrence_pattern'
    ) THEN
        ALTER TABLE todo_tasks ADD COLUMN recurrence_pattern JSONB;
    END IF;
END $$;
