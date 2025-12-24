# Quick Start Guide

Get your Douglas To-Do List application running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- npm package manager
- Supabase account (free tier works)
- GitHub account (already set up)

---

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/am225723/todo.git
cd todo

# Install dependencies
npm install
```

---

## Step 2: Set Up Supabase (5 minutes)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: douglas-todo-app
   - **Database Password**: (generate and save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2 minutes for setup

### 2.2 Get API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

### 2.3 Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste content from `supabase/migrations/20240101000000_initial_schema.sql`
4. Click "Run"
5. Repeat for:
   - `20240101000001_create_functions.sql`
   - `20240101000002_create_policies.sql`

---

## Step 3: Configure Environment (2 minutes)

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your preferred editor
```

**Minimum required variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
PIN_SALT_ROUNDS=12
```

---

## Step 4: Create Test Users (3 minutes)

### 4.1 Generate PIN Hashes

Go to [bcrypt-generator.com](https://bcrypt-generator.com/):
- Enter PIN: `1234` (for Douglas)
- Rounds: `12`
- Click "Generate"
- Copy the hash

Repeat for admin PIN: `5678`

### 4.2 Insert Users

In Supabase SQL Editor, run:

```sql
-- Douglas (Client) - PIN: 1234
INSERT INTO user_profiles (role, pin_hash, email, phone, full_name, is_active)
VALUES (
  'client',
  'YOUR_BCRYPT_HASH_FOR_1234',
  'douglas@example.com',
  '+1234567890',
  'Douglas',
  true
);

-- Admin User - PIN: 5678
INSERT INTO user_profiles (role, pin_hash, email, phone, full_name, is_active)
VALUES (
  'admin',
  'YOUR_BCRYPT_HASH_FOR_5678',
  'admin@example.com',
  '+1234567891',
  'Admin',
  true
);
```

### 4.3 Add Sample Tasks

```sql
-- Sample static (daily) tasks
INSERT INTO todo_items (title, description, link_url, link_type, is_static, priority, display_time) VALUES
  ('Morning Review', 'Review daily goals and priorities', NULL, NULL, true, 100, '08:00:00'),
  ('Check Agent Dashboard', 'Review AI agent status', 'https://agent.drz.services', 'agent', true, 90, '09:00:00'),
  ('Quo System Check', 'Check Quo system', 'https://quo.drz.services', 'agent', true, 80, '10:00:00');
```

---

## Step 5: Run the App (1 minute)

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 6: Test Login (2 minutes)

1. You should see the login page
2. Enter:
   - **Email**: `douglas@example.com`
   - **PIN**: `1234`
3. Click "Sign In"
4. You should see the dashboard!

---

## 🎉 Success!

Your app is now running locally. You should see:
- ✅ Login page with PIN entry
- ✅ Dashboard with welcome message
- ✅ Sample tasks (if you added them)

---

## Next Steps

### Add More Features

1. **Set up Google Calendar** (optional)
   - See `docs/IMPLEMENTATION_GUIDE.md` Phase 6

2. **Configure Email Notifications** (optional)
   - Sign up for [Resend](https://resend.com)
   - Add API key to `.env.local`

3. **Configure SMS Notifications** (optional)
   - Sign up for [Twilio](https://twilio.com)
   - Add credentials to `.env.local`

### Deploy to Production

When ready to deploy:
1. Follow `DEPLOYMENT.md`
2. Deploy to Vercel (5 minutes)
3. Configure production environment variables

---

## Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env.local` file
- Verify Supabase URL and keys are correct
- Make sure Supabase project is running

### "Invalid credentials" on login
- Verify PIN hash was generated correctly
- Check user was inserted into database
- Try regenerating the hash with bcrypt-generator.com

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### Build errors
- Check Node.js version: `node --version` (should be 18+)
- Run `npm run type-check` to see TypeScript errors

---

## Development Tips

### Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
npm run type-check   # Check TypeScript types
```

### Hot Reload

The app automatically reloads when you save files. No need to restart!

### Database Changes

After changing database schema:
1. Create new migration file in `supabase/migrations/`
2. Run it in Supabase SQL Editor
3. Restart dev server

---

## Getting Help

### Documentation
- `README.md` - Project overview
- `DEPLOYMENT.md` - Production deployment
- `docs/` - Complete technical docs

### Common Issues
- Check `docs/IMPLEMENTATION_GUIDE.md` troubleshooting section
- Review Supabase logs in dashboard
- Check browser console for errors

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## What's Next?

Now that your app is running:

1. **Explore the Dashboard**
   - View tasks
   - Mark tasks complete
   - Check progress

2. **Try Admin Features**
   - Login as admin (PIN: 5678)
   - Create new tasks
   - Manage users

3. **Customize**
   - Add your own tasks
   - Adjust colors and styling
   - Configure notifications

4. **Deploy**
   - Follow DEPLOYMENT.md
   - Share with Douglas!

---

## Quick Reference

### Login Credentials (Test)
- **Douglas**: douglas@example.com / PIN: 1234
- **Admin**: admin@example.com / PIN: 5678

### Important URLs
- **Local App**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/am225723/todo

### Key Files
- `.env.local` - Environment variables
- `src/app/page.tsx` - Home page
- `src/app/dashboard/page.tsx` - Dashboard
- `supabase/migrations/` - Database schema

---

**You're all set! Happy coding! 🚀**

*Built with ❤️ by NinjaTech AI*