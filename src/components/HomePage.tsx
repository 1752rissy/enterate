import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, AuthState } from '@/types';
import AuthModal from './AuthModal';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  ArrowRight, 
  Sparkles,
  Heart,
  MessageCircle,
  Eye
} from 'lucide-react';

interface HomePageProps {
  onLogin: (user: User) => void;
  onEnterApp: () => void;
}

export default function HomePage({ onLogin, onEnterApp }: HomePageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = (user: User) => {
    onLogin(user);
    onEnterApp();
  };

  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Ver Eventos",
      description: "Descubre todos los eventos de ocio y turismo en Posadas"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Me Gusta",
      description: "Dale me gusta a los eventos que más te interesen"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Comentar",
      description: "Comparte tu opinión y conecta con otros usuarios"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Crear Eventos",
      description: "Los organizadores pueden publicar nuevos eventos"
    }
  ];

  const stats = [
    { number: "500+", label: "Eventos" },
    { number: "2K+", label: "Usuarios" },
    { number: "50+", label: "Organizadores" },
    { number: "10K+", label: "Me Gusta" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Entérate</h1>
                <p className="text-xs text-gray-500">desarrollada por Appstraccion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => onEnterApp()}
                className="text-gray-600 hover:text-gray-900"
              >
                Ver Eventos
              </Button>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Plataforma de Eventos de Posadas
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Descubre los mejores
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                eventos de Posadas
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conecta con tu comunidad local. Descubre eventos de ocio y turismo, 
              comenta, recomienda y mantente al día con todo lo que pasa en Misiones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => onEnterApp()}
                className="px-8 py-3 text-lg"
              >
                Ver Eventos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Qué puedes hacer en Entérate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa para la comunidad de Posadas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para conectar con tu comunidad?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de personas que ya descubren eventos increíbles en Posadas
          </p>
          <Button
            size="lg"
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Crear Cuenta Gratis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Entérate</h3>
                <p className="text-xs text-gray-400">desarrollada por Appstraccion</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Conectando la comunidad de Posadas, Misiones con los mejores eventos locales
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Appstraccion</span>
              <span>•</span>
              <span>Posadas, Misiones</span>
              <span>•</span>
              <span>Argentina</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}