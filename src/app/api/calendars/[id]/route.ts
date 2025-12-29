import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dbUser, error: userError } = await supabase
        .from('TODO_USERS')
        .select('id')
        .eq('email', user.email)
        .single();

    if (userError || !dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Force TypeScript to trust that dbUser has the shape of { id: string } because .single() return type
    // with Postgrest is sometimes inferred as User | null, and we checked for null.
    // The issue is likely that dbUser is inferred as "never" or some other type incompatibility.
    const validUser = dbUser as { id: string };

    const { error } = await supabase
        .from('todo_calendar_sources')
        .delete()
        .eq('id', params.id)
        .eq('user_id', validUser.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
