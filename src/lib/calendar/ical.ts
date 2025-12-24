// @ts-nocheck
import ICAL from 'ical.js';

export async function parseICalFeed(url: string) {
  try {
    const response = await fetch(url);
    const icalData = await response.text();
    
    // @ts-ignore
    const jcalData = ICAL.parse(icalData);
    // @ts-ignore
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    return vevents.map((vevent: any) => {
      const event = new ICAL.Event(vevent);
      return {
        id: event.uid,
        title: event.summary,
        description: event.description,
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        location: event.location,
      };
    });
  } catch (error) {
    console.error('Error parsing iCal feed:', error);
    throw error;
  }
}

export function generateICalEvent(task: any): string {
  const comp = new ICAL.Component(['vcalendar', [], []]);
  comp.updatePropertyWithValue('prodid', '-//Douglas Todo App//EN');
  comp.updatePropertyWithValue('version', '2.0');

  const vevent = new ICAL.Component('vevent');
  const event = new ICAL.Event(vevent);

  event.uid = task.id;
  event.summary = task.title;
  event.description = task.description || '';
  
  const startDate = new Date(`${task.display_date}T${task.display_time || '09:00:00'}`);
  event.startDate = ICAL.Time.fromJSDate(startDate, true);
  event.endDate = ICAL.Time.fromJSDate(new Date(startDate.getTime() + 3600000), true); // +1 hour

  comp.addSubcomponent(vevent);

  return comp.toString();
}

export async function subscribeToICalFeed(url: string, userId: string) {
  // This would typically save the iCal URL to the database
  // and set up periodic syncing
  try {
    const events = await parseICalFeed(url);
    return events;
  } catch (error) {
    console.error('Error subscribing to iCal feed:', error);
    throw error;
  }
}