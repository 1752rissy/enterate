import React from 'react';
import { Comment } from '@/types';

interface EventMessagesProps {
  comments: Comment[];
}

const EventMessages: React.FC<EventMessagesProps> = ({ comments }) => {
  return (
    <div
      className="space-y-4 pr-2 border rounded-md bg-white min-h-[120px] max-h-[70vh] overflow-y-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        height: '100%',
        maxHeight: '70vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'manipulation',
        overscrollBehavior: 'auto',
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
  );
};

export default EventMessages;
