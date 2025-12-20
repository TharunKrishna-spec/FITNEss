
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition } from './types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Aryan Sharma',
    role: Role.BOARD,
    position: 'Club President',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
    bio: 'Leading the vision of Fitness Club VIT Chennai. National-level powerlifter and final-year Computer Science student.',
    socials: { linkedin: '#', instagram: '#' },
    achievements: ['Gold Medal - State Powerlifting 2023', 'VIT Sports Excellence Award'],
    order_index: 1
  },
  {
    id: 'b27ac10b-58cc-4372-a567-0e02b2c3d480',
    name: 'Ishaan Verma',
    role: Role.BOARD,
    position: 'General Secretary',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
    bio: 'Managing club operations and inter-college tie-ups. Passionate about functional training.',
    socials: { linkedin: '#', instagram: '#' },
    order_index: 2
  },
  {
    id: 'c37ac10b-58cc-4372-a567-0e02b2c3d481',
    name: 'Riya Kapoor',
    role: Role.LEAD,
    position: 'Technical Training Lead',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400',
    bio: 'Oversees the scientific training protocols for our junior members and transformation programs.',
    socials: { instagram: '#' },
    order_index: 3
  }
];

export const INITIAL_EVENTS: Event[] = [
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

export const INITIAL_HALL_OF_FAME: Achievement[] = [
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
