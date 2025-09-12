import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Mail,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Search,
  Filter
} from 'lucide-react';
import { User, UserRole, AdminStatus, Event } from '@/types';
import { sendEmail, createAdminApprovalEmail, createAdminRejectionEmail } from '@/lib/emailService';
import ImageUpload from '@/components/ImageUpload';

interface ModeratorDashboardProps {
  currentUser: User;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  maxAttendees: string;
  price: string;
  tags: string;
  status: 'draft' | 'published';
}

const categories = [
  'Tecnología',
  'Negocios',
  'Arte y Cultura',
  'Deportes',
  'Educación',
  'Entretenimiento',
  'Salud y Bienestar',
  'Gastronomía',
  'Música',
  'Networking'
];

export default function ModeratorDashboard({ currentUser }: ModeratorDashboardProps) {
  const [adminRequests, setAdminRequests] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  
  // Event management states
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    image: '',
    maxAttendees: '',
    price: '0',
    tags: '',
    status: 'published'
  });

  useEffect(() => {
    loadAdminRequests();
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedCategory]);

  const loadAdminRequests = () => {
    const storedUsers = localStorage.getItem('enterate-users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const pendingRequests = users.filter((user: User) => 
        user.role === UserRole.ADMIN && user.adminStatus === AdminStatus.PENDING
      );
      setAdminRequests(pendingRequests);
    }
  };

  const loadEvents = () => {
    const storedEvents = localStorage.getItem('enterate-events');
    if (storedEvents) {
      const allEvents = JSON.parse(storedEvents);
      setEvents(allEvents);
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

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratis' : `$${price.toLocaleString('es-AR')} ARS`;
  };

  const updateUserStatus = async (userId: string, newStatus: AdminStatus) => {
    setLoading(true);
    setError('');
    
    try {
      const storedUsers = localStorage.getItem('enterate-users');
      if (!storedUsers) return;
      
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((user: User) => user.id === userId);
      
      if (userIndex === -1) {
        setError('Usuario no encontrado');
        return;
      }

      const user = users[userIndex];
      users[userIndex] = { ...user, adminStatus: newStatus };
      
      localStorage.setItem('enterate-users', JSON.stringify(users));
      
      // Send email notification
      let emailSent = false;
      if (newStatus === AdminStatus.APPROVED) {
        const emailData = createAdminApprovalEmail(user.name, user.email);
        emailSent = await sendEmail(emailData);
      } else if (newStatus === AdminStatus.REJECTED) {
        const emailData = createAdminRejectionEmail(user.name, user.email);
        emailSent = await sendEmail(emailData);
      }
      
      if (emailSent) {
        setMessage(`Usuario ${newStatus === AdminStatus.APPROVED ? 'aprobado' : 'rechazado'} y email enviado exitosamente`);
      } else {
        setMessage(`Usuario ${newStatus === AdminStatus.APPROVED ? 'aprobado' : 'rechazado'} pero falló el envío del email`);
      }
      
      loadAdminRequests();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setError('Error al actualizar el estado del usuario');
    } finally {
      setLoading(false);
    }
  };

  const resetEventForm = () => {
    setEventFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      image: '',
      maxAttendees: '',
      price: '0',
      tags: '',
      status: 'published'
    });
    setEditingEvent(null);
    setError('');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!eventFormData.title || !eventFormData.description || !eventFormData.date || !eventFormData.time || !eventFormData.location || !eventFormData.category) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }

      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date,
        time: eventFormData.time,
        location: eventFormData.location,
        category: eventFormData.category,
        image: eventFormData.image || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        attendees: 0,
        maxAttendees: eventFormData.maxAttendees ? parseInt(eventFormData.maxAttendees) : undefined,
        price: eventFormData.price ? parseFloat(eventFormData.price) : 0,
        tags: eventFormData.tags ? eventFormData.tags.split(',').map(tag => tag.trim()) : [],
        status: eventFormData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedEvents = [...events, newEvent];
      localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);

      setMessage('Evento creado exitosamente');
      setIsCreateEventOpen(false);
      resetEventForm();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setLoading(true);
    setError('');

    try {
      if (!eventFormData.title || !eventFormData.description || !eventFormData.date || !eventFormData.time || !eventFormData.location || !eventFormData.category) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }

      const updatedEvent: Event = {
        ...editingEvent,
        title: eventFormData.title,
        description: eventFormData.description,
        date: eventFormData.date,
        time: eventFormData.time,
        location: eventFormData.location,
        category: eventFormData.category,
        image: eventFormData.image || editingEvent.image,
        maxAttendees: eventFormData.maxAttendees ? parseInt(eventFormData.maxAttendees) : undefined,
        price: eventFormData.price ? parseFloat(eventFormData.price) : 0,
        tags: eventFormData.tags ? eventFormData.tags.split(',').map(tag => tag.trim()) : [],
        status: eventFormData.status,
        updatedAt: new Date().toISOString()
      };

      const updatedEvents = events.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      );
      localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);

      setMessage('Evento actualizado exitosamente');
      setIsEditEventOpen(false);
      setEditingEvent(null);
      resetEventForm();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Error al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      setMessage('Evento eliminado exitosamente');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditEventClick = (event: Event) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      image: event.image,
      maxAttendees: event.maxAttendees?.toString() || '',
      price: event.price?.toString() || '0',
      tags: event.tags?.join(', ') || '',
      status: event.status
    });
    setIsEditEventOpen(true);
  };

  const toggleEventStatus = (eventId: string) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          status: event.status === 'published' ? 'draft' : 'published' as 'draft' | 'published',
          updatedAt: new Date().toISOString()
        };
      }
      return event;
    });
    localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
    setMessage('Estado del evento actualizado');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Moderación</h1>
              <p className="text-gray-600">Gestiona solicitudes de administrador y eventos de la plataforma</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">
              <Shield className="w-4 h-4 mr-2" />
              Moderador: {currentUser.name}
            </Badge>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Solicitudes de Admin ({adminRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Gestión de Eventos ({events.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Admin Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {adminRequests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay solicitudes pendientes</h3>
                  <p className="text-gray-600">Todas las solicitudes de administrador han sido procesadas</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {adminRequests.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendiente
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Solicitud de administrador
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => updateUserStatus(user.id, AdminStatus.APPROVED)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {loading ? 'Enviando...' : 'Aprobar'}
                          </Button>
                          <Button
                            onClick={() => updateUserStatus(user.id, AdminStatus.REJECTED)}
                            disabled={loading}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {loading ? 'Enviando...' : 'Rechazar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events Management Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Events Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h2>
                <p className="text-gray-600">Administra todos los eventos de la plataforma</p>
              </div>
              
              <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetEventForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Evento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={eventFormData.title}
                          onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select value={eventFormData.category} onValueChange={(value) => setEventFormData({...eventFormData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción *</Label>
                      <Textarea
                        id="description"
                        value={eventFormData.description}
                        onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={eventFormData.date}
                          onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={eventFormData.time}
                          onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Máx. Asistentes</Label>
                        <Input
                          id="maxAttendees"
                          type="number"
                          value={eventFormData.maxAttendees}
                          onChange={(e) => setEventFormData({...eventFormData, maxAttendees: e.target.value})}
                          placeholder="Ilimitado"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación *</Label>
                        <Input
                          id="location"
                          value={eventFormData.location}
                          onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio (ARS)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="1"
                          min="0"
                          value={eventFormData.price}
                          onChange={(e) => setEventFormData({...eventFormData, price: e.target.value})}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">Ingresa 0 para eventos gratuitos</p>
                      </div>
                    </div>

                    {/* Image Upload Component */}
                    <ImageUpload
                      value={eventFormData.image}
                      onChange={(imageUrl) => setEventFormData({...eventFormData, image: imageUrl})}
                      label="Imagen del Evento"
                      placeholder="Ingresa URL de imagen o sube una imagen desde tu dispositivo"
                    />

                    <div className="space-y-2">
                      <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
                      <Input
                        id="tags"
                        value={eventFormData.tags}
                        onChange={(e) => setEventFormData({...eventFormData, tags: e.target.value})}
                        placeholder="tecnología, innovación, networking"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select value={eventFormData.status} onValueChange={(value: 'draft' | 'published') => setEventFormData({...eventFormData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Evento'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="Todas">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay eventos</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedCategory !== 'Todas' 
                      ? 'No se encontraron eventos con los filtros aplicados'
                      : 'Crea el primer evento para la plataforma'
                    }
                  </p>
                  <Button onClick={() => setIsCreateEventOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Evento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Badge className={event.status === 'published' ? 'bg-green-600' : 'bg-gray-600'}>
                          {event.status === 'published' ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-black/70 text-white">
                          {formatPrice(event.price || 0)}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date} a las {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees}/{event.maxAttendees || '∞'} asistentes</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEventClick(event)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleEventStatus(event.id)}
                        >
                          {event.status === 'published' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Event Dialog */}
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título *</Label>
                  <Input
                    id="edit-title"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría *</Label>
                  <Select value={eventFormData.category} onValueChange={(value) => setEventFormData({...eventFormData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción *</Label>
                <Textarea
                  id="edit-description"
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Hora *</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={eventFormData.time}
                    onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxAttendees">Máx. Asistentes</Label>
                  <Input
                    id="edit-maxAttendees"
                    type="number"
                    value={eventFormData.maxAttendees}
                    onChange={(e) => setEventFormData({...eventFormData, maxAttendees: e.target.value})}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ubicación *</Label>
                  <Input
                    id="edit-location"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Precio (ARS)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="1"
                    min="0"
                    value={eventFormData.price}
                    onChange={(e) => setEventFormData({...eventFormData, price: e.target.value})}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Ingresa 0 para eventos gratuitos</p>
                </div>
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                value={eventFormData.image}
                onChange={(imageUrl) => setEventFormData({...eventFormData, image: imageUrl})}
                label="Imagen del Evento"
                placeholder="Ingresa URL de imagen o sube una imagen desde tu dispositivo"
              />

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="edit-tags"
                  value={eventFormData.tags}
                  onChange={(e) => setEventFormData({...eventFormData, tags: e.target.value})}
                  placeholder="tecnología, innovación, networking"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={eventFormData.status} onValueChange={(value: 'draft' | 'published') => setEventFormData({...eventFormData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditEventOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Actualizando...' : 'Actualizar Evento'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}