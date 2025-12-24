# Douglas To-Do List - Step-by-Step Implementation Guide

## Overview

This guide provides detailed, step-by-step instructions for implementing the Douglas To-Do List application from scratch. Follow these steps in order for a smooth development experience.

---

## Phase 1: Initial Setup (30 minutes)

### Step 1.1: Create GitHub Repository

```bash
# 1. Create a new repository on GitHub
# - Name: douglas-todo-app
# - Description: PIN-based to-do list application for Douglas
# - Visibility: Private
# - Initialize with README: No (we'll create our own)

# 2. Clone the repository locally
git clone https://github.com/YOUR_USERNAME/douglas-todo-app.git
cd douglas-todo-app

# 3. Initialize git if not already done
git init
git branch -M main
```

### Step 1.2: Initialize Next.js Project

```bash
# Create Next.js app with TypeScript and Tailwind CSS
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# When prompted, select:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? Yes (@/*)
```

### Step 1.3: Install Dependencies

```bash
# Install Supabase dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-toast @radix-ui/react-slot

# Install form handling
npm install react-hook-form @hookform/resolvers zod

# Install utilities
npm install date-fns bcryptjs clsx tailwind-merge class-variance-authority lucide-react

# Install state management
npm install zustand

# Install chart library
npm install recharts

# Install dev dependencies
npm install -D @types/bcryptjs tailwindcss-animate
```

### Step 1.4: Install Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version

# Login to Supabase (if you have an account)
supabase login
```

---

## Phase 2: Supabase Setup (45 minutes)

### Step 2.1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - **Name**: douglas-todo-app
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient

5. Wait for project to be provisioned (~2 minutes)

### Step 2.2: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep this secret!)

### Step 2.3: Configure Environment Variables

Create `.env.local` file in project root:

```bash
# Create .env.local file
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email Service (Resend) - Add later
RESEND_API_KEY=

# SMS Service (Twilio) - Add later
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Security
PIN_SALT_ROUNDS=12
SESSION_SECRET=generate-a-random-secret-key-here
EOF
```

**Important**: Replace placeholder values with your actual Supabase credentials.

### Step 2.4: Initialize Local Supabase (Optional but Recommended)

```bash
# Initialize Supabase in your project
supabase init

# This creates a supabase/ directory with configuration files
```

### Step 2.5: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the complete schema from `DATABASE_SCHEMA.md`
4. Run the query to create all tables, functions, and policies

Alternatively, create migration files:

```bash
# Create migration directory
mkdir -p supabase/migrations

# Create initial schema migration
cat > supabase/migrations/20240101000000_initial_schema.sql << 'EOF'
-- Copy the complete schema from DATABASE_SCHEMA.md
-- Include all CREATE TABLE statements
EOF

# Create functions migration
cat > supabase/migrations/20240101000001_create_functions.sql << 'EOF'
-- Copy all CREATE FUNCTION statements from DATABASE_SCHEMA.md
EOF

# Create policies migration
cat > supabase/migrations/20240101000002_create_policies.sql << 'EOF'
-- Copy all RLS policies from DATABASE_SCHEMA.md
EOF

# Apply migrations (if using local Supabase)
supabase db reset
```

### Step 2.6: Generate TypeScript Types

```bash
# Generate types from your Supabase schema
npx supabase gen types typescript --project-id "your-project-ref" > src/lib/supabase/types.ts

# Or if using local Supabase:
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

---

## Phase 3: Core Setup (1 hour)

### Step 3.1: Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Step 3.2: Update Global Styles

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 3.3: Create Utility Functions

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 3.4: Setup Supabase Clients

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  );
}
```

Create `src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

### Step 3.5: Create Middleware

Create `src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Phase 4: Authentication Implementation (2 hours)

### Step 4.1: Create PIN Authentication Utilities

Create `src/lib/auth/pin.ts`:

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.PIN_SALT_ROUNDS || '12');

/**
 * Hash a PIN using bcrypt
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a PIN against a hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Validate PIN format (4-6 digits)
 */
export function validatePinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
```

### Step 4.2: Create Authentication Hook

Create `src/hooks/useAuth.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: 'client' | 'admin';
  email: string;
  full_name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, role, email, full_name')
          .eq('supabase_uid', user.id)
          .single();

        setProfile(profile);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, role, email, full_name')
            .eq('supabase_uid', session.user.id)
            .single();

          setProfile(profile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === 'admin',
    isClient: profile?.role === 'client',
  };
}
```

### Step 4.3: Create PIN Input Component

Create `src/components/auth/PinInput.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function PinInput({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const newPin = newValue.join('').slice(0, length);
    
    onChange(newPin);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold',
            error && 'border-destructive',
            focusedIndex === index && 'ring-2 ring-primary'
          )}
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
```

### Step 4.4: Create Login API Route

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPin, validatePinFormat } from '@/lib/auth/pin';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();

    // Validate input
    if (!email || !pin) {
      return NextResponse.json(
        { error: 'Email and PIN are required' },
        { status: 400 }
      );
    }

    if (!validatePinFormat(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check rate limiting
    const { data: rateLimitData } = await supabase
      .rpc('check_pin_rate_limit', { p_email: email });

    if (rateLimitData && !rateLimitData.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitData.message,
          locked_until: rateLimitData.locked_until 
        },
        { status: 429 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, supabase_uid, pin_hash, role, email, full_name')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      // Record failed attempt
      await supabase.rpc('record_pin_attempt', {
        p_email: email,
        p_success: false,
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify PIN
    const isValid = await verifyPin(pin, profile.pin_hash);

    // Record attempt
    await supabase.rpc('record_pin_attempt', {
      p_email: email,
      p_success: isValid,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign in with Supabase Auth (if supabase_uid exists)
    if (profile.supabase_uid) {
      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', profile.id);

      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          full_name: profile.full_name,
        },
      });
    }

    return NextResponse.json(
      { error: 'Account setup incomplete' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 4.5: Create Login Page

Create `src/app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PinInput } from '@/components/auth/PinInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setPin('');
        return;
      }

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and PIN to access your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>PIN</Label>
              <PinInput
                length={4}
                value={pin}
                onChange={setPin}
                disabled={loading}
                error={!!error}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || pin.length < 4 || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Phase 5: Core Features Implementation (3-4 hours)

### Step 5.1: Create Task Components

Create `src/components/tasks/TaskCard.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TodoItem, TodoProgress } from '@/types';

interface TaskCardProps {
  task: TodoItem;
  progress?: TodoProgress;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
  onViewEmbedded?: (task: TodoItem) => void;
}

export function TaskCard({ task, progress, onToggleComplete, onViewEmbedded }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const isCompleted = progress?.completed || false;

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id, !isCompleted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      isCompleted && 'opacity-60'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggle}
            disabled={loading}
            className="mt-1"
          />
          <div className="flex-1">
            <CardTitle className={cn(
              'text-lg',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </CardTitle>
            {task.description && (
              <CardDescription className="mt-1">
                {task.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      {task.link_url && (
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <a
                href={task.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </a>
            </Button>

            {task.link_type === 'embedded' && onViewEmbedded && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewEmbedded(task)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
```

### Step 5.2: Create Dashboard Page

Create `src/app/(dashboard)/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TaskList } from '@/components/tasks/TaskList';
import { ProgressStats } from '@/components/progress/ProgressStats';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('supabase_uid', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Get today's tasks
  const { data: tasks } = await supabase
    .rpc('get_todays_tasks');

  // Get user's progress for today
  const { data: progress } = await supabase
    .from('todo_progress')
    .select('*')
    .eq('user_id', profile.id)
    .eq('progress_date', new Date().toISOString().split('T')[0]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile.full_name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here are your tasks for today
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <ProgressStats
          userId={profile.id}
          tasks={tasks || []}
          progress={progress || []}
        />
      </div>

      <TaskList
        tasks={tasks || []}
        progress={progress || []}
        userId={profile.id}
      />
    </div>
  );
}
```

---

## Phase 6: Edge Functions Setup (1-2 hours)

### Step 6.1: Create Email Notification Function

Create `supabase/functions/send-daily-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get all active users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_active', true);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: 'No active users' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get today's tasks
    const { data: tasks } = await supabase.rpc('get_todays_tasks');

    // Send email to each user
    for (const user of users) {
      const emailHtml = generateEmailHtml(user, tasks || []);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Douglas To-Do <noreply@yourdomain.com>',
          to: user.email,
          subject: `Your Tasks for ${new Date().toLocaleDateString()}`,
          html: emailHtml,
        }),
      });

      const emailData = await emailResponse.json();

      // Log notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        notification_type: 'email',
        status: emailResponse.ok ? 'sent' : 'failed',
        recipient: user.email,
        subject: `Your Tasks for ${new Date().toLocaleDateString()}`,
        content: emailHtml,
        sent_at: new Date().toISOString(),
        error_message: emailResponse.ok ? null : JSON.stringify(emailData),
        metadata: emailData,
      });
    }

    return new Response(
      JSON.stringify({ message: 'Emails sent successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailHtml(user: any, tasks: any[]): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .task { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .task-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
          .task-description { color: #666; font-size: 14px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Tasks for Today</h1>
            <p>Hello ${user.full_name || 'User'},</p>
            <p>Here are your tasks for ${new Date().toLocaleDateString()}:</p>
          </div>
          <div style="padding: 20px;">
            ${tasks.map(task => `
              <div class="task">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                ${task.link_url ? `<a href="${task.link_url}" style="color: #3b82f6; text-decoration: none;">View Link →</a>` : ''}
              </div>
            `).join('')}
          </div>
          <div class="footer">
            <p>This is an automated message from your Douglas To-Do App</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
```

### Step 6.2: Deploy Edge Functions

```bash
# Deploy email function
supabase functions deploy send-daily-email --project-ref your-project-ref

# Set environment variables
supabase secrets set RESEND_API_KEY=your_resend_api_key --project-ref your-project-ref

# Test the function
supabase functions invoke send-daily-email --project-ref your-project-ref
```

---

## Phase 7: Deployment (30 minutes)

### Step 7.1: Prepare for Deployment

```bash
# Build the project locally to check for errors
npm run build

# Fix any build errors before deploying
```

### Step 7.2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? douglas-todo-app
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 7.3: Configure Environment Variables in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)
   - Other variables as needed

5. Redeploy after adding variables

---

## Phase 8: Testing & Verification (1 hour)

### Step 8.1: Test Authentication

1. Visit your deployed URL
2. Try logging in with test credentials
3. Verify PIN validation works
4. Test rate limiting (try wrong PIN multiple times)
5. Verify redirect to dashboard after login

### Step 8.2: Test Task Management

1. View today's tasks
2. Mark tasks as complete
3. Verify progress persists after refresh
4. Test task links (external and embedded)

### Step 8.3: Test Admin Features

1. Login as admin
2. Create a new task
3. Edit existing task
4. Delete a task
5. Verify changes reflect for client user

### Step 8.4: Test Notifications

1. Trigger email notification manually
2. Check email delivery
3. Verify notification logging in database
4. Test SMS notification (if configured)

---

## Phase 9: Initial Data Setup

### Step 9.1: Create User Accounts

```sql
-- In Supabase SQL Editor

-- Generate PIN hashes (use bcrypt online tool or Node.js)
-- Example for PIN "1234": $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEg7u

-- Douglas (Client)
INSERT INTO user_profiles (
  role, pin_hash, email, phone, full_name, is_active
) VALUES (
  'client',
  '$2b$12$YOUR_HASHED_PIN_FOR_DOUGLAS',
  'douglas@example.com',
  '+1234567890',
  'Douglas',
  true
);

-- Admin User
INSERT INTO user_profiles (
  role, pin_hash, email, phone, full_name, is_active
) VALUES (
  'admin',
  '$2b$12$YOUR_HASHED_PIN_FOR_ADMIN',
  'admin@example.com',
  '+1234567891',
  'Admin',
  true
);
```

### Step 9.2: Create Sample Tasks

```sql
-- Sample static (daily) tasks
INSERT INTO todo_items (title, description, link_url, link_type, is_static, priority, display_time) VALUES
  ('Morning Review', 'Review daily goals and priorities', NULL, NULL, true, 100, '08:00:00'),
  ('Check Agent Dashboard', 'Review AI agent status', 'https://agent.drz.services', 'agent', true, 90, '09:00:00'),
  ('Quo System Check', 'Check Quo system', 'https://quo.drz.services', 'agent', true, 80, '10:00:00');

-- Sample dynamic task for today
INSERT INTO todo_items (title, description, is_static, priority, display_date) VALUES
  ('Review Project Proposal', 'Review and provide feedback on Q1 proposal', false, 85, CURRENT_DATE);
```

---

## Phase 10: Documentation & Handoff

### Step 10.1: Create README

Create comprehensive `README.md` with:
- Project overview
- Setup instructions
- Environment variables
- Deployment guide
- Usage instructions
- Troubleshooting

### Step 10.2: Document PIN Codes

Create a secure document (not in repo) with:
- Douglas's PIN
- Admin PIN
- How to reset PINs
- Security best practices

### Step 10.3: Create User Guide

Document for Douglas:
- How to log in
- How to mark tasks complete
- How to view embedded links
- How to check progress

---

## Troubleshooting Common Issues

### Issue: Supabase Connection Errors

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify Supabase project is running
supabase status

# Check Supabase logs
supabase logs
```

### Issue: Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Issue: Authentication Not Working

1. Check RLS policies are enabled
2. Verify PIN hashes are correct
3. Check browser console for errors
4. Verify Supabase Auth is configured

### Issue: Edge Functions Not Deploying

```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm update -g supabase

# Redeploy with verbose logging
supabase functions deploy send-daily-email --debug
```

---

## Next Steps After Implementation

1. **Set up monitoring**: Configure error tracking (Sentry)
2. **Enable analytics**: Add privacy-focused analytics
3. **Schedule notifications**: Set up cron jobs for daily emails/SMS
4. **Add tests**: Write unit and integration tests
5. **Optimize performance**: Add caching, optimize queries
6. **Enhance security**: Add 2FA, audit logging
7. **Gather feedback**: Get user feedback and iterate

---

## Estimated Timeline

- **Phase 1-3**: 2 hours (Setup and configuration)
- **Phase 4**: 2 hours (Authentication)
- **Phase 5**: 4 hours (Core features)
- **Phase 6**: 2 hours (Edge functions)
- **Phase 7**: 1 hour (Deployment)
- **Phase 8**: 1 hour (Testing)
- **Phase 9-10**: 1 hour (Data setup and documentation)

**Total**: ~13 hours for complete implementation

---

## Support and Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Vercel Docs**: https://vercel.com/docs

---

This implementation guide provides a complete roadmap from zero to production. Follow each phase sequentially for the best results.