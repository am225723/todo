// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const supabase = createClient();

    // Since we're using PIN-only auth, we need to find user by trying all active users
    const { data: users, error: usersError } = await supabase
      .from('TODO_USERS')
      .select('*')
      .eq('is_active', true);

    if (usersError || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'No active users found' },
        { status: 401 }
      );
    }

    // Try to find a user with matching PIN
    let authenticatedUser = null;
    for (const user of users) {
      const isValid = await verifyPin(pin, user.pin_hash);
      if (isValid) {
        authenticatedUser = user;
        break;
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('TODO_USER_PROFILES')
      .select('*')
      .eq('user_id', authenticatedUser.id)
      .single();

    // Update last login
    await supabase
      .from('TODO_USERS')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', authenticatedUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        display_name: profile?.display_name || null,
      },
      redirect_url: '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}