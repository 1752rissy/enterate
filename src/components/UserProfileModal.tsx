import React from 'react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    nombre_completo: string;
    email: string;
    foto_perfil?: string;
  };
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-2">
        <h2 className="text-2xl font-bold mb-4 text-center">Perfil de Usuario</h2>
        <div className="flex flex-col items-center gap-4">
          {user.foto_perfil && (
            <img
              src={user.foto_perfil}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover border"
            />
          )}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              value={user.nombre_completo}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            className="flex-1 border rounded px-4 py-2"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
