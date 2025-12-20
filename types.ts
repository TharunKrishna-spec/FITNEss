
export enum Role {
  BOARD = 'Board Member',
  LEAD = 'Lead',
  ALUMNI = 'Alumni',
  MEMBER = 'FFCS Member'
}

export interface Profile {
  id: string;
  name: string;
  role: Role;
  position: string;
  reg_no?: string; // VIT Registration Number
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

export interface ScoreColumn {
  id: string;
  name: string;
  type: 'number' | 'text' | 'time';
  isTotalComponent: boolean;
}

export interface EventScore {
  id: string;
  event_id: string;
  athlete_name: string;
  data: Record<string, any>;
  total: number;
  rank?: number;
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
  score_schema?: ScoreColumn[];
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
