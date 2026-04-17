# IIoT Authentication Backend

Node.js/Express authentication server with Prisma ORM and MySQL.

## Features
- User signup with email verification
- Secure signin with JWT tokens
- Password hashing with bcrypt (12 rounds)
- Forgot/reset password flow
- Protected routes middleware

## Setup

### 1. Install Dependencies
```bash
cd auth-backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
- `DATABASE_URL` - Your MySQL connection string
- `JWT_SECRET` - A strong secret key
- `SMTP_*` - Your email provider settings
- `FRONTEND_URL` - Your frontend URL

### 3. Setup Database
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE iiot_auth;"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Server
```bash
npm start
# or for development
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| GET | `/api/auth/verify/:token` | Verify email |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/resend-verification` | Resend verification email |

## Email Setup (Gmail)
1. Enable 2FA on your Google account
2. Generate an App Password
3. Use the app password in `SMTP_PASS`
