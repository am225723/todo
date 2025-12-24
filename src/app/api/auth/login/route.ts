import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPin, validatePinFormat } from '@/lib/auth/pin';

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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, supabase_uid, pin_hash, role, email, full_name, is_active')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify PIN
    const isValid = await verifyPin(pin, profile.pin_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
      redirect_url: profile.role === 'admin' ? '/admin' : '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
