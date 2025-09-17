import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventDetail from '@/components/EventDetail';
import { Event, User } from '@/types';
import { supabaseManager } from '@/lib/supabaseManager';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const connected = await supabaseManager.initialize();
      setSupabaseConnected(connected);
      let foundEvent = null;
      if (connected) {
        const events = await supabaseManager.getEvents();
        foundEvent = events.find(e => e.id === id);
      } else {
        const storedEvents = localStorage.getItem('enterate-events');
        if (storedEvents) {
          const events = JSON.parse(storedEvents);
          foundEvent = events.find((e: Event) => e.id === id);
        }
      }
      setEvent(foundEvent || null);
      setLoading(false);
    };
    fetchEvent();
    // Load user
    const storedUser = localStorage.getItem('enterate-current-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando evento...</div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-700 mb-4">Evento no encontrado</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <EventDetail
          event={event}
          isOpen={true}
          onClose={() => navigate(-1)}
          currentUser={currentUser}
          onEventUpdate={() => {}}
          supabaseConnected={supabaseConnected}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;
