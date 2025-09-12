import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle,
  DollarSign,
  User as UserIcon
} from 'lucide-react';
import { Event, User } from '@/types';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  currentUser: User | null;
  supabaseConnected: boolean;
}

const EventList: React.FC<EventListProps> = ({
  events,
  onEventClick,
  currentUser,
  supabaseConnected
}) => {
  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay eventos disponibles</h3>
        <p className="text-gray-600 mb-6">Los eventos aparecerán aquí cuando estén disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {events.map((event) => (
        <Card 
          key={event.id} 
          className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => onEventClick(event)}
        >
          {/* Event Image */}
          {(event.imageUrl || event.image) && (
            <div className="h-40 sm:h-48 bg-gray-200 overflow-hidden">
              <img
                src={event.imageUrl || event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          
          <CardHeader className="pb-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {event.title}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="w-fit text-xs">
              {event.category}
            </Badge>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 space-y-3">
            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {event.description}
            </p>
            
            {/* Event Details */}
            <div className="space-y-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{event.date}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span>{event.time}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>

              {/* Price */}
              {event.price !== undefined && (
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className={`font-medium ${event.price === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                    {event.price === 0 ? 'Gratuito' : `$${event.price} ARS`}
                  </span>
                </div>
              )}

              {/* Organizer */}
              <div className="flex items-center">
                <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate text-xs">{event.organizerName}</span>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{event.likes || 0}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>
                    {Array.isArray(event.attendees) ? event.attendees.length : event.attendees || 0}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{event.comments?.length || 0}</span>
                </div>
              </div>

              {/* User interaction indicators */}
              {currentUser && (
                <div className="flex items-center space-x-1">
                  {Array.isArray(event.likedBy) && event.likedBy.includes(currentUser.id) && (
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current" />
                  )}
                  {Array.isArray(event.attendees) && event.attendees.includes(currentUser.id) && (
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300"
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              Ver detalles
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventList;