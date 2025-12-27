
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let query = supabase.from('todo_tasks').select('*');

  if (userId) {
    // If requesting tasks for a specific user, ensure the requester is an admin
    const { data: requester } = await supabase
      .from('TODO_USERS')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!requester || !(requester as any).is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    query = query.eq('user_id', userId);
  } else {
    // Default to own tasks
    query = query.eq('user_id', user.id);
  }

  const { data: tasks, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if user is assigning to someone else (Admin only)
    if (body.user_id && body.user_id !== user.id) {
       const { data: requester } = await supabase
        .from('TODO_USERS')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!requester || !(requester as any).is_admin) {
        return NextResponse.json({ error: 'Forbidden: Cannot assign tasks to others' }, { status: 403 });
      }
    }

    const taskData = {
      ...body,
      user_id: body.user_id || user.id, // Default to self if not specified
    };

    const { data: task, error } = await supabase
      .from('todo_tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
