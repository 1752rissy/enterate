import React, { useState, useEffect } from 'react';
import OnboardingModal from '@/components/OnboardingModal';
import UserProfileModal from '@/components/UserProfileModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUpload from '@/components/ImageUpload';
import EventCreateModal from '@/components/EventCreateModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Search, 
  Settings, 
  User as UserIcon, 
  LogOut,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Menu
} from 'lucide-react';
import { Event, User } from '@/types';
import { supabaseManager } from '@/lib/supabaseManager';
import { mockEvents } from '@/lib/mockData';
import EventList from '@/components/EventList';
import EventDetail from '@/components/EventDetail';
import ModeratorEventManager from '@/components/ModeratorEventManager';
import AuthModal from '@/components/AuthModal';

const Index: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Consultar puntos acumulados al abrir el perfil
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (currentUser && showUserProfile) {
        const points = await supabaseManager.getUserPoints(currentUser.id);
        setUserPoints(points);
      }
    };
    fetchUserPoints();
  }, [currentUser, showUserProfile]);

  // Mostrar onboarding solo si el usuario no lo vio
  useEffect(() => {
    setShowOnboarding(true);
  }, []);

  // Función para cerrar el onboarding
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('enterate-onboarding-seen', 'true');
  };
  // Crear evento
  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'likes' | 'likedBy' | 'comments' | 'photos' | 'createdAt'>) => {
    const newEvent: Omit<Event, 'id'> = {
      ...eventData,
      organizerName: currentUser?.name || 'Anónimo',
      createdBy: currentUser?.id || '',
      likes: 0,
      likedBy: [],
      comments: [],
      attendees: [],
      createdAt: new Date(),
      puntos: eventData.puntos || 0,
    };
    if (supabaseConnected) {
      await supabaseManager.createEvent(newEvent);
      const updatedEvents = await supabaseManager.getEvents();
      setEvents(updatedEvents);
    } else {
      setEvents(prev => {
        // Para localStorage sí se necesita el id
        const localEvent: Event = {
          ...newEvent,
          id: Date.now().toString(),
        };
        const updated = [...prev, localEvent];
        localStorage.setItem('enterate-events', JSON.stringify(updated));
        return updated;
      });
    }
    setShowCreateEventForm(false);
  };

  const categories = ['Música', 'Gastronomía', 'Turismo', 'Cultura', 'Deportes', 'Arte'];

  useEffect(() => {
  // Mostrar onboarding solo si el usuario no lo vio
  const onboardingSeen = localStorage.getItem('enterate-onboarding-seen');
  if (!onboardingSeen) setShowOnboarding(true);
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('enterate-onboarding-seen', 'true');
  };
    initializeApp();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedCategory]);

  const initializeApp = async () => {
    setLoading(true);
    
    // Try to connect to Supabase
    const connected = await supabaseManager.initialize();
    setSupabaseConnected(connected);
    
    // Load current user
    loadCurrentUser();
    
    // Load events
    await loadEvents(connected);
    
    setLoading(false);
  };

  const loadEvents = async (connected: boolean = supabaseConnected) => {
    console.log('Loading events, Supabase connected:', connected);
    
    if (connected) {
      try {
        const supabaseEvents = await supabaseManager.getEvents();
        console.log('Loaded events from Supabase:', supabaseEvents.length);
        
        if (supabaseEvents.length === 0) {
          // If no events in Supabase, check for local data to migrate
          const storedEvents = localStorage.getItem('enterate-events');
          if (storedEvents) {
            const localEvents = JSON.parse(storedEvents);
            console.log('Migrating local events to Supabase:', localEvents.length);
            
            for (const event of localEvents) {
              await supabaseManager.createEvent(event);
            }
            
            // Reload events after migration
            const migratedEvents = await supabaseManager.getEvents();
            setEvents(migratedEvents);
          } else {
            // Load mock data if no events exist
            console.log('Loading mock data into Supabase...');
            for (const event of mockEvents) {
              await supabaseManager.createEvent(event);
            }
            
            const mockLoadedEvents = await supabaseManager.getEvents();
            setEvents(mockLoadedEvents);
          }
        } else {
          setEvents(supabaseEvents);
        }
      } catch (error) {
        console.error('Error loading Supabase events:', error);
        loadLocalStorageData();
      }
    } else {
      loadLocalStorageData();
    }
  };

  const loadLocalStorageData = () => {
    console.log('Loading events from localStorage...');
    const storedEvents = localStorage.getItem('enterate-events');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        console.log('Loaded events from localStorage:', parsedEvents.length);
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error parsing stored events:', error);
        setEvents(mockEvents);
        localStorage.setItem('enterate-events', JSON.stringify(mockEvents));
      }
    } else {
      console.log('No localStorage events, using mock data');
      setEvents(mockEvents);
      localStorage.setItem('enterate-events', JSON.stringify(mockEvents));
    }
  };

  const loadCurrentUser = () => {
    const storedUser = localStorage.getItem('enterate-current-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        console.log('Current user loaded:', user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  const handleCloseEventDetail = () => {
    setIsEventDetailOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleEventUpdate = async () => {
    console.log('Refreshing events...');
    setRefreshing(true);
    
    try {
      await loadEvents();
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleLogin = async (user: User) => {
    console.log('User logging in:', user);
    
    // If Supabase is connected, try to create/get user from database
    if (supabaseConnected) {
      try {
        let dbUser = await supabaseManager.getUserByEmail(user.email);
        if (!dbUser) {
          dbUser = await supabaseManager.createUser(user);
        }
        if (dbUser) {
          setCurrentUser(dbUser);
          localStorage.setItem('enterate-current-user', JSON.stringify(dbUser));
          console.log('User set from database:', dbUser);
        } else {
          setCurrentUser(user);
          localStorage.setItem('enterate-current-user', JSON.stringify(user));
          console.log('User set from login data:', user);
        }
      } catch (error) {
        console.error('Error managing user in Supabase:', error);
        setCurrentUser(user);
        localStorage.setItem('enterate-current-user', JSON.stringify(user));
        console.log('User set with fallback:', user);
      }
    } else {
      setCurrentUser(user);
      localStorage.setItem('enterate-current-user', JSON.stringify(user));
      console.log('User set (offline mode):', user);
    }
    
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('enterate-current-user');
    setActiveTab('events'); // Reset to events tab
    setMobileMenuOpen(false);
    console.log('User logged out');
  };

  // Check if user has moderator permissions
  const canManageEvents = currentUser && (currentUser.role === 'moderator' || currentUser.role === 'admin');

  if (loading) {
    return (
      <>
        {showOnboarding && (
          <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
        )}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando Entérate...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showOnboarding && (
        <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Logo and status */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">
                  🎉 Entérate
                </h1>
                <span className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  la primera aplicación de eventos sociales, donde todo lo generas vos!!!
                </span>
              </div>
              
              {/* Connection Status - Hidden on very small screens */}
              <Badge 
                variant={supabaseConnected ? "default" : "secondary"}
                className={`text-xs hidden xs:inline-flex ${supabaseConnected ? "bg-green-600" : "bg-orange-500"}`}
              >
                {supabaseConnected ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Supabase</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </Badge>

              {/* Refresh Button - Hidden on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden md:flex"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center space-x-2">
              {currentUser ? (
                <>
                  {/* Desktop user menu */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={currentUser.profileImage || currentUser.avatar}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onClick={() => setShowUserProfile(true)}
                      />
                      <div className="text-sm hidden lg:block">
                        <p className="font-medium text-gray-900 truncate max-w-32">
                          {currentUser.name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {(currentUser.role === 'moderator' || currentUser.role === 'admin') && (
                            <Shield className="w-3 h-3 text-green-600" />
                          )}
                          <p className="text-gray-500 capitalize text-xs">{currentUser.role}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 lg:mr-2" />
                      <span className="hidden lg:inline">Salir</span>
                    </Button>
                  </div>

                  {/* Mobile user menu */}
                  <div className="sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      <Menu className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <UserIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && currentUser && (
            <div className="sm:hidden border-t bg-white py-3">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={currentUser.profileImage || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  onClick={() => setShowUserProfile(true)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {(currentUser.role === 'moderator' || currentUser.role === 'admin') && (
                      <Shield className="w-3 h-3 text-green-600" />
                    )}
                    <p className="text-gray-500 capitalize text-xs">{currentUser.role}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${canManageEvents ? 'grid-cols-2' : 'grid-cols-1'} max-w-md mx-auto sm:mx-0`}>
            <TabsTrigger value="events" className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Eventos
            </TabsTrigger>
            {canManageEvents && (
              <TabsTrigger value="manage" className="flex items-center text-sm">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Gestionar</span>
                <span className="sm:hidden">Panel</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="events" className="space-y-4 sm:space-y-6">
            {/* Botón agregar evento para usuarios registrados */}
            {currentUser && (
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => setShowCreateEventForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Agregar evento
                </Button>
              </div>
            )}
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredEvents.length === events.length
                  ? `Mostrando ${events.length} eventos`
                  : `Mostrando ${filteredEvents.length} de ${events.length} eventos`
                }
              </div>
            </div>

            {/* Connection Alert */}
            <Alert className={supabaseConnected ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
              {supabaseConnected ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <AlertDescription className={`text-sm ${supabaseConnected ? "text-green-800" : "text-orange-800"}`}>
                {supabaseConnected 
                  ? ""
                  : "💾 Trabajando en modo offline - Los eventos se cargan desde el almacenamiento local."
                }
              </AlertDescription>
            </Alert>

            {/* Events List */}
            <EventList
              events={filteredEvents}
              onEventClick={handleEventClick}
              currentUser={currentUser}
              supabaseConnected={supabaseConnected}
            />

            {/* Nuevo modal de creación de evento básico */}
            {showCreateEventForm && (
              <EventCreateModal
                currentUser={currentUser}
                supabaseConnected={supabaseConnected}
                setShowCreateEventForm={setShowCreateEventForm}
                onCreateEvent={handleCreateEvent}
              />
            )}
          </TabsContent>

          {canManageEvents && (
            <TabsContent value="manage">
              <ModeratorEventManager
                currentUser={currentUser!}
                events={events}
                onEventUpdate={handleEventUpdate}
                supabaseConnected={supabaseConnected}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          isOpen={isEventDetailOpen}
          onClose={handleCloseEventDetail}
          currentUser={currentUser}
          onEventUpdate={handleEventUpdate}
          supabaseConnected={supabaseConnected}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        supabaseConnected={supabaseConnected}
      />

      {/* User Profile Modal */}
      {currentUser && showUserProfile && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={{
            nombre_completo: currentUser.name,
            email: currentUser.email,
            foto_perfil: currentUser.profileImage || currentUser.avatar || '',
            puntos: userPoints
          }}
        />
      )}
    </div>
  );
}

export default Index;