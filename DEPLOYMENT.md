# 🚀 Deployment Guide - Cricket Team App to Vercel

## Step-by-Step Deployment Process

### **1. Prerequisites**
- ✅ GitHub account
- ✅ Vercel account (free at [vercel.com](https://vercel.com))
- ✅ Firebase project set up
- ✅ Your code ready in this directory

### **2. Push Code to GitHub**

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - Cricket Team Management App"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/cricket-team-tracker.git
git branch -M main
git push -u origin main
```

### **3. Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: cricket-team-tracker
# - Directory: ./
# - Override settings? No
```

#### **Option B: Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. **Import** your GitHub repository
4. **Configure** project settings:
   - Framework: **Next.js**
   - Root Directory: **.**
   - Build Command: **npm run build**
   - Output Directory: **.next**

### **4. Configure Environment Variables**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123:web:abc123
```

**⚠️ Important**: Add these to **all environments** (Production, Preview, Development)

### **5. Update Firebase Configuration**

#### **Add Vercel Domain to Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domains:
   - `your-app-name.vercel.app`
   - `your-app-name-git-main-username.vercel.app`
   - Any custom domains you plan to use

#### **Update Firestore Security Rules**
Make sure your rules allow public read access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for dashboard
    match /practice-sessions/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /players/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### **6. Test Your Deployment**

1. **Visit your app**: `https://your-app-name.vercel.app`
2. **Test features**:
   - ✅ Dashboard loads
   - ✅ Can view existing data
   - ✅ Manager can sign in
   - ✅ Mobile entry works
   - ✅ Charts display correctly

### **7. Custom Domain (Optional)**

1. **Buy domain** (e.g., from Namecheap, GoDaddy)
2. **In Vercel Dashboard** → Your Project → Settings → Domains
3. **Add domain** and follow DNS setup instructions
4. **Update Firebase** authorized domains with your custom domain

### **8. Ongoing Updates**

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys on push to main branch!
```

## 🎯 **Quick Deployment Checklist**

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Firebase domains updated
- [ ] App tested and working
- [ ] Team notified of new URL

## 🔧 **Troubleshooting**

### **Build Errors**
- Check Vercel build logs
- Ensure all dependencies in package.json
- Verify TypeScript types

### **Firebase Connection Issues**
- Double-check environment variables
- Verify Firebase project settings
- Check authorized domains

### **Authentication Problems**
- Confirm authorized domains in Firebase
- Check environment variables are set for all environments

## 📱 **Mobile Testing**

Test on actual mobile devices:
- iOS Safari
- Android Chrome
- Touch interactions
- Responsive design

---

🎉 **Congratulations!** Your cricket team app is now live on Vercel!