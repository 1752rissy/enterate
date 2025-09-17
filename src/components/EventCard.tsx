import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Heart, MessageCircle, Users, Share2 } from 'lucide-react';

interface EventCardProps {
  event: any;
  onClick: () => void;
  currentUser: any;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, currentUser }) => {
  const isLiked = event.likedBy?.includes(currentUser?.id) || false;
  const isAttending = event.attendees?.includes(currentUser?.id) || false;

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {event.imageUrl && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {event.category}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {event.date}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">{event.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className={`w-4 h-4 ${isAttending ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">{event.attendees?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{event.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;