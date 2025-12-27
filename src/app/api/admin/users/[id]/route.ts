
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

  // Check admin
  const { data: requester } = await supabase
    .from('TODO_USERS')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!requester || !(requester as any).is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = params.id;

    const { data: updatedUser, error } = await supabase
      .from('TODO_USERS')
      .update(body as never)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
