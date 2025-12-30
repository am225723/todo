import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
        return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get TODO_USERS id
        const { data: todoUserData, error: todoUserError } = await supabase
            .from('TODO_USERS')
            .select('id')
            .eq('email', user.email)
            .single();

        if (todoUserError || !todoUserData) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const todoUser = todoUserData as { id: string };

        // Use upsert to handle "insert or update" logic, avoiding unique constraint violations
        const { error: upsertError } = await supabase
           .from('todo_push_subscriptions')
           .upsert({
               user_id: todoUser.id,
               endpoint: subscription.endpoint,
               keys_auth: subscription.keys.auth,
               keys_p256dh: subscription.keys.p256dh,
               updated_at: new Date().toISOString()
           } as any, { onConflict: 'endpoint' });

        if (upsertError) {
            console.error('Subscription error:', upsertError);
            return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
