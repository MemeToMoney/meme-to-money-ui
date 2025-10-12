// Google OAuth Integration for MemeToMoney
// This will handle Google Sign-In and get the idToken for your API

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
  private static isLoaded = false;

  static async loadGoogleScript(): Promise<void> {
    if (this.isLoaded || typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  static async initialize(): Promise<void> {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
      throw new Error('Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file');
    }

    await this.loadGoogleScript();

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: () => {}, // Will be overridden per sign-in
      });
    }
  }

  static async signIn(): Promise<GoogleAuthResponse> {
    if (!window.google) {
      throw new Error('Google SDK not loaded');
    }

    return new Promise((resolve, reject) => {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: (response: any) => {
              if (response.error) {
                reject(new Error(response.error));
                return;
              }

              // Get user info with the access token
              fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
                .then(res => res.json())
                .then(userInfo => {
                  resolve({
                    idToken: response.access_token, // You may need to adjust this based on your backend requirements
                    user: {
                      email: userInfo.email,
                      name: userInfo.name,
                      picture: userInfo.picture,
                      sub: userInfo.id
                    }
                  });
                })
                .catch(reject);
            },
          }).requestAccessToken();
        }
      });

      // Handle credential response for One Tap
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            const payload = this.parseJWT(response.credential);
            resolve({
              idToken: response.credential,
              user: {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                sub: payload.sub
              }
            });
          }
        },
      });
    });
  }

  private static parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  static renderSignInButton(elementId: string, callback: (response: GoogleAuthResponse) => void): void {
    if (!window.google) return;

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 250,
      }
    );

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          const payload = this.parseJWT(response.credential);
          callback({
            idToken: response.credential,
            user: {
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              sub: payload.sub
            }
          });
        }
      },
    });
  }
}