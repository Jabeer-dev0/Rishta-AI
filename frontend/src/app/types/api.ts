// ─── Backend-aligned TypeScript types ────────────────────────────────────────

export interface ApiUser {
  _id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  religion: string;
  city: string;
  country: string;
  education: string;
  profession: string;
  interests: string[];
  familyBackground: string;
  bio: string;
  photos: string[];
  profilePhoto: string;
  verified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  profileCompletion: number;
  profileViews: number;
  aiScore: number;
  role: 'user' | 'admin';
  isBlocked: boolean;
  isActive: boolean;
  partnerPreferences: {
    ageRange: { min: number; max: number };
    cities: string[];
    education: string[];
    religions: string[];
    professions: string[];
  };
  personalityScores: {
    extraversion: number;
    conscientiousness: number;
    agreeableness: number;
    openness: number;
    emotionalStability: number;
    personalityType: string;
  };
  socialMediaConnected: {
    instagram: boolean;
    facebook: boolean;
    twitter: boolean;
  };
  socialInsights: {
    detectedInterests: string[];
    lifestyleScore: number;
    matchImprovement: number;
    dataPoints: number;
  };
  notificationPrefs: {
    matches: boolean;
    messages: boolean;
    requests: boolean;
    marketing: boolean;
  };
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';
  connectionRequestId?: string | null;
  lastActiveAt: string;
  createdAt: string;
}

export interface ApiMatch {
  _id: string;
  user: string;
  matchedUser: ApiUser;
  compatibilityScore: number;
  matchReasons: string[];
  aiInsights: {
    personalityMatch: number;
    lifestyleCompatibility: number;
    emotionalCompatibility: number;
    longTermStability: number;
    strengths: string[];
    potentialHurdles: string[];
  };
  report: string;
  generatedAt: string;
}

export interface ApiConnectionRequest {
  _id: string;
  fromUser: ApiUser;
  toUser: ApiUser;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string;
  createdAt: string;
}

export interface ApiConversation {
  _id: string;
  participants: ApiUser[];
  otherUser: ApiUser;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
}

export interface ApiMessage {
  _id: string;
  conversation: string;
  sender: ApiUser;
  text: string;
  mediaType: 'text' | 'image' | 'voice';
  seenBy: string[];
  createdAt: string;
}

export interface ApiNotification {
  _id: string;
  type: 'new_match' | 'connection_request' | 'request_accepted' | 'new_message' | 'profile_view' | 'verification_complete';
  title: string;
  body: string;
  isRead: boolean;
  data: Record<string, string>;
  createdAt: string;
}

export interface ApiPersonalityResult {
  _id: string;
  scores: {
    extraversion: number;
    conscientiousness: number;
    agreeableness: number;
    openness: number;
    emotionalStability: number;
  };
  personalityType: string;
  completedAt: string;
}

export interface ApiStats {
  profileViews: number;
  aiMatches: number;
  messages: number;
  pendingRequests: number;
  profileCompletion: number;
  aiScore: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
