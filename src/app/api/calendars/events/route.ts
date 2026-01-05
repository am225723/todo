import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
const ICAL = require('ical.js');

// Hardcoded NY Timezone definition to handle floating times in EST context
const NY_VTIMEZONE = `BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:STANDARD
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
END:DAYLIGHT
END:VTIMEZONE`;

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

    const internalEvents = (tasks || []).map((task: any) => {
        // Treat internal tasks as timed events
        const startDate = new Date(task.due_date);
        // Default duration 1 hour for display if no explicit end time
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        return {
            id: task.id,
            title: task.title,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            allDay: false,
            resource: { type: 'task', priority: task.priority, status: task.status }
        };
    });

    // 2. Fetch external calendar sources
    const { data: sources, error: sourcesError } = await supabase
        .from('todo_calendar_sources')
        .select('*')
        .eq('user_id', userId);

    if (sourcesError) {
        if (sourcesError.code === '42P01') {
             console.error("Calendar sources table missing (42P01). Returning only internal tasks.");
             return NextResponse.json({ events: internalEvents });
        }
    }

    let externalEvents: any[] = [];
    const safeSources = (sources || []) as any[];

    // Register default NY timezone once
    try {
        const tzComp = new ICAL.Component(ICAL.parse(`BEGIN:VCALENDAR\n${NY_VTIMEZONE}\nEND:VCALENDAR`));
        const vtz = tzComp.getFirstSubcomponent('vtimezone');
        ICAL.TimezoneService.register(vtz);
    } catch (e) {
        console.warn('Failed to register default NY timezone', e);
    }

    if (safeSources.length > 0) {
        for (const source of safeSources) {
            try {
                let fetchUrl = source.url;
                if (fetchUrl.startsWith('webcal://')) {
                    fetchUrl = fetchUrl.replace('webcal://', 'https://');
                }

                const response = await fetch(fetchUrl);
                if (!response.ok) continue;

                const icalData = await response.text();
                const jcalData = ICAL.parse(icalData);
                const comp = new ICAL.Component(jcalData);

                // Register timezones from the calendar feed (overwrites default if same TZID)
                const vtimezones = comp.getAllSubcomponents('vtimezone');
                vtimezones.forEach((vtz: any) => {
                    try {
                        ICAL.TimezoneService.register(vtz);
                    } catch (tzError) {
                        console.warn('Failed to register timezone from feed:', tzError);
                    }
                });

                const vevents = comp.getAllSubcomponents('vevent');

                const sourceEvents = vevents.map((vevent: any) => {
                    const event = new ICAL.Event(vevent);

                    // Fix for Floating Time (assumes America/New_York)
                    if (!event.startDate.isDate && event.startDate.zone.tzid === 'floating') {
                         const nyZone = ICAL.TimezoneService.get('America/New_York');
                         if (nyZone) event.startDate.zone = nyZone;
                    }
                    if (!event.endDate.isDate && event.endDate.zone.tzid === 'floating') {
                         const nyZone = ICAL.TimezoneService.get('America/New_York');
                         if (nyZone) event.endDate.zone = nyZone;
                    }

                    return {
                        id: `${source.id}-${event.uid}`,
                        title: event.summary,
                        start: event.startDate.toJSDate().toISOString(),
                        end: event.endDate.toJSDate().toISOString(),
                        allDay: event.startDate.isDate,
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
