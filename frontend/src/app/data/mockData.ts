import { MatchProfile, Conversation, MatchRequest } from '../types';

export const mockMatches: MatchProfile[] = [
  {
    id: '2',
    name: 'Aisha Khan',
    age: 26,
    gender: 'Female',
    religion: 'Islam',
    city: 'Dubai',
    education: 'Masters in Computer Science',
    profession: 'Software Engineer',
    interests: ['Technology', 'Reading', 'Hiking', 'Photography'],
    familyBackground: 'Professional family with modern values',
    bio: 'Tech enthusiast who loves exploring new places and meeting new people. Looking for someone who shares my passion for innovation and adventure.',
    photos: [],
    verified: true,
    profileCompletion: 95,
    partnerPreferences: {
      ageRange: [26, 32],
      cities: ['Dubai', 'Abu Dhabi'],
      education: ['Bachelors', 'Masters'],
      religions: ['Islam'],
      interests: ['Technology', 'Travel']
    },
    compatibilityScore: 94,
    matchReasons: [
      'Similar educational background',
      'Shared interests in technology and photography',
      'Compatible lifestyle preferences',
      'Strong family values alignment'
    ],
    aiInsights: {
      personalityMatch: 92,
      lifestyleCompatibility: 88,
      emotionalCompatibility: 95,
      longTermStability: 90,
      potentialHurdles: [
        'Different communication styles may need adjustment',
        'Career ambitions should be discussed early'
      ],
      strengths: [
        'Excellent intellectual compatibility',
        'Similar social values',
        'Strong emotional intelligence match'
      ],
      redFlags: []
    }
  },
  {
    id: '3',
    name: 'Fatima Hassan',
    age: 27,
    gender: 'Female',
    religion: 'Islam',
    city: 'Abu Dhabi',
    education: 'Bachelors in Medicine',
    profession: 'Doctor',
    interests: ['Healthcare', 'Volunteering', 'Yoga', 'Cooking'],
    familyBackground: 'Traditional family with strong religious values',
    bio: 'Dedicated healthcare professional seeking a partner who values compassion, family, and making a positive impact in the world.',
    photos: [],
    verified: true,
    profileCompletion: 90,
    partnerPreferences: {
      ageRange: [27, 35],
      cities: ['Abu Dhabi', 'Dubai'],
      education: ['Bachelors', 'Masters', 'PhD'],
      religions: ['Islam'],
      interests: ['Healthcare', 'Volunteering']
    },
    compatibilityScore: 89,
    matchReasons: [
      'Strong family values',
      'Similar religious background',
      'Complementary career paths',
      'Shared interest in community service'
    ],
    aiInsights: {
      personalityMatch: 85,
      lifestyleCompatibility: 90,
      emotionalCompatibility: 88,
      longTermStability: 92,
      potentialHurdles: [
        'Demanding work schedules may require coordination',
        'Different social activity preferences'
      ],
      strengths: [
        'High emotional maturity',
        'Strong commitment to family values',
        'Excellent communication skills'
      ],
      redFlags: []
    }
  },
  {
    id: '4',
    name: 'Layla Mohammed',
    age: 29,
    gender: 'Female',
    religion: 'Islam',
    city: 'Dubai',
    education: 'Masters in Architecture',
    profession: 'Architect',
    interests: ['Design', 'Art', 'Travel', 'Photography'],
    familyBackground: 'Creative and supportive family environment',
    bio: 'Creative soul with a passion for beautiful spaces and meaningful connections. Seeking someone who appreciates art, culture, and deep conversations.',
    photos: [],
    verified: true,
    profileCompletion: 88,
    partnerPreferences: {
      ageRange: [28, 36],
      cities: ['Dubai', 'Sharjah'],
      education: ['Bachelors', 'Masters'],
      religions: ['Islam'],
      interests: ['Art', 'Travel', 'Photography']
    },
    compatibilityScore: 87,
    matchReasons: [
      'Shared creative interests',
      'Similar age group',
      'Compatible cultural values',
      'Both value personal growth'
    ],
    aiInsights: {
      personalityMatch: 88,
      lifestyleCompatibility: 85,
      emotionalCompatibility: 86,
      longTermStability: 87,
      potentialHurdles: [
        'Different approaches to decision-making',
        'May need to balance social vs quiet time preferences'
      ],
      strengths: [
        'Strong creative synergy',
        'Excellent cultural alignment',
        'Good communication compatibility'
      ],
      redFlags: []
    }
  },
  {
    id: '5',
    name: 'Mariam Ali',
    age: 25,
    gender: 'Female',
    religion: 'Islam',
    city: 'Sharjah',
    education: 'Bachelors in Business',
    profession: 'Entrepreneur',
    interests: ['Business', 'Fitness', 'Travel', 'Fashion'],
    familyBackground: 'Business-oriented family with entrepreneurial spirit',
    bio: 'Young entrepreneur building my dream business. Looking for an ambitious partner who supports growth and shares the journey of life.',
    photos: [],
    verified: true,
    profileCompletion: 82,
    partnerPreferences: {
      ageRange: [25, 32],
      cities: ['Sharjah', 'Dubai', 'Abu Dhabi'],
      education: ['Bachelors', 'Masters'],
      religions: ['Islam'],
      interests: ['Business', 'Travel', 'Fitness']
    },
    compatibilityScore: 83,
    matchReasons: [
      'Similar entrepreneurial mindset',
      'Aligned life goals',
      'Shared interest in personal development',
      'Compatible age range'
    ],
    aiInsights: {
      personalityMatch: 82,
      lifestyleCompatibility: 84,
      emotionalCompatibility: 81,
      longTermStability: 83,
      potentialHurdles: [
        'Both being very career-focused may need balance',
        'Different relaxation preferences'
      ],
      strengths: [
        'Strong ambition alignment',
        'Good fitness compatibility',
        'Shared growth mindset'
      ],
      redFlags: []
    }
  },
  {
    id: '6',
    name: 'Zainab Malik',
    age: 30,
    gender: 'Female',
    religion: 'Islam',
    city: 'Dubai',
    education: 'PhD in Psychology',
    profession: 'Clinical Psychologist',
    interests: ['Psychology', 'Reading', 'Meditation', 'Counseling'],
    familyBackground: 'Academic family with focus on education and personal growth',
    bio: 'Clinical psychologist passionate about mental health and personal development. Seeking a emotionally intelligent partner for a meaningful relationship.',
    photos: [],
    verified: true,
    profileCompletion: 93,
    partnerPreferences: {
      ageRange: [29, 38],
      cities: ['Dubai', 'Abu Dhabi'],
      education: ['Masters', 'PhD'],
      religions: ['Islam'],
      interests: ['Reading', 'Personal Development', 'Health']
    },
    compatibilityScore: 91,
    matchReasons: [
      'Exceptional emotional intelligence match',
      'Similar educational values',
      'Deep interest in personal growth',
      'Strong communication compatibility'
    ],
    aiInsights: {
      personalityMatch: 94,
      lifestyleCompatibility: 87,
      emotionalCompatibility: 96,
      longTermStability: 93,
      potentialHurdles: [
        'May over-analyze situations',
        'Different social energy levels'
      ],
      strengths: [
        'Outstanding emotional compatibility',
        'Excellent conflict resolution potential',
        'Strong intellectual connection'
      ],
      redFlags: []
    }
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: ['1', '2'],
    lastMessage: 'That sounds wonderful! I would love to meet for coffee.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2,
    otherUser: mockMatches[0]
  },
  {
    id: 'conv2',
    participants: ['1', '3'],
    lastMessage: 'Thank you for sharing that. Your family sounds lovely.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    otherUser: mockMatches[1]
  },
  {
    id: 'conv3',
    participants: ['1', '4'],
    lastMessage: 'I completely agree! Architecture is such a fascinating field.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 1,
    otherUser: mockMatches[2]
  }
];

export const mockMatchRequests: MatchRequest[] = [
  {
    id: 'req1',
    fromUser: mockMatches[3],
    toUserId: '1',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: 'req2',
    fromUser: mockMatches[4],
    toUserId: '1',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

export const personalityQuestions = [
  {
    id: 1,
    question: 'I enjoy being the center of attention in social gatherings',
    category: 'extraversion'
  },
  {
    id: 2,
    question: 'I prefer to plan things in advance rather than be spontaneous',
    category: 'conscientiousness'
  },
  {
    id: 3,
    question: 'I find it easy to understand and share others\' feelings',
    category: 'agreeableness'
  },
  {
    id: 4,
    question: 'I enjoy exploring new ideas and experiences',
    category: 'openness'
  },
  {
    id: 5,
    question: 'I remain calm under pressure',
    category: 'emotionalStability'
  },
  {
    id: 6,
    question: 'I prefer deep one-on-one conversations over group discussions',
    category: 'extraversion'
  },
  {
    id: 7,
    question: 'I pay attention to details and like things organized',
    category: 'conscientiousness'
  },
  {
    id: 8,
    question: 'I prioritize harmony in relationships over being right',
    category: 'agreeableness'
  },
  {
    id: 9,
    question: 'I love trying new cuisines and activities',
    category: 'openness'
  },
  {
    id: 10,
    question: 'I handle criticism well without getting defensive',
    category: 'emotionalStability'
  }
];
