export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  avatar?: string;
  role?: 'user' | 'moderator' | 'admin';
  createdAt?: Date;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  end_time?: string;
  location: string;
  category: string;
  imageUrl?: string;
  image?: string;
  price?: number;
  organizerName?: string;
  createdBy?: string;
  likes?: number;
  likedBy?: string[];
  attendees?: string[];
  comments?: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
  puntos?: number;
  eventId?: string;
  userId?: string;
  userName?: string;
  userProfileImage?: string;
  userAvatar?: string;
  content?: string;
}

export interface EventInteraction {
  id: string;
  eventId: string;
  userId: string;
  type: 'like' | 'attend';
  createdAt: Date;
}