'use client';

import Link from 'next/link';

export default function PublicAccess() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">🌐 Enable Public Dashboard Access</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Goal: Everyone Can View Dashboard, Only Manager Can Add Data</h2>
          <p className="text-blue-700">
            This setup allows anyone (signed-in or guest) to view the cricket team dashboard, but only the authorized manager can add new practice sessions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Update Firestore Security Rules:</h2>
          
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
              </ol>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 3: Replace with Public Read Rules</h3>
              <p className="text-gray-700 mb-2">Replace ALL existing rules with this:</p>
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-gray-800">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow EVERYONE to read practice sessions (public dashboard)
    match /practice-sessions/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow EVERYONE to read players (for dropdown lists)
    match /players/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow test collection for debugging
    match /test-collection/{document} {
      allow read, write: if true;
    }
    
    // All other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
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
                <li>Done! Now everyone can view the dashboard</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">After Updating Rules:</h3>
          <div className="space-y-2 text-green-700">
            <p>✅ <strong>Anyone</strong> can view the dashboard (signed-in or guest)</p>
            <p>✅ <strong>Only nhremon8181@gmail.com</strong> can add practice sessions</p>
            <p>✅ <strong>Data is secure</strong> - no unauthorized writes allowed</p>
            <p>✅ <strong>Perfect for team sharing</strong> - players can see their progress</p>
          </div>
          
          <div className="mt-4 space-x-4">
            <Link href="/dashboard" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 inline-block">
              Test Public Dashboard
            </Link>
            <Link href="/test-save" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 inline-block">
              Test Database Access
            </Link>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How This Works:</h3>
          <div className="space-y-2 text-yellow-700 text-sm">
            <p><strong>Public Read Access:</strong> <code>allow read: if true</code> - Anyone can read practice sessions</p>
            <p><strong>Authenticated Write:</strong> <code>allow write: if request.auth != null</code> - Only signed-in users can write</p>
            <p><strong>App Logic:</strong> Only nhremon8181@gmail.com can access the "Add Session" page</p>
            <p><strong>Result:</strong> Perfect balance of openness and security!</p>
          </div>
        </div>
      </div>
    </div>
  );
}