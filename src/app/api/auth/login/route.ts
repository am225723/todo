import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPin, validatePinFormat } from '@/lib/auth/pin';
import type { Database } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();

    if (!email || !pin) {
      return NextResponse.json(
        { error: 'Email and PIN are required' },
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

    // Get user with PIN hash
    const { data: user, error: userError } = await supabase
      .from('TODO_USERS')
      .select('*')
      .eq('email', email)
      .single()
      .returns<Database['public']['Tables']['TODO_USERS']['Row'] | null>();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Type assertion to bypass TypeScript inference issue
    const userData = user as any;
    
    if (!userData.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify PIN
    const isValid = await verifyPin(pin, userData.pin_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('TODO_USER_PROFILES')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    // Type assertion for profile
    const profileData = profile as any;
    
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        display_name: profileData?.display_name || null,
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