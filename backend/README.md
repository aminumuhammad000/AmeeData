# VTU App Backend API Documentation

A comprehensive backend API for VTU (Virtual Top-Up) services including airtime, data, cable TV, electricity, and exam pin purchases.

## Base URL
```
http://localhost:PORT
```

## Technologies Used
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose v8.19.2
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Security**: Helmet, CORS, Express Rate Limit
- **Logging**: Winston, Morgan

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Wallet Management](#wallet-management)
4. [Bill Payment Services](#bill-payment-services)
5. [Transactions](#transactions)
6. [Notifications](#notifications)
7. [Support Tickets](#support-tickets)
8. [Promotions](#promotions)
9. [Admin Dashboard](#admin-dashboard)

---

## Authentication

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "phone_number": "+234XXXXXXXXXX",
  "first_name": "John",
  "last_name": "Doe",
  "referral_code": "ABC123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "phone_number": "+234XXXXXXXXXX",
      "first_name": "John",
      "last_name": "Doe",
      "referral_code": "XYZ789",
      "country": "Nigeria",
      "kyc_status": "pending",
      "status": "active",
      "biometric_enabled": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

### POST `/api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "phone_number": "+234XXXXXXXXXX",
      "first_name": "John",
      "last_name": "Doe",
      "referral_code": "XYZ789",
      "country": "Nigeria",
      "kyc_status": "pending",
      "status": "active",
      "biometric_enabled": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

### POST `/api/auth/verify-otp`
Verify OTP sent during registration or other verification processes.

**Request Body:**
```json
{
  "phone_number": "+234XXXXXXXXXX",
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account verified successfully"
}
```

---

### POST `/api/auth/resend-otp`
Resend OTP to user.

**Request Body:**
```json
{
  "phone_number": "+234XXXXXXXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

---

## User Management

### GET `/api/users/profile`
Get current user profile (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "phone_number": "+234XXXXXXXXXX",
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-01",
      "address": "123 Main St",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "kyc_status": "pending",
      "kyc_document_id_front_url": null,
      "kyc_document_id_back_url": null,
      "referral_code": "XYZ789",
      "biometric_enabled": false,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### PUT `/api/users/profile`
Update user profile (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "phone_number": "+234XXXXXXXXXX",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone_number": "+234XXXXXXXXXX"
    }
  }
}
```

---

### DELETE `/api/users/profile`
Delete user account (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### POST `/api/users/kyc`
Upload KYC documents (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
document: file
documentType: string (e.g., "passport", "drivers_license", "national_id")
```

**Response:**
```json
{
  "success": true,
  "message": "KYC document uploaded successfully"
}
```

---

### GET `/api/users`
Get all users - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "users": [...]
}
```

---

### GET `/api/users/:id`
Get user by ID - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

---

### PUT `/api/users/:id`
Update user by ID - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### DELETE `/api/users/:id`
Delete user by ID - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## Wallet Management

### GET `/api/wallet`
Get user wallet details (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "balance": 5000.00,
    "currency": "NGN",
    "userId": "user_id"
  }
}
```

---

### POST `/api/wallet/fund`
Fund wallet (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 1000.00,
  "paymentMethod": "card",
  "reference": "payment_reference"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet funded successfully",
  "balance": 6000.00
}
```

---

### GET `/api/wallet/transactions`
Get wallet transaction history (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn_id",
      "type": "credit",
      "amount": 1000.00,
      "date": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### PUT `/api/wallet/adjust`
Adjust wallet balance - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "amount": 500.00,
  "type": "credit",
  "reason": "Refund"
}
```

---

### POST `/api/wallet/transfer`
Transfer funds to another user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "recipientId": "recipient_user_id",
  "amount": 1000.00,
  "note": "Payment for services"
}
```

---

## Bill Payment Services

**Note:** Bill payment routes are currently commented out in `app.ts`. Uncomment to activate.

All bill payment endpoints require authentication.

**Base Path:** `/api/billpayment`

### GET `/api/billpayment/networks`
Get available mobile networks.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "networks": [
    {"id": "mtn", "name": "MTN"},
    {"id": "glo", "name": "GLO"},
    {"id": "airtel", "name": "Airtel"},
    {"id": "9mobile", "name": "9Mobile"}
  ]
}
```

---

### GET `/api/billpayment/data-plans`
Get available data plans.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `network`: Network ID (required)

**Response:**
```json
{
  "success": true,
  "plans": [...]
}
```

---

### GET `/api/billpayment/cable-providers`
Get cable TV providers.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {"id": "dstv", "name": "DSTV"},
    {"id": "gotv", "name": "GOTV"},
    {"id": "startimes", "name": "StarTimes"}
  ]
}
```

---

### GET `/api/billpayment/electricity-providers`
Get electricity distribution companies.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "providers": [...]
}
```

---

### GET `/api/billpayment/exampin-providers`
Get exam pin providers.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {"id": "waec", "name": "WAEC"},
    {"id": "neco", "name": "NECO"}
  ]
}
```

---

### POST `/api/billpayment/airtime`
Purchase airtime (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "network": "mtn",
  "phone": "+234XXXXXXXXXX",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "reference": "txn_ref",
    "status": "success"
  }
}
```

---

### POST `/api/billpayment/data`
Purchase data bundle (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "network": "mtn",
  "phone": "+234XXXXXXXXXX",
  "planId": "plan_id",
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data bundle purchased successfully",
  "transaction": {...}
}
```

---

### POST `/api/billpayment/cable/verify`
Verify cable TV account (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "provider": "dstv",
  "smartCardNumber": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "accountName": "John Doe",
  "accountNumber": "1234567890"
}
```

---

### POST `/api/billpayment/cable/purchase`
Purchase cable TV subscription (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "provider": "dstv",
  "smartCardNumber": "1234567890",
  "package": "package_id",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cable TV subscription successful",
  "transaction": {...}
}
```

---

### POST `/api/billpayment/electricity/verify`
Verify electricity meter number (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "provider": "ekedc",
  "meterNumber": "12345678901",
  "meterType": "prepaid"
}
```

**Response:**
```json
{
  "success": true,
  "accountName": "John Doe",
  "address": "123 Main St"
}
```

---

### POST `/api/billpayment/electricity/purchase`
Purchase electricity token (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "provider": "ekedc",
  "meterNumber": "12345678901",
  "meterType": "prepaid",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Electricity token purchased successfully",
  "token": "1234-5678-9012-3456",
  "transaction": {...}
}
```

---

### POST `/api/billpayment/exampin`
Purchase exam pin (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "provider": "waec",
  "quantity": 1,
  "examType": "waec_gce"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exam pin purchased successfully",
  "pins": [
    {
      "serial": "ABC123456789",
      "pin": "123456789012"
    }
  ]
}
```

---

### GET `/api/billpayment/transaction/:reference`
Get bill payment transaction status (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "reference": "txn_ref",
    "status": "success",
    "type": "airtime",
    "amount": 100
  }
}
```

---

## Transactions

### POST `/api/transactions`
Create a new transaction (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "type": "airtime",
  "amount": 100,
  "details": {...}
}
```

---

### GET `/api/transactions`
Get user transactions (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `type` (optional): Filter by type

**Response:**
```json
{
  "success": true,
  "transactions": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

### GET `/api/transactions/all`
Get all transactions - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### GET `/api/transactions/:id`
Get transaction by ID (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "transaction": {...}
}
```

---

### PUT `/api/transactions/:id/status`
Update transaction status - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

---

## Notifications

### GET `/api/notifications`
Get user notifications (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif_id",
      "title": "Transaction Successful",
      "message": "Your airtime purchase was successful",
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/notifications/:id`
Get notification by ID (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### PUT `/api/notifications/:id/read`
Mark notification as read (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT `/api/notifications/read-all`
Mark all notifications as read (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### DELETE `/api/notifications/:id`
Delete notification (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### DELETE `/api/notifications`
Delete all notifications (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## Support Tickets

### POST `/api/support`
Create support ticket (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "subject": "Issue with transaction",
  "message": "My transaction failed but I was debited",
  "category": "transaction",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "ticket_id",
    "ticketNumber": "TICK-001",
    "status": "open"
  }
}
```

---

### GET `/api/support`
Get user support tickets (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "tickets": [...]
}
```

---

### GET `/api/support/all`
Get all support tickets - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### GET `/api/support/:id`
Get ticket by ID (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### PUT `/api/support/:id/status`
Update ticket status - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "resolved"
}
```

---

### PUT `/api/support/:id`
Update ticket (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "message": "Additional information..."
}
```

---

### DELETE `/api/support/:id`
Delete ticket (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## Promotions

### GET `/api/promotions`
Get active promotions (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "promotions": [
    {
      "id": "promo_id",
      "title": "New Year Bonus",
      "description": "Get 10% extra on all recharges",
      "code": "NEWYEAR2024",
      "discount": 10,
      "validFrom": "2024-01-01",
      "validTo": "2024-01-31"
    }
  ]
}
```

---

### POST `/api/promotions`
Create promotion - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "New Year Bonus",
  "description": "Get 10% extra on all recharges",
  "code": "NEWYEAR2024",
  "discount": 10,
  "validFrom": "2024-01-01",
  "validTo": "2024-01-31"
}
```

---

### GET `/api/promotions/:id`
Get promotion by ID (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### PUT `/api/promotions/:id`
Update promotion - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### DELETE `/api/promotions/:id`
Delete promotion - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## Admin Dashboard

### POST `/api/admin/login`
Admin login.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "admin": {
    "id": "admin_id",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### GET `/api/admin/dashboard`
Get dashboard statistics - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1000,
    "totalTransactions": 5000,
    "totalRevenue": 1000000,
    "activeUsers": 500,
    "pendingTickets": 10
  }
}
```

---

### GET `/api/admin/users`
Get all users - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

---

### GET `/api/admin/users/:id`
Get user by ID - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### PUT `/api/admin/users/:id/status`
Update user status - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "active"
}
```

---

### PUT `/api/admin/users/:id`
Update user - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### DELETE `/api/admin/users/:id`
Delete user - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

### GET `/api/admin/audit-logs`
Get audit logs - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `action` (optional): Filter by action type

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_id",
      "userId": "user_id",
      "action": "user_login",
      "timestamp": "2024-01-01T00:00:00Z",
      "ipAddress": "192.168.1.1"
    }
  ]
}
```

---

### DELETE `/api/admin/audit-logs/:id`
Delete audit log - Admin only (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## System Endpoints

### GET `/`
Root endpoint - Health check.

**Response:**
```
✅ Connecta Backend (MongoDB) is running...
```

---

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### GET `/api/test-topupmate`
Test TopUpMate service integration.

**Response:**
```json
{
  "success": true,
  "message": "TopUpMate service is working!",
  "data": [...]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details"
}
```

---

## Rate Limiting

API endpoints are protected with rate limiting to prevent abuse. Default limits apply per IP address.

---

## Environment Variables

Required environment variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TOPUPMATE_API_KEY=your_topupmate_api_key
TOPUPMATE_BASE_URL=https://api.topupmate.com
NODE_ENV=development
```

---

## Development

### Setup
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

---

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Helmet**: Security headers protection
- **CORS**: Cross-Origin Resource Sharing enabled
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Express Validator for request validation
- **Password Hashing**: bcryptjs for secure password storage

---

## Logging

- **Winston**: Structured logging for production
- **Morgan**: HTTP request logging for development

---

## License

ISC

---

## Support

For issues or questions, create a support ticket through the `/api/support` endpoint or contact the development team.
