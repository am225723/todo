
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncPasswordsAndIds() {
  const usersToSync = [
    { email: 'thedoctor@drzelisko.com', pin: '4207' },
    { email: 'aleix@drzelisko.com', pin: '4539' }
  ];

  for (const u of usersToSync) {
    const paddedPin = u.pin + "00"; // Pad to 6 chars
    console.log(`\nProcessing ${u.email}...`);

    // 1. Get Auth User
    let authId = null;
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) { console.error("List Error:", listError); continue; }

    let authUser = users.find(user => user.email === u.email);

    if (authUser) {
        console.log(`Auth User found: ${authUser.id}`);
        authId = authUser.id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            authId, { password: paddedPin, email_confirm: true }
        );
        if (updateError) console.error(`Failed to update password for ${u.email}:`, updateError);
        else console.log(`Password updated (padded).`);
    } else {
        console.log(`Auth User NOT found. Creating...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: paddedPin,
            email_confirm: true
        });
        if (createError) {
            console.error(`Failed to create ${u.email}:`, createError);
            continue;
        }
        authId = newUser.user.id;
        console.log(`Auth User created: ${authId}`);
    }

    // 2. Sync with TODO_USERS
    const { data: dbUser } = await supabase.from('TODO_USERS').select('*').eq('email', u.email).single();

    if (dbUser) {
        console.log(`DB User found: ${dbUser.id}`);
        if (dbUser.id !== authId) {
            console.log(`MISMATCH! Auth: ${authId} vs DB: ${dbUser.id}. Migrating...`);

            // a. Update OLD row email to temp
            const tempEmail = `temp_${Date.now()}_${u.email}`;
            await supabase.from('TODO_USERS').update({ email: tempEmail }).eq('id', dbUser.id);
            console.log("Renamed old DB user email to temp.");

            // b. Insert NEW row with correct email and Auth ID
            const { id, ...userData } = dbUser; // Exclude old ID
            const { error: insError } = await supabase.from('TODO_USERS').insert({
                ...userData,
                id: authId,
                email: u.email
            });

            if (insError) {
                console.error("Insert new DB user failed:", insError);
                // Rollback email name?
                await supabase.from('TODO_USERS').update({ email: u.email }).eq('id', dbUser.id);
                continue;
            }
            console.log("Inserted new DB User row.");

            // c. Update FKs
            // Tasks
            const { error: taskError } = await supabase.from('todo_tasks')
                .update({ user_id: authId })
                .eq('user_id', dbUser.id);
            if (taskError) console.error("Task migration error:", taskError);
            else console.log("Tasks migrated.");

            // Profiles
            const { error: profError } = await supabase.from('TODO_USER_PROFILES')
                .update({ user_id: authId })
                .eq('user_id', dbUser.id);
            if (profError) console.error("Profile migration error:", profError);
            else console.log("Profiles migrated.");

            // Notification Logs
            const { error: notifError } = await supabase.from('todo_notification_logs')
                .update({ user_id: authId })
                .eq('user_id', dbUser.id);
            if (notifError) console.error("Notification Logs migration error:", notifError);

            // d. Delete OLD row
            const { error: delError } = await supabase.from('TODO_USERS').delete().eq('id', dbUser.id);
            if (delError) console.error("Failed to delete old DB user:", delError);
            else console.log("Old DB user deleted. Migration complete.");

        } else {
            console.log("IDs match. Good.");
        }
    } else {
        console.log("DB User NOT found. Creating entry...");
        await supabase.from('TODO_USERS').insert({
            id: authId,
            email: u.email,
            is_active: true,
        });
        console.log("DB User created.");
    }
  }
}

syncPasswordsAndIds();
