import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, MapPin, Image, X } from 'lucide-react';
import { Event } from '@/types';

interface CreateEventFormProps {
  onSubmit: (eventData: Omit<Event, 'id' | 'organizerName' | 'likes' | 'likedBy' | 'comments' | 'attendees' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

export default function CreateEventForm({ onSubmit, onCancel }: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    imageUrl: '',
    category: '',
    customCategory: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};


    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    if (!formData.time) {
      newErrors.time = 'La hora es obligatoria';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es obligatoria';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'La imagen es obligatoria';
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Debe ser una URL válida';
      }
    }

    if (!formData.category) {
      newErrors.category = 'El tipo de evento es obligatorio';
    }
    if (formData.category === 'Otro' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Por favor especifica el tipo de evento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const eventData = {
        ...formData,
        category: formData.category === 'Otro' ? formData.customCategory : formData.category
      };
      onSubmit(eventData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Crear Nuevo Evento</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Evento Emocional */}
            <div className="space-y-2">
              <Label htmlFor="category">Tipo de Evento *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={e => {
                  handleInputChange('category', e.target.value);
                  if (e.target.value !== 'Otro') {
                    handleInputChange('customCategory', '');
                  }
                }}
                className={`w-full border rounded-md p-2 ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona una opción</option>
                <option value="Juntada para charlar">Juntada para charlar</option>
                <option value="Salir a correr">Salir a correr</option>
                <option value="Mateada en la plaza">Mateada en la plaza</option>
                <option value="Paseo con mascotas">Paseo con mascotas</option>
                <option value="Descubrimiento local">Descubrimiento local</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              {formData.category === 'Otro' && (
                <div className="mt-2">
                  <Input
                    id="customCategory"
                    value={formData.customCategory}
                    onChange={e => handleInputChange('customCategory', e.target.value)}
                    placeholder="Especifica el tipo de evento..."
                    className={errors.customCategory ? 'border-red-500' : ''}
                  />
                  {errors.customCategory && <p className="text-red-500 text-sm">{errors.customCategory}</p>}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Festival de la Cerveza Artesanal"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu evento..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Fecha *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Hora *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={errors.time ? 'border-red-500' : ''}
                />
                {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Ubicación *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ej: Plaza 9 de Julio, Posadas"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center">
                <Image className="w-4 h-4 mr-2" />
                URL de la Imagen *
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className={errors.imageUrl ? 'border-red-500' : ''}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
              {formData.imageUrl && !errors.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                    onError={() => setErrors(prev => ({ ...prev, imageUrl: 'URL de imagen inválida' }))}
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Crear Evento
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}