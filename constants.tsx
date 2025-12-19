
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition } from './types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Aryan Sharma',
    role: Role.BOARD,
    position: 'Club President',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
    bio: 'Leading the vision of Fitness Club VIT Chennai. National-level powerlifter and final-year Computer Science student.',
    socials: { linkedin: '#', instagram: '#' },
    achievements: ['Gold Medal - State Powerlifting 2023', 'VIT Sports Excellence Award']
  },
  {
    id: '2',
    name: 'Ishaan Verma',
    role: Role.BOARD,
    position: 'General Secretary',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
    bio: 'Managing club operations and inter-college tie-ups. Passionate about functional training.',
    socials: { linkedin: '#', instagram: '#' }
  },
  {
    id: '3',
    name: 'Riya Kapoor',
    role: Role.LEAD,
    position: 'Technical Training Lead',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400',
    bio: 'Oversees the scientific training protocols for our junior members and transformation programs.',
    socials: { instagram: '#' }
  },
  {
    id: '4',
    name: 'Vikram Singh',
    role: Role.LEAD,
    position: 'Events & Logistics Lead',
    tenure: '2023 - 2024',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
    bio: 'In charge of organizing Campus Clash and Indoor Strength Opens.',
    socials: { linkedin: '#' }
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'VIT Campus Clash 2024',
    date: '2024-04-15',
    description: 'The biggest inter-department strength competition in VIT Chennai. Categories: Squat, Bench, Deadlift.',
    status: EventStatus.REGISTRATION_OPEN,
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200'
  },
  {
    id: 'e-mega',
    title: 'Titans Night: Under the Lights',
    date: '2024-05-20',
    description: 'A night-time fitness festival featuring neon workouts, DJ sets, and maximum-rep challenges.',
    status: EventStatus.UPCOMING,
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200'
  },
  {
    id: 'e2',
    title: 'Freshers Induction Cycle',
    date: '2024-03-10',
    description: 'Welcoming the new batch of Titans. Core team recruitments and fitness assessments.',
    status: EventStatus.ONGOING,
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200'
  },
  {
    id: 'e3',
    title: 'Powerlifting Seminar',
    date: '2024-02-15',
    description: 'Deep dive into squat mechanics and injury prevention with state-level coaches.',
    status: EventStatus.COMPLETED,
    banner: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200'
  }
];

export const INITIAL_HALL_OF_FAME: Achievement[] = [
  {
    id: 'h1',
    category: 'Powerlifting - Under 85kg',
    eventName: 'Campus Clash 2023',
    athleteName: 'Sameer Khan',
    athleteImg: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800',
    position: PodiumPosition.GOLD,
    stat: '540kg Total',
    year: '2023',
    featured: true
  },
  {
    id: 'h2',
    category: 'Powerlifting - Under 85kg',
    eventName: 'Campus Clash 2023',
    athleteName: 'Rahul Mehta',
    athleteImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800',
    position: PodiumPosition.SILVER,
    stat: '515kg Total',
    year: '2023',
    featured: false
  },
  {
    id: 'h3',
    category: 'Powerlifting - Under 85kg',
    eventName: 'Campus Clash 2023',
    athleteName: 'Arjun Reddy',
    athleteImg: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800',
    position: PodiumPosition.BRONZE,
    stat: '490kg Total',
    year: '2023',
    featured: false
  },
  {
    id: 'h4',
    category: 'Women\'s Open Category',
    eventName: 'Indoor Strength Open 2023',
    athleteName: 'Priya Das',
    athleteImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
    position: PodiumPosition.GOLD,
    stat: '320kg Total',
    year: '2023',
    featured: false
  },
  {
    id: 'h5',
    category: 'Men\'s Physique',
    eventName: 'Campus Aesthetics 2022',
    athleteName: 'Varun Dhawan',
    athleteImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800',
    position: PodiumPosition.GOLD,
    stat: 'Winner',
    year: '2022',
    featured: false
  }
];
