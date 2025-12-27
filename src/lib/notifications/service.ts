
import { createClient } from '@/lib/supabase/server';

interface NotificationPayload {
    userId: string;
    recipient: string;
    type: 'email' | 'sms';
    subject?: string;
    message: string;
    taskId?: string;
}

export async function sendNotification(payload: NotificationPayload) {
    const supabase = createClient();

    // In a real application, you would integrate with SendGrid, Twilio, etc.
    // For this PWA/Demo, we will log to console and database.

    console.log(`[MOCK ${payload.type.toUpperCase()}] To: ${payload.recipient} | Msg: ${payload.message}`);

    const { error } = await supabase.from('todo_notification_logs').insert({
        user_id: payload.userId,
        recipient: payload.recipient,
        type: payload.type,
        status: 'sent', // Assuming immediate success for mock
        subject: payload.subject || null,
        message: payload.message || null,
        task_id: payload.taskId || null,
        sent_at: new Date().toISOString()
    } as any);

    if (error) {
        console.error('Failed to log notification:', error);
        return false;
    }

    return true;
}

export async function checkAndSendNotifications() {
    const supabase = createClient();
    const now = new Date();

    // 1. Find tasks due soon (e.g., today) that haven't been notified yet
    // This requires complex logic and potentially new columns (last_notified_at).
    // For simplicity, we will just send a "Daily Digest" to all active users with pending tasks for today.

    const { data: users } = await supabase
        .from('TODO_USERS')
        .select('id, email, is_active')
        .eq('is_active', true);

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

            await sendNotification({
                userId: userData.id,
                recipient: userData.email,
                type: 'email',
                subject: 'Your Daily To-Do Digest',
                message: message
            });
            sentCount++;
        }
    }

    return sentCount;
}
