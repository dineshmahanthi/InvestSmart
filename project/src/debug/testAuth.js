/**
 * Auth Debugging Tool
 * This code can be pasted in the browser console when on the login page
 * to test the authentication flow directly.
 */

// Test credentials
const testCredentials = {
  email: 'rajesh@example.com',
  password: 'Password123'
};

// Function to test direct API call
async function testDirectApiCall() {
  try {
    console.log('Testing direct API call with:', testCredentials);
    
    // First try with relative URL (proxy)
    console.log('\n1. Testing with relative URL (using proxy):');
    let response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });
    
    console.log('Response status:', response.status);
    let data;
    
    try {
      data = await response.json();
      console.log('Response data:', data);
    } catch (err) {
      console.error('Failed to parse response JSON:', err);
    }
    
    // Try with absolute URL
    console.log('\n2. Testing with absolute URL (bypassing proxy):');
    response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });
    
    console.log('Response status:', response.status);
    
    try {
      data = await response.json();
      console.log('Response data:', data);
    } catch (err) {
      console.error('Failed to parse response JSON:', err);
    }
    
    // Also check if the user exists with the check-email endpoint
    console.log('\n3. Checking if user exists:');
    response = await fetch(`/api/auth/check-email/${testCredentials.email}`);
    
    console.log('Response status:', response.status);
    
    try {
      data = await response.json();
      console.log('User existence check:', data);
    } catch (err) {
      console.error('Failed to parse response JSON:', err);
    }
    
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

// Run the test
testDirectApiCall();

// Instructions:
console.log(`
=====================================================
AUTH DEBUGGING TOOL - INSTRUCTIONS
=====================================================
1. Open browser dev tools (F12)
2. Go to the login page in your app
3. Copy this entire script
4. Paste it in the console and press Enter
5. Check the console output for diagnostic information
=====================================================
`);
