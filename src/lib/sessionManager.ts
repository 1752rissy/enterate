import { User, Event } from '@/types';
import { mockUsers, mockEvents } from './mockData';

export class SessionManager {
  private static instance: SessionManager;
  
  private constructor() {}
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Initialize application data
  initializeApp(): void {
    this.initializeUsers();
    this.initializeEvents();
    this.initializeSession();
  }

  // Initialize users if not exists
  private initializeUsers(): void {
    const storedUsers = localStorage.getItem('enterate-users');
    if (!storedUsers) {
      localStorage.setItem('enterate-users', JSON.stringify(mockUsers));
      console.log('Initialized users with mock data');
    }
  }

  // Initialize events if not exists
  private initializeEvents(): void {
    const storedEvents = localStorage.getItem('enterate-events');
    if (!storedEvents) {
      localStorage.setItem('enterate-events', JSON.stringify(mockEvents));
      console.log('Initialized events with mock data');
    }
  }

  // Initialize session data
  private initializeSession(): void {
    const sessionId = this.getOrCreateSessionId();
    console.log('Session ID:', sessionId);
  }

  // Get or create session ID
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('enterate-session-id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('enterate-session-id', sessionId);
    }
    return sessionId;
  }

  // Get all users
  getUsers(): User[] {
    const storedUsers = localStorage.getItem('enterate-users');
    return storedUsers ? JSON.parse(storedUsers) : mockUsers;
  }

  // Save users
  saveUsers(users: User[]): void {
    localStorage.setItem('enterate-users', JSON.stringify(users));
  }

  // Get user by email
  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  // Get user by ID
  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  // Update user
  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      this.saveUsers(users);
      
      // Update current user session if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        this.setCurrentUser(updatedUser);
      }
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem('enterate-current-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Always get the latest user data from storage
        const latestUser = this.getUserById(parsedUser.id);
        if (latestUser) {
          // Update stored current user with latest data
          this.setCurrentUser(latestUser);
          return latestUser;
        }
        return parsedUser;
      } catch (error) {
        console.error('Error parsing current user:', error);
        localStorage.removeItem('enterate-current-user');
      }
    }
    return null;
  }

  // Set current user
  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('enterate-current-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('enterate-current-user');
    }
  }

  // Get all events
  getEvents(): Event[] {
    const storedEvents = localStorage.getItem('enterate-events');
    return storedEvents ? JSON.parse(storedEvents) : mockEvents;
  }

  // Save events
  saveEvents(events: Event[]): void {
    localStorage.setItem('enterate-events', JSON.stringify(events));
  }

  // Get event by ID
  getEventById(id: string): Event | null {
    const events = this.getEvents();
    return events.find(event => event.id === id) || null;
  }

  // Update event
  updateEvent(updatedEvent: Event): void {
    const events = this.getEvents();
    const eventIndex = events.findIndex(event => event.id === updatedEvent.id);
    if (eventIndex !== -1) {
      events[eventIndex] = updatedEvent;
      this.saveEvents(events);
    }
  }

  // Add new event
  addEvent(newEvent: Event): void {
    const events = this.getEvents();
    events.push(newEvent);
    this.saveEvents(events);
  }

  // Delete event
  deleteEvent(eventId: string): void {
    const events = this.getEvents();
    const filteredEvents = events.filter(event => event.id !== eventId);
    this.saveEvents(filteredEvents);
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    localStorage.removeItem('enterate-users');
    localStorage.removeItem('enterate-events');
    localStorage.removeItem('enterate-current-user');
    localStorage.removeItem('enterate-session-id');
    // Clear all event interactions
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('enterate-interaction-')) {
        localStorage.removeItem(key);
      }
    });
    console.log('All application data cleared');
  }

  // Get application stats
  getStats(): { users: number; events: number; sessionId: string } {
    return {
      users: this.getUsers().length,
      events: this.getEvents().length,
      sessionId: localStorage.getItem('enterate-session-id') || 'none'
    };
  }

  // Export data (for backup/transfer)
  exportData(): string {
    const data = {
      users: this.getUsers(),
      events: this.getEvents(),
      currentUser: this.getCurrentUser(),
      sessionId: localStorage.getItem('enterate-session-id'),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data (for restore/transfer)
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.users) this.saveUsers(data.users);
      if (data.events) this.saveEvents(data.events);
      if (data.currentUser) this.setCurrentUser(data.currentUser);
      if (data.sessionId) localStorage.setItem('enterate-session-id', data.sessionId);
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();