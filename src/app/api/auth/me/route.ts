import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ user: null, profile: null, isAdmin: false }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing Supabase Service Role credentials in /api/auth/me");
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    // Use Service Role Key to bypass RLS for fetching user details
    const adminClient = createSupabaseClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch Profile
    const { data: profile, error: profileError } = await adminClient
      .from('TODO_USER_PROFILES')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch Admin Status
    const { data: dbUser, error: dbUserError } = await adminClient
        .from('TODO_USERS')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    const isAdmin = dbUser?.is_admin || false;

    return NextResponse.json({
        user,
        profile,
        isAdmin
    });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
