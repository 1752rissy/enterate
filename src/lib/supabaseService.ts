import { supabase } from './supabase';
import { Event, User, Comment, EventInteraction } from '@/types';

export class SupabaseService {
  // User operations
  async createUser(user: User): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profileImage,
          role: user.role || 'user',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        role: data.role,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        role: data.role,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'moderator' | 'admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Event operations
  async createEvent(event: Event): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('app_f6a677c6d3_events')
        .insert([{
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          image_url: event.imageUrl,
          price: event.price || 0,
          organizer_name: event.organizerName,
          created_by: event.createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      return this.transformEventFromDB(data);
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('app_f6a677c6d3_events')
        .select(`
          *,
          event_interactions(user_id, type),
          comments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(event => this.transformEventFromDB(event));
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  async updateEvent(event: Event): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('app_f6a677c6d3_events')
        .update({
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          image_url: event.imageUrl,
          price: event.price || 0,
          organizer_name: event.organizerName,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id)
        .select()
        .single();

      if (error) throw error;
      
      return this.transformEventFromDB(data);
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      // Delete related interactions and comments first
      await supabase.from('event_interactions').delete().eq('event_id', eventId);
      await supabase.from('comments').delete().eq('event_id', eventId);
      
      // Delete the event
      const { error } = await supabase
        .from('app_f6a677c6d3_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Interaction operations
  async toggleLike(eventId: string, userId: string): Promise<boolean> {
    try {
      // Check if like exists
      const { data: existing } = await supabase
        .from('event_interactions')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('type', 'like')
        .single();

      if (existing) {
        // Remove like
        const { error } = await supabase
          .from('event_interactions')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add like
        const { error } = await supabase
          .from('event_interactions')
          .insert([{
            event_id: eventId,
            user_id: userId,
            type: 'like',
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }

  async toggleAttendance(eventId: string, userId: string): Promise<boolean> {
    try {
      // Check if attendance exists
      const { data: existing } = await supabase
        .from('event_interactions')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('type', 'attend')
        .single();

      if (existing) {
        // Remove attendance
        const { error } = await supabase
          .from('event_interactions')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add attendance
        const { error } = await supabase
          .from('event_interactions')
          .insert([{
            event_id: eventId,
            user_id: userId,
            type: 'attend',
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling attendance:', error);
      return false;
    }
  }

  async getUserInteractions(eventId: string, userId: string): Promise<{ isLiked: boolean; isAttending: boolean }> {
    try {
      const { data, error } = await supabase
        .from('event_interactions')
        .select('type')
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      
      const interactions = data || [];
      return {
        isLiked: interactions.some(i => i.type === 'like'),
        isAttending: interactions.some(i => i.type === 'attend')
      };
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return { isLiked: false, isAttending: false };
    }
  }

  // Comment operations
  async addComment(eventId: string, userId: string, userName: string, userProfileImage: string, content: string): Promise<Comment | null> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          event_id: eventId,
          user_id: userId,
          user_name: userName,
          user_profile_image: userProfileImage,
          content: content,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        userName: data.user_name,
        userProfileImage: data.user_profile_image,
        content: data.content,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  async getComments(eventId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data.map(comment => ({
        id: comment.id,
        eventId: comment.event_id,
        userId: comment.user_id,
        userName: comment.user_name,
        userProfileImage: comment.user_profile_image,
        content: comment.content,
        createdAt: new Date(comment.created_at)
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  // Helper method to transform event data from database
  private transformEventFromDB(data: any): Event {
    const likes = data.event_interactions?.filter((i: any) => i.type === 'like').length || 0;
    const likedBy = data.event_interactions?.filter((i: any) => i.type === 'like').map((i: any) => i.user_id) || [];
    const attendees = data.event_interactions?.filter((i: any) => i.type === 'attend').map((i: any) => i.user_id) || [];
    const comments = data.comments?.map((c: any) => ({
      id: c.id,
      eventId: c.event_id,
      userId: c.user_id,
      userName: c.user_name,
      userProfileImage: c.user_profile_image,
      content: c.content,
      createdAt: new Date(c.created_at)
    })) || [];

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      category: data.category,
      imageUrl: data.image_url,
      price: data.price,
      organizerName: data.organizer_name,
      createdBy: data.created_by,
      likes,
      likedBy,
      attendees,
      comments,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export const supabaseService = new SupabaseService();