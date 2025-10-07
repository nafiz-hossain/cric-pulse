'use client';

import { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function TestFirebase() {
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: any = {};

    // Test Firebase Auth connection
    try {
      results.auth = {
        status: '✅ Connected',
        config: auth.config.apiKey ? '✅ API Key found' : '❌ No API Key'
      };
    } catch (error) {
      results.auth = {
        status: '❌ Failed',
        error: error
      };
    }

    // Test Firestore connection
    try {
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Test connection',
        timestamp: new Date().toISOString()
      });
      results.firestore = {
        status: '✅ Connected',
        docId: testDoc.id
      };
    } catch (error: any) {
      results.firestore = {
        status: '❌ Failed',
        error: error.message
      };
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Firebase Connection Test</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Firebase Services</h2>
          
          <button
            onClick={runTests}
            disabled={testing}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {testing ? 'Testing...' : 'Run Firebase Tests'}
          </button>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Firebase Authentication</h3>
                <p className="text-sm">{testResults.auth?.status}</p>
                <p className="text-sm">{testResults.auth?.config}</p>
                {testResults.auth?.error && (
                  <p className="text-sm text-red-600">Error: {testResults.auth.error}</p>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Firestore Database</h3>
                <p className="text-sm">{testResults.firestore?.status}</p>
                {testResults.firestore?.docId && (
                  <p className="text-sm text-green-600">Test document created: {testResults.firestore.docId}</p>
                )}
                {testResults.firestore?.error && (
                  <p className="text-sm text-red-600">Error: {testResults.firestore.error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Setup Checklist</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span>🔧</span>
              <span>Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a></span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔐</span>
              <span>Authentication → Sign-in method → Enable Email/Password</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🗄️</span>
              <span>Firestore Database → Create database (test mode)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span>Then use "Create Account" to add your user</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}