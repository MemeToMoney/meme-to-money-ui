// Google OAuth Integration for MemeToMoney
// Uses Firebase Auth to get proper Firebase ID tokens for backend verification

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase-config';

export interface GoogleAuthResponse {
  idToken: string;
  user: {
    email: string;
    name: string;
    picture: string;
    sub: string;
  };
}

export class GoogleAuth {
  private static provider = new GoogleAuthProvider();

  static async initialize(): Promise<void> {
    // No external script loading needed - Firebase SDK handles everything
    GoogleAuth.provider.addScope('email');
    GoogleAuth.provider.addScope('profile');
  }

  static async signIn(): Promise<GoogleAuthResponse> {
    try {
      const result = await signInWithPopup(auth, GoogleAuth.provider);
      const user = result.user;

      // Get the Firebase ID token - this is what the backend can verify
      const idToken = await user.getIdToken();

      return {
        idToken,
        user: {
          email: user.email || '',
          name: user.displayName || '',
          picture: user.photoURL || '',
          sub: user.uid
        }
      };
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up blocked by browser. Please allow pop-ups for this site.');
      }
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
      }
      throw new Error(error.message || 'Google sign-in failed. Please try again.');
    }
  }
}
