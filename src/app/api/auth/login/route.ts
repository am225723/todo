// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { verifyPin, validatePinFormat } from '@/lib/auth/pin';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    if (!validatePinFormat(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. Must be 4-6 digits.' },
        { status: 400 }
      );
    }

    // Use Service Role Client to search users (bypassing RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing Supabase Service Role credentials");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const serviceClient = createServiceClient(
        supabaseUrl,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // Get all active users
    const { data: users, error } = await serviceClient
      .from('TODO_USERS')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.log('Database error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.log('No active users found in database');
      return NextResponse.json(
        { error: 'No active users found' },
        { status: 401 }
      );
    }

    // Find user with matching PIN
    let validUser = null;
    for (const user of users) {
      try {
          const isValidPin = await verifyPin(pin, user.pin_hash);
          if (isValidPin) {
            validUser = user;
            break;
          }
      } catch (e) {
          console.error("Error verifying pin for user", user.id, e);
      }
    }

    if (!validUser) {
      console.log('No user found with matching PIN');
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Get user profile if available (using service client)
    const { data: profile } = await serviceClient
      .from('TODO_USER_PROFILES')
      .select('*')
      .eq('user_id', validUser.id)
      .single();

    // Update last login (using service client)
    await serviceClient
      .from('TODO_USERS')
      .update({ last_login: new Date().toISOString() })
      .eq('id', validUser.id);

    // Standard Supabase Auth Login to set cookies
    // We use the standard client which is wired to cookies
    const supabase = createClient();

    // Check if the user exists in Auth (it should)
    // We perform sign in
    const paddedPin = pin + "00";
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: validUser.email,
        password: paddedPin
    });

    if (signInError) {
        console.error('Supabase Auth Sign In Error:', signInError);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const isAdmin = validUser.is_admin || validUser.role === 'admin';

    return NextResponse.json({
      success: true,
      user: {
        id: validUser.id,
        email: validUser.email,
        full_name: validUser.full_name,
        display_name: profile?.display_name || validUser.full_name,
        role: validUser.role,
        is_admin: isAdmin
      },
      redirect_url: isAdmin ? '/admin' : '/dashboard'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
