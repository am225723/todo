
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { hashPin } from '@/lib/auth/pin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin
  // Use Service Client to verify admin status safely avoiding RLS recursion risks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfiguration: Missing Service Role Key" }, { status: 500 });
  }

  const serviceClient = createServiceClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
  );

  const { data: requester } = await serviceClient
    .from('TODO_USERS')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!requester || !requester.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: users, error } = await serviceClient
    .from('TODO_USERS')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch profiles to map display names
  const { data: profiles } = await serviceClient
    .from('TODO_USER_PROFILES')
    .select('user_id, display_name');

  const usersWithProfiles = users.map(u => {
      const profile = profiles?.find(p => p.user_id === u.id);
      return {
          ...u,
          display_name: profile?.display_name || u.full_name
      };
  });

  return NextResponse.json({ users: usersWithProfiles });
}

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server misconfiguration: Missing Service Role Key" }, { status: 500 });
    }

    const serviceClient = createServiceClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
    );

    // Check admin
    const { data: requester } = await serviceClient
      .from('TODO_USERS')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!requester || !requester.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { email, display_name, pin } = body;

        if (!email || !display_name || !pin) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Create Supabase Auth User
        // Use pin + "00" as the password to match the login logic
        const { data: authUser, error: createError } = await serviceClient.auth.admin.createUser({
            email,
            password: pin + "00",
            email_confirm: true,
            user_metadata: { display_name }
        });

        if (createError) {
             return NextResponse.json({ error: createError.message }, { status: 400 });
        }

        if (!authUser.user) {
             return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
        }

        // 2. Hash PIN
        const pinHash = await hashPin(pin);

        // 3. Create TODO_USERS entry
        const { error: dbError } = await serviceClient
            .from('TODO_USERS')
            .insert({
                id: authUser.user.id,
                email,
                pin_hash: pinHash,
                is_active: true,
                is_admin: false,
                role: 'client',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (dbError) {
            // Attempt to cleanup Auth user if DB insert fails
            await serviceClient.auth.admin.deleteUser(authUser.user.id);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        // 4. Create Profile
        const { error: profileError } = await serviceClient
            .from('TODO_USER_PROFILES')
            .insert({
                user_id: authUser.user.id,
                display_name
            });

        if (profileError) {
             console.error("Profile creation failed", profileError);
        }

        return NextResponse.json({ success: true, user: authUser.user });

    } catch (e: any) {
        console.error("Create user error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
