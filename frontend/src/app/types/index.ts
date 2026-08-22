export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  religion: string;
  city: string;
  education: string;
  profession: string;
  interests: string[];
  familyBackground: string;
  bio: string;
  photos: string[];
  verified: boolean;
  profileCompletion: number;
  partnerPreferences: PartnerPreferences;
  personalityTest?: PersonalityTestResult;
  socialMediaConnected?: {
    facebook: boolean;
    instagram: boolean;
    linkedin: boolean;
  };
}

export interface PartnerPreferences {
  ageRange: [number, number];
  cities: string[];
  education: string[];
  religions: string[];
  interests: string[];
}

export interface MatchProfile extends User {
  compatibilityScore: number;
  matchReasons: string[];
  aiInsights: AIInsights;
}

export interface AIInsights {
  personalityMatch: number;
  lifestyleCompatibility: number;
  emotionalCompatibility: number;
  longTermStability: number;
  potentialHurdles: string[];
  strengths: string[];
  redFlags: string[];
}

export interface PersonalityTestResult {
  type: string;
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    emotionalStability: number;
  };
  communicationStyle: string;
  relationshipReadiness: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  aiWarning?: string;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  otherUser: User;
}

export interface MatchRequest {
  id: string;
  fromUser: User;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}
