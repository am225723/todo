# Deployment Guide

## Quick Start

This guide will help you deploy the Douglas To-Do List application to production.

## Prerequisites

- GitHub account
- Vercel account
- Supabase account
- Domain name (optional)

## Step 1: Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: douglas-todo-app
   - Database Password: (generate strong password)
   - Region: (choose closest to users)
4. Wait for project to be created

### 1.2 Run Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Run migrations in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_create_functions.sql`
   - `supabase/migrations/20240101000002_create_policies.sql`

### 1.3 Create Initial Users

Run this SQL to create users (replace PIN hashes with actual bcrypt hashes):

\`\`\`sql
-- Generate PIN hash using: https://bcrypt-generator.com/
-- Use 12 rounds

-- Douglas (Client) - PIN: 1234 (example)
INSERT INTO user_profiles (role, pin_hash, email, phone, full_name, is_active)
VALUES (
  'client',
  '$2b$12$YOUR_HASHED_PIN_FOR_DOUGLAS',
  'douglas@example.com',
  '+1234567890',
  'Douglas',
  true
);

-- Admin User - PIN: 5678 (example)
INSERT INTO user_profiles (role, pin_hash, email, phone, full_name, is_active)
VALUES (
  'admin',
  '$2b$12$YOUR_HASHED_PIN_FOR_ADMIN',
  'admin@example.com',
  '+1234567891',
  'Admin',
  true
);
\`\`\`

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### 2.2 Configure Environment Variables

Add these environment variables in Vercel:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
RESEND_API_KEY=your-resend-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/calendar/callback
PIN_SALT_ROUNDS=12
SESSION_SECRET=your-random-secret
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_CALENDAR_SYNC=true
\`\`\`

### 2.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Visit your app URL

## Step 3: Set Up Integrations

### 3.1 Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-app.vercel.app/api/calendar/callback`
6. Update environment variables in Vercel

### 3.2 Email Notifications (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to Vercel environment variables
4. Deploy Supabase Edge Function for emails

### 3.3 SMS Notifications (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Get credentials
3. Add to Vercel environment variables
4. Deploy Supabase Edge Function for SMS

## Step 4: Test Deployment

1. Visit your app URL
2. Try logging in with test credentials
3. Create a test task
4. Mark task as complete
5. Test calendar sync
6. Verify notifications

## Step 5: Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

## Monitoring

- **Vercel Analytics**: Automatic performance monitoring
- **Supabase Logs**: Database query logs
- **Error Tracking**: Set up Sentry (optional)

## Backup Strategy

- Supabase automatic backups (daily)
- Point-in-time recovery available
- Export data regularly for safety

## Security Checklist

- [ ] All environment variables set
- [ ] RLS policies enabled
- [ ] HTTPS enforced
- [ ] Strong PIN hashes used
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] API keys secured

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure migrations ran successfully

### Authentication Not Working
- Verify PIN hashes are correct
- Check Supabase Auth settings
- Review browser console for errors

## Support

For issues, refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Deployment complete! 🎉**