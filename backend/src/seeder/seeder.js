require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const Match = require('../models/Match.model');
const ConnectionRequest = require('../models/ConnectionRequest.model');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Notification = require('../models/Notification.model');
const PersonalityResult = require('../models/PersonalityResult.model');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const MALE_USERS = [
  {
    name: 'Ahmed Raza', age: 28, gender: 'Male', religion: 'Islam', city: 'Lahore',
    email: 'ahmed@rishtaai.test', password: 'Test@12345',
    education: 'Masters in Computer Science', profession: 'Software Engineer',
    interests: ['Technology', 'Travel', 'Reading', 'Cricket'],
    familyBackground: 'Middle-class family from Lahore. Father is a retired teacher.',
    bio: 'Seeking a sincere and educated life partner. Family-oriented and career-driven.',
    verified: true, verificationStatus: 'verified', profileCompletion: 85, profileViews: 142,
    partnerPreferences: { ageRange: { min: 22, max: 32 }, cities: ['Lahore', 'Islamabad'], religions: ['Islam'] },
    personalityScores: { extraversion: 72, conscientiousness: 88, agreeableness: 76, openness: 80, emotionalStability: 84, personalityType: 'The Planner' },
    socialMediaConnected: { instagram: true, facebook: false, twitter: false },
    socialInsights: { detectedInterests: ['Tech', 'Travel', 'Books'], lifestyleScore: 8.4, matchImprovement: 23, dataPoints: 312 },
    aiScore: 87,
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop',
  },
  {
    name: 'Bilal Hassan', age: 31, gender: 'Male', religion: 'Islam', city: 'Karachi',
    email: 'bilal@rishtaai.test', password: 'Test@12345',
    education: 'MBBS', profession: 'Doctor',
    interests: ['Medicine', 'Cooking', 'Traveling', 'Football'],
    familyBackground: 'Traditional Karachi family. Father is a businessman.',
    bio: 'A doctor looking for a compassionate and family-loving partner.',
    verified: true, verificationStatus: 'verified', profileCompletion: 90, profileViews: 198,
    partnerPreferences: { ageRange: { min: 23, max: 30 }, cities: ['Karachi', 'Hyderabad'], religions: ['Islam'] },
    personalityScores: { extraversion: 60, conscientiousness: 92, agreeableness: 88, openness: 65, emotionalStability: 90, personalityType: 'The Rock' },
    socialMediaConnected: { instagram: false, facebook: true, twitter: false },
    socialInsights: { detectedInterests: ['Healthcare', 'Cooking', 'Sports'], lifestyleScore: 7.9, matchImprovement: 18, dataPoints: 245 },
    aiScore: 91,
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop',
  },
  {
    name: 'Usman Tariq', age: 26, gender: 'Male', religion: 'Islam', city: 'Islamabad',
    email: 'usman@rishtaai.test', password: 'Test@12345',
    education: 'BBA', profession: 'Marketing Manager',
    interests: ['Business', 'Photography', 'Hiking', 'Music'],
    familyBackground: 'Upper-middle class. Father runs a textile business.',
    bio: 'Creative professional seeking a modern and understanding life partner.',
    verified: false, verificationStatus: 'unverified', profileCompletion: 70, profileViews: 87,
    partnerPreferences: { ageRange: { min: 21, max: 28 }, cities: ['Islamabad', 'Rawalpindi', 'Lahore'], religions: ['Islam'] },
    personalityScores: { extraversion: 85, conscientiousness: 70, agreeableness: 78, openness: 92, emotionalStability: 72, personalityType: 'The Explorer' },
    socialMediaConnected: { instagram: true, facebook: true, twitter: true },
    socialInsights: { detectedInterests: ['Photography', 'Travel', 'Art'], lifestyleScore: 9.1, matchImprovement: 31, dataPoints: 478 },
    aiScore: 79,
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
  },
  {
    name: 'Hamza Sheikh', age: 33, gender: 'Male', religion: 'Islam', city: 'Lahore',
    email: 'hamza@rishtaai.test', password: 'Test@12345',
    education: 'LLB', profession: 'Lawyer',
    interests: ['Law', 'Reading', 'Chess', 'Gardening'],
    familyBackground: 'Legal family background. Father is a retired judge.',
    bio: 'Looking for an educated, principled partner with strong family values.',
    verified: true, verificationStatus: 'verified', profileCompletion: 80, profileViews: 110,
    partnerPreferences: { ageRange: { min: 24, max: 32 }, cities: ['Lahore', 'Multan'], religions: ['Islam'] },
    personalityScores: { extraversion: 50, conscientiousness: 95, agreeableness: 80, openness: 70, emotionalStability: 88, personalityType: 'The Planner' },
    socialMediaConnected: { instagram: false, facebook: false, twitter: false },
    socialInsights: { detectedInterests: ['Law', 'Books', 'Philosophy'], lifestyleScore: 7.2, matchImprovement: 10, dataPoints: 90 },
    aiScore: 84,
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop',
  },
  {
    name: 'Saad Ali', age: 29, gender: 'Male', religion: 'Islam', city: 'Faisalabad',
    email: 'saad@rishtaai.test', password: 'Test@12345',
    education: 'BE Electrical Engineering', profession: 'Engineer',
    interests: ['Engineering', 'Gaming', 'Cooking', 'Cricket'],
    familyBackground: 'Simple middle-class family with strong Islamic values.',
    bio: 'Humble engineer looking for a kind-hearted and religious life partner.',
    verified: false, verificationStatus: 'unverified', profileCompletion: 60, profileViews: 54,
    partnerPreferences: { ageRange: { min: 22, max: 28 }, cities: ['Faisalabad', 'Lahore'], religions: ['Islam'] },
    personalityScores: { extraversion: 55, conscientiousness: 80, agreeableness: 90, openness: 60, emotionalStability: 85, personalityType: 'The Harmonizer' },
    socialMediaConnected: { instagram: false, facebook: false, twitter: false },
    socialInsights: { detectedInterests: ['Technology', 'Games', 'Food'], lifestyleScore: 6.8, matchImprovement: 12, dataPoints: 140 },
    aiScore: 75,
    profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop',
  },
];

const FEMALE_USERS = [
  {
    name: 'Zara Malik', age: 25, gender: 'Female', religion: 'Islam', city: 'Lahore',
    email: 'zara@rishtaai.test', password: 'Test@12345',
    education: 'Masters in Business Administration', profession: 'Marketing Executive',
    interests: ['Business', 'Travel', 'Cooking', 'Reading'],
    familyBackground: 'Educated Lahori family. Father is a government officer.',
    bio: 'Ambitious yet family-oriented woman seeking a supportive life partner.',
    verified: true, verificationStatus: 'verified', profileCompletion: 90, profileViews: 234,
    partnerPreferences: { ageRange: { min: 26, max: 34 }, cities: ['Lahore', 'Islamabad'], religions: ['Islam'] },
    personalityScores: { extraversion: 78, conscientiousness: 85, agreeableness: 80, openness: 88, emotionalStability: 82, personalityType: 'The Explorer' },
    socialMediaConnected: { instagram: true, facebook: true, twitter: false },
    socialInsights: { detectedInterests: ['Business', 'Fashion', 'Travel'], lifestyleScore: 8.7, matchImprovement: 27, dataPoints: 389 },
    aiScore: 92,
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop',
  },
  {
    name: 'Ayesha Khan', age: 27, gender: 'Female', religion: 'Islam', city: 'Karachi',
    email: 'ayesha@rishtaai.test', password: 'Test@12345',
    education: 'MBBS', profession: 'Doctor',
    interests: ['Medicine', 'Volunteering', 'Yoga', 'Reading'],
    familyBackground: 'Conservative Karachi family with medical background.',
    bio: 'Dedicated doctor with strong values. Looking for a kind and understanding husband.',
    verified: true, verificationStatus: 'verified', profileCompletion: 85, profileViews: 178,
    partnerPreferences: { ageRange: { min: 28, max: 36 }, cities: ['Karachi', 'Lahore'], religions: ['Islam'] },
    personalityScores: { extraversion: 60, conscientiousness: 90, agreeableness: 95, openness: 68, emotionalStability: 88, personalityType: 'The Harmonizer' },
    socialMediaConnected: { instagram: false, facebook: true, twitter: false },
    socialInsights: { detectedInterests: ['Healthcare', 'Wellness', 'Books'], lifestyleScore: 8.1, matchImprovement: 19, dataPoints: 220 },
    aiScore: 94,
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop',
  },
  {
    name: 'Sana Mirza', age: 24, gender: 'Female', religion: 'Islam', city: 'Islamabad',
    email: 'sana@rishtaai.test', password: 'Test@12345',
    education: 'BS Computer Science', profession: 'Software Developer',
    interests: ['Coding', 'Photography', 'Art', 'Travel'],
    familyBackground: 'Modern Islamabad family. Father works in IT sector.',
    bio: 'Tech-savvy and creative, looking for an equally ambitious partner.',
    verified: true, verificationStatus: 'verified', profileCompletion: 80, profileViews: 156,
    partnerPreferences: { ageRange: { min: 25, max: 32 }, cities: ['Islamabad', 'Lahore', 'Rawalpindi'], religions: ['Islam'] },
    personalityScores: { extraversion: 65, conscientiousness: 82, agreeableness: 76, openness: 95, emotionalStability: 78, personalityType: 'The Explorer' },
    socialMediaConnected: { instagram: true, facebook: false, twitter: true },
    socialInsights: { detectedInterests: ['Tech', 'Art', 'Photography'], lifestyleScore: 9.2, matchImprovement: 34, dataPoints: 512 },
    aiScore: 88,
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop',
  },
  {
    name: 'Hira Baig', age: 29, gender: 'Female', religion: 'Islam', city: 'Lahore',
    email: 'hira@rishtaai.test', password: 'Test@12345',
    education: 'LLB', profession: 'Lawyer',
    interests: ['Law', 'Writing', 'Social Work', 'Fitness'],
    familyBackground: 'Educated Punjabi family. Strong Islamic values.',
    bio: 'Independent lawyer who values family above all. Seeking a mature life partner.',
    verified: false, verificationStatus: 'unverified', profileCompletion: 70, profileViews: 92,
    partnerPreferences: { ageRange: { min: 29, max: 38 }, cities: ['Lahore', 'Multan', 'Islamabad'], religions: ['Islam'] },
    personalityScores: { extraversion: 55, conscientiousness: 92, agreeableness: 82, openness: 74, emotionalStability: 90, personalityType: 'The Planner' },
    socialMediaConnected: { instagram: false, facebook: false, twitter: false },
    socialInsights: { detectedInterests: ['Law', 'Fitness', 'Writing'], lifestyleScore: 7.5, matchImprovement: 13, dataPoints: 110 },
    aiScore: 82,
    profilePhoto: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&auto=format&fit=crop',
  },
  {
    name: 'Maira Javed', age: 23, gender: 'Female', religion: 'Islam', city: 'Faisalabad',
    email: 'maira@rishtaai.test', password: 'Test@12345',
    education: 'BS Nutrition', profession: 'Nutritionist',
    interests: ['Health', 'Cooking', 'Gardening', 'Poetry'],
    familyBackground: 'Traditional family from Faisalabad with strong deen.',
    bio: 'Simple, caring and religious. Seeking a God-fearing life partner.',
    verified: false, verificationStatus: 'unverified', profileCompletion: 60, profileViews: 45,
    partnerPreferences: { ageRange: { min: 25, max: 32 }, cities: ['Faisalabad', 'Lahore'], religions: ['Islam'] },
    personalityScores: { extraversion: 48, conscientiousness: 85, agreeableness: 95, openness: 62, emotionalStability: 92, personalityType: 'The Rock' },
    socialMediaConnected: { instagram: false, facebook: false, twitter: false },
    socialInsights: { detectedInterests: ['Cooking', 'Health', 'Nature'], lifestyleScore: 7.0, matchImprovement: 11, dataPoints: 95 },
    aiScore: 78,
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop',
  },
];

const MATCH_PAIRS = [
  // [maleIdx, femaleIdx, score, reasons]
  [0, 0, 94, ['Both from Lahore', 'Shared love for travel and reading', 'Similar education levels', 'Strong family values match']],
  [0, 2, 82, ['Tech-industry overlap', 'Both value ambition', 'Similar age group']],
  [1, 1, 96, ['Both are doctors', 'Deep agreeableness match', 'City proximity (Karachi)', 'Religious alignment']],
  [1, 0, 78, ['Both career-driven', 'Complementary personalities', 'Good age compatibility']],
  [2, 2, 89, ['Creative personalities', 'Tech & photography interests', 'Both social media active', 'Similar openness scores']],
  [2, 0, 85, ['High social energy', 'Travel lovers', 'Business-minded overlap']],
  [3, 3, 87, ['Both lawyers', 'Strong conscientiousness', 'Family-oriented', 'Educational background match']],
  [3, 0, 80, ['Intellectual compatibility', 'Reading interest shared', 'Good emotional stability']],
  [4, 4, 91, ['Same city (Faisalabad)', 'Strong religious values', 'Emotional stability match', 'Simple lifestyle preference']],
  [4, 1, 76, ['Complementary professions', 'Healthcare & wellness interests', 'Good agreeableness match']],
];

const CONVERSATION_PAIRS = [
  [0, 0], // Ahmed ↔ Zara
  [1, 1], // Bilal ↔ Ayesha
];

const MESSAGES_PAIR_0 = [
  { senderIdx: 'male', text: 'Assalam o Alaikum Zara! I came across your profile and was truly impressed.' },
  { senderIdx: 'female', text: 'Wa Alaikum Assalam Ahmed! Thank you, your profile is lovely as well.' },
  { senderIdx: 'male', text: 'I noticed we share a love for travel. What has been your favourite destination so far?' },
  { senderIdx: 'female', text: 'Definitely Istanbul! The culture and food was incredible. Have you travelled internationally?' },
  { senderIdx: 'male', text: 'Yes! I visited Turkey last year as well. Perhaps we have similar taste 😊' },
  { senderIdx: 'female', text: 'That is quite a coincidence! I would love to know more about your family background.' },
  { senderIdx: 'male', text: 'Of course. My father is a retired teacher and my mother is a homemaker. Very close-knit family.' },
  { senderIdx: 'female', text: 'Mashallah that sounds wonderful! I would love for our families to connect soon.' },
];

const MESSAGES_PAIR_1 = [
  { senderIdx: 'male', text: 'Assalam o Alaikum Ayesha! Being a doctor myself I find your dedication truly inspiring.' },
  { senderIdx: 'female', text: 'Wa Alaikum Assalam Bilal! It is rare to find someone who understands this profession.' },
  { senderIdx: 'male', text: 'Absolutely. The long hours can be challenging. How do you manage work-life balance?' },
  { senderIdx: 'female', text: 'Yoga helps a lot. And my family is very supportive alhamdulillah.' },
  { senderIdx: 'male', text: 'That is great. Family support is so important especially in our field.' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Main Seeder ─────────────────────────────────────────────────────────────
const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  // ── Destroy mode ──
  if (process.argv.includes('--destroy')) {
    await Promise.all([
      User.deleteMany({}),
      Match.deleteMany({}),
      ConnectionRequest.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      PersonalityResult.deleteMany({}),
    ]);
    console.log('🗑️  All collections cleared.');
    process.exit(0);
  }

  // ── Clear existing test data ──
  await User.deleteMany({ email: /@rishtaai\.test$/ });
  console.log('🧹 Cleared existing test users');

  // ── Seed Admin ──
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      age: 30,
      gender: 'Male',
      religion: 'Islam',
      city: 'Lahore',
      email: process.env.ADMIN_EMAIL || 'admin@rishtaai.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      education: 'BS Computer Science',
      profession: 'Platform Administrator',
      interests: ['Technology'],
      role: 'admin',
      verified: true,
      verificationStatus: 'verified',
      profileCompletion: 100,
    });
    console.log('👑 Admin user created');
  }

  // ── Hash passwords & create users ──
  const hash = await bcrypt.hash('Test@12345', 12);

  const createUsers = async (list) => {
    const created = [];
    for (const u of list) {
      // Calculate a likely DOB based on age (approximate)
      const year = new Date().getFullYear() - u.age;
      const month = rand(0, 11);
      const day = rand(1, 28);
      const dateOfBirth = new Date(year, month, day);

      const doc = await User.create({ ...u, dateOfBirth, password: hash });
      created.push(doc);
    }
    return created;
  };

  const males = await createUsers(MALE_USERS);
  const females = await createUsers(FEMALE_USERS);
  console.log(`👥 Created ${males.length} male + ${females.length} female users`);

  // ── Seed Personality Results ──
  for (const user of [...males, ...females]) {
    if (user.personalityScores?.personalityType) {
      await PersonalityResult.create({
        user: user._id,
        answers: Array.from({ length: 10 }, (_, i) => ({ questionId: i + 1, score: rand(3, 5) })),
        scores: {
          extraversion: user.personalityScores.extraversion,
          conscientiousness: user.personalityScores.conscientiousness,
          agreeableness: user.personalityScores.agreeableness,
          openness: user.personalityScores.openness,
          emotionalStability: user.personalityScores.emotionalStability,
        },
        personalityType: user.personalityScores.personalityType,
      });
    }
  }
  console.log('🧠 Personality results seeded');

  // ── Seed Matches ──
  const matchDocs = [];
  for (const [mi, fi, score, reasons] of MATCH_PAIRS) {
    // Male → Female match
    const m1 = await Match.create({
      user: males[mi]._id,
      matchedUser: females[fi]._id,
      compatibilityScore: score,
      matchReasons: reasons,
      aiInsights: {
        personalityMatch: Math.min(100, score + rand(-5, 5)),
        lifestyleCompatibility: Math.min(100, score + rand(-8, 3)),
        emotionalCompatibility: Math.min(100, score + rand(-4, 6)),
        longTermStability: Math.min(100, score + rand(-6, 4)),
        strengths: reasons.slice(0, 2),
        potentialHurdles: ['Different cities may require discussion', 'Career schedules to align'],
      },
      report: `${males[mi].name} and ${females[fi].name} show exceptional compatibility across multiple dimensions. Their shared values, educational backgrounds and interests create a strong foundation for a meaningful relationship. The AI engine rates this as a highly recommended match.`,
    });
    // Female → Male match (reverse)
    const m2 = await Match.create({
      user: females[fi]._id,
      matchedUser: males[mi]._id,
      compatibilityScore: score,
      matchReasons: reasons,
      aiInsights: {
        personalityMatch: Math.min(100, score + rand(-5, 5)),
        lifestyleCompatibility: Math.min(100, score + rand(-8, 3)),
        emotionalCompatibility: Math.min(100, score + rand(-4, 6)),
        longTermStability: Math.min(100, score + rand(-6, 4)),
        strengths: reasons.slice(0, 2),
        potentialHurdles: ['Career alignment needed', 'Family introductions to arrange'],
      },
      report: `${females[fi].name} and ${males[mi].name} are highly compatible based on our AI engine analysis.`,
    });
    matchDocs.push(m1, m2);
  }
  console.log(`💑 ${matchDocs.length} match records seeded`);

  // ── Seed Connections + Conversations + Messages ──
  for (const [mi, fi] of CONVERSATION_PAIRS) {
    const maleUser = males[mi];
    const femaleUser = females[fi];

    // Connection request (accepted)
    const req = await ConnectionRequest.create({
      fromUser: maleUser._id,
      toUser: femaleUser._id,
      status: 'accepted',
      message: `Assalam o Alaikum! I would love to connect.`,
      updatedAt: new Date(),
    });

    // Conversation
    const conv = await Conversation.create({
      participants: [maleUser._id, femaleUser._id],
      connectionRequest: req._id,
      isActive: true,
    });

    // Messages
    const msgList = mi === 0 ? MESSAGES_PAIR_0 : MESSAGES_PAIR_1;
    let lastMsg = '';
    let lastTime = new Date(Date.now() - msgList.length * 5 * 60 * 1000);

    for (const m of msgList) {
      const sender = m.senderIdx === 'male' ? maleUser : femaleUser;
      lastTime = new Date(lastTime.getTime() + 5 * 60 * 1000);
      const msg = await Message.create({
        conversation: conv._id,
        sender: sender._id,
        text: m.text,
        mediaType: 'text',
        seenBy: [maleUser._id, femaleUser._id],
        deliveredTo: [maleUser._id, femaleUser._id],
        createdAt: lastTime,
      });
      lastMsg = m.text;
    }

    await Conversation.findByIdAndUpdate(conv._id, {
      lastMessage: lastMsg,
      lastMessageTime: lastTime,
    });
    console.log(`💬 Conversation seeded: ${maleUser.name} ↔ ${femaleUser.name}`);
  }

  // ── Seed a pending request ──
  await ConnectionRequest.create({
    fromUser: males[2]._id,
    toUser: females[0]._id,
    status: 'pending',
    message: 'Assalam o Alaikum! I came across your profile and would love to get to know you.',
  });
  console.log('📨 Pending connection request seeded');

  // ── Seed Notifications ──
  const notifData = [
    { recipient: females[0]._id, type: 'new_match', title: 'New Match Found! 💑', body: `${males[0].name} is a 94% match for you!` },
    { recipient: females[0]._id, type: 'connection_request', title: 'New Connection Request', body: `${males[2].name} wants to connect with you!` },
    { recipient: females[0]._id, type: 'request_accepted', title: 'Connection Accepted! 🎉', body: `You are now connected with ${males[0].name}.` },
    { recipient: males[0]._id, type: 'new_match', title: 'New Match Found! 💑', body: `${females[0].name} is a 94% match for you!` },
    { recipient: males[0]._id, type: 'request_accepted', title: 'Connection Accepted! 🎉', body: `${females[0].name} accepted your request. You can now chat!` },
    { recipient: males[0]._id, type: 'profile_view', title: 'Someone Viewed Your Profile 👀', body: '3 new people viewed your profile today.' },
    { recipient: males[1]._id, type: 'new_match', title: 'New Match Found! 💑', body: `${females[1].name} is a 96% match for you!` },
    { recipient: females[1]._id, type: 'verification_complete', title: 'Identity Verified! ✅', body: 'Your CNIC verification is complete. You now have a Verified badge.' },
  ];

  await Notification.insertMany(notifData.map((n, i) => ({ ...n, isRead: i > 3 })));
  console.log('🔔 Notifications seeded');

  // ── Summary ──
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DATABASE SEEDED SUCCESSFULLY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Test Credentials (password: Test@12345)\n');
  console.log('  👨 Male Users:');
  MALE_USERS.forEach(u => console.log(`     ${u.name.padEnd(16)} ${u.email}`));
  console.log('\n  👩 Female Users:');
  FEMALE_USERS.forEach(u => console.log(`     ${u.name.padEnd(16)} ${u.email}`));
  console.log(`\n  👑 Admin: ${process.env.ADMIN_EMAIL || 'admin@rishtaai.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seedDB().catch(err => {
  console.error('❌ Seeder error:', err.message);
  process.exit(1);
});
