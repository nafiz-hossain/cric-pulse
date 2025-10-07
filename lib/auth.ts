import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export const AUTHORIZED_EMAIL = 'nhremon8181@gmail.com';
export const AUTHORIZED_PASSWORD = 'Life@129261';

export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Only allow the specific email
    if (email !== AUTHORIZED_EMAIL) {
      throw new Error('Unauthorized email address');
    }
    
    // First try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // If user doesn't exist or wrong credentials, try to create account
    if (error.code === 'auth/user-not-found' || 
        error.code === 'auth/invalid-login-credentials' ||
        error.code === 'auth/wrong-password') {
      try {
        console.log('Creating new user account...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (createError: any) {
        // If account already exists but wrong password
        if (createError.code === 'auth/email-already-in-use') {
          throw new Error('Account exists but password is incorrect');
        }
        throw createError;
      }
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};