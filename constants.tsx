import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition } from './types';

// No client-side prefetched data — app loads from Supabase
export const INITIAL_PROFILES: Profile[] = [];
export const INITIAL_EVENTS: Event[] = [];
export const INITIAL_HALL_OF_FAME: Achievement[] = [];

// Seed/demo data (used only by admin "Seed System Data")
export const SEED_PROFILES: Profile[] = [
];

export const SEED_EVENTS: Event[] = [
  {
    id: 'd17ac10b-58cc-4372-a567-0e02b2c3d482',
    title: 'VIT Campus Clash 2024',
    date: '2024-04-15',
    description: 'The biggest inter-department strength competition in VIT Chennai. Categories: Squat, Bench, Deadlift.',
    status: EventStatus.REGISTRATION_OPEN,
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200',
    is_featured: true
  },
  {
    id: 'e27ac10b-58cc-4372-a567-0e02b2c3d483',
    title: 'Elite Night: Under the Lights',
    date: '2024-05-20',
    description: 'A night-time fitness festival featuring neon workouts, DJ sets, and maximum-rep challenges.',
    status: EventStatus.UPCOMING,
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200',
    is_featured: true
  }
];

export const SEED_HALL_OF_FAME: Achievement[] = [
  {
    id: 'h17ac10b-58cc-4372-a567-0e02b2c3d484',
    category: 'Powerlifting - Under 85kg',
    eventName: 'Campus Clash 2023',
    athleteName: 'Sameer Khan',
    athleteImg: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800',
    position: PodiumPosition.GOLD,
    stat: '540kg Total',
    year: '2023',
    featured: true
  }
];
