# Quick Setup Guide for Cricket Team Tracker

## ✅ Completed
- ✅ Firebase configuration
- ✅ Dependencies installed
- ✅ NextAuth secret generated

## 🔧 Still Need to Complete

### 1. Google OAuth Setup (Required for login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

### 2. Firebase Authentication Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select "cricket-track" project
3. Authentication → Sign-in method → Enable Google
4. Add your Google OAuth Client ID

### 3. Firestore Database Setup
1. In Firebase Console → Firestore Database
2. Create database (start in test mode)
3. Collections will be created automatically when you add data

## 🚀 Run the App
```bash
npm run dev
```

## 📝 Test Data Entry
Once setup is complete, sign in with nhremon8181@gmail.com to add practice session data.

## 🔒 Access Control
- Only nhremon8181@gmail.com can add/edit data
- Others can view dashboard after signing in with Google