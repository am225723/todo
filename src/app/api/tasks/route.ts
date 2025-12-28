
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

  // Get the correct TODO_USERS id
  const { data: todoUser, error: todoUserError } = await supabase
    .from('TODO_USERS')
    .select('id, is_admin')
    .eq('email', user.email!)
    .single();

  if (todoUserError || !todoUser) {
    // Fallback or error if user not found in TODO_USERS
    console.error('User mismatch or missing in TODO_USERS', todoUserError);
    return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
  }

  const todoUserAny = todoUser as any;
  let query = supabase.from('todo_tasks').select('*');

  if (userId) {
    // If requesting tasks for a specific user, ensure the requester is an admin
    if (!todoUserAny.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    query = query.eq('user_id', userId);
  } else {
    // Default to own tasks
    query = query.eq('user_id', todoUserAny.id);
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

  // Get the correct TODO_USERS id
  const { data: todoUser, error: todoUserError } = await supabase
      .from('TODO_USERS')
      .select('id, is_admin')
      .eq('email', user.email!)
      .single();

  if (todoUserError || !todoUser) {
       return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
  }

  const todoUserAny = todoUser as any;

  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const due_date = formData.get('due_date') as string;
    const is_agent_task = formData.get('is_agent_task') === 'true';
    const file = formData.get('file') as File | null;
    let targetUserId = formData.get('user_id') as string;

    if (!targetUserId) {
        targetUserId = todoUserAny.id;
    }

    // Check if user is assigning to someone else (Admin only)
    if (targetUserId !== todoUserAny.id) {
      if (!todoUserAny.is_admin) {
        return NextResponse.json({ error: 'Forbidden: Cannot assign tasks to others' }, { status: 403 });
      }
    }

    let attachment_url = null;
    let attachment_type = null;

    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${todoUserAny.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(fileName, file);

        if (uploadError) {
             console.error('Upload error:', uploadError);
             // Proceed without attachment or fail? Let's fail for now to alert user.
             // Or better, proceed but warn. User wants upload.
             return NextResponse.json({ error: 'Failed to upload file: ' + uploadError.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(fileName);

        attachment_url = publicUrlData.publicUrl;
        attachment_type = file.type.startsWith('image/') ? 'image' : 'pdf';
    }

    const taskData = {
      title,
      description: description || null,
      priority: priority || 'medium',
      due_date: due_date || null,
      is_agent_task,
      user_id: targetUserId,
      attachment_url,
      attachment_type,
      status: 'pending'
    };

    const { data: task, error } = await supabase
      .from('todo_tasks')
      .insert(taskData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
