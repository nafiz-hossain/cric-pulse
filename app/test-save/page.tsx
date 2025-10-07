'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

export default function TestSave() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirestore = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test 1: Try to add a document
      console.log('Testing Firestore write...');
      const docRef = await addDoc(collection(db, 'test-collection'), {
        message: 'Test message',
        timestamp: new Date().toISOString(),
        testNumber: Math.random()
      });
      
      console.log('Document written with ID: ', docRef.id);
      
      // Test 2: Try to read documents
      console.log('Testing Firestore read...');
      const querySnapshot = await getDocs(collection(db, 'test-collection'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setTestResult(`✅ SUCCESS!
      
✓ Document saved with ID: ${docRef.id}
✓ Found ${docs.length} documents in test collection
✓ Firestore is working properly!

Your cricket app should work now. The issue might be:
1. Make sure you're signed in
2. Check browser console for any errors
3. Ensure you have internet connection`);

    } catch (error: any) {
      console.error('Firestore test failed:', error);
      setTestResult(`❌ FAILED!

Error: ${error.message}

Common fixes:
1. Go to Firebase Console → Firestore Database
2. Create database if not exists (start in test mode)
3. Check Firebase project ID matches your config
4. Ensure internet connection is working

Error code: ${error.code || 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Test Database Save</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Firestore Connection</h2>
          
          <p className="text-gray-600 mb-6">
            This will test if your Firebase Firestore database is working properly.
          </p>

          <button
            onClick={testFirestore}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-6"
          >
            {isLoading ? 'Testing Database...' : '🧪 Test Database Save & Read'}
          </button>

          {testResult && (
            <div className={`p-4 rounded-lg whitespace-pre-line ${
              testResult.includes('SUCCESS') 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {testResult}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">If Test Fails:</h3>
            <ol className="list-decimal list-inside text-blue-700 text-sm space-y-1">
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="underline">Firebase Console</a></li>
              <li>Select your "cricket-track" project</li>
              <li>Go to "Firestore Database"</li>
              <li>Click "Create database" if it doesn't exist</li>
              <li>Choose "Start in test mode"</li>
              <li>Select a location (any is fine)</li>
              <li>Come back and test again</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}