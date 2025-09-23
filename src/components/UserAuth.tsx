
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
            <AvatarFallback>
              {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{user.user_metadata?.name || user.email}</div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              Usuario
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
      <LogIn className="w-4 h-4 mr-2" />
      Iniciar Sesión
    </Button>
  );
}