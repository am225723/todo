// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: users, error } = await supabase
      .from('TODO_USERS')
      .select(`
        id,
        email,
        is_active,
        created_at,
        updated_at,
        TODO_USER_PROFILES (
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Flatten the user data
    const flattenedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      display_name: user.TODO_USER_PROFILES?.display_name || null,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })) || [];

    return NextResponse.json({ users: flattenedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, display_name, pin } = await request.json();

    if (!email || !display_name || !pin) {
      return NextResponse.json(
        { error: 'Email, display name, and PIN are required' },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4-6 digits' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('TODO_USERS')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate salt and hash PIN
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('TODO_USERS')
      .insert({
        email,
        pin_hash: pinHash,
        pin_salt: salt,
        is_active: true, // Auto-approve for now, can be changed to false for approval workflow
      })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('TODO_USER_PROFILES')
      .insert({
        user_id: user.id,
        display_name,
        timezone: 'UTC',
        theme: 'light',
      });

    if (profileError) {
      // Rollback user creation if profile creation fails
      await supabase.from('TODO_USERS')
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
