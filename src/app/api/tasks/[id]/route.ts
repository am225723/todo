
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function calculateNextDueDate(currentDateStr: string | null, pattern: any): string {
    const date = currentDateStr ? new Date(currentDateStr) : new Date();

    // Default to tomorrow if no pattern
    if (!pattern || !pattern.type) {
        date.setDate(date.getDate() + 1);
        return date.toISOString();
    }

    const interval = parseInt(pattern.interval) || 1;

    switch (pattern.type) {
        case 'daily':
            date.setDate(date.getDate() + interval);
            break;
        case 'weekly':
            date.setDate(date.getDate() + (7 * interval));
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + interval);
            break;
        default:
             date.setDate(date.getDate() + 1);
    }

    return date.toISOString();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the correct TODO_USERS id
  const { data: todoUser, error: todoUserError } = await supabase
      .from('TODO_USERS')
      .select('id, is_admin')
      .eq('email', user.email!)
      .single();

  if (todoUserError || !todoUser) {
       return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const taskId = params.id;

    // Verify ownership or admin status
    const { data: task } = await supabase
        .from('todo_tasks')
        .select('*') // Select all to check recurrence
        .eq('id', taskId)
        .single();

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Cast task to any to access properties
    const taskData = task as any;
    const todoUserAny = todoUser as any;

    if (taskData.user_id !== todoUserAny.id) {
        // Check admin
        if (!todoUserAny.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    // Handle Recurrence: If completing a recurring task, create the next one
    if (body.status === 'completed' && taskData.status !== 'completed' && taskData.is_recurring) {
        const nextDueDate = calculateNextDueDate(taskData.due_date, taskData.recurrence_pattern);

        const newTask = {
            ...taskData,
            id: undefined, // Let DB generate ID
            created_at: undefined,
            updated_at: undefined,
            status: 'pending',
            due_date: nextDueDate,
            // Keep recurrence settings
            is_recurring: true,
            recurrence_pattern: taskData.recurrence_pattern
        };
        delete newTask.id;
        delete newTask.created_at;
        delete newTask.updated_at;

        // Insert new task
        await supabase.from('todo_tasks').insert(newTask);
    }

    // Explicitly cast body to match the Update type for todo_tasks
    const updatePayload: any = { ...body };
    delete updatePayload.id; // Ensure ID is not updated
    delete updatePayload.created_at; // Ensure created_at is not updated
    // Protect user_id update unless admin
    if (updatePayload.user_id && updatePayload.user_id !== todoUserAny.id && !todoUserAny.is_admin) {
        delete updatePayload.user_id;
    }

    const { data: updatedTask, error } = await supabase
      .from('todo_tasks')
      .update(updatePayload as never)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Task update error", error);
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

    // Get the correct TODO_USERS id
    const { data: todoUser, error: todoUserError } = await supabase
      .from('TODO_USERS')
      .select('id, is_admin')
      .eq('email', user.email!)
      .single();

    if (todoUserError || !todoUser) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    const taskId = params.id;

    // Verify ownership or admin status
    const { data: task } = await supabase
        .from('todo_tasks')
        .select('user_id')
        .eq('id', taskId)
        .single();

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Cast task to any to access properties
    const taskData = task as any;

    const todoUserAny = todoUser as any;
    if (taskData.user_id !== todoUserAny.id) {
        // Check admin
        if (!todoUserAny.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    const { error } = await supabase
      .from('todo_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }
