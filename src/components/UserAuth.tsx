import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, UserRole, AuthState } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface UserAuthProps {
  authState: AuthState;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export default function UserAuth({ authState, onLogin, onLogout }: UserAuthProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = () => {
    const selectedUser = mockUsers.find(user => user.id === selectedUserId);
    if (selectedUser) {
      onLogin(selectedUser);
      setShowLogin(false);
      setSelectedUserId('');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return role === UserRole.ORGANIZER ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={authState.user.avatar} />
            <AvatarFallback>
              {authState.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{authState.user.name}</div>
            <Badge variant="secondary" className={getRoleBadgeColor(authState.user.role)}>
              {authState.user.role === UserRole.ORGANIZER ? 'Organizador' : 'Usuario'}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setShowLogin(!showLogin)}>
        <LogIn className="w-4 h-4 mr-2" />
        Iniciar Sesión
      </Button>

      {showLogin && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Demo - Seleccionar Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                Selecciona un usuario para probar la aplicación:
              </div>
              
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario..." />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.role === UserRole.ORGANIZER ? 'Organizador' : 'Usuario'}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleLogin} 
                  disabled={!selectedUserId}
                  className="flex-1"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLogin(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>

              <div className="text-xs text-gray-500 border-t pt-3">
                <strong>Nota:</strong> Esta es una demostración. Los organizadores pueden crear eventos, todos los usuarios pueden comentar y dar "Me gusta".
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}