export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  pin_hash: string;
  pin_salt: string;
  full_name: string;
  role: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  reminder_time: string | null;
  is_recurring: boolean;
  recurrence_pattern: any;
  calendar_event_id: string | null;
  is_static: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCategory {
  id: string;
  task_id: string;
  category_id: string;
  created_at: string;
}

export interface TaskTag {
  id: string;
  task_id: string;
  tag_id: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  icon: string | null;
  points: number;
  earned_at: string;
  metadata: any;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  task_id: string | null;
  type: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed';
  recipient: string;
  subject: string | null;
  message: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      TODO_USERS: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      // Alias for lowercase usage
      TODO_users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      todo_users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_USER_PROFILES: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      // Alias for lowercase usage
      TODO_user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      todo_user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_CATEGORIES: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_TAGS: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_TASKS: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      TODO_TASK_CATEGORIES: {
        Row: TaskCategory;
        Insert: Omit<TaskCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskCategory, 'id' | 'created_at'>>;
      };
      TODO_task_categories: {
        Row: TaskCategory;
        Insert: Omit<TaskCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskCategory, 'id' | 'created_at'>>;
      };
      TODO_TASK_TAGS: {
        Row: TaskTag;
        Insert: Omit<TaskTag, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskTag, 'id' | 'created_at'>>;
      };
      TODO_task_tags: {
        Row: TaskTag;
        Insert: Omit<TaskTag, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskTag, 'id' | 'created_at'>>;
      };
      TODO_ACHIEVEMENTS: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'earned_at'>;
        Update: Partial<Omit<Achievement, 'id' | 'earned_at'>>;
      };
      TODO_achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'earned_at'>;
        Update: Partial<Omit<Achievement, 'id' | 'earned_at'>>;
      };
      TODO_NOTIFICATION_LOGS: {
        Row: NotificationLog;
        Insert: Omit<NotificationLog, 'id' | 'created_at'>;
        Update: Partial<Omit<NotificationLog, 'id' | 'created_at'>>;
      };
      TODO_notification_logs: {
        Row: NotificationLog;
        Insert: Omit<NotificationLog, 'id' | 'created_at'>;
        Update: Partial<Omit<NotificationLog, 'id' | 'created_at'>>;
      };
    };
  };
}
