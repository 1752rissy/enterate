import { supabase } from './supabase';
import { Event, User, Comment } from '@/types';

class SupabaseManager {
  // Obtener puntos acumulados de un usuario
  async getUserPoints(userId: string): Promise<number> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot get user points');
      return 0;
    }
    try {
      const { data, error } = await supabase
        .from('app_f6e677dc63_puntos_evento')
        .select('puntos_obtenidos')
        .eq('usuario_id', userId);
      if (error) {
        console.error('❌ Error fetching user points:', error);
        return 0;
      }
      // Sumar todos los puntos obtenidos
      return (data || []).reduce((acc, row) => acc + (row.puntos_obtenidos || 0), 0);
    } catch (error) {
      console.error('❌ Error getting user points:', error);
      return 0;
    }
  }
  // Auth: Login con email y password usando Supabase Auth
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      console.log('[SUPABASE] signIn con', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[SUPABASE] Error en signIn:', error);
        return null;
      }
      if (!data.user) {
        console.warn('[SUPABASE] No se encontró usuario en signIn');
        return null;
      }
      // Buscar datos extendidos del usuario en la tabla users
      const userDb = await this.getUserByEmail(email);
      if (!userDb) {
        // Si no hay datos extendidos, devolver lo básico
        return {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email,
          email: data.user.email,
          profileImage: data.user.user_metadata?.avatar_url || '',
          avatar: data.user.user_metadata?.avatar_url || '',
          role: 'user',
          createdAt: new Date(data.user.created_at)
        };
      }
      return userDb;
    } catch (error) {
      console.error('[SUPABASE] Excepción en signIn:', error);
      return null;
    }
  }
  private isConnected = false;

  async initialize(): Promise<boolean> {
    try {
      console.log('🔄 Initializing Supabase connection...');
      const { data, error } = await supabase.from('app_f6a677c6d3_events').select('count').limit(1);
      if (error) {
        console.error('Supabase initialization error:', error);
        throw error;
      }
      
      this.isConnected = true;
      console.log('✅ Supabase connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Event Management
  async getEvents(): Promise<Event[]> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, returning empty array');
      return [];
    }
    
    try {
      console.log('🔄 Fetching events from Supabase...');
      const { data, error } = await supabase
        .from('app_f6a677c6d3_events')
        .select(`
          *,
          app_f6a677c6d3_comments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} events from Supabase`);

      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        imageUrl: event.image_url,
        image: event.image_url, // For backward compatibility
        price: event.price,
        organizerName: event.organizer_name,
        createdBy: event.created_by,
        createdAt: new Date(event.created_at),
        updatedAt: event.updated_at ? new Date(event.updated_at) : undefined,
        likes: event.likes || 0,
        likedBy: event.liked_by || [],
        attendees: event.attendees || [],
        comments: event.app_f6a677c6d3_comments?.map((comment: any) => ({
          id: comment.id,
          eventId: comment.event_id,
          userId: comment.user_id,
          userName: comment.user_name,
          userProfileImage: comment.user_profile_image,
          userAvatar: comment.user_profile_image,
          content: comment.content,
          createdAt: new Date(comment.created_at)
        })) || []
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event | null> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot create event');
      return null;
    }

    try {
      console.log('🔄 Creating event in Supabase...', eventData.title);
      
      const eventToInsert = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        category: eventData.category,
        image_url: eventData.imageUrl || eventData.image || null,
        price: eventData.price || 0,
        organizer_name: eventData.organizerName,
        created_by: eventData.createdBy,
        likes: 0,
        liked_by: [],
        attendees: []
      };

      console.log('📝 Event data to insert:', eventToInsert);

      const { data, error } = await supabase
        .from('app_f6a677c6d3_events')
        .insert(eventToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating event:', error);
        throw error;
      }

      console.log('✅ Event created successfully:', data);

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        category: data.category,
        imageUrl: data.image_url,
        image: data.image_url,
        price: data.price,
        organizerName: data.organizer_name,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        likes: 0,
        likedBy: [],
        attendees: [],
        comments: []
      };
    } catch (error) {
      console.error('❌ Error creating event:', error);
      return null;
    }
  }

  async updateEvent(event: Event): Promise<boolean> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot update event');
      return false;
    }

    try {
      console.log('🔄 Updating event in Supabase...', event.id);
      
      const { error } = await supabase
        .from('app_f6a677c6d3_events')
        .update({
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          image_url: event.imageUrl || event.image,
          price: event.price || 0,
          organizer_name: event.organizerName,
          likes: event.likes || 0,
          liked_by: event.likedBy || [],
          attendees: event.attendees || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) {
        console.error('❌ Error updating event:', error);
        throw error;
      }
      
      console.log('✅ Event updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot delete event');
      return false;
    }

    try {
      console.log('🔄 Deleting event from Supabase...', eventId);
      
      // Delete related comments first (CASCADE should handle this, but being explicit)
      await supabase
        .from('app_f6a677c6d3_comments')
        .delete()
        .eq('event_id', eventId);

      // Delete related interactions
      await supabase
        .from('app_f6a677c6d3_event_interactions')
        .delete()
        .eq('event_id', eventId);

      // Delete the event
      const { error } = await supabase
        .from('app_f6a677c6d3_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('❌ Error deleting event:', error);
        throw error;
      }
      
      console.log('✅ Event deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      return false;
    }
  }

  // Event Interactions (Likes and Attendance) - FIXED VERSION
  async updateEventInteraction(eventId: string, userId: string, type: 'like' | 'attend', add: boolean): Promise<boolean> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot update interaction');
      return false;
    }

    try {
      console.log(`🔄 ${add ? 'Adding' : 'Removing'} ${type} interaction...`, { eventId, userId });

      if (add) {
        // Add interaction
        const { error } = await supabase
          .from('app_f6a677c6d3_event_interactions')
          .upsert({
            event_id: eventId,
            user_id: userId,
            interaction_type: type
          }, {
            onConflict: 'event_id,user_id,interaction_type'
          });

        if (error) {
          console.error('❌ Error adding interaction:', error);
          throw error;
        }
      } else {
        // Remove interaction
        const { error } = await supabase
          .from('app_f6a677c6d3_event_interactions')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .eq('interaction_type', type);

        if (error) {
          console.error('❌ Error removing interaction:', error);
          throw error;
        }
      }

      // Update the event's cached counts
      await this.updateEventCounts(eventId);
      
      console.log(`✅ ${type} interaction ${add ? 'added' : 'removed'} successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating ${type} interaction:`, error);
      return false;
    }
  }

  private async updateEventCounts(eventId: string): Promise<void> {
    try {
      // Get like count and user IDs
      const { data: likes, error: likesError } = await supabase
        .from('app_f6a677c6d3_event_interactions')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('interaction_type', 'like');

      if (likesError) throw likesError;

      // Get attendance count and user IDs
      const { data: attendees, error: attendeesError } = await supabase
        .from('app_f6a677c6d3_event_interactions')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('interaction_type', 'attend');

      if (attendeesError) throw attendeesError;

      // Update event with new counts
      const { error: updateError } = await supabase
        .from('app_f6a677c6d3_events')
        .update({
          likes: likes?.length || 0,
          liked_by: likes?.map(l => l.user_id) || [],
          attendees: attendees?.map(a => a.user_id) || []
        })
        .eq('id', eventId);

      if (updateError) throw updateError;

      console.log('✅ Event counts updated successfully');
    } catch (error) {
      console.error('❌ Error updating event counts:', error);
    }
  }

  // Comment Management
  async createComment(commentData: Omit<Comment, 'id'>): Promise<Comment | null> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot create comment');
      return null;
    }

    try {
      console.log('🔄 Creating comment in Supabase...');
      
      const { data, error } = await supabase
        .from('app_f6a677c6d3_comments')
        .insert({
          event_id: commentData.eventId,
          user_id: commentData.userId,
          user_name: commentData.userName,
          user_profile_image: commentData.userProfileImage || commentData.userAvatar,
          content: commentData.content
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating comment:', error);
        throw error;
      }

      console.log('✅ Comment created successfully');

      return {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        userName: data.user_name,
        userProfileImage: data.user_profile_image,
        userAvatar: data.user_profile_image,
        content: data.content,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      return null;
    }
  }

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot create user');
      return null;
    }

    try {
      console.log('🔄 Creating user in Supabase...', userData.email);
      
      const { data, error } = await supabase
        .from('app_f6a677c6d3_users')
        .insert({
          name: userData.name,
          email: userData.email,
          profile_image: userData.profileImage || userData.avatar,
          role: userData.role || 'user'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        throw error;
      }

      console.log('✅ User created successfully');

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        avatar: data.profile_image,
        role: data.role,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.isConnected) {
      console.log('⚠️ Supabase not connected, cannot get user');
      return null;
    }

    try {
      console.log('🔄 Fetching user from Supabase...', email);
      
      const { data, error } = await supabase
        .from('app_f6a677c6d3_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, user doesn't exist
          console.log('👤 User not found in database');
          return null;
        }
        console.error('❌ Error fetching user by email:', error);
        throw error;
      }

      console.log('✅ User found in database');

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        profileImage: data.profile_image,
        avatar: data.profile_image,
        role: data.role,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('❌ Error fetching user by email:', error);
      return null;
    }
  }

  isSupabaseConnected(): boolean {
    return this.isConnected;
  }
}

export const supabaseManager = new SupabaseManager();