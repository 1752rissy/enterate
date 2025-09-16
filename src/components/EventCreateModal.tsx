import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, MapPin, Image as ImageIcon, X, PlusCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Event, User } from '@/types';

interface EventCreateModalProps {
  currentUser: User | null;
  supabaseConnected: boolean;
  setShowCreateEventForm: (show: boolean) => void;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  events: Event[];
}

const EventCreateModal: React.FC<EventCreateModalProps> = ({
  currentUser,
  supabaseConnected,
  setShowCreateEventForm,
  setEvents,
  events,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    category: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    if (!formData.time) newErrors.time = 'La hora de inicio es obligatoria';
    if (!formData.endTime) newErrors.endTime = 'La hora de finalización es obligatoria';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria';
    if (!formData.category.trim()) newErrors.category = 'La categoría es obligatoria';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'La URL de la imagen es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (url: string) => {
    handleInputChange('imageUrl', url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newEvent: Event = {
      ...formData,
      id: Date.now().toString(),
      organizerName: currentUser?.name || 'Anónimo',
      createdBy: currentUser?.id || '',
      likes: 0,
      likedBy: [],
      comments: [],
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (supabaseConnected) {
      // Lógica para guardar en Supabase
    } else {
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
    }
    setShowCreateEventForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Crear Nuevo Evento</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateEventForm(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input id="title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="Ej: Concierto Acústico" className={errors.title ? 'border-red-500' : ''} />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Describe los detalles del evento..." rows={4} className={errors.description ? 'border-red-500' : ''} />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2" />Fecha *</Label>
                <Input id="date" type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} className={errors.date ? 'border-red-500' : ''} />
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center"><Clock className="w-4 h-4 mr-2" />Hora Inicio *</Label>
                <Input id="time" type="time" value={formData.time} onChange={e => handleInputChange('time', e.target.value)} className={errors.time ? 'border-red-500' : ''} />
                {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center"><Clock className="w-4 h-4 mr-2" />Hora Fin *</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={e => handleInputChange('endTime', e.target.value)} className={errors.endTime ? 'border-red-500' : ''} />
                {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Input id="category" value={formData.category} onChange={e => handleInputChange('category', e.target.value)} placeholder="Ej: Música" className={errors.category ? 'border-red-500' : ''} />
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center"><MapPin className="w-4 h-4 mr-2" />Ubicación *</Label>
              <Input id="location" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} placeholder="Ej: Plaza Central" className={errors.location ? 'border-red-500' : ''} />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center"><ImageIcon className="w-4 h-4 mr-2" />Imagen del Evento *</Label>
              <ImageUpload onUpload={handleImageUpload} />
              {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="w-4 h-4 mr-2" />
                Crear Evento
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateEventForm(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCreateModal;
