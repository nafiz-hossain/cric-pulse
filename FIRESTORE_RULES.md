# Firestore Security Rules Fix

## The Problem:
You're getting "Missing or insufficient permissions" because Firestore has default security rules that block all writes.

## The Solution:
Go to Firebase Console and update your Firestore security rules.

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your "cricket-track" project
3. Go to "Firestore Database"
4. Click on "Rules" tab

### Step 2: Replace the Rules
Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow everyone to READ practice sessions (for dashboard viewing)
    match /practice-sessions/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow test collection for debugging
    match /test-collection/{document} {
      allow read, write: if true;
    }
    
    // Default: authenticated users can read/write everything else
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish the Rules
1. Click "Publish" button
2. Wait for confirmation

### Alternative: Temporary Open Rules (for testing only)
If you want to test quickly, use these rules (LESS SECURE):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## After updating rules, your app will work!