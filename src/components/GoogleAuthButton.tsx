import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface GoogleAuthButtonProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = '420303693033-04hgjjogksuns5odn04vf0eejj1e7qqt.apps.googleusercontent.com';

declare global {
  interface Window {
    google: any;
    googleSignInCallback: (response: any) => void;
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled = false
}) => {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGoogleScript();
  }, []);

  const loadGoogleScript = () => {
    // Check if script is already loaded
    if (window.google) {
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      onError('Error loading Google Sign-In script');
    };
    document.head.appendChild(script);
  };

  const initializeGoogleSignIn = () => {
    if (window.google) {
      // Set up the callback function
      window.googleSignInCallback = handleGoogleSignIn;

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: window.googleSignInCallback,
        auto_select: false,
        cancel_on_tap_outside: false
      });

      setGoogleLoaded(true);
    }
  };

  const handleGoogleSignIn = async (response: any) => {
    try {
      setLoading(true);

      // Decode the JWT token to get user info
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));

      const user: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        profileImage: payload.picture,
        avatar: payload.picture,
        role: 'user', // Default role
        createdAt: new Date()
      };

      console.log('Google Sign-In successful:', user);
      onSuccess(user);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    if (window.google && googleLoaded) {
      window.google.accounts.id.prompt();
    } else {
      onError('Google Sign-In no está disponible. Recarga la página e inténtalo de nuevo.');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={triggerGoogleSignIn}
      disabled={disabled || loading || !googleLoaded}
    >
      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? 'Iniciando sesión...' : googleLoaded ? 'Continuar con Google' : 'Cargando Google...'}
    </Button>
  );
};

export default GoogleAuthButton;