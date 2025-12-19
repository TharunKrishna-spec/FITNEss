
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
}

export enum PodiumPosition {
  GOLD = '1st Place',
  SILVER = '2nd Place',
  BRONZE = '3rd Place'
}

export interface Achievement {
  id: string;
  category: string; // e.g., "Powerlifting - 75kg", "Best Transformation"
  eventName: string; // e.g., "VIT Campus Clash 2023"
  athleteName: string;
  athleteImg?: string;
  position: PodiumPosition;
  stat?: string; // e.g., "450kg Total", "15% BF Drop"
  year: string;
  featured: boolean;
}

export interface UserRole {
  isAdmin: boolean;
  type: 'Super Admin' | 'Content Admin' | 'Event Manager' | 'User';
}
