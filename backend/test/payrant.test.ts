import { describe, beforeAll, afterAll, it, expect, jest } from '@jest/globals';
import { TestClient, setupTestDB, createTestUser } from './helpers/test-utils';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Increase timeout for tests
jest.setTimeout(30000);

// Mock the Payrant service
jest.mock('../../src/services/payrant.service', () => {
  return {
    PayrantService: jest.fn().mockImplementation(() => ({
      createVirtualAccount: jest.fn().mockResolvedValue({
        success: true,
        message: 'Virtual account created successfully',
        data: {
          account_no: '1234567890',
          account_name: 'Test User',
          bank_name: 'PalmPay',
          reference: 'test-ref-123',
          provider: 'payrant'
        }
      }),
      getVirtualAccount: jest.fn().mockResolvedValue({
        success: true,
        data: {
          account_no: '1234567890',
          account_name: 'Test User',
          bank_name: 'PalmPay',
          reference: 'test-ref-123',
          provider: 'payrant',
          isActive: true
        }
      })
    }))
  };
});

describe('Payrant Virtual Account API', () => {
  let client: TestClient;
  let testUser: any;
  let mongoServer: MongoMemoryServer;
  let db: any;

  beforeAll(async () => {
    // Setup in-memory database
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    db = {
      closeDB: async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
      },
      clearDB: async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
          await collections[key].deleteMany({});
        }
      }
    };

    client = new TestClient();
    
    // Create a test user
    testUser = await createTestUser(client, {
      email: 'payrant-test@example.com',
      password: 'password123',
      firstName: 'Payrant',
      lastName: 'Test',
      phone: '+1234567890'
    });
  });

  afterAll(async () => {
    // Clean up database
    await db.clearDB();
    await db.closeDB();
  });

  describe('POST /payment/payrant/create-virtual-account', () => {
    it('should create a virtual account for authenticated user', async () => {
      // Login first
      await client.login({
        email: testUser.email,
        password: 'password123'
      });

      const virtualAccountData = {
        documentType: 'nin',
        documentNumber: '12345678901',
        virtualAccountName: 'Test User',
        customerName: 'Test User',
        email: testUser.email,
        accountReference: `test-ref-${Date.now()}`
      };

      const response = await client.post(
        '/payment/payrant/create-virtual-account',
        virtualAccountData
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('account_no');
      expect(response.data.data).toHaveProperty('account_name');
      expect(response.data.data).toHaveProperty('bank_name', 'PalmPay');
    });

    it('should return 400 for missing required fields', async () => {
      await client.login({
        email: testUser.email,
        password: 'password123'
      });

      const response = await client.post(
        '/payment/payrant/create-virtual-account',
        { documentType: 'nin' } // Missing other required fields
      );

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('message');
    });
  });

  describe('GET /payment/payrant/virtual-account', () => {
    it('should get virtual account details for authenticated user', async () => {
      await client.login({
        email: testUser.email,
        password: 'password123'
      });

      const response = await client.get('/payment/payrant/virtual-account');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data.data).toHaveProperty('account_no');
      expect(response.data.data).toHaveProperty('account_name');
    });

    it('should return 404 if no virtual account exists', async () => {
      // Create a new user without a virtual account
      const newUser = await createTestUser(client, {
        email: `newuser-${Date.now()}@example.com`,
        password: 'password123'
      });

      await client.login({
        email: newUser.email,
        password: 'password123'
      });

      // Mock the service to return null for this test
      const mockPayrantService = require('../../src/services/payrant.service');
      mockPayrantService.PayrantService.mockImplementationOnce(() => ({
        getVirtualAccount: jest.fn().mockResolvedValue(null)
      }));

      const response = await client.get('/payment/payrant/virtual-account');
      
      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('message', 'Virtual account not found');
    });
  });
  });
});
