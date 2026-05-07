# VTU Admin Dashboard

Admin dashboard application for managing users, viewing statistics, and tracking audit logs.

## ✅ Project Status: COMPLETE

All API endpoints have been implemented, tested, and documented. The admin dashboard is ready for development and testing.

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Access at: `http://localhost:5173/`

### Production Build
```bash
npm run build
npm run preview
```

### Testing APIs
```bash
bash test_api.sh
```

---

## 📦 Tech Stack

- **Frontend:** Vite + React 19 + TypeScript
- **Styling:** TailwindCSS
- **Data Fetching:** React Query + Axios
- **Forms:** React Hook Form
- **Routing:** React Router v7
- **Components:** Headless UI

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `APIDOCS.md` | API specification |
| `ENDPOINT_REFERENCE.md` | Complete endpoint reference |
| `API_TESTING_GUIDE.md` | Browser testing guide |
| `QUICK_API_TEST.md` | Quick cURL reference |
| `API_TESTING_SUMMARY.md` | Testing overview |

---

## 🧪 API Testing

### Option 1: Automated (Recommended)
```bash
bash test_api.sh
```

### Option 2: Browser Console
```javascript
testAllEndpoints()  // Test all
testEndpoint('login', { email: 'admin@example.com', password: 'password' })  // Test single
```

### Option 3: Manual cURL
See `QUICK_API_TEST.md`

---

## 📋 Features

- ✅ Admin authentication (JWT)
- ✅ Dashboard with statistics
- ✅ User management (view, edit, delete, status)
- ✅ Audit logs tracking
- ✅ Admin profile management
- ✅ Protected routes
- ✅ Responsive design

---

## 🏗️ Project Structure

```
src/
├── api/           # API endpoints and config
├── components/    # Reusable UI components
├── hooks/         # Custom hooks and auth context
├── pages/         # Page components
├── App.tsx        # Main app with routing
└── main.tsx       # Entry point
```

---

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 📡 API Base URL

- **Development:** `http://localhost:5000/api/v1/admin`
- **Production:** `https://vtuapp-production.up.railway.app/api/v1/admin`

---

## 🔐 Authentication

All endpoints (except `/login`) require JWT token in header:
```
Authorization: Bearer <TOKEN>
```

---

## 🐛 Troubleshooting

### Backend Connection Error
Ensure backend is running on `http://localhost:5000`

### Styles Not Loading
```bash
npm run build  # Check if CSS is generated
```

### Build Fails
```bash
npm install  # Reinstall dependencies
npm run build
```

---

## 📞 Support

For detailed information, see the documentation files in the project root.
# ibdata-admin
