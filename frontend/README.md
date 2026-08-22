# 💍 Rishtaai — AI-Powered Matchmaking Platform

> *Where tradition meets technology. Rishtaai uses cutting-edge AI to help you find a life partner with verified identities, intelligent compatibility matching, and meaningful connections.*

---

## 📌 Project Overview

**Rishtaai** is a modern, AI-driven matrimonial matchmaking platform designed for South Asian communities. It combines traditional rishta (match) culture with advanced artificial intelligence to create safer, smarter, and more meaningful connections. Every profile is identity-verified, every match is intelligently curated, and every conversation is intentional.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| UI Components | Radix UI + MUI (Material UI) |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Form Handling | React Hook Form |
| Routing | React Router v7 |
| Charts / Analytics | Recharts |
| Backend (Planned) | Node.js / Python FastAPI |
| AI Services (Planned) | OpenAI / Google Gemini API |
| Identity Verification (Planned) | NADRA CNIC OCR / Face Match API |
| Social Integration (Planned) | OAuth 2.0 (Instagram, Facebook) |
| Database (Planned) | PostgreSQL + Firebase (real-time chat) |

---

## 🛠️ Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🔑 Core Features to Be Implemented

---

### 1. 👤 User Registration & Profile Creation

**Description:**
Every new user must complete a structured onboarding form that creates their full matrimonial profile.

**Fields to Collect:**
- Full name, date of birth, gender
- City / Country of residence
- Education & profession
- Family background (parents, siblings, family type)
- Religious practice level
- Physical attributes (height, complexion)
- Marital history (never married / divorced / widowed)
- Hobbies, interests, languages spoken
- Partner preferences (age range, education, city, etc.)
- Profile photo upload

**Flow:**
1. User opens the app → lands on onboarding screen
2. Fills multi-step form (step-by-step, not all at once)
3. Uploads profile photo
4. Submits for **CNIC verification** (see Feature 2)
5. Profile goes live after successful verification

---

### 2. 🪪 CNIC-Based Identity Verification (Face Match)

**Description:**
To ensure authenticity and protect users from fake profiles, every user must verify their identity using their **CNIC (Computerized National Identity Card)**. The system will compare the CNIC photo with the uploaded profile picture using AI face-matching.

**How It Works:**
1. User uploads a photo of their CNIC (front side)
2. System extracts the face from the CNIC using **OCR + Face Detection**
3. AI face-matching algorithm compares CNIC face to the uploaded profile picture
4. If faces match with sufficient confidence → ✅ Profile is verified
5. If they do not match → ❌ User is asked to re-upload or provide a clearer photo
6. Verified profiles display a **"Verified ✅"** badge

**Technologies to Use:**
- Face recognition: `DeepFace`, `AWS Rekognition`, or `Azure Face API`
- OCR for CNIC text extraction: `Tesseract OCR` or `Google Vision API`
- CNIC data stored securely and encrypted; never shown to other users

**Privacy Rule:**
> CNIC data is used **only** for one-time verification and is never shared with other users or displayed on the platform.

---

### 3. 🔍 AI-Powered Match Discovery

**Description:**
Once a profile is live, the platform automatically discovers and displays compatible matches for the user based on their preferences and AI analysis.

**How Matches Are Found:**
- User's preferences (age, city, education, profession, religion, etc.) are used as a base filter
- AI then ranks remaining profiles by deeper compatibility indicators
- Interests, hobbies, lifestyle choices, and social behavior are factored in
- Matches are shown in a curated feed (not random)

**Display:**
- Each match card shows: name, age, city, profession, education, compatibility percentage
- Swipe or scroll-based browsing interface
- "Why this match?" button that explains AI reasoning

---

### 4. 📨 Connection Request System (Request → Accept → Chat)

**Description:**
Users cannot chat freely. A structured request-accept flow keeps all communication intentional and respectful.

**Flow:**
1. User A browses profiles and finds an interesting match
2. User A sends a **Connection Request** to User B
3. User B receives a notification and can **Accept** or **Decline**
4. **Only after acceptance** → Both users can access the chat interface
5. Either party can unmatch at any time, which removes chat access

**Chat Features (Post-Accept):**
- Text messaging
- Voice notes (optional)
- Emoji reactions
- Message seen receipts
- Report / block functionality

**Rules:**
- Users cannot send unsolicited messages
- Spam or repeated declined requests result in account warnings

---

### 5. 📱 Social Media Integration for Behavioral Analysis

**Description:**
With the user's explicit permission, Rishtaai will request access to their connected social media accounts (e.g., Instagram, Facebook) to better understand their lifestyle, personality, and interests — enabling more accurate AI matching.

**How It Works:**
1. During onboarding, user is given the option to **"Connect Social Accounts"** (optional but recommended)
2. App requests read-only OAuth access (no posting on their behalf)
3. AI analyzes:
   - Types of content liked/shared (travel, food, fashion, religion, sports, etc.)
   - Interests inferred from followed accounts
   - General activity patterns (active times, frequency)
4. This data is used **only** to improve match suggestions — never stored permanently or shown to others

**Supported Platforms (Planned):**
- Instagram (Meta Graph API)
- Facebook (Meta Graph API)
- Twitter/X (optional)

**Privacy Controls:**
- Users can disconnect social accounts at any time
- All inferred data can be deleted on request
- Clear in-app explanation of what data is used and why

---

### 6. 🤖 AI Compatibility Report & Prediction Engine

**Description:**
For every match shown to a user, the AI generates a detailed **Compatibility Report** that goes beyond surface-level preferences. It predicts how well two people can live together, what challenges they may face, and what strengths they share.

**Report Includes:**

| Section | Details |
|---|---|
| 💯 Compatibility Score | Overall percentage score (e.g., 87% compatible) |
| 💪 Shared Strengths | Common values, interests, goals |
| ⚠️ Potential Challenges | Personality clashes, lifestyle differences, communication styles |
| 🏠 Long-term Compatibility | How well they can build a life together |
| 🗣️ Communication Style | Are they both introverts/extroverts? Direct/indirect communicators? |
| 🕌 Religious Alignment | Similarity in religious practice and values |
| 👨‍👩‍👧 Family Compatibility | Whether family backgrounds and expectations align |
| 📈 Growth Potential | Will this relationship help both people grow? |

**AI Model Inputs:**
- Profile data (age, education, profession, religion, hobbies)
- Social media behavioral signals (if connected)
- Preference answers from onboarding questionnaire
- Historical matching patterns (platform-wide anonymized data)

**Output Format:**
- Visual gauge/chart showing compatibility score
- Short paragraph explanations for each section
- Color-coded indicators (green = strength, yellow = caution, red = challenge)

---

## 🗺️ Application Flow (End-to-End)

```
[User Opens App]
       ↓
[Sign Up / Login]
       ↓
[Multi-Step Profile Form]
       ↓
[Upload Profile Photo]
       ↓
[CNIC Upload → Face Match Verification]
       ↓
[Profile Created & Verified ✅]
       ↓
[Connect Social Media (Optional)]
       ↓
[AI Analyzes Data → Generates Match Pool]
       ↓
[User Browses Curated Match Feed]
       ↓
[Sends Connection Request to a Profile]
       ↓
[Other User Accepts Request]
       ↓
[Chat Unlocked 💬]
       ↓
[AI Compatibility Report Available for Both]
```

---

## 🔐 Privacy & Security Principles

- All CNIC data is **end-to-end encrypted** and used only for one-time verification
- Social media access is **read-only** and can be revoked anytime
- AI predictions are generated from **anonymized, aggregated data** — not sold or shared
- Users can **delete their account and all data** at any time
- Platform complies with **PDPA (Pakistan's Personal Data Protection Act)** guidelines

---

## 📂 Project Structure

```
Rishtaai/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and backend service calls
│   ├── store/             # State management
│   ├── utils/             # Helper functions
│   └── assets/            # Images, icons, fonts
├── guidelines/
│   └── Guidelines.md      # AI coding guidelines
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🗓️ Planned Development Phases

### Phase 1 — Foundation (Current)
- [x] Project setup (React + Vite + Tailwind)
- [ ] UI Design system & component library
- [ ] Onboarding & profile creation form
- [ ] Authentication (Sign Up / Login / OTP)

### Phase 2 — Verification & Profiles
- [ ] CNIC upload & OCR extraction
- [ ] Face comparison & verification badge
- [ ] Profile view pages
- [ ] Profile editing

### Phase 3 — Matchmaking Engine
- [ ] Preference-based filtering
- [ ] AI match ranking algorithm
- [ ] Match feed UI (with cards)
- [ ] "Why this match?" explanation feature

### Phase 4 — Connections & Chat
- [ ] Connection request system
- [ ] Accept / Decline flow
- [ ] Real-time chat (Firebase / WebSockets)
- [ ] Notifications (push + in-app)

### Phase 5 — Social Integration & AI Reports
- [ ] OAuth integration (Instagram, Facebook)
- [ ] Behavioral data analysis pipeline
- [ ] AI Compatibility Report generation
- [ ] Compatibility dashboard UI

### Phase 6 — Polish & Launch
- [ ] Admin panel (profile moderation)
- [ ] Reporting & blocking system
- [ ] Performance optimization
- [ ] App Store / Play Store deployment

---

## 🤝 Contributing

This project is currently in active development. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: your feature description'`
4. Push to branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is proprietary. All rights reserved © 2026 Rishtaai.

---

> *"The right match isn't found by chance — it's found by intelligence."*
> — **Rishtaai**