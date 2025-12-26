// Simple test to verify login API logic
// Run with: node test_login_api.js

const bcrypt = require('bcryptjs');

// Test PINs
const pins = {
  douglas: '4207',
  aleixander: '4539'
};

// Test PIN hashes (these are the ones in our SQL)
const hashes = {
  douglas: '$2b$12$D3SzkYG0wRwE9qQTKA/z2OWL129.W1Zb2f1pwfXwStBcZZEB.kEV2',
  aleixander: '$2b$12$gXPjjaVGmxmLnfEFVqAKAOL4gfCfvwhCf334sFLTCXHueXLfFEuOa'
};

async function verifyPins() {
  console.log('Testing PIN verification...\n');

  // Test Douglas
  const douglasValid = await bcrypt.compare(pins.douglas, hashes.douglas);
  console.log(`Douglas PIN (4207): ${douglasValid ? 'VALID' : 'INVALID'}`);

  // Test Aleixander
  const aleixanderValid = await bcrypt.compare(pins.aleixander, hashes.aleixander);
  console.log(`Aleixander PIN (4539): ${aleixanderValid ? 'VALID' : 'INVALID'}`);

  // Test wrong PIN
  const wrongPinValid = await bcrypt.compare('0000', hashes.douglas);
  console.log(`Wrong PIN test: ${!wrongPinValid ? 'CORRECTLY REJECTED' : 'INCORRECTLY ACCEPTED'}`);

  console.log('\nAll PIN tests completed!');
}

verifyPins().catch(console.error);