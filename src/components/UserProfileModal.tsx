import React from 'react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Permite compatibilidad con objeto Supabase
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  // Compatibilidad con login Google/Supabase
  const nombre = user?.user_metadata?.name || user?.nombre_completo || user?.email || '';
  const foto = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.foto_perfil || '';
  const email = user?.user_metadata?.email || user?.email || '';
  const puntos = user?.puntos ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-2">
        <h2 className="text-2xl font-bold mb-4 text-center">Perfil de Usuario</h2>
        <div className="flex flex-col items-center gap-4">
          {foto && (
            <img
              src={foto}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover border"
            />
          )}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Puntos acumulados</label>
            <input
              type="number"
              value={puntos}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 font-bold text-blue-700"
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
