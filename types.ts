
export enum Role {
  BOARD = 'Board Member',
  LEAD = 'Lead',
  ALUMNI = 'Alumni'
}

export interface Profile {
  id: string;
  name: string;
  role: Role;
  position: string;
  tenure: string;
  photo: string;
  bio: string;
  socials: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  achievements?: string[];
  order_index?: number;
}

export enum EventStatus {
  UPCOMING = 'Upcoming',
  REGISTRATION_OPEN = 'Registrations Open',
  SOLD_OUT = 'Sold Out',
  COMPLETED = 'Completed',
  ONGOING = 'Ongoing'
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  status: EventStatus;
  banner: string;
  gallery?: string[];
  results?: string;
  is_featured?: boolean;
}

export enum PodiumPosition {
  GOLD = '1st Place',
  SILVER = '2nd Place',
  BRONZE = '3rd Place'
}

export interface Achievement {
  id: string;
  category: string;
  eventName: string;
  athleteName: string;
  athleteImg?: string;
  athleteSocial?: string;
  position: PodiumPosition;
  stat?: string;
  year: string;
  featured: boolean;
}

export interface UserRole {
  isAdmin: boolean;
  type: 'Super Admin' | 'Content Admin' | 'Event Manager' | 'User';
}
