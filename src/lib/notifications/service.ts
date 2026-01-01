
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import webpush from 'web-push';
import nodemailer from 'nodemailer';

interface NotificationPayload {
    userId: string;
    recipient: string;
    type: 'email' | 'sms' | 'push';
    subject?: string;
    message: string;
    taskId?: string;
}

// Setup web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:example@yourdomain.org', // You should customize this
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Setup Nodemailer
const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return null;
};

export async function sendNotification(payload: NotificationPayload) {
    // Use admin client to ensure we can insert logs regardless of current session context (RLS)
    const supabase = createAdminClient();

    console.log(`[${payload.type.toUpperCase()}] To: ${payload.recipient} | Msg: ${payload.message}`);

    let status = 'sent';
    let errorMessage = null;

    try {
        // Handle Email
        if (payload.type === 'email') {
            const transporter = createTransporter();
            if (transporter) {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Todo App" <no-reply@example.com>',
                    to: payload.recipient,
                    subject: payload.subject || 'Notification',
                    text: payload.message,
                    html: payload.message.replace(/\n/g, '<br>'), // Simple text to HTML
                });
            } else {
                console.warn('SMTP not configured. Email logged but not sent.');
                // We mark it as 'sent' because in dev environment we often don't have SMTP
                // If you want to mark it as failed:
                // status = 'failed';
                // errorMessage = 'SMTP configuration missing';
            }
        }

        // Handle Push Notifications
        if (payload.type === 'push') {
            // Recipient for push should be the endpoint or we need to fetch subscriptions
            // We'll fetch all subscriptions for the user
            const { data: subscriptions } = await supabase
                .from('todo_push_subscriptions')
                .select('*')
                .eq('user_id', payload.userId);

            if (subscriptions && subscriptions.length > 0) {
                const notificationPayload = JSON.stringify({
                    title: payload.subject || 'New Notification',
                    body: payload.message,
                    url: '/dashboard' // Optional deep link
                });

                const promises = subscriptions.map((sub: any) => {
                   const pushSubscription = {
                       endpoint: sub.endpoint,
                       keys: {
                           auth: sub.keys_auth,
                           p256dh: sub.keys_p256dh
                       }
                   };
                   return webpush.sendNotification(pushSubscription, notificationPayload)
                       .catch(err => {
                           console.error('Error sending push to subscription:', sub.id, err);
                           // Optionally remove invalid subscriptions here
                           if (err.statusCode === 410 || err.statusCode === 404) {
                               supabase.from('todo_push_subscriptions').delete().eq('id', sub.id).then();
                           }
                           throw err;
                       });
                });

                await Promise.allSettled(promises);
            } else {
                status = 'failed';
                errorMessage = 'No subscriptions found';
            }
        }
    } catch (error: any) {
        console.error(`Failed to send ${payload.type} notification:`, error);
        status = 'failed';
        errorMessage = error.message;
    }

    // Attempt to resolve the correct user_id for the log table.
    // The system currently has a discrepancy where tasks use 'TODO_USERS' (uppercase table)
    // but the notification logs reference 'todo_users' (lowercase table) via foreign key.
    // We try to find the matching user in 'todo_users' by email.
    let logUserId = payload.userId;

    try {
        let email: string | null = null;

        // Always try to fetch email from source user first to ensure accuracy
        const { data: sourceUser } = await supabase
            .from('TODO_USERS')
            .select('email')
            .eq('id', payload.userId)
            .single();

        if (sourceUser) {
            email = (sourceUser as any).email;
        }

        // Fallback to recipient if it looks like an email and we didn't find one
        if (!email && payload.recipient.includes('@')) {
            email = payload.recipient;
        }

        if (email) {
            const { data: targetUser } = await supabase
                .from('todo_users' as any)
                .select('id')
                .eq('email', email)
                .single();

            if (targetUser) {
                logUserId = (targetUser as any).id;
            }
        }
    } catch (err) {
        console.warn('Error resolving user ID for logging:', err);
    }

    const { error } = await supabase.from('todo_notification_logs').insert({
        user_id: logUserId,
        recipient: payload.recipient,
        type: payload.type,
        status: status,
        subject: payload.subject || null,
        message: payload.message || null,
        task_id: payload.taskId || null,
        sent_at: new Date().toISOString(),
        error_message: errorMessage
    } as any);

    if (error) {
        console.error('Failed to log notification:', error);
        return false;
    }

    return status === 'sent';
}

export async function checkAndSendNotifications() {
    // Use Admin Client for system-wide background tasks to bypass RLS
    const supabase = createAdminClient();
    const now = new Date();

    const { data: users, error: userError } = await supabase
        .from('TODO_USERS')
        .select('id, email, is_active')
        .eq('is_active', true);

    if (userError) {
        console.error('Error fetching users for notifications:', userError);
        return;
    }

    if (!users) return;

    let sentCount = 0;

    for (const user of users) {
        // Cast user to any to access id
        const userData = user as any;

        // Fetch pending tasks for today
        const todayStr = now.toISOString().split('T')[0];
        const { data: tasks } = await supabase
            .from('todo_tasks')
            .select('*')
            .eq('user_id', userData.id)
            .neq('status', 'completed')
            .lte('due_date', todayStr + 'T23:59:59');

        if (tasks && tasks.length > 0) {
            const taskList = tasks.map((t: any) => `- ${t.title}`).join('\n');
            const message = `You have ${tasks.length} pending tasks for today:\n${taskList}`;

            // Send Email (Real)
            await sendNotification({
                userId: userData.id,
                recipient: userData.email,
                type: 'email',
                subject: 'Your Daily To-Do Digest',
                message: message
            });

            // Send Push (Real)
            await sendNotification({
                userId: userData.id,
                recipient: 'push-device',
                type: 'push',
                subject: 'Daily Task Digest',
                message: `You have ${tasks.length} tasks due today.`
            });

            sentCount++;
        }
    }

    return sentCount;
}
