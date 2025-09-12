import { Event, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    profileImage: 'https://ui-avatars.com/api/?name=Juan+Perez&background=3b82f6&color=fff',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=3b82f6&color=fff',
    role: 'user',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Ana García',
    email: 'ana.moderator@example.com',
    profileImage: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=10b981&color=fff',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=10b981&color=fff',
    role: 'moderator',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Carlos Admin',
    email: 'carlos.admin@example.com',
    profileImage: 'https://ui-avatars.com/api/?name=Carlos+Admin&background=dc2626&color=fff',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Admin&background=dc2626&color=fff',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Jazz en el Parque',
    description: 'Un evento musical único con los mejores artistas de jazz de la región. Disfruta de una tarde llena de música en vivo, comida gourmet y un ambiente familiar.',
    date: '2024-12-15',
    time: '18:00',
    location: 'Parque Central, Buenos Aires',
    category: 'Música',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    price: 2500,
    organizerName: 'Ana García',
    createdBy: '2',
    createdAt: new Date('2024-11-01'),
    likes: 45,
    likedBy: ['1', '3'],
    attendees: ['1', '3'],
    comments: [
      {
        id: '1',
        userId: '1',
        userName: 'Juan Pérez',
        userAvatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=3b82f6&color=fff',
        content: '¡Excelente evento! No puedo esperar a asistir.',
        createdAt: new Date('2024-11-02')
      }
    ]
  },
  {
    id: '2',
    title: 'Feria Gastronómica Internacional',
    description: 'Descubre sabores de todo el mundo en nuestra feria gastronómica. Más de 50 stands con comida típica de diferentes países.',
    date: '2024-12-20',
    time: '12:00',
    location: 'Centro de Convenciones, Córdoba',
    category: 'Gastronomía',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    price: 0,
    organizerName: 'Carlos Admin',
    createdBy: '3',
    createdAt: new Date('2024-11-05'),
    likes: 78,
    likedBy: ['1', '2'],
    attendees: ['1', '2'],
    comments: []
  },
  {
    id: '3',
    title: 'Tour Histórico por el Casco Antiguo',
    description: 'Recorre los lugares más emblemáticos de la ciudad con guías especializados. Conoce la historia y arquitectura colonial.',
    date: '2024-12-25',
    time: '10:00',
    location: 'Plaza de Armas, Salta',
    category: 'Turismo',
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=400&fit=crop',
    price: 1500,
    organizerName: 'Ana García',
    createdBy: '2',
    createdAt: new Date('2024-11-08'),
    likes: 32,
    likedBy: ['3'],
    attendees: ['3'],
    comments: []
  },
  {
    id: '4',
    title: 'Exposición de Arte Contemporáneo',
    description: 'Muestra de obras de artistas emergentes locales. Una oportunidad única para conocer el talento artístico de la región.',
    date: '2024-12-30',
    time: '16:00',
    location: 'Museo de Arte Moderno, Rosario',
    category: 'Arte',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
    price: 800,
    organizerName: 'Carlos Admin',
    createdBy: '3',
    createdAt: new Date('2024-11-10'),
    likes: 56,
    likedBy: ['1', '2'],
    attendees: ['1', '2'],
    comments: []
  }
];