import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import { Database } from '@/types';

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Public/Authenticated read access
    const { data: agents, error } = await supabase
      .from('todo_agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Auth Check
    const authClient = createAuthClient();
    const { data: { user: authUser }, error: authError } = await authClient.auth.getUser();

    if (authError || !authUser || !authUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Admin Check
    // We check the TODO_USERS table for the email to see if they are an admin
    // We use the service client for this query to ensure we can read the users table reliably
    const { data: userData, error: userError } = await (supabase
        .from('TODO_USERS') as any)
        .select('role, is_admin')
        .eq('email', authUser.email)
        .single();

    if (userError || !userData) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    const isAdmin = userData.role === 'admin' || userData.is_admin === true;
    if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 3. Logic
    const body = await request.json();
    const { name, description, url, open_in_new_window } = body;

    // Validation
    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const { data: agent, error } = await (supabase
      .from('todo_agents') as any)
      .insert({
        name,
        description,
        url,
        open_in_new_window: open_in_new_window || false,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}
