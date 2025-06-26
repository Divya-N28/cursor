const { processFile } = require('./modernFileProcessor');

async function runTests() {
  console.log('Running tests...\n');

  // Test 1: Valid file processing
  try {
    console.log('Test 1: Processing valid file');
    await processFile('input.txt', 'output.txt');
    console.log('✓ Test 1 passed\n');
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message);
  }

  // Test 2: Invalid file path
  try {
    console.log('Test 2: Invalid file path');
    await processFile('nonexistent.txt');
    console.error('✗ Test 2 failed: Should have thrown an error');
  } catch (error) {
    console.log('✓ Test 2 passed:', error.message);
  }

  // Test 3: Invalid input type
  try {
    console.log('\nTest 3: Invalid input type');
    await processFile(null);
    console.error('✗ Test 3 failed: Should have thrown an error');
  } catch (error) {
    console.log('✓ Test 3 passed:', error.message);
  }
}

runTests(); 