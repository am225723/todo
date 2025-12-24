import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export function getGoogleAuthUrl(userId: string): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId, // Pass user ID to identify user after OAuth
  });

  return url;
}

export async function getGoogleCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function syncTaskToGoogleCalendar(
  accessToken: string,
  refreshToken: string,
  task: any
) {
  try {
    const calendar = await getGoogleCalendarClient(accessToken, refreshToken);

    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: `${task.display_date}T${task.display_time || '09:00:00'}`,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: `${task.display_date}T${task.display_time || '09:00:00'}`,
        timeZone: 'America/Los_Angeles',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    throw error;
  }
}

export async function deleteGoogleCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string
) {
  try {
    const calendar = await getGoogleCalendarClient(accessToken, refreshToken);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
}

export async function getGoogleCalendarEvents(
  accessToken: string,
  refreshToken: string,
  startDate: string,
  endDate: string
) {
  try {
    const calendar = await getGoogleCalendarClient(accessToken, refreshToken);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
}