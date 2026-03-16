# MediSlip — Complete Project Setup Guide

## Folder Structure
```
MediSlip-Complete/
├── medislip-backend/    ← Node.js + Express + MongoDB API
└── medislip-frontend/   ← React + Vite frontend
```

---

## Step 1 — Backend Setup

### 1a. Go to backend folder and install packages
```powershell
cd D:\MediSlip\medislip-backend
npm install
```

### 1b. Create the `.env` file
Create a file called `.env` in `medislip-backend/` with this content:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/medislip
JWT_SECRET=medislip_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

EMAIL_SERVICE=gmail
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **How to get Gmail App Password:**
> 1. Go to https://myaccount.google.com/apppasswords
> 2. Sign in, click "Create App Password"
> 3. Name it "MediSlip", copy the 16-character password
> 4. Paste it as EMAIL_PASS above

### 1c. Start the backend
```powershell
npm run dev
```
You should see:
```
🚀 MediSlip API running on http://localhost:5000
✅ MongoDB connected: localhost
```

---

## Step 2 — Frontend Setup

### 2a. Go to frontend folder and install packages
```powershell
cd D:\MediSlip\medislip-frontend
npm install
```

### 2b. The `.env` file is already included with:
```
VITE_API_URL=http://localhost:5000/api
```

### 2c. Start the frontend
```powershell
npm run dev
```
Open http://localhost:5173 in your browser.

---

## How OTP Verification Works

1. **Register** → Fill form → OTP sent to college email → Enter OTP → Account created ✅
2. **Login** → Enter credentials → OTP sent to email → Enter OTP → Logged in ✅

Email formats:
- Student: `id@charusat.edu.in`
- HOD: `hod.department@charusat.ac.in`
- Hospital: any valid email

---

## Keep Both Terminals Running
| Terminal | Command |
|----------|---------|
| Terminal 1 | `cd medislip-backend && npm run dev` |
| Terminal 2 | `cd medislip-frontend && npm run dev` |
