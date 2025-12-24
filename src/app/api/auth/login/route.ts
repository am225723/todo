import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || pin.length < 4) {
      return NextResponse.json(
        { error: 'PIN is required and must be at least 4 digits' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get all active users and find the one with matching PIN
    const { data: users, error } = await supabase
      .from('TODO_users')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.log('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
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

    console.log(`Found ${users.length} active users, checking PIN: ${pin}`);

    // Find user with matching PIN
    let validUser = null;
    for (const user of users) {
      const isValidPin = await bcrypt.compare(pin, user.pin_hash);
      if (isValidPin) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      console.log('No user found with matching PIN');
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('TODO_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', validUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: validUser.id,
        email: validUser.email,
        full_name: validUser.full_name,
        role: validUser.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}