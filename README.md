# UserMS — User Management System

A MERN stack app I built for managing users with role-based access. Has JWT auth with refresh token rotation, soft deletes, audit trails, and separate views per role.

---

## Live

- **URL LINK:** `https://user-management-system-liard.vercel.app`

Login with these accounts to test:

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@example.com    | Admin@123    |
| Manager | manager@example.com  | Manager@123  |
| User    | user@example.com     | User@123     |

---

## Stack

- **Frontend** — React 18, React Router v6, Axios, Context API
- **Backend** — Node.js, Express
- **DB** — MongoDB + Mongoose
- **Auth** — JWT (access + refresh tokens)
- **Other** — bcryptjs, helmet, express-rate-limit, express-validator

---

## Project Structure

```
user-management/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── layout/
    │   │       ├── Layout.jsx
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── UserList.jsx
    │   │   │   ├── UserDetail.jsx
    │   │   │   └── UserForm.jsx
    │   │   └── user/
    │   │       └── MyProfile.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   └── userService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## Running locally

You'll need Node 18+ and a MongoDB connection string (Atlas free tier is fine).

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/user-management
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Seed the DB (creates the three demo accounts):

```bash
npm run seed
```

Start:

```bash
npm run dev    # nodemon
npm start      # plain node
```

Runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

`.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Runs on `http://localhost:5173`

---

## API

### Auth

| Method | Route | Access | What it does |
|--------|-------|--------|--------------|
| POST | /api/auth/register | Public | Creates a regular user account |
| POST | /api/auth/login | Public | Returns access + refresh tokens |
| POST | /api/auth/refresh | Public | Rotates refresh token, returns new pair |
| POST | /api/auth/logout | Private | Removes refresh token from DB |
| GET | /api/auth/me | Private | Returns current user |

### Users

| Method | Route | Access | What it does |
|--------|-------|--------|--------------|
| GET | /api/users | Admin, Manager | Paginated list with search/filter |
| GET | /api/users/:id | Admin, Manager, Self | Single user |
| POST | /api/users | Admin | Create user |
| PUT | /api/users/:id | Admin / Manager (limited) / Self | Update user |
| DELETE | /api/users/:id | Admin | Soft delete (sets status inactive) |

`GET /api/users` query params: `page`, `limit`, `search`, `role`, `status`

---

## Permissions

| Action | Admin | Manager | User |
|--------|-------|---------|------|
| View all users | ✅ | ✅ (no admins) | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Create user | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Edit any user | ✅ | ✅ (non-admin only) | ❌ |
| Edit own profile | ✅ | ✅ | ✅ |
| Deactivate user | ✅ | ❌ | ❌ |
| View audit info | ✅ | ✅ | ❌ |

---

## Security notes

- Passwords hashed with bcrypt (12 rounds)
- Refresh tokens are rotated on every use — reuse triggers full revocation for that user
- Inactive users are blocked at login and at the JWT middleware level
- Passwords and refresh tokens are never included in API responses (`select: false` on the model + `toJSON()` override)
- Secrets live in env vars, not in code
- Rate limiting: 20 req/15min on auth routes, 100 req/15min elsewhere
- Helmet on all responses

---

## Deployment

### Backend on Render

1. Push to GitHub
2. New Web Service → connect repo
3. Root directory: `backend`
4. Build: `npm install` / Start: `npm start`
5. Add env vars from `.env.example`

### Frontend on Vercel

1. Import repo on Vercel
2. Root directory: `frontend`
3. Framework: Vite
4. Add `VITE_API_URL=https://your-backend.onrender.com/api`

---

## Schema

```js
User {
  name:          String        // 2–50 chars
  email:         String        // unique, lowercase
  password:      String        // bcrypt hashed, never returned
  role:          String        // 'admin' | 'manager' | 'user'
  status:        String        // 'active' | 'inactive'
  refreshTokens: [String]      // never returned

  createdBy:     ObjectId
  updatedBy:     ObjectId
  createdAt:     Date          // auto (timestamps: true)
  updatedAt:     Date          // auto
}
```