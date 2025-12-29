import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
const ICAL = require('ical.js');

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

    // Force Type Check
    const userId = (dbUser as { id: string }).id;

    // 1. Fetch internal tasks with due dates
    const { data: tasks } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('user_id', userId)
        .not('due_date', 'is', null);

    // Explicitly type 'tasks' or map safely.
    const internalEvents = (tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        start: task.due_date, // assuming ISO string
        end: task.due_date,
        allDay: true, // simplified
        resource: { type: 'task', priority: task.priority, status: task.status }
    }));

    // 2. Fetch external calendar sources
    const { data: sources, error: sourcesError } = await supabase
        .from('todo_calendar_sources')
        .select('*')
        .eq('user_id', userId);

    if (sourcesError) {
        if (sourcesError.code === '42P01') {
             // Return just internal events if calendar source table is missing,
             // but log error or maybe include a warning flag in response?
             // For now, let's just return internal events to keep the UI working partially.
             console.error("Calendar sources table missing (42P01). Returning only internal tasks.");
             return NextResponse.json({ events: internalEvents });
        }
    }

    let externalEvents: any[] = [];

    // Cast sources to array of any or proper type to avoid 'never'
    const safeSources = (sources || []) as any[];

    if (safeSources.length > 0) {
        for (const source of safeSources) {
            try {
                // Determine URL to fetch (handle webcal:// protocol if needed)
                let fetchUrl = source.url;
                if (fetchUrl.startsWith('webcal://')) {
                    fetchUrl = fetchUrl.replace('webcal://', 'https://');
                }

                const response = await fetch(fetchUrl);
                if (!response.ok) continue;

                const icalData = await response.text();
                const jcalData = ICAL.parse(icalData);
                const comp = new ICAL.Component(jcalData);
                const vevents = comp.getAllSubcomponents('vevent');

                const sourceEvents = vevents.map((vevent: any) => {
                    const event = new ICAL.Event(vevent);
                    return {
                        id: `${source.id}-${event.uid}`,
                        title: event.summary,
                        start: event.startDate.toJSDate().toISOString(),
                        end: event.endDate.toJSDate().toISOString(),
                        allDay: event.startDate.isDate, // True if just date (no time)
                        resource: { type: 'calendar', color: source.color, sourceId: source.id }
                    };
                });

                externalEvents = [...externalEvents, ...sourceEvents];
            } catch (err) {
                console.error(`Failed to fetch/parse calendar ${source.name}:`, err);
            }
        }
    }

    return NextResponse.json({
        events: [...internalEvents, ...externalEvents]
    });
}
