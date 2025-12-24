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
  try {
    return await bcrypt.compare(pin, hash);
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
}

/**
 * Validate PIN format (4-6 digits)
 */
export function validatePinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

/**
 * Generate a random PIN
 */
export function generateRandomPin(length: number = 4): string {
  if (length < 4 || length > 6) {
    throw new Error('PIN length must be between 4 and 6');
  }
  
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
}