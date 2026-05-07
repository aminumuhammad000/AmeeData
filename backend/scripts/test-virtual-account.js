const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

async function testVirtualAccount() {
  try {
    // 1. Login to get a token
    console.log('🔑 Logging in...');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@example.com', // Replace with test user email
      password: 'password'       // Replace with test user password
    });
    
    const token = loginRes.data.token;
    console.log('✅ Logged in successfully');

    // 2. Create virtual account
    console.log('\n🏦 Creating virtual account...');
    const vaRes = await axios.post(
      `${API_URL}/api/payment/payrant/virtual-account`,
      {
        documentType: 'nin',
        documentNumber: '12345678901', // Test NIN
        virtualAccountName: 'Test User',
        customerName: 'Test User',
        email: 'test@example.com',
        accountReference: `test-${Date.now()}`
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Virtual account created:', JSON.stringify(vaRes.data, null, 2));

    // 3. Verify virtual account was saved
    console.log('\n🔍 Verifying virtual account in database...');
    const verifyRes = await axios.get(
      `${API_URL}/api/payment/payrant/virtual-account`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Virtual account from API:', JSON.stringify(verifyRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    process.exit(1);
  }
}

testVirtualAccount();
