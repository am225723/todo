import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import { Database } from '@/types';

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function checkAdmin() {
    const authClient = createAuthClient();
    const { data: { user: authUser }, error: authError } = await authClient.auth.getUser();

    if (authError || !authUser || !authUser.email) {
      return { authorized: false, status: 401, message: 'Unauthorized' };
    }

    const { data: userData, error: userError } = await (supabase
        .from('TODO_USERS') as any)
        .select('role, is_admin')
        .eq('email', authUser.email)
        .single();

    if (userError || !userData) {
        return { authorized: false, status: 403, message: 'User profile not found' };
    }

    const isAdmin = userData.role === 'admin' || userData.is_admin === true;
    if (!isAdmin) {
        return { authorized: false, status: 403, message: 'Forbidden: Admins only' };
    }

    return { authorized: true };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdmin();
    if (!authCheck.authorized) {
        return NextResponse.json({ error: authCheck.message }, { status: authCheck.status || 403 });
    }

    const { id } = params;
    const body = await request.json();

    // Sanitize body to match Agent update type
    const updateData = {
      name: body.name,
      description: body.description,
      url: body.url,
      open_in_new_window: body.open_in_new_window,
      is_active: body.is_active,
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key]);

    const { data: agent, error } = await (supabase
      .from('todo_agents') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdmin();
    if (!authCheck.authorized) {
        return NextResponse.json({ error: authCheck.message }, { status: authCheck.status || 403 });
    }

    const { id } = params;

    const { error } = await supabase
      .from('todo_agents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
