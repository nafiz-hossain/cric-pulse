'use client';

import Link from 'next/link';

export default function FixPermissions() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">🚨 Fix Database Permissions</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Error Detected: "Missing or insufficient permissions"</h2>
          <p className="text-red-700">
            Your Firestore database is blocking writes because of security rules. This is easy to fix!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Fix Steps:</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 1: Open Firebase Console</h3>
              <p className="text-gray-700 mb-2">
                Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a>
              </p>
              <p className="text-gray-700">Select your <strong>"cricket-track"</strong> project</p>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 2: Go to Firestore Rules</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Click "Firestore Database" in left menu</li>
                <li>Click "Rules" tab at the top</li>
                <li>You'll see the current security rules</li>
              </ol>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 3: Replace the Rules</h3>
              <p className="text-gray-700 mb-2">Replace ALL the existing rules with this:</p>
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-gray-800">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow everyone to read practice sessions (for demo)
    match /practice-sessions/{document} {
      allow read: if true;
    }
    
    // Allow test collection
    match /test-collection/{document} {
      allow read, write: if true;
    }
  }
}`}</pre>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 4: Publish Rules</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Click the <strong>"Publish"</strong> button</li>
                <li>Wait for "Rules published successfully" message</li>
                <li>Now everyone can view dashboard, only signed-in users can add data!</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">After Fixing Rules:</h3>
          <div className="space-y-2 text-green-700">
            <p>✅ You'll be able to save practice sessions</p>
            <p>✅ Dashboard will show your data</p>
            <p>✅ All database operations will work</p>
          </div>
          
          <div className="mt-4 space-x-4">
            <Link href="/test-save" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 inline-block">
              Test Database After Fix
            </Link>
            <Link href="/add-session" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 inline-block">
              Try Adding Session
            </Link>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Alternative: Quick Test Rules</h3>
          <p className="text-yellow-700 mb-2">
            If you want to test immediately, use these simpler rules (less secure but works):
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-800">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            ⚠️ This allows anyone to read/write. Use only for testing!
          </p>
        </div>
      </div>
    </div>
  );
}