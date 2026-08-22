# 💍 Rishtaai — Backend Architecture & Implementation Guide

> *Express.js + MongoDB (Mongoose) backend powering the AI-driven matrimonial matchmaking platform.*

---

## 📌 Overview

This document describes the complete backend to be built for the Rishtaai frontend. The backend must serve:

- **Authentication** (multi-step signup, login, JWT)
- **User profiles** with all matrimonial fields
- **CNIC identity verification** (AI face-matching)
- **AI matchmaking engine** (scoring, compatibility report)
- **Real-time chat** (Socket.io, request → accept → chat flow)
- **Personality test** results storage & match weighting
- **Social media integration** (OAuth, behavioral analysis)
- **Notifications** system (in-app + push)
- **Admin / moderation** panel APIs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MongoDB Atlas |
| ORM / ODM | Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| File Storage | Cloudinary |
| AI / LLM | Google Gemini API |
| Face Matching | face-api.js (local, free) / DeepFace (Python sidecar) |
| OCR | Tesseract.js / Google Vision API |
| Social OAuth | Instagram Graph API, Facebook Graph API, Twitter OAuth 2.0 |
| Email | Nodemailer / SendGrid |
| Validation | Joi / express-validator |
| Rate Limiting | express-rate-limit |
| Env Config | dotenv |

---

## 📁 Project Structure

```
backend/
├── server.js                    # Entry point — HTTP + Socket.io server
├── .env.example                 # Environment variable template
├── package.json
└── src/
    ├── config/
    │   ├── db.js                # MongoDB connection (Mongoose)
    │   ├── cloudinary.js        # Cloudinary config for photo uploads
    │   └── socket.js            # Socket.io setup & event registration
    │
    ├── models/
    │   ├── User.model.js        # Core user + profile schema
    │   ├── Match.model.js       # AI match records
    │   ├── ConnectionRequest.model.js   # Rishta (connection) request
    │   ├── Conversation.model.js        # Chat rooms
    │   ├── Message.model.js     # Individual messages
    │   ├── Notification.model.js
    │   ├── PersonalityResult.model.js
    │   ├── Report.model.js      # User reports / complaints
    │   └── Admin.model.js       # Admin/moderator accounts
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── profile.routes.js
    │   ├── match.routes.js
    │   ├── connection.routes.js
    │   ├── chat.routes.js
    │   ├── personality.routes.js
    │   ├── socialMedia.routes.js
    │   ├── notification.routes.js
    │   ├── report.routes.js
    │   └── admin.routes.js
    │
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── profile.controller.js
    │   ├── match.controller.js
    │   ├── connection.controller.js
    │   ├── chat.controller.js
    │   ├── personality.controller.js
    │   ├── socialMedia.controller.js
    │   ├── notification.controller.js
    │   ├── report.controller.js
    │   └── admin.controller.js
    │
    ├── middleware/
    │   ├── auth.middleware.js    # JWT verification
    │   ├── upload.middleware.js  # Multer + Cloudinary
    │   ├── validate.middleware.js
    │   ├── rateLimiter.middleware.js
    │   └── adminOnly.middleware.js
    │
    ├── services/
    │   ├── ai.service.js         # Gemini API: compatibility report generation
    │   ├── faceMatch.service.js  # AWS Rekognition face comparison
    │   ├── ocr.service.js        # CNIC OCR extraction
    │   ├── matchEngine.service.js  # Scoring + ranking algorithm
    │   ├── socialAnalysis.service.js # Social media data pipeline
    │   ├── notification.service.js
    │   └── email.service.js
    │
    └── utils/
        ├── jwt.utils.js
        ├── password.utils.js
        └── response.utils.js        # Standardized API response helpers
```

---

## 🗃️ Data Models (Mongoose Schemas)

### 1. `User` Model

Maps directly to the frontend signup form fields (4-step) and profile page.

```js
{
  // Auth
  email:            { type: String, required, unique },
  password:         { type: String, required },              // bcrypt hashed

  // Step 1 — Basic Info
  name:             { type: String, required },
  age:              { type: Number, required, min: 18 },
  gender:           { type: String, enum: ['Male', 'Female'], required },
  religion:         { type: String, required },
  city:             { type: String, required },
  country:          { type: String, default: 'Pakistan' },

  // Step 2 — Professional Background
  education:        { type: String, required },
  profession:       { type: String, required },
  interests:        [String],
  familyBackground: { type: String },
  bio:              { type: String },

  // Profile Photos (Cloudinary URLs)
  photos:           [String],
  profilePhoto:     { type: String },

  // CNIC Verification
  verified:         { type: Boolean, default: false },
  cnicImageUrl:     { type: String },                        // Encrypted, never exposed to other users
  selfieImageUrl:   { type: String },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },

  // Partner Preferences
  partnerPreferences: {
    ageRange:    { min: Number, max: Number },
    cities:      [String],
    education:   [String],
    religions:   [String],
    professions: [String],
  },

  // Personality Test Results
  personalityScores: {
    extraversion:        Number,    // 0-100
    conscientiousness:   Number,
    agreeableness:       Number,
    openness:            Number,
    emotionalStability:  Number,
    personalityType:     String,   // 'The Socialite', 'The Planner', etc.
  },

  // Social Media Connections
  socialMediaConnected: {
    instagram: { type: Boolean, default: false },
    facebook:  { type: Boolean, default: false },
    twitter:   { type: Boolean, default: false },
  },
  socialInsights: {
    detectedInterests:    [String],
    lifestyleScore:       Number,
    matchImprovement:     Number,
    dataPoints:           Number,
  },

  // Dashboard Stats (computed or cached)
  profileViews:        { type: Number, default: 0 },
  profileCompletion:   { type: Number, default: 40 },   // percentage
  aiScore:             { type: Number },

  // Account Status
  isActive:     { type: Boolean, default: true },
  isBlocked:    { type: Boolean, default: false },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },

  // Notification Preferences
  notificationPrefs: {
    matches:   { type: Boolean, default: true },
    messages:  { type: Boolean, default: true },
    requests:  { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },

  lastActiveAt:   { type: Date, default: Date.now },
  createdAt:      { type: Date, default: Date.now },
}
```

---

### 2. `Match` Model

Stores AI-generated compatibility matches per user pair.

```js
{
  user:            { type: ObjectId, ref: 'User', required },
  matchedUser:     { type: ObjectId, ref: 'User', required },

  compatibilityScore:   { type: Number },           // Overall % (0-100)

  aiInsights: {
    personalityMatch:         Number,               // %
    lifestyleCompatibility:   Number,
    emotionalCompatibility:   Number,
    longTermStability:        Number,
    strengths:                [String],             // ["Both value education", ...]
    potentialHurdles:         [String],
  },

  matchReasons:   [String],                         // ["Shared interests in travel", ...]
  report:         { type: String },                 // Full AI-generated Compatibility Report text

  isActive:     { type: Boolean, default: true },
  generatedAt:  { type: Date, default: Date.now },
  expiresAt:    { type: Date },                     // Re-run daily
}
```

---

### 3. `ConnectionRequest` Model

Controls the "Request → Accept → Chat Unlock" flow shown in the Messages page.

```js
{
  fromUser:   { type: ObjectId, ref: 'User', required },
  toUser:     { type: ObjectId, ref: 'User', required },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },

  message:    { type: String },                     // Optional intro message
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date },
}
```

---

### 4. `Conversation` Model

Created **only** after a connection request is accepted.

```js
{
  participants:   [{ type: ObjectId, ref: 'User' }],   // exactly 2 users
  connectionRequest: { type: ObjectId, ref: 'ConnectionRequest' },

  lastMessage:     { type: String },
  lastMessageTime: { type: Date },
  lastMessageBy:   { type: ObjectId, ref: 'User' },

  unreadCount: {
    type: Map,
    of: Number,
    default: {},                                        // { userId: count }
  },

  isActive:    { type: Boolean, default: true },        // false = unmatched
  createdAt:   { type: Date, default: Date.now },
}
```

---

### 5. `Message` Model

```js
{
  conversation:   { type: ObjectId, ref: 'Conversation', required },
  sender:         { type: ObjectId, ref: 'User', required },

  text:           { type: String },
  mediaUrl:       { type: String },                     // Voice note / image
  mediaType:      { type: String, enum: ['text', 'image', 'voice'] },

  seenBy:         [{ type: ObjectId, ref: 'User' }],
  deliveredTo:    [{ type: ObjectId, ref: 'User' }],

  isDeleted:      { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
}
```

---

### 6. `Notification` Model

```js
{
  recipient:  { type: ObjectId, ref: 'User', required },
  type: {
    type: String,
    enum: ['new_match', 'connection_request', 'request_accepted', 'new_message', 'profile_view', 'verification_complete'],
  },
  title:       String,
  body:        String,
  data:        { type: Map, of: String },
  isRead:      { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
}
```

---

### 7. `PersonalityResult` Model

```js
{
  user:    { type: ObjectId, ref: 'User', required, unique },
  answers: [{ questionId: Number, score: Number }],
  scores: {
    extraversion:       Number,
    conscientiousness:  Number,
    agreeableness:      Number,
    openness:           Number,
    emotionalStability: Number,
  },
  personalityType:  String,
  completedAt:      { type: Date, default: Date.now },
}
```

---

### 8. `Report` Model

```js
{
  reportedBy:  { type: ObjectId, ref: 'User', required },
  reportedUser:{ type: ObjectId, ref: 'User', required },
  reason:      { type: String, enum: ['spam', 'fake_profile', 'harassment', 'inappropriate_content', 'other'] },
  description: String,
  status:      { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
  createdAt:   { type: Date, default: Date.now },
}
```

---

## 🔌 API Endpoints

### 🔐 Auth Routes — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Multi-step user registration (steps 1-3 data) |
| POST | `/login` | Email + password login, returns JWT |
| POST | `/logout` | Invalidate token / clear cookie |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset password with token |
| GET | `/me` | Get current authenticated user |
| POST | `/refresh-token` | Refresh JWT access token |

**Registration Payload (from SignupPage steps 1-3):**
```json
{
  "name": "Zara Ahmed",
  "age": 26,
  "gender": "Female",
  "religion": "Islam",
  "city": "Lahore",
  "education": "Masters in Business",
  "profession": "Software Engineer",
  "interests": ["Reading", "Travel", "Cooking"],
  "familyBackground": "We are a close-knit family...",
  "email": "zara@example.com",
  "password": "SecurePass123!"
}
```

---

### 🪪 CNIC Verification Routes — `/api/verify`

Implements the identity verification flow from Step 4 of SignupPage and SettingsPage.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-cnic` | Upload CNIC image (Multer → Cloudinary) |
| POST | `/upload-selfie` | Upload selfie image (Multer → Cloudinary) |
| POST | `/run-verification` | Trigger AI face-match comparison |
| GET | `/status` | Get current verification status |

**`POST /run-verification` Flow (`faceMatch.service.js`):**
1. Download CNIC and selfie images from Cloudinary
2. Run **face-api.js** (local Node.js, no API cost):
   - Load pre-trained models (SSD MobileNet + FaceNet)
   - Extract 128-dim face descriptors from both images
   - Compute Euclidean distance between descriptors
3. If `distance < 0.6` (i.e. `similarity >= 80%`) → `verified: true`, `verificationStatus: 'verified'`
4. Update `profileCompletion += 15`
5. Send in-app notification: "Identity Verified!"
6. Return `{ verified, similarity, distance }` to client

> **Fallback:** If `face-api.js` detects no face (blurry CNIC), optionally escalate to a **DeepFace Python sidecar** (ArcFace model) via internal HTTP call for higher accuracy.

---

### 👤 Profile Routes — `/api/profile`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Get own full profile |
| PUT | `/me` | Update own profile (EditProfilePage) |
| GET | `/:userId` | View another user's public profile |
| POST | `/me/photo` | Upload/update profile photo |
| DELETE | `/me/photo/:index` | Remove a photo |
| PUT | `/me/preferences` | Update partner preferences |
| GET | `/me/stats` | Get dashboard stats (views, connections, AI score) |
| PUT | `/me/notifications` | Update notification preferences (SettingsPage) |
| DELETE | `/me` | Delete account and all data |

**Profile completion calculation:**
- Basic info filled: +40%
- Professional info filled: +20%
- CNIC verified: +15%
- Personality test done: +15%
- Social media connected: +10%

---

### 🤖 AI Match Routes — `/api/matches`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get AI-curated matches for current user |
| GET | `/:matchId` | Get a specific match with full AI report |
| POST | `/regenerate` | Request fresh match pool regeneration |
| GET | `/explore` | Paginated profile browsing (ExplorePage) with filters |

**Query Parameters for `/explore`:**
```
?search=doctor
&city=Lahore
&minAge=25&maxAge=35
&education=Masters
&religion=Islam
&page=1&limit=12
```

**Match Engine Algorithm (`matchEngine.service.js`):**

```
Step 1 — Hard Filters (must satisfy):
  - Opposite gender
  - Age within partner preference range
  - Not blocked / not self

Step 2 — AI Compatibility Scoring (weighted sum):
  - Personality compatibility (Big Five overlap)     25%
  - Shared interests (Jaccard similarity)            20%
  - Religion alignment                               15%
  - Education level match                            10%
  - City proximity                                   10%
  - Profession compatibility                         10%
  - Social behavioral similarity (if connected)      10%

Step 3 — Sort by score desc, return top N
```

---

### 🤖 AI Compatibility Report — `/api/ai`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/compatibility-report` | Generate full AI report between two users |
| GET | `/report/:matchId` | Retrieve cached AI report for a match |
| POST | `/why-this-match/:matchId` | "Why You Match" explanation |

**AI Report Generation via Google Gemini API:**

Prompt template sent to `gemini-1.5-flash`:
```
Generate a matrimonial compatibility report for:

Person A: {name, age, city, education, profession, religion, interests, personalityScores}
Person B: {name, age, city, education, profession, religion, interests, personalityScores}

Return as JSON with:
1. compatibilityScore (0-100)
2. personalityMatch %
3. lifestyleCompatibility %
4. emotionalCompatibility %
5. longTermStability %
6. strengths (array of 3-5 strings)
7. potentialHurdles (array of 2-3 strings)
8. matchReasons (array of 3-4 strings)
9. report (150-word narrative)
```

**Response shape:**
```json
{
  "compatibilityScore": 87,
  "personalityMatch": 91,
  "lifestyleCompatibility": 85,
  "emotionalCompatibility": 88,
  "longTermStability": 84,
  "strengths": [
    "Both deeply value family and traditional roots",
    "Shared passion for travel and new experiences"
  ],
  "potentialHurdles": [
    "Different cities may require relocation discussion"
  ],
  "matchReasons": [
    "Both are practicing Muslims with strong religious values",
    "Overlapping interests: Travel, Reading, Cooking"
  ],
  "report": "Zara and Ahmed share exceptional alignment in core values..."
}
```

---

### 💬 Connection Request Routes — `/api/connections`

Implements the Request → Accept → Chat Unlock flow (MessagesPage).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/send/:targetUserId` | Send connection request |
| POST | `/accept/:requestId` | Accept → creates Conversation |
| POST | `/decline/:requestId` | Decline a request |
| POST | `/cancel/:requestId` | Cancel a sent request |
| GET | `/received` | Get all pending received requests |
| GET | `/sent` | Get all sent requests and statuses |
| POST | `/unmatch/:conversationId` | Unmatch and deactivate conversation |

**`POST /accept/:requestId` — Flow:**
1. Update `ConnectionRequest.status = 'accepted'`
2. Create a new `Conversation` with both user IDs
3. Emit Socket.io `connection:accepted` to both users
4. Create in-app notification for requester
5. Return conversation data

---

### 💬 Real-Time Chat — `/api/chat` + Socket.io

**REST endpoints (for loading message history):**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | Get all conversations for current user |
| GET | `/conversations/:id/messages` | Get paginated messages |
| POST | `/conversations/:id/read` | Mark all messages as read |
| GET | `/conversations/:id` | Get conversation metadata |

**Socket.io Events:**

```
Client → Server:
  'chat:join'              Join a conversation room
  'chat:send-message'      { conversationId, text, mediaType? }
  'chat:typing'            { conversationId, isTyping }
  'chat:read'              { conversationId }

Server → Client:
  'chat:new-message'       New Message document broadcast to room
  'chat:message-seen'      Seen receipts (WhatsApp-style ticks)
  'chat:typing'            Forward typing indicator to other user
  'chat:online-status'     { userId, isOnline }
  'connection:accepted'    Notify requester when request accepted
  'connection:new-request' Notify target of incoming request
  'notification:new'       Real-time in-app notifications
```

**Security rules:**
- Users can only join conversations they participate in
- Messages blocked if `conversation.isActive === false` (unmatched)
- Rate limit: 60 messages per minute per user

---

### 🧠 Personality Test Routes — `/api/personality`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/questions` | Get the full questionnaire (Big Five) |
| POST | `/submit` | Submit answers, calculate scores |
| GET | `/result` | Get current user's personality result |

**`POST /submit` — Processing:**
1. Receive `[{ questionId, score }]` answers
2. Group answers by Big Five category
3. Calculate normalized score per category (0-100%)
4. Determine dominant personality type label
5. Store `PersonalityResult` document
6. Update `User.personalityScores` and `profileCompletion += 15`
7. Trigger background re-ranking of match pool
8. Return personality type + scores

**Personality Types:**
| Category | Label |
|---|---|
| extraversion | The Socialite |
| conscientiousness | The Planner |
| agreeableness | The Harmonizer |
| openness | The Explorer |
| emotionalStability | The Rock |

---

### 📱 Social Media Integration — `/api/social`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/instagram/oauth-url` | Generate Instagram OAuth redirect URL |
| GET | `/instagram/callback` | Handle OAuth callback, store token |
| POST | `/instagram/analyze` | Run Instagram data through AI pipeline |
| GET | `/facebook/oauth-url` | Facebook OAuth URL |
| GET | `/facebook/callback` | Handle Facebook OAuth |
| POST | `/facebook/analyze` | Analyze Facebook data |
| GET | `/twitter/oauth-url` | Twitter OAuth 2.0 URL |
| GET | `/twitter/callback` | Twitter callback |
| POST | `/disconnect/:platform` | Disconnect a platform |
| GET | `/insights` | Get AI analysis results |

**Social Analysis Pipeline (`socialAnalysis.service.js`):**

```
1. Fetch user data via platform API (read-only OAuth token)
   - Instagram: liked posts, followed accounts, stories
   - Facebook: page likes, group memberships, public posts
   - Twitter: tweet topics, followed accounts, liked tweets

2. Send to Gemini API for NLP classification:
   - Classify into interest categories (travel, food, religion, sports, art...)
   - Score lifestyle patterns
   - Detect activity patterns

3. Store in User.socialInsights:
   - detectedInterests: ["Travel", "Food", "Photography"]
   - lifestyleScore: 8.4
   - matchImprovement: +23%
   - dataPoints: 340

4. Re-weight match scores to incorporate social signals
```

---

### 🔔 Notification Routes — `/api/notifications`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all notifications for current user |
| POST | `/:id/read` | Mark single notification as read |
| POST | `/read-all` | Mark all as read |
| DELETE | `/:id` | Delete a notification |
| GET | `/unread-count` | Get count of unread notifications |

**Notification triggers:**

| Event | Created For |
|---|---|
| New AI match generated | User |
| Connection request received | Target user |
| Connection request accepted | Requester |
| New message received | Recipient |
| Profile viewed | Profile owner |
| CNIC verification complete | User |
| Social media connected | User |

---

### 🚨 Report & Block Routes — `/api/reports`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Report a user |
| POST | `/block/:userId` | Block a user |
| DELETE | `/unblock/:userId` | Unblock a user |
| GET | `/blocked-users` | List blocked users |

---

### 🛡️ Admin Routes — `/api/admin`

Protected by `adminOnly` middleware.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users with filters + pagination |
| GET | `/users/:id` | Detailed user profile |
| PUT | `/users/:id/block` | Block user |
| PUT | `/users/:id/unblock` | Unblock user |
| PUT | `/users/:id/verify` | Manually verify CNIC |
| DELETE | `/users/:id` | Delete user account |
| GET | `/reports` | Get all pending reports |
| PUT | `/reports/:id/resolve` | Resolve a report |
| GET | `/stats` | Platform analytics (users, verifications, matches) |

---

## 🔒 Authentication & Security

### JWT Strategy

```
Access token:   JWT, 15 min expiry, sent in Authorization header
Refresh token:  JWT, 7 day expiry, stored in httpOnly secure cookie
```

### Password Security
- Hashed using `bcrypt` with salt rounds = 12
- Minimum 8 characters enforced

### Rate Limiting

| Scope | Limit |
|---|---|
| Global | 100 req / 15 min per IP |
| Auth endpoints | 10 req / 15 min per IP |
| Chat messages | 60 messages / 1 min per user |
| Report endpoint | 5 reports / 1 hour per user |

### CNIC Data Privacy
- CNIC and selfie images stored in a **private Cloudinary folder**
- Image URLs are **never** returned in responses visible to other users
- Images are processed server-side only; clients receive only `verificationStatus`

---

## ⚙️ Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI — Google Gemini
GEMINI_API_KEY=

# Face Matching — AWS Rekognition
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Social OAuth
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=

TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 🔄 End-to-End Application Flow

```
1.  POST /api/auth/register
        -> User created in MongoDB
        ↓
2.  POST /api/verify/upload-cnic
    POST /api/verify/upload-selfie
    POST /api/verify/run-verification
        -> AWS Rekognition face compare
        -> verified: true | verificationStatus: verified
        ↓
3.  Match engine runs (on profile completion / cron)
        -> Preference filters applied
        -> AI compatibility scores computed (matchEngine.service)
        -> Match documents saved
        ↓
4.  GET /api/matches
        -> Returns curated matches with compatibilityScore, aiInsights
        ↓
5.  POST /api/ai/compatibility-report
        -> Gemini generates detailed breakdown
        -> Stored in Match.report
        -> Displayed in AIMatchesPage modal
        ↓
6.  POST /api/personality/submit
        -> Big Five scores computed
        -> Match pool re-ranked
        ↓
7.  GET /api/social/instagram/oauth-url
        -> OAuth flow
        -> AI analyzes social data (socialAnalysis.service)
        -> Insights stored, match scores updated
        ↓
8.  POST /api/connections/send/:userId
        -> ConnectionRequest created
        -> Socket.io: 'connection:new-request' emitted to target
        -> Notification created
        ↓
9.  POST /api/connections/accept/:requestId
        -> ConnectionRequest.status = 'accepted'
        -> Conversation document created
        -> Socket.io: 'connection:accepted' emitted to both users
        -> Chat unlocked
        ↓
10. Socket.io 'chat:send-message'
        -> Message saved to DB
        -> Broadcast to conversation room
        -> Seen receipts via 'chat:message-seen'
        -> Unread count updated
```

---

## 📡 Real-time Architecture

```
Client (React + Socket.io client)
    ↕  WebSocket
Express Server (Socket.io attached to HTTP server)
    ↕
MongoDB (Message, Conversation, Notification collections)

Socket Rooms:
  user:{userId}     Personal channel — notifications, request events
  conv:{convId}     Conversation room — messages, typing, seen
```

---

## 🗓️ Implementation Phases

### Phase 1 — Foundation
- [ ] Express + Mongoose setup, MongoDB connection
- [ ] User model
- [ ] Auth routes (register, login, logout, JWT)
- [ ] Auth middleware

### Phase 2 — Profile & Verification
- [ ] Profile CRUD routes
- [ ] Cloudinary photo upload (Multer)
- [ ] CNIC + selfie upload endpoints
- [ ] AWS Rekognition face comparison service
- [ ] Verification status update + notification

### Phase 3 — AI Matchmaking
- [ ] Match engine (preference filters + scoring algorithm)
- [ ] Match model + match generation
- [ ] Explore API with pagination + filters
- [ ] Gemini compatibility report generation + caching

### Phase 4 — Personality Test
- [ ] Questions API
- [ ] Answer submission + Big Five scoring
- [ ] PersonalityResult model
- [ ] Match re-ranking on personality update

### Phase 5 — Chat System (Socket.io)
- [ ] Socket.io server setup
- [ ] Conversation model + creation on request accept
- [ ] Message model + send / receive events
- [ ] Seen receipts + typing indicators
- [ ] Online status tracking
- [ ] Message history REST API

### Phase 6 — Connections Flow
- [ ] ConnectionRequest model + CRUD
- [ ] Request → Accept → Conversation creation
- [ ] Decline / Cancel / Unmatch flows
- [ ] Real-time Socket.io events

### Phase 7 — Notifications
- [ ] Notification model
- [ ] Notification service (triggered from all system events)
- [ ] Real-time delivery via Socket.io
- [ ] REST CRUD for notification management

### Phase 8 — Social Media Integration
- [ ] Instagram OAuth flow
- [ ] Facebook OAuth flow
- [ ] Twitter OAuth 2.0 flow
- [ ] Social data analysis pipeline (Gemini NLP)
- [ ] Social insights storage + match weight update

### Phase 9 — Admin & Moderation
- [ ] Admin model + admin-only middleware
- [ ] User management (block, verify, delete)
- [ ] Report system
- [ ] Platform analytics API

### Phase 10 — Polish & Security
- [ ] Rate limiting on all routes
- [ ] Input validation (Joi schemas)
- [ ] CNIC data encryption layer
- [ ] Email service (password reset, welcome)
- [ ] API documentation (Swagger / Postman)
- [ ] Unit + integration tests

---

## 🌐 CORS Configuration

```js
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'https://rishtaai.com'],
  credentials: true,          // Required for httpOnly cookie (refresh token)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};
```

---

## 🧪 Testing Strategy

- **Unit tests**: Services (matchEngine, faceMatch, aiService)
- **Integration tests**: All REST routes with Supertest + Jest
- **Socket tests**: Socket.io client tests for real-time flows
- **Load testing**: Artillery for chat scalability

---

> *"The right match isn't found by chance — it's found by intelligence."*
> — **Rishtaai**
