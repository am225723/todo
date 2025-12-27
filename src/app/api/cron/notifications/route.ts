
import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendNotifications } from '@/lib/notifications/service';

// This endpoint is meant to be called by a external cron service (e.g. Vercel Cron, GitHub Actions)
// or manually by an admin.
export async function POST(request: NextRequest) {
    try {
        // In production, you would verify a CRON_SECRET header here.
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

        const count = await checkAndSendNotifications();

        return NextResponse.json({ success: true, notificationsSent: count });
    } catch (error: any) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
