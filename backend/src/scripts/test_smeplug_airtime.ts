import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Direct test of SMEPlug airtime purchase
 * Tests the integration without going through the full app flow
 */

const SMEPLUG_API_KEY = process.env.SMEPLUG_API_KEY || '';
const BASE_URL = 'https://smeplug.ng/api';

// Network IDs according to SMEPlug API
// 1 = MTN, 2 = Airtel, 3 = 9Mobile, 4 = Glo
const NETWORKS = {
    'mtn': 1,
    'airtel': 2,
    '9mobile': 3,
    'glo': 4
};

async function testAirtimePurchase() {
    console.log('\n🧪 Testing SMEPlug Airtime Purchase...\n');

    // Test parameters
    const phone = '08100015498';
    const amount = 50;  // ₦50
    const network = 'mtn';  // Assuming MTN
    const network_id = NETWORKS[network];

    console.log('📋 Test Parameters:');
    console.log(`   Phone: ${phone}`);
    console.log(`   Amount: ₦${amount}`);
    console.log(`   Network: ${network.toUpperCase()} (ID: ${network_id})`);
    console.log(`   API Key: ${SMEPLUG_API_KEY.substring(0, 20)}...`);
    console.log('');

    try {
        // Step 1: Check balance first
        console.log('1️⃣  Checking wallet balance...');
        const balanceRes = await axios.get(`${BASE_URL}/v1/account/balance`, {
            headers: {
                'Authorization': `Bearer ${SMEPLUG_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const balance = balanceRes.data?.balance || 0;
        console.log(`   ✅ Balance: ₦${balance}`);

        if (balance < amount) {
            console.log(`   ⚠️  Insufficient balance! Need at least ₦${amount}`);
            console.log(`   💡 Please fund your SMEPlug account at https://smeplug.ng`);
            return;
        }

        console.log('');

        // Step 2: Attempt purchase
        console.log('2️⃣  Purchasing airtime...');
        const purchaseData = {
            network_id: network_id,
            amount: amount,
            phone: phone,
            customer_reference: `TEST_${Date.now()}`
        };

        console.log('   Request:', JSON.stringify(purchaseData, null, 2));

        const purchaseRes = await axios.post(
            `${BASE_URL}/v1/airtime/purchase`,
            purchaseData,
            {
                headers: {
                    'Authorization': `Bearer ${SMEPLUG_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('');
        console.log('✅ SUCCESS! Airtime Purchase Response:');
        console.log(JSON.stringify(purchaseRes.data, null, 2));

    } catch (error: any) {
        console.log('');
        console.log('❌ FAILED! Error Details:');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));

            // Specific error handling
            if (error.response.status === 403) {
                console.log('\n   💡 Tip: API authentication failed. Check your secret key.');
            } else if (error.response.status === 400) {
                console.log('\n   💡 Tip: Invalid request parameters or insufficient balance.');
            }
        } else {
            console.log('   Message:', error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
}

// Run the test
testAirtimePurchase()
    .then(() => {
        console.log('\n✨ Test completed');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });
