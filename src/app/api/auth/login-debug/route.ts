import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    console.log('🔍 DEBUG: Login attempt with PIN:', pin);

    if (!pin || pin.length < 4) {
      console.log('❌ DEBUG: Invalid PIN format');
      return NextResponse.json(
        { error: 'PIN is required and must be at least 4 digits' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Test database connection
    console.log('🔍 DEBUG: Testing database connection...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('todo_users')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('❌ DEBUG: Database connection error:', connectionError);
      return NextResponse.json(
        { error: 'Database connection failed', details: connectionError },
        { status: 500 }
      );
    }

    console.log('✅ DEBUG: Database connection successful');

    // Get all active users
    console.log('🔍 DEBUG: Fetching all users (ignoring is_active status for debugging)...');
    const { data: users, error } = await supabase
      .from('todo_users')
      .select('*')
      .returns<User[]>();

    if (error) {
      console.log('❌ DEBUG: User fetch error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.log('❌ DEBUG: No users found in database at all');
      return NextResponse.json(
        { error: 'No users found in database table todo_users' },
        { status: 401 }
      );
    }

    console.log(`✅ DEBUG: Found ${users.length} active users:`);
    users.forEach(user => {
      console.log(`   - ${user.full_name} (${user.email}) - Role: ${user.role}`);
    });

    // Test PIN against each user
    console.log('🔍 DEBUG: Testing PIN against users...');
    let validUser: User | null = null;
    let attempts = 0;

    for (const user of users) {
      attempts++;
      console.log(`🔍 DEBUG: Attempt ${attempts} - Testing PIN for ${user.full_name}`);
      console.log(`   PIN hash: ${user.pin_hash.substring(0, 20)}...`);
      
      try {
        const isValidPin = await bcrypt.compare(pin, user.pin_hash);
        console.log(`   Result: ${isValidPin ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (isValidPin) {
          validUser = user;
          console.log(`🎉 DEBUG: Found valid user: ${user.full_name}`);
          break;
        }
      } catch (bcryptError) {
        console.log(`❌ DEBUG: Bcrypt error for user ${user.full_name}:`, bcryptError);
      }
    }

    if (!validUser) {
      console.log('❌ DEBUG: No user found with matching PIN after', attempts, 'attempts');
      return NextResponse.json(
        { error: `Invalid PIN. Tested against ${attempts} users.` },
        { status: 401 }
      );
    }

    // Update last login
    console.log('🔍 DEBUG: Updating last login...');
    await (supabase
      .from('todo_users') as any)
      .update({ last_login: new Date().toISOString() })
      .eq('id', validUser.id);

    console.log('✅ DEBUG: Login successful for:', validUser.full_name);

    return NextResponse.json({
      success: true,
      user: {
        id: validUser.id,
        email: validUser.email,
        full_name: validUser.full_name,
        role: validUser.role
      }
    });

  } catch (error: any) {
    console.error('❌ DEBUG: Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
