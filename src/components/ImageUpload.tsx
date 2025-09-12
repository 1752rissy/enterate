import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, label = "Imagen del Evento", placeholder = "URL de imagen o subir archivo" }: ImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }

      // Convert file to base64 and store in localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        
        // Store in localStorage with a unique key
        const imageId = `event-image-${Date.now()}`;
        const imageData = {
          id: imageId,
          data: base64String,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };

        // Store individual image
        localStorage.setItem(`enterate-image-${imageId}`, JSON.stringify(imageData));
        
        // Update image registry
        const imageRegistry = JSON.parse(localStorage.getItem('enterate-image-registry') || '[]');
        imageRegistry.push({
          id: imageId,
          filename: file.name,
          uploadedAt: imageData.uploadedAt
        });
        localStorage.setItem('enterate-image-registry', JSON.stringify(imageRegistry));

        // Return the base64 string as the image URL
        onChange(base64String);
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setError('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Method Selection */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={uploadMethod === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('url')}
        >
          <Link className="w-4 h-4 mr-2" />
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMethod === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('file')}
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir Archivo
        </Button>
      </div>

      {/* URL Input */}
      {uploadMethod === 'url' && (
        <div className="space-y-2">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      )}

      {/* File Upload */}
      {uploadMethod === 'file' && (
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
            
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
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
                src={value}
                alt="Vista previa"
                className="w-full h-full object-cover rounded"
                onError={() => setError('Error al cargar la imagen')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}