'use client';

import Link from 'next/link';

export default function Setup() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Setup Google OAuth</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">⚠️ Setup Required</h2>
            <p className="text-gray-600 mb-4">
              You're seeing a 400 error because Google OAuth isn't configured yet. Follow these steps:
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 1: Google Cloud Console</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Create a new project or select existing one</li>
                <li>Enable the Google+ API</li>
                <li>Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"</li>
                <li>Set application type to "Web application"</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 2: Configure URLs</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-medium mb-2">Authorized JavaScript origins:</p>
                <code className="block bg-white p-2 rounded border">http://localhost:3000</code>
                
                <p className="font-medium mb-2 mt-4">Authorized redirect URIs:</p>
                <code className="block bg-white p-2 rounded border">http://localhost:3000/api/auth/callback/google</code>
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 3: Update Environment</h3>
              <p className="text-gray-700 mb-2">Copy your Client ID and Secret to <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>:</p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm">
{`GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here`}
                </pre>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold mb-2">Step 4: Firebase Authentication</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a></li>
                <li>Select your "cricket-track" project</li>
                <li>Go to Authentication → Sign-in method</li>
                <li>Enable Google provider</li>
                <li>Add your Google OAuth Client ID</li>
                <li>Go to Firestore Database → Create database (test mode)</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">After Setup:</h4>
            <p className="text-blue-700">
              Restart your development server (<code>npm run dev</code>) and the Google sign-in will work!
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/dashboard" className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 inline-block">
              View Demo Dashboard (No Auth Required)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}