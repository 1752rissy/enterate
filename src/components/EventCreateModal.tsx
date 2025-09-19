import React, { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/lib/supabase';
import { supabaseManager } from '@/lib/supabaseManager';

interface EventCreateModalProps {
  currentUser: any;
  supabaseConnected: boolean;
  setShowCreateEventForm: (show: boolean) => void;
  onCreateEvent: (event: any) => void;
}

const BUCKET_NAME = 'event-images';

export default function EventCreateModal({ currentUser, supabaseConnected, setShowCreateEventForm, onCreateEvent }: EventCreateModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Upload a file to Supabase Storage and get public URL
  const categories = [
  'Juntada para charlar',
  'Salir a correr',
  'Mateada en la plaza',
  'Paseo con mascotas',
  'Ir al cine',
  'Paseo con perros',
  'Descubrimiento local',
  'Música',
  'Otro'
  ];
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${currentUser?.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) {
        setError(`Error al subir la imagen: ${uploadError.message}`);
        return;
      }
      // Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      setImageUrl(urlData.publicUrl);
    } catch (err: any) {
      setError(`Error inesperado: ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8 mx-2 max-h-[calc(100vh-80px)] overflow-y-auto mb-20">
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Evento</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as any;
            const puntosValue = Number(form.puntos.value) || 0;
            const eventDate = new Date(form.date.value);
            const today = new Date();
            today.setHours(0,0,0,0);
            if (eventDate < today) {
              alert('La fecha del evento no puede ser anterior a la actual.');
              return;
            }
            const newEvent = {
              title: form.title.value,
              description: form.description.value,
              date: form.date.value,
              time: form.time.value,
              end_time: form.end_time.value,
              location: form.location.value,
              category: form.category.value,
              imageUrl: imageUrl, // url pública de la imagen subida al bucket
              price: 0,
              organizerName: currentUser?.name || '',
              createdBy: currentUser?.id || '',
              puntos: puntosValue,
            };
            onCreateEvent(newEvent);
            setShowCreateEventForm(false);
          }}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Título del evento</label>
            <input name="title" type="text" required className="w-full border rounded px-3 py-2" placeholder="Ej: Festival de música" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Descripción breve</label>
            <textarea name="description" required className="w-full border rounded px-3 py-2" rows={2} placeholder="Describe el evento..." />
          </div>
          <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select name="category" required className="w-full border rounded px-3 py-2">
                <option value="" disabled selected>Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input name="date" type="date" required className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hora de inicio</label>
              <input name="time" type="time" required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora de finalización</label>
              <input name="end_time" type="time" required className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Ubicación</label>
            <input name="location" type="text" required className="w-full border rounded px-3 py-2" placeholder="Ej: Plaza 9 de Julio" />
            <div className="text-xs text-gray-500 mt-1">(Próximamente: mapa interactivo)</div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Cupo máximo (opcional)</label>
            <input name="max_capacity" type="number" min="1" className="w-full border rounded px-3 py-2" placeholder="Ej: 100" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Puntos por asistir</label>
            <input name="puntos" type="number" min="0" required className="w-full border rounded px-3 py-2" placeholder="Ej: 10" />
          </div>
          <div className="mb-3">
            <ImageUpload
              value={imageFile}
              onChange={async (file: File | null) => {
                setError('');
                setImageFile(file);
                if (file) {
                  await handleFileUpload(file);
                } else {
                  setImageUrl('');
                }
              }}
              label="Imagen del Evento"
            />
            {/* Solo mostrar la imagen subida si no hay archivo local pendiente */}
            {imageUrl && !imageFile && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            {uploading && <div className="text-sm text-blue-600 mt-2">Subiendo imagen...</div>}
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          </div>
          <div className="flex gap-3 pt-4 pb-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold">Crear Evento</button>
            <button type="button" className="flex-1 border rounded px-4 py-2" onClick={() => setShowCreateEventForm(false)}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
