import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('TODO_USER_PROFILES')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Type assertion to bypass TypeScript inference issue
  const profileData = profile as any;

  if (!profileData) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profileData.display_name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here are your tasks for today
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Tasks</h2>
          <p className="text-muted-foreground">
            Your tasks will appear here once you set up your Supabase database.
          </p>
        </div>
      </div>
    </div>
  );
}