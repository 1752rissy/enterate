export interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export const GOOGLE_CLIENT_ID = '420303693033-04hgjjogksuns5odn04vf0eejj1e7qqt.apps.googleusercontent.com';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export const initializeGoogleAuth = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if Google Identity Services script is already loaded
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        reject(new Error('Google Identity Services failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    
    document.head.appendChild(script);
  });
};

export const parseJwtToken = (token: string): GoogleUserInfo => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};