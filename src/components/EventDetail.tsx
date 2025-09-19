import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  MessageCircle,
  Send,
  X,
  DollarSign,
  User as UserIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Event, User, Comment } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { supabaseManager } from '@/lib/supabaseManager';
interface EventDetailProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onEventUpdate: () => void;
  supabaseConnected: boolean;
}


const EventDetail: React.FC<EventDetailProps> = ({
  event,
  isOpen,
  onClose,
  currentUser,
  onEventUpdate,
  supabaseConnected
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();
  const [isAttending, setIsAttending] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    // ...existing code...
  }, []);

  useEffect(() => {
    if (event) {
      // Set counts
      setLikesCount(event.likes || 0);
      setAttendeesCount(Array.isArray(event.attendees) ? event.attendees.length : 0);
      setComments(event.comments || []);

      // Check user interactions
      if (currentUser) {
        const likedBy = Array.isArray(event.likedBy) ? event.likedBy : [];
        const attendees = Array.isArray(event.attendees) ? event.attendees : [];

        setIsLiked(likedBy.includes(currentUser.id));
        setIsAttending(attendees.includes(currentUser.id));
      } else {
        setIsLiked(false);
        setIsAttending(false);
      }
    }
  }, [event, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like a un evento');
      return;
    }

    setLoading(true);
    try {
      const newLikedState = !isLiked;

      // Update UI immediately for better UX
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

      if (supabaseConnected) {
        // Update in Supabase
        const success = await supabaseManager.updateEventInteraction(
          event.id,
          currentUser.id,
          'like',
          newLikedState
        );

        if (!success) {
          // Revert on failure
          setIsLiked(!newLikedState);
          setLikesCount(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1);
          alert('Error al actualizar el like. Inténtalo de nuevo.');
          return;
        }
      } else {
        // Update in localStorage
        const storedEvents = JSON.parse(localStorage.getItem('enterate-events') || '[]');
        const updatedEvents = storedEvents.map((e: Event) => {
          if (e.id === event.id) {
            const likedBy = Array.isArray(e.likedBy) ? [...e.likedBy] : [];

            if (newLikedState) {
              if (!likedBy.includes(currentUser.id)) {
                likedBy.push(currentUser.id);
              }
            } else {
              const index = likedBy.indexOf(currentUser.id);
              if (index > -1) {
                likedBy.splice(index, 1);
              }
            }

            return {
              ...e,
              likes: likedBy.length,
              likedBy: likedBy
            };
          }
          return e;
        });

        localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      }

      // Refresh events list
      onEventUpdate();
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
      alert('Error al actualizar el like. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para confirmar asistencia');
      return;
    }

    setLoading(true);
    try {
      const newAttendingState = !isAttending;

      // Update UI immediately for better UX
      setIsAttending(newAttendingState);
      setAttendeesCount(prev => newAttendingState ? prev + 1 : Math.max(0, prev - 1));

      if (supabaseConnected) {
        // Update in Supabase
        const success = await supabaseManager.updateEventInteraction(
          event.id,
          currentUser.id,
          'attend',
          newAttendingState
        );

        if (!success) {
          // Revert on failure
          setIsAttending(!newAttendingState);
          setAttendeesCount(prev => newAttendingState ? Math.max(0, prev - 1) : prev + 1);
          alert('Error al actualizar la asistencia. Inténtalo de nuevo.');
          return;
        }
      } else {
        // Update in localStorage
        const storedEvents = JSON.parse(localStorage.getItem('enterate-events') || '[]');
        const updatedEvents = storedEvents.map((e: Event) => {
          if (e.id === event.id) {
            const attendees = Array.isArray(e.attendees) ? [...e.attendees] : [];

            if (newAttendingState) {
              if (!attendees.includes(currentUser.id)) {
                attendees.push(currentUser.id);
              }
            } else {
              const index = attendees.indexOf(currentUser.id);
              if (index > -1) {
                attendees.splice(index, 1);
              }
            }

            return {
              ...e,
              attendees: attendees
            };
          }
          return e;
        });

        localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));
      }

      // Refresh events list
      onEventUpdate();
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Revert on error
      setIsAttending(!isAttending);
      setAttendeesCount(prev => isAttending ? prev + 1 : Math.max(0, prev - 1));
      alert('Error al actualizar la asistencia. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    setCommentLoading(true);
    try {
      const comment: Omit<Comment, 'id'> = {
        eventId: event.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.profileImage || currentUser.avatar,
        userProfileImage: currentUser.profileImage || currentUser.avatar,
        content: newComment.trim(),
        createdAt: new Date()
      };

      if (supabaseConnected) {
        // Add comment to Supabase
        const newCommentWithId = await supabaseManager.createComment(comment);
        if (newCommentWithId) {
          setComments([...comments, newCommentWithId]);
          setNewComment('');
          onEventUpdate();
        } else {
          alert('Error al agregar el comentario. Inténtalo de nuevo.');
        }
      } else {
        // Add comment to localStorage
        const commentWithId: Comment = {
          ...comment,
          id: Date.now().toString()
        };

        const storedEvents = JSON.parse(localStorage.getItem('enterate-events') || '[]');
        const updatedEvents = storedEvents.map((e: Event) => {
          if (e.id === event.id) {
            const updatedComments = [...(e.comments || []), commentWithId];
            return {
              ...e,
              comments: updatedComments
            };
          }
          return e;
        });

        localStorage.setItem('enterate-events', JSON.stringify(updatedEvents));

        setComments([...comments, commentWithId]);
        setNewComment('');
        onEventUpdate();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error al agregar el comentario. Inténtalo de nuevo.');
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <DialogHeader className="p-4 sm:p-6 border-b flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold pr-4 line-clamp-2">
              {event.title}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Event Image */}
              {(event.imageUrl || event.image) && (
                <div className="w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={event.imageUrl || event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column - Event Details */}
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mb-3">
                      {event.category}
                    </Badge>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-2">
                      {event.description}
                    </p>
                    {/* Puntos destacados en la descripción */}
                    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-yellow-50 rounded-full w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#FACC15" />
                        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#B45309" fontWeight="bold">★</text>
                      </svg>
                      <span className="font-semibold text-yellow-700 text-sm">{event.puntos || 0} pts</span>
                      <span className="text-xs text-yellow-800 ml-2">Puntos que obtendrás por asistir.</span>
                    </div>
                  </div>

                  {/* Event Meta Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{formatTime(event.time)}</span>
                    </div>

                    <div className="flex items-start text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{event.location}</span>
                    </div>

                    {event.price !== undefined && event.price > 0 && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm sm:text-base font-semibold">
                          ${event.price} ARS
                        </span>
                      </div>
                    )}

                    {event.price === 0 && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm sm:text-base font-semibold">
                          Evento Gratuito
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <UserIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        Organizado por {event.organizerName}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentUser && (
                    <div className="flex flex-col gap-3 pt-4">
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <Button
                          onClick={handleLike}
                          disabled={loading}
                          variant={isLiked ? "default" : "outline"}
                          className={`flex-1 ${isLiked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current text-white' : ''}`} />
                          {isLiked ? 'Te gusta' : 'Me gusta'} ({likesCount})
                        </Button>

                        <Button
                          onClick={handleAttendance}
                          disabled={loading}
                          variant={isAttending ? "default" : "outline"}
                          className={`flex-1 ${isAttending ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                        >
                          <Users className={`w-4 h-4 mr-2 ${isAttending ? 'text-white' : ''}`} />
                          {isAttending ? 'Asistiré' : 'Asistiré'} ({attendeesCount})
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-4 py-2"
                            onClick={() => setShowComments(true)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Mensajes
                          </Button>
                          {/* Logo y puntos al lado de comentarios */}
                          <div className="flex items-center gap-2 ml-2 px-3 py-2 bg-yellow-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#FACC15" />
                              <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#B45309" fontWeight="bold">★</text>
                            </svg>
                            <span className="font-semibold text-yellow-700 text-sm">{event.puntos || 0} pts</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mt-2"
                        onClick={() => {
                          const eventUrl = `${window.location.origin}/evento/${event.id}`;
                          const shareText = `¡Mirá este evento en Entérate!\n${event.title}\n${event.description}\n${eventUrl}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                        Compartir por WhatsApp
                      </Button>
                    </div>
                  )}

                  {!currentUser && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Inicia sesión para dar like y confirmar asistencia
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Right Column - Comments Section */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Comentarios ({comments.length})
                    </h3>
                  </div>

                  {/* Add Comment */}
                  {currentUser && (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={commentLoading || !newComment.trim()}
                        size="sm"
                        className="w-full sm:w-auto px-6 py-2 text-base sm:text-sm"
                        style={{ minWidth: 120 }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {commentLoading ? 'Enviando...' : 'Enviar comentario'}
                      </Button>
                    </div>
                  )}

                  {!currentUser && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        Inicia sesión para comentar
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Comments List - Scrollable within the main scroll area */}
                  <div
                    className="space-y-4 overflow-y-auto pr-2 border rounded-md bg-white min-h-[120px] max-h-[60vh]"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      height: '100%',
                      maxHeight: '60vh',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      touchAction: 'pan-y',
                      overscrollBehavior: 'contain',
                      scrollBehavior: 'smooth',
                    }}
                  >
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 text-sm">
                        No hay comentarios aún. ¡Sé el primero en comentar!
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={comment.userProfileImage || comment.userAvatar || '/api/placeholder/32/32'}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {comment.createdAt ? comment.createdAt.toLocaleDateString('es-ES') : 'Ahora'}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed break-words">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetail;