import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

export interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "Imagen del Evento" }) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }
      setError('');
      onChange(file);
    }
  };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError('Por favor selecciona un archivo de imagen válido');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('El archivo es demasiado grande. Máximo 5MB permitido');
          return;
        }
        setError('');
        onChange(file);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };

    const clearImage = () => {
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div className="space-y-4">
        <Label>{label}</Label>
        <div className="space-y-2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
          </div>
        </div>
        {value && (
          <div className="relative">
            <div className="border rounded-lg p-2 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Vista previa:</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearImage}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="aspect-video w-full max-w-xs mx-auto">
                <img
                  src={URL.createObjectURL(value)}
                  alt="Vista previa"
                  className="w-full h-full object-cover rounded"
                  onError={() => setError('Error al cargar la imagen')}
                />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 mt-2">{error}</div>
        )}
      </div>
    );
  };

  export default ImageUpload;