# VTU Admin API Documentation

**Base URL:** `/api/v1/admin`

## 1. Authentication

### POST `/login`
- **Description:** Admin login
- **Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "admin": { /* admin user object */ },
      "token": "JWT_TOKEN"
    },
    "message": "Login successful"
  }
  ```

---

## 2. Dashboard

### GET `/dashboard`
- **Description:** Get dashboard statistics
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 100,
      "activeUsers": 80,
      "totalTransactions": 500,
      "successfulTransactions": 450
    },
    "message": "Dashboard stats retrieved successfully"
  }
  ```

---

## 3. User Management

### GET `/users`
- **Description:** List all users (paginated)
- **Query:** `page`, `limit`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": [ /* array of user objects */ ],
    "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 10 },
    "message": "Users retrieved successfully"
  }
  ```

### GET `/users/:id`
- **Description:** Get user details
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": { /* user object */ },
    "message": "User retrieved successfully"
  }
  ```

### PUT `/users/:id`
- **Description:** Update user details
- **Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "08012345678",
    "status": "active",
    "kyc_status": "verified"
  }
  ```
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": { /* updated user object */ },
    "message": "User updated successfully"
  }
  ```

### PUT `/users/:id/status`
- **Description:** Update user status
- **Body:**
  ```json
  { "status": "active" }
  ```
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": { /* updated user object */ },
    "message": "User status updated successfully"
  }
  ```

### DELETE `/users/:id`
- **Description:** Delete a user
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": null,
    "message": "User deleted successfully"
  }
  ```

---

## 4. Audit Logs

### GET `/audit-logs`
- **Description:** List audit logs (paginated)
- **Query:** `page`, `limit`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": [ /* array of audit log objects */ ],
    "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 10 },
    "message": "Audit logs retrieved successfully"
  }
  ```

### DELETE `/audit-logs/:id`
- **Description:** Delete an audit log
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": null,
    "message": "Audit log deleted successfully"
  }
  ```

---

## Suggested Admin Dashboard UI Structure

### Pages
- Login Page
- Dashboard (stats)
- Users (table, view, edit, status, delete)
- Audit Logs (table, delete)
- Profile/Settings

### Components
- Sidebar navigation
- Topbar with admin info and logout
- Data tables
- Modals for edit/delete
- Toast notifications

### Tech Stack
- Vite + React + TypeScript
- TailwindCSS
- React Router
- React Query
- Axios
- React Hook Form
- Headless UI
