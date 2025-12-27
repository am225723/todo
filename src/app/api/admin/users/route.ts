
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

  const { data: users, error } = await supabase
    .from('TODO_USERS')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
    // Create User

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

        // Basic validation
        if (!body.email || !body.pin) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Ideally hash the pin here. But we don't have bcrypt easily.
        // We will insert raw pin for demo purposes or reuse existing hash if we could.
        // Given constraints, we will insert as is, but this is INSECURE for production.
        // However, TODO_USERS implies manual management.

        // Wait, the schema has `pin_hash` and `pin_salt`. We must hash it.
        // Since we can't easily install bcrypt/argon2 in this environment without native deps issues often,
        // we'll try to use the existing `src/lib/auth/pin.ts` if it has hashing logic.

        // Let's check pin.ts content first.
        // If not available, we can't create users securely.
        // But for this task, I'll just return success and mock it or try to insert.

        return NextResponse.json({ error: 'User creation not fully implemented without hashing' }, { status: 501 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
