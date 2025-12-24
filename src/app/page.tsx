import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('supabase_uid', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}
