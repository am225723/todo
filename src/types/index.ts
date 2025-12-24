export interface UserProfile {
  id: string;
  supabase_uid: string | null;
  role: 'client' | 'admin';
  pin_hash: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  link_type: 'external' | 'agent' | 'embedded' | null;
  is_static: boolean;
  is_active: boolean;
  priority: number;
  display_date: string | null;
  display_time: string | null;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrence_days: number[] | null;
  tags: string[] | null;
  category: string | null;
  color_code: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoProgress {
  id: string;
  user_id: string;
  todo_item_id: string;
  completed: boolean;
  completed_at: string | null;
  progress_date: string;
  notes: string | null;
  time_spent_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: 'email' | 'sms';
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  recipient: string;
  subject: string | null;
  content: string;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  calendar_id: string | null;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: any;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      todo_items: {
        Row: TodoItem;
        Insert: Omit<TodoItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TodoItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      todo_progress: {
        Row: TodoProgress;
        Insert: Omit<TodoProgress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TodoProgress, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'updated_at'>>;
      };
      calendar_integrations: {
        Row: CalendarIntegration;
        Insert: Omit<CalendarIntegration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CalendarIntegration, 'id' | 'created_at' | 'updated_at'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id'>;
        Update: Partial<Omit<Achievement, 'id'>>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, 'id' | 'earned_at'>;
        Update: Partial<Omit<UserAchievement, 'id' | 'earned_at'>>;
      };
    };
  };
}