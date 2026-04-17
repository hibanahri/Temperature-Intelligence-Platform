@echo off
echo Starting Auth Backend Server...
echo.
echo Make sure you have:
echo 1. MySQL running
echo 2. Created .env file from .env.example
echo 3. Run: npm install
echo 4. Run: npx prisma generate
echo 5. Run: npx prisma db push
echo.
npm start
