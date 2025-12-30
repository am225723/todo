-- Fix Foreign Key Constraint on todo_tasks table
-- The issue is that todo_tasks.user_id was likely referencing auth.users(id)
-- but the application uses custom TODO_USERS table for user management.

DO $$
BEGIN
    -- Check if the constraint exists and drop it
    -- We try to drop the constraint by name if we know it, or find it.
    -- Common name pattern: todo_tasks_user_id_fkey

    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'todo_tasks_user_id_fkey'
        AND table_name = 'todo_tasks'
    ) THEN
        ALTER TABLE todo_tasks DROP CONSTRAINT todo_tasks_user_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint todo_tasks_user_id_fkey';
    END IF;

    -- Add the correct foreign key constraint referencing TODO_USERS(id)
    ALTER TABLE todo_tasks
    ADD CONSTRAINT todo_tasks_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES "TODO_USERS"(id)
    ON DELETE CASCADE;

    RAISE NOTICE 'Added correct foreign key constraint referencing TODO_USERS(id)';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;

-- Verify the column type matches
-- TODO_USERS.id is UUID, so todo_tasks.user_id must be UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'todo_tasks'
        AND column_name = 'user_id'
        AND data_type != 'uuid'
    ) THEN
        RAISE NOTICE 'WARNING: todo_tasks.user_id is not UUID. Converting...';
        ALTER TABLE todo_tasks
        ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    END IF;
END $$;
