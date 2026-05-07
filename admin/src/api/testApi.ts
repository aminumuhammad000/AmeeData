/**
 * API Testing Utility
 * This file contains functions to test all API endpoints
 * Run this in the browser console to test all endpoints
 */

import {
  deleteAuditLog,
  deleteUser,
  getAuditLogs,
  getDashboardStats,
  getUser,
  getUsers,
  login,
  updateUser,
  updateUserStatus,
} from './adminApi';

// Test credentials (update with your actual test account)
const TEST_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password',
};

/**
 * Test all API endpoints
 */
export const testAllEndpoints = async () => {
  console.log('🚀 Starting API endpoint tests...\n');

  try {
    // 1. Test Login
    console.log('1️⃣ Testing POST /login');
    const loginResponse = await login(TEST_CREDENTIALS);
    console.log('✅ Login successful', loginResponse.data);
    const token = loginResponse.data.data.token;
    console.log('📌 Token:', token);
    localStorage.setItem('token', token);
    console.log('');

    // 2. Test Get Dashboard Stats
    console.log('2️⃣ Testing GET /dashboard');
    const dashboardResponse = await getDashboardStats();
    console.log('✅ Dashboard stats retrieved', dashboardResponse.data);
    console.log('');

    // 3. Test Get Users (paginated)
    console.log('3️⃣ Testing GET /users (paginated)');
    const usersResponse = await getUsers({ page: 1, limit: 10 });
    console.log('✅ Users retrieved', usersResponse.data);
    console.log('');

    // 4. Test Get Single User (if users exist)
    if (usersResponse.data.data && usersResponse.data.data.length > 0) {
      const userId = usersResponse.data.data[0].id || usersResponse.data.data[0]._id;
      console.log('4️⃣ Testing GET /users/:id');
      const userResponse = await getUser(userId);
      console.log('✅ User details retrieved', userResponse.data);
      console.log('');

      // 5. Test Update User Status
      console.log('5️⃣ Testing PUT /users/:id/status');
      const currentStatus = userResponse.data.data.status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const statusUpdateResponse = await updateUserStatus(userId, newStatus);
      console.log('✅ User status updated', statusUpdateResponse.data);
      console.log('');

      // 6. Test Update User Details
      console.log('6️⃣ Testing PUT /users/:id');
      const updateResponse = await updateUser(userId, {
        first_name: 'Updated',
        last_name: 'User',
      });
      console.log('✅ User details updated', updateResponse.data);
      console.log('');
    } else {
      console.log('⚠️ No users available for testing individual user endpoints');
      console.log('');
    }

    // 7. Test Get Audit Logs
    console.log('7️⃣ Testing GET /audit-logs (paginated)');
    const auditLogsResponse = await getAuditLogs({ page: 1, limit: 10 });
    console.log('✅ Audit logs retrieved', auditLogsResponse.data);
    console.log('');

    // 8. Test Delete Audit Log (if logs exist)
    if (
      auditLogsResponse.data.data &&
      auditLogsResponse.data.data.length > 0
    ) {
      const logId =
        auditLogsResponse.data.data[0].id || auditLogsResponse.data.data[0]._id;
      console.log('8️⃣ Testing DELETE /audit-logs/:id');
      const deleteLogResponse = await deleteAuditLog(logId);
      console.log('✅ Audit log deleted', deleteLogResponse.data);
      console.log('');
    } else {
      console.log('⚠️ No audit logs available for testing delete endpoint');
      console.log('');
    }

    console.log('✅ All API endpoint tests completed successfully!');
  } catch (error: any) {
    console.error('❌ Error during API testing:', error);
    console.error('Response:', error.response?.data || error.message);
  }
};

/**
 * Test individual endpoints
 */
export const testEndpoint = async (endpoint: string, ...args: any[]) => {
  try {
    switch (endpoint) {
      case 'login':
        return await login(args[0] || TEST_CREDENTIALS);
      case 'getDashboardStats':
        return await getDashboardStats();
      case 'getUsers':
        return await getUsers(args[0]);
      case 'getUser':
        return await getUser(args[0]);
      case 'updateUser':
        return await updateUser(args[0], args[1]);
      case 'updateUserStatus':
        return await updateUserStatus(args[0], args[1]);
      case 'deleteUser':
        return await deleteUser(args[0]);
      case 'getAuditLogs':
        return await getAuditLogs(args[0]);
      case 'deleteAuditLog':
        return await deleteAuditLog(args[0]);
      default:
        console.error(`Unknown endpoint: ${endpoint}`);
        return null;
    }
  } catch (error: any) {
    console.error(`Error testing ${endpoint}:`, error);
    return error.response?.data || error.message;
  }
};

// Export for browser console usage
(window as any).testAllEndpoints = testAllEndpoints;
(window as any).testEndpoint = testEndpoint;

console.log(
  '📝 API testing utilities loaded. Use testAllEndpoints() or testEndpoint(name, ...args) in console.',
);
