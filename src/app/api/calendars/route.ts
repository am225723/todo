import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    const userId = (dbUser as { id: string }).id;

    const { data: sources, error } = await supabase
        .from('todo_calendar_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        // Handle "relation does not exist" error gracefully
        if (error.code === '42P01') {
            return NextResponse.json({
                error: "Database table 'todo_calendar_sources' missing. Please run calendar_setup.sql in Supabase."
            }, { status: 503 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources });
}

export async function POST(request: Request) {
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

    const userId = (dbUser as { id: string }).id;

    try {
        const body = await request.json();
        const { name, url, type, color } = body;

        // Force casting to "any" to bypass the strict type checking if the generated types
        // in supabase/ssr are not picking up the local 'Database' interface correctly.
        const { data: source, error } = await (supabase
            .from('todo_calendar_sources') as any)
            .insert({
                user_id: userId,
                name,
                url,
                type,
                color
            })
            .select()
            .single();

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json({
                    error: "Database table 'todo_calendar_sources' missing. Please run calendar_setup.sql in Supabase."
                }, { status: 503 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ source });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
