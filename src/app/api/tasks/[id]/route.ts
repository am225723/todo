
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const taskId = params.id;

    // Verify ownership or admin status
    const { data: task } = await supabase
        .from('TODO_TASKS')
        .select('user_id')
        .eq('id', taskId)
        .single();

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Cast task to any to access properties
    const taskData = task as any;

    if (taskData.user_id !== user.id) {
        // Check admin
        const { data: requester } = await supabase
            .from('TODO_USERS')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!(requester as any)?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    // Explicitly cast body to match the Update type for TODO_TASKS
    const updatePayload: any = { ...body };
    delete updatePayload.id; // Ensure ID is not updated
    delete updatePayload.created_at; // Ensure created_at is not updated

    const { data: updatedTask, error } = await supabase
      .from('TODO_TASKS')
      .update(updatePayload as never)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;

    // Verify ownership or admin status
    const { data: task } = await supabase
        .from('TODO_TASKS')
        .select('user_id')
        .eq('id', taskId)
        .single();

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Cast task to any to access properties
    const taskData = task as any;

    if (taskData.user_id !== user.id) {
        // Check admin
        const { data: requester } = await supabase
            .from('TODO_USERS')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!(requester as any)?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    const { error } = await supabase
      .from('TODO_TASKS')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }
