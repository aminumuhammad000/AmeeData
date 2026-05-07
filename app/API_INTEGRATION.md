# API Integration Documentation

## Overview
This document outlines the API integration between the frontend (React Native/Expo) and backend (Node.js/Express).

## Base Configuration
- **Backend URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token
- **Storage**: AsyncStorage for token and user data persistence

## Services Created

### 1. API Client (`services/api.ts`)
Base axios instance with:
- Request interceptor for JWT token injection
- Response interceptor for 401 handling
- 30-second timeout
- Automatic token cleanup on auth errors

### 2. Auth Service (`services/auth.service.ts`)
Handles authentication operations:

#### Endpoints:
- **POST** `/auth/register` - User registration
- **POST** `/auth/login` - User login
- **POST** `/auth/verify-otp` - OTP verification
- **POST** `/auth/resend-otp` - Resend OTP

#### Methods:
- `register(data)` - Register new user with first_name, last_name, email, phone_number, password, referral_code
- `login(data)` - Login with email and password
- `verifyOTP(phone_number, otp_code)` - Verify OTP
- `resendOTP(phone_number)` - Resend OTP
- `logout()` - Clear stored credentials
- `getCurrentUser()` - Get stored user data
- `isAuthenticated()` - Check auth status

### 3. Wallet Service (`services/wallet.service.ts`)
Handles wallet operations:

#### Endpoints:
- **GET** `/wallet` - Get user wallet
- **POST** `/wallet/topup` - Top up wallet

#### Methods:
- `getWallet()` - Fetch wallet balance
- `topUp(amount, payment_method)` - Add funds to wallet

### 4. Transaction Service (`services/transaction.service.ts`)
Handles transaction operations:

#### Endpoints:
- **GET** `/transactions` - Get user transactions (paginated)
- **GET** `/transactions/:id` - Get specific transaction
- **POST** `/billpayment/airtime` - Purchase airtime
- **POST** `/billpayment/data` - Purchase data
- **GET** `/billpayment/balance` - Get wallet balance (API Key only)

#### Methods:
- `getTransactions(page, limit)` - Fetch paginated transactions
- `getTransactionById(id)` - Get transaction details
- `purchaseAirtime(data)` - Buy airtime
- `purchaseData(data)` - Buy data bundle

### 5. User Service (`services/user.service.ts`)
Handles user profile operations:

#### Endpoints:
- **GET** `/users/profile` - Get user profile
- **PUT** `/users/profile` - Update profile
- **PUT** `/users/password` - Update password

#### Methods:
- `getProfile()` - Fetch user profile
- `updateProfile(data)` - Update user information
- `updatePassword(currentPassword, newPassword)` - Change password

## Field Mapping (Frontend ↔ Backend)

### User Model
Backend fields match frontend implementation:

| Backend Field | Frontend Usage | Required | Notes |
|--------------|----------------|----------|-------|
| `email` | ✅ Used | Yes | Unique identifier |
| `phone_number` | ✅ Used | Yes | Format: 10-15 digits |
| `password_hash` | ✅ Used (as `password`) | Yes | Min 6 characters |
| `first_name` | ✅ Used | Yes | Split from fullName |
| `last_name` | ✅ Used | Yes | Split from fullName |
| `date_of_birth` | ⚪ Not used yet | No | Optional field |
| `address` | ⚪ Not used yet | No | Optional field |
| `city` | ⚪ Not used yet | No | Optional field |
| `state` | ⚪ Not used yet | No | Optional field |
| `country` | ✅ Default: 'Nigeria' | Yes | Auto-set by backend |
| `kyc_status` | ⚪ Not used yet | No | Backend managed |
| `referral_code` | ✅ Used | Yes | Auto-generated |
| `referred_by` | ✅ Used (optional input) | No | Optional referral |
| `biometric_enabled` | ⚪ Not used yet | No | Future feature |
| `status` | ⚪ Not used yet | No | Backend managed |

### Frontend Changes Made

#### SignupScreen.js
**Removed:**
- `fullName` field (not in backend)
- `rememberMe` functionality (not in backend)

**Added:**
- `first_name` field (backend required)
- `last_name` field (backend required)
- `referral_code` field (backend optional)
- API integration with error handling
- Proper validation for phone_number format

**Updated:**
- `phoneNumber` → `phone_number` (snake_case for backend)
- Real API calls instead of mock data
- Success/error alert handling

#### LoginScreen.js
**Removed:**
- `rememberMe` checkbox (not in backend)
- Mock authentication logic

**Added:**
- Real API integration
- JWT token storage
- User data persistence
- Error handling with user feedback

**Updated:**
- Proper validation
- Async/await pattern
- Navigation after successful login

#### Home Screen (index.tsx)
**Added:**
- User data loading from storage
- Dynamic welcome message with user's first_name
- Integration preparation for wallet and transactions

#### Profile Screen (profile.tsx)
**Added:**
- User data loading from storage
- Display of first_name, last_name, and email
- Logout functionality with confirmation
- Navigation back to login on logout

## Dependencies Installed
```json
{
  "axios": "^latest",
  "@react-native-async-storage/async-storage": "^latest"
}
```

## Environment Configuration

### Frontend
Update the API base URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, use:
```typescript
const API_BASE_URL = 'https://your-production-api.com/api';
```

### Backend
Ensure CORS is configured to accept requests from your frontend:
```typescript
app.use(cors({
  origin: ['http://localhost:8081', 'exp://...'],
  credentials: true
}));
```

## Error Handling
All services implement try-catch blocks and return structured error responses:
```typescript
{
  success: false,
  message: 'Error description'
}
```

## Authentication Flow
1. User registers/logs in
2. Backend returns JWT token + user data
3. Token stored in AsyncStorage
4. Token automatically attached to all subsequent requests
5. On 401 error, token is cleared and user redirected to login

## Testing Checklist
- [ ] Test registration with all required fields
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test JWT token persistence
- [ ] Test automatic token injection
- [ ] Test logout functionality
- [ ] Test 401 handling and redirect
- [ ] Test user data display on home screen
- [ ] Test user data display on profile screen

## Next Steps
1. Implement wallet balance display
2. Implement transaction history
3. Implement airtime/data purchase flows
4. Add notification integration
5. Implement KYC document upload
6. Add biometric authentication
7. Implement forgot password flow

## Notes
- All backend routes require authentication except `/auth/register`, `/auth/login`
- Phone numbers should be validated on frontend before submission
- Passwords must be at least 6 characters
- Referral code is optional during registration
