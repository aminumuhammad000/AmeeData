import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { TestClient, setupTestDB, createTestUser } from './helpers/test-utils';

// Increase timeout for tests
jest.setTimeout(30000);

describe('Authentication API', () => {
  let client: TestClient;
  let testUser: any;
  let db: any;

  beforeAll(async () => {
    // Setup in-memory database
    db = await setupTestDB();
    client = new TestClient();
    
    // Create a test user
    testUser = await createTestUser(client, {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890'
    });
  });

  afterAll(async () => {
    // Clean up database
    await db.clearDB();
    await db.closeDB();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: `newuser-${Date.now()}@example.com`,
        password: 'password123',
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      };

      const response = await client.post('/auth/register', userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message', 'User registered successfully');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(userData.email);
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: testUser.email, // Using existing email
        password: 'password123',
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      };

      const response = await client.post('/auth/register', userData);
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await client.post('/auth/login', {
        email: testUser.email,
        password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.email).toBe(testUser.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await client.post('/auth/login', {
        email: testUser.email,
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      // Login first
      await client.login({
        email: testUser.email,
        password: 'password123'
      });

      const response = await client.get('/auth/me');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('_id');
      expect(response.data.email).toBe(testUser.email);
    });

    it('should return 401 for unauthenticated request', async () => {
      // Create a new client without login
      const unauthenticatedClient = new TestClient();
      const response = await unauthenticatedClient.get('/auth/me');
      
      expect(response.status).toBe(401);
    });
  });
});
