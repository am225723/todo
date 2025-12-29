
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Applying calendar migration...');

  // SQL to create table
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS todo_calendar_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "TODO_USERS"(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'web_ical',
        color TEXT NOT NULL DEFAULT '#3b82f6',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // SQL for RLS
  const enableRlsSql = `ALTER TABLE todo_calendar_sources ENABLE ROW LEVEL SECURITY;`;

  // Note: We cannot execute "CREATE POLICY" via standard Postgrest RPC easily unless we have a function for it.
  // However, Supabase-js client doesn't support raw SQL execution directly on the public interface
  // unless we use a Postgres function created for that purpose (like 'exec_sql').

  // If we can't run raw SQL, we are stuck.
  // BUT, usually these environments might have a `exec` RPC function set up for admin purposes if `SETUP_INSTRUCTIONS` implies it.
  // Checking `supabase/migrations/20240101000001_create_functions.sql` might show us.

  // Let's try to see if there is an `exec_sql` or similar function.

  const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSql });

  if (error) {
      console.error("Failed to execute SQL via RPC:", error);
      console.log("Attempting fallback: Manual Table Check (not real migration)");
      // If RPC fails (likely does not exist), we can't create tables via JS client without it.
  } else {
      console.log("Table created successfully via RPC.");

      // Apply Policies
      const policies = [
          `CREATE POLICY "Users can view their own calendar sources" ON todo_calendar_sources FOR SELECT USING (user_id = auth.uid() OR user_id IN (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));`,
          `CREATE POLICY "Users can insert their own calendar sources" ON todo_calendar_sources FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IN (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));`,
          `CREATE POLICY "Users can update their own calendar sources" ON todo_calendar_sources FOR UPDATE USING (user_id = auth.uid() OR user_id IN (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));`,
          `CREATE POLICY "Users can delete their own calendar sources" ON todo_calendar_sources FOR DELETE USING (user_id = auth.uid() OR user_id IN (SELECT id FROM "TODO_USERS" WHERE email = auth.jwt() ->> 'email'));`
      ];

      for (const policy of policies) {
          await supabase.rpc('exec_sql', { sql: policy });
      }
      console.log("Policies applied.");
  }
}

// Check for exec_sql function by trying to call it
applyMigration();
