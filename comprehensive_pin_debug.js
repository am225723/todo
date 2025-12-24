// Comprehensive PIN debugging script
// Run this to verify everything is working correctly

const bcrypt = require('bcryptjs');

// Test PIN hashing and verification locally
async function testPinLocally() {
  console.log('🔍 Testing PIN hashing and verification locally...\n');

  const testPins = ['4207', '4539'];
  
  for (const pin of testPins) {
    console.log(`Testing PIN: ${pin}`);
    
    // Hash the PIN (same way we did in user creation)
    const hash = await bcrypt.hash(pin, 12);
    console.log(`Generated hash: ${hash}`);
    
    // Verify the PIN against the hash
    const isValid = await bcrypt.compare(pin, hash);
    console.log(`Verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    // Test with wrong PIN
    const isInvalid = await bcrypt.compare('0000', hash);
    console.log(`Wrong PIN test: ${!isInvalid ? '✅ CORRECTLY REJECTED' : '❌ INCORRECTLY ACCEPTED'}`);
    console.log('---');
  }
}

// Generate new user creation SQL with proper hashing
async function generateUserSQL() {
  console.log('\n📝 Generating new user creation SQL...\n');
  
  const users = [
    { email: 'thedoctor@drzelisko.com', full_name: 'Douglas Zelisko', pin: '4207', role: 'client' },
    { email: 'aleix@drzelisko.com', full_name: 'Aleixander Puerta', pin: '4539', role: 'admin' }
  ];

  let sql = '-- Delete existing users (if any)\n';
  sql += 'DELETE FROM TODO_users WHERE email IN (\'thedoctor@drzelisko.com\', \'aleix@drzelisko.com\');\n\n';
  sql += '-- Insert new users with properly hashed PINs\n';
  
  for (const user of users) {
    const hashedPin = await bcrypt.hash(user.pin, 12);
    sql += `INSERT INTO TODO_users (email, full_name, pin_hash, role, is_active, created_at) VALUES (\n`;
    sql += `  '${user.email}',\n`;
    sql += `  '${user.full_name}',\n`;
    sql += `  '${hashedPin}',\n`;
    sql += `  '${user.role}',\n`;
    sql += `  true,\n`;
    sql += `  NOW()\n`;
    sql += `);\n\n`;
  }

  sql += '-- Verify users were created\n';
  sql += 'SELECT email, full_name, role, is_active, LEFT(pin_hash, 20) as pin_hash_preview FROM TODO_users WHERE email IN (\'thedoctor@drzelisko.com\', \'aleix@drzelisko.com\');\n';

  return sql;
}

// Main execution
async function main() {
  await testPinLocally();
  
  const sql = await generateUserSQL();
  
  // Save SQL to file
  const fs = require('fs');
  fs.writeFileSync('fix_users_sql.sql', sql);
  
  console.log('\n✅ Debug SQL saved to fix_users_sql.sql');
  console.log('\n📋 Next steps:');
  console.log('1. Run fix_users_sql.sql in Supabase SQL Editor');
  console.log('2. Test login again with PINs 4207 and 4539');
  console.log('3. If still issues, check Supabase logs for errors');
}

main().catch(console.error);