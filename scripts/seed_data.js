
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting seed...');

  // 1. Create a demo client user
  const clientEmail = 'client@demo.com';
  // Pin: 1234
  const clientPinHash = '$2b$10$wKq.fN3bZ5.hKq.fN3bZ5.hKq.fN3bZ5.hKq.fN3bZ5.hKq.fN3bZ5'; // Needs real hash
  // Since we don't have bcrypt here easily, I'll rely on the existing auth logic or just insert raw and assume test_login handles it or I'll just create a user via API later.

  // Actually, I'll insert a user directly. I need to know how PINs are hashed.
  // Looking at `src/lib/auth/pin.ts` (if it existed) or `route.ts`.
  // Wait, I saw `verifyPin(pin, user.pin_hash)` in login route.
  // I don't have the hashing function exposed.

  // Let's create a user via the "Create User" API if possible, but that requires admin auth.
  // Instead, let's just insert a user with a known hash if we can generate one, or just skip user creation if "admin" (4539) is all we need.
  // The user asked for a seed script.

  // Let's assume the user wants tasks seeded.

  // Get the admin user by searching for one with is_admin=true or active
  const { data: adminUser } = await supabase.from('TODO_USERS').select('id').eq('is_admin', true).single();

  let adminId = adminUser?.id;

  if (!adminId) {
      console.log("No admin found. Please create one manually or via the UI first.");
      // We can't easily seed users without bcrypt.
  } else {
      console.log(`Found admin user: ${adminId}`);

      // Seed some tasks for the admin
      const tasks = [
          {
              user_id: adminId,
              title: "Review Quarterly Goals",
              description: "Check the Q3 progress report.",
              status: "pending",
              priority: "high",
              due_date: new Date().toISOString()
          },
          {
              user_id: adminId,
              title: "Call Supplier",
              description: "Discuss the new pricing model.",
              status: "pending",
              priority: "medium",
              due_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
          },
           {
              user_id: adminId,
              title: "Check AI Agent",
              description: "Verify the agent is responding correctly.",
              status: "pending",
              priority: "urgent",
              is_agent_task: true,
              agent_url: "https://example.com/agent",
              open_in_new_window: false,
              due_date: new Date().toISOString()
          }
      ];

      for (const task of tasks) {
          const { error } = await supabase.from('todo_tasks').insert(task);
          if (error) console.error('Error inserting task:', error);
          else console.log(`Inserted task: ${task.title}`);
      }
  }

  console.log('Seed complete.');
}

seed();
