import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
// Mock config for testing if env vars are missing
if (!process.env.PAYRANT_WEBHOOK_SECRET) {
    console.warn('⚠️ PAYRANT_WEBHOOK_SECRET not found in env, using test secret');
    process.env.PAYRANT_WEBHOOK_SECRET = 'test_secret';
}
const { payrantService } = await import('../services/payrant.service.js');
const secret = process.env.PAYRANT_WEBHOOK_SECRET || 'test_secret';
// Test Payload
const payload = {
    event: 'charge.success',
    data: {
        reference: 'test_ref_123',
        amount: 5000,
        status: 'successful',
        customer: {
            email: 'test@example.com',
            name: 'Test User'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
};
const payloadString = JSON.stringify(payload);
// Generate Signature
const hmac = crypto.createHmac('sha256', secret);
const signature = hmac.update(payloadString).digest('hex');
console.log('--- Webhook Verification Test ---');
console.log('Secret:', secret);
console.log('Payload String:', payloadString);
console.log('Generated Signature:', signature);
// Verify using the service
// We need to ensure the service picks up the config. 
// Since verifyWebhookSignature calls ensureConfig internally, we might need to mock the provider lookup or rely on env vars.
// For this test, we are relying on env vars being picked up by the service constructor or ensureConfig fallback.
// Force config update for test if needed (accessing private property via any cast if necessary, but verifyWebhookSignature calls ensureConfig)
// Let's just try calling it.
const isValid = payrantService.verifyWebhookSignature(payloadString, signature);
console.log('\n--- Result ---');
if (isValid) {
    console.log('✅ Signature Verification PASSED');
}
else {
    console.error('❌ Signature Verification FAILED');
}
// Test with invalid signature
const isInvalid = payrantService.verifyWebhookSignature(payloadString, 'invalid_signature');
if (!isInvalid) {
    console.log('✅ Invalid Signature Rejection PASSED');
}
else {
    console.error('❌ Invalid Signature Rejection FAILED');
}
