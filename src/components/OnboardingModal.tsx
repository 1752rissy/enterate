import React, { useState, useEffect, TouchEvent } from 'react';

const slides = [
  {
    title: '¡Bienvenido a Entérate!',
    description: 'La primera aplicación de eventos sociales donde vos generás y descubrís actividades cerca tuyo.'
  },
  {
    title: 'Crea y comparte tus eventos',
    description: 'Organizá juntadas, paseos, actividades deportivas, culturales y mucho más. ¡Invitá a tus amigos y a toda la comunidad!'
  },
  {
    title: 'Sumá puntos por participar',
    description: 'Asistí a eventos, escaneá el código QR y acumulá puntos para canjear beneficios exclusivos.'
  },
  {
    title: 'Todo lo que pasa, lo generás vos',
    description: 'En Entérate, cada usuario puede crear, comentar, compartir y hacer crecer la comunidad. ¡Animate a participar!'
  }
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) setCurrent(0);
  }, [isOpen]);

  const handlePrev = () => {
    setCurrent((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 50) handlePrev();
    if (touchStartX - touchEndX > 50) handleNext();
    setTouchStartX(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-2 flex flex-col items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <h2 className="text-xl font-bold mb-2 text-center">{slides[current].title}</h2>
        <p className="text-gray-700 text-base text-center mb-6">{slides[current].description}</p>
        <div className="flex items-center justify-between w-full mt-2 mb-4">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className={`px-3 py-1 rounded bg-gray-200 text-gray-600 font-semibold ${current === 0 ? 'opacity-50' : 'hover:bg-gray-300'}`}
          >
            ←
          </button>
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`block w-2 h-2 rounded-full ${idx === current ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={current === slides.length - 1}
            className={`px-3 py-1 rounded bg-gray-200 text-gray-600 font-semibold ${current === slides.length - 1 ? 'opacity-50' : 'hover:bg-gray-300'}`}
          >
            →
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold"
        >
          {current === slides.length - 1 ? '¡Empezar!' : 'Saltar'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
