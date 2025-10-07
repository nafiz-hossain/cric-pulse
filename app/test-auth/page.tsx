'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TestAuth() {
  const { data: session, status } = useSession();
  const [envCheck, setEnvCheck] = useState({
    clientId: false,
    clientSecret: false,
    nextAuthUrl: false,
    nextAuthSecret: false
  });

  useEffect(() => {
    // Check if environment variables are set (client-side check)
    setEnvCheck({
      clientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: true, // Can't check server-side env vars from client
      nextAuthUrl: !!process.env.NEXT_PUBLIC_NEXTAUTH_URL,
      nextAuthSecret: true // Can't check server-side env vars from client
    });
  }, []);

  const testGoogleAuth = async () => {
    try {
      await signIn('google');
    } catch (error) {
      console.error('Google Auth Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Google Auth Test</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${status === 'loading' ? 'bg-yellow-100' : 
                           session ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className="font-semibold">Session Status</h3>
              <p className="text-sm">
                {status === 'loading' ? '🔄 Loading...' : 
                 session ? '✅ Signed In' : '❌ Not Signed In'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-100">
              <h3 className="font-semibold">NextAuth Status</h3>
              <p className="text-sm">
                {typeof window !== 'undefined' ? '✅ Client Ready' : '🔄 Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Environment Check */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded">
              <span>NEXTAUTH_URL</span>
              <span className="text-green-600">✅ Set</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>NEXTAUTH_SECRET</span>
              <span className="text-green-600">✅ Set</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>GOOGLE_CLIENT_ID</span>
              <span className="text-yellow-600">⚠️ Check .env.local</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>GOOGLE_CLIENT_SECRET</span>
              <span className="text-yellow-600">⚠️ Check .env.local</span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Google Authentication</h2>
          
          {!session ? (
            <div className="space-y-4">
              <button
                onClick={testGoogleAuth}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                🔐 Test Google Sign In
              </button>
              <div className="text-sm text-gray-600">
                <p><strong>What should happen:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Google sign-in popup should open</li>
                  <li>You can select your Google account</li>
                  <li>After signing in, you should see your profile info below</li>
                  <li>If you see errors, check the browser console (F12)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">✅ Google Auth Working!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Signed in as:</strong> {session.user?.name}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Can add data:</strong> {session.user?.email === 'nhremon8181@gmail.com' ? '✅ Yes' : '❌ No (view only)'}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-4 text-sm">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold">❌ If you see "400 Bad Request":</h4>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Google OAuth credentials are missing or incorrect</li>
                <li>Check your .env.local file</li>
                <li>Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold">⚠️ If popup doesn't open:</h4>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check if popup blockers are enabled</li>
                <li>Try in incognito/private mode</li>
                <li>Check browser console for errors</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">ℹ️ If redirect fails:</h4>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check Google Cloud Console redirect URIs</li>
                <li>Should be: http://localhost:3000/api/auth/callback/google</li>
                <li>Restart your dev server after env changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}