'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { AUTHORIZED_EMAIL, AUTHORIZED_PASSWORD } from '../../lib/auth';
import Link from 'next/link';

export default function SetupAccount() {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAccount = async () => {
    setIsCreating(true);
    setError('');
    setMessage('');

    try {
      await createUserWithEmailAndPassword(auth, AUTHORIZED_EMAIL, AUTHORIZED_PASSWORD);
      setMessage('✅ Account created successfully! You can now sign in.');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('✅ Account already exists! You can sign in now.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Setup Account</h1>
          <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Create Firebase Account</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Account Details:</h3>
            <p className="text-blue-700"><strong>Email:</strong> {AUTHORIZED_EMAIL}</p>
            <p className="text-blue-700"><strong>Password:</strong> {AUTHORIZED_PASSWORD}</p>
          </div>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={createAccount}
            disabled={isCreating}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 mb-4"
          >
            {isCreating ? 'Creating Account...' : 'Create Account in Firebase'}
          </button>

          <div className="text-sm text-gray-600">
            <p className="mb-2"><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Creates your manager account in Firebase Authentication</li>
              <li>Uses the email and password you provided</li>
              <li>After creation, you can sign in normally</li>
            </ul>
          </div>

          {message.includes('✅') && (
            <div className="mt-6 text-center">
              <Link href="/" className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 inline-block">
                Go Sign In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}