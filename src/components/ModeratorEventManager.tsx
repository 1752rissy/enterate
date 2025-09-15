import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, MapPin, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Event, User } from '@/types';
import { supabaseManager } from '@/lib/supabaseManager';

interface ModeratorEventManagerProps {
  currentUser: User;
  events: Event[];
  onEventUpdate: () => void;
  supabaseConnected: boolean;
}

const ModeratorEventManager: React.FC<ModeratorEventManagerProps> = ({
  currentUser,
  events,
  onEventUpdate,
  supabaseConnected
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Cultura',
    price: 0
  });

  const categories = ['Música', 'Gastronomía', 'Turismo', 'Cultura', 'Deportes', 'Arte'];

  // Check if user has moderator permissions
  const canManageEvents = currentUser.role === 'moderator' || currentUser.role === 'admin';

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'Cultura',
      price: 0
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async () => {
    if (!canManageEvents) return;

    setLoading(true);
    try {
      const newEvent: Omit<Event, 'id'> = {
        ...formData,
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
        createdBy: currentUser.id,
        organizerName: currentUser.name,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
        attendees: [],
        comments: []
      };

      if (supabaseConnected) {
        await supabaseManager.createEvent(newEvent);
      } else {
        // Fallback to localStorage
        const storedEvents = JSON.parse(localStorage.getItem('enterate-events') || '[]');
        const eventWithId = { ...newEvent, id: Date.now().toString() };
        storedEvents.push(eventWithId);
        localStorage.setItem('enterate-events', JSON.stringify(storedEvents));
      }

      resetForm();
      setIsCreateModalOpen(false);
      onEventUpdate();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error al crear el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    if (!canManageEvents) return;

    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      price: event.price || 0
    });
    setImagePreview(event.imageUrl || event.image || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!canManageEvents || !selectedEvent) return;

    setLoading(true);
    try {
      const updatedEvent: Event = {
        ...selectedEvent,
        ...formData,
        imageUrl: imagePreview || selectedEvent.imageUrl || selectedEvent.image,
        updatedAt: new Date()
      };

      if (supabaseConnected) {
        await supabaseManager.updateEvent(updatedEvent);
      } else {
        // Fallback to localStorage
        const storedEvents = JSON.parse(localStorage.getItem('enterate-events') || '[]');
        const updatedEvents = storedEvents.map((e: Event) => 
          e.id === selectedEvent.id ? updatedEvent : e
        );
        localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      }

      resetForm();
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      onEventUpdate();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error al actualizar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!canManageEvents) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      if (supabaseConnected) {
        await supabaseManager.deleteEvent(eventId);
      } else {
        // Fallback to localStorage
        const storedEvents = JSON.parse(localStorage.getItem('enterate-events') || '[]');
        const updatedEvents = storedEvents.filter((e: Event) => e.id !== eventId);
        localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      }

      onEventUpdate();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error al eliminar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!canManageEvents) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          No tienes permisos para gestionar eventos. Contacta a un administrador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
  <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h2>
          <p className="text-gray-600">Crear, editar y eliminar eventos</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setSelectedEvent(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Connection Status */}
              <Alert className={supabaseConnected ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
                {supabaseConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
                <AlertDescription className={supabaseConnected ? "text-green-800" : "text-orange-800"}>
                  {supabaseConnected 
                    ? "Conectado a Supabase - El evento se guardará en la base de datos" 
                    : "Modo offline - El evento se guardará localmente"
                  }
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Título del evento</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ej: Concierto de Jazz en el Parque"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe el evento..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ej: Teatro Municipal"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="price">Precio (ARS)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="0 para eventos gratuitos"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Imagen del evento</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={loading || !formData.title || !formData.date || !formData.time}
                >
                  {loading ? 'Creando...' : 'Crear Evento'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            {(event.imageUrl || event.image) && (
              <div className="h-48 bg-gray-200">
                <img
                  src={event.imageUrl || event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1">{event.category}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {Array.isArray(event.attendees) ? event.attendees.length : event.attendees || 0}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditEvent(event)}
                  disabled={loading}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-title">Título del evento</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-time">Hora</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit-price">Precio (ARS)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="edit-image">Cambiar imagen</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedEvent(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateEvent}
                disabled={loading || !formData.title || !formData.date || !formData.time}
              >
                {loading ? 'Actualizando...' : 'Actualizar Evento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorEventManager;