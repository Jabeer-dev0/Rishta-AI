# Rishtaai API — Testing Workflow

## Prerequisites

| Requirement | Value |
|---|---|
| Backend URL | `http://localhost:5000` |
| MongoDB | Running locally (`mongodb://localhost:27017/rishtaai`) |
| Postman | v10+ or [web.postman.co](https://web.postman.co) |
| Collection File | `Rishtaai_API.postman_collection.json` (in project root) |

---

## Step 1 — Import the Collection

1. Open Postman → **Import** → drag `Rishtaai_API.postman_collection.json`
2. The collection auto-sets **Collection Variables**:
   - `BASE_URL` → `http://localhost:5000`
   - `TOKEN`, `USER_ID`, `TARGET_USER_ID`, `REQUEST_ID`, `CONVERSATION_ID`, `MATCH_ID` — auto-populated by test scripts

> [!TIP]
> The **Register** and **Login** requests auto-save your JWT token to `{{TOKEN}}`. Every subsequent request uses it automatically.

---

## Step 2 — Start the Backend

```powershell
cd d:\innovate\Rishtaai\backend
npm run dev
# Expected: 💍 Rishtaai Backend running on http://localhost:5000
#           ✅ MongoDB Connected: localhost
```

Verify the health check first:
```
GET http://localhost:5000/health
→ {"success":true,"message":"Rishtaai API is running 💍"}
```

---

## Module Testing Order

> [!IMPORTANT]
> **Always test in this order** — later modules depend on IDs from earlier ones.

---

## Module 1 — 🔐 Auth

### Goal: Create two users (User A = male, User B = female) so matching works

**Step 1.1** — Run **Register** for User A (male, saved as main session user)
```json
{ "name": "Ahmed Raza", "gender": "Male", "age": 28, "email": "ahmed@test.com", "password": "Test@12345", ... }
```
✅ Expected: `201 Created` — token auto-saved to `{{TOKEN}}`, user ID to `{{USER_ID}}`

**Step 1.2** — Open a second Postman tab (or use a different environment), register User B
```json
{ "name": "Zara Malik", "gender": "Female", "age": 25, "email": "zara@test.com", "password": "Test@12345", ... }
```
Copy User B's `_id` → paste into `{{TARGET_USER_ID}}` collection variable manually.

**Step 1.3** — Run **Login** → confirms token works

**Step 1.4** — Run **Get Me** → confirms JWT middleware works
```
→ 200 OK with your user object
```

---

## Module 2 — 👤 Profile

**Step 2.1** — **Get My Profile** → baseline check
**Step 2.2** — **Update My Profile** → change city, interests
```json
{ "city": "Islamabad", "bio": "Looking for a sincere partner." }
→ 200 OK with updated user
```
**Step 2.3** — **Update Partner Preferences**
```json
{ "ageRange": { "min": 22, "max": 32 }, "cities": ["Lahore"], "religions": ["Islam"] }
```
**Step 2.4** — **Get My Stats** → checks profile views, match count
**Step 2.5** — **Get Another User's Profile** → uses `{{TARGET_USER_ID}}`

> [!NOTE]
> `profileCompletion` auto-recalculates on every profile update based on filled fields.

---

## Module 3 — 🤖 AI Matches

**Step 3.1** — **Get My AI Matches**
- First call triggers `generateMatchPool()` if no matches exist
- Returns scored list of compatible users
- Auto-saves first match's `_id` → `{{MATCH_ID}}` and matched user's `_id` → `{{TARGET_USER_ID}}`

```
→ 200 OK { matches: [ { compatibilityScore: 87, matchedUser: {...} } ] }
```

**Step 3.2** — **Explore Profiles** (used by the Explore page)
```
GET /api/matches/explore?page=1&limit=12&city=Lahore&minAge=22&maxAge=35
→ paginated profiles with gender-opposite filter applied
```

**Step 3.3** — **Get Single Match Detail** → full match with `aiInsights`

**Step 3.4** — **Regenerate Matches** → forces fresh scoring (useful after personality test)

---

## Module 4 — ✨ AI Compatibility Report

> [!NOTE]
> This requires `GEMINI_API_KEY` set in `.env`. Without it, the service will throw an error.

**Step 4.1** — **Generate Compatibility Report**
```json
{ "targetUserId": "{{TARGET_USER_ID}}" }
→ { compatibilityScore: 89, personalityMatch: 91, strengths: [...], report: "..." }
```

**Step 4.2** — **Get Cached Report** (uses `{{MATCH_ID}}`)
```
→ returns previously generated report without re-calling Gemini
```

---

## Module 5 — 💌 Connections (Request → Accept → Chat)

This is the **core flow** — follow steps in exact order.

**Step 5.1 — User A sends a request to User B**
```
POST /api/connections/send/{{TARGET_USER_ID}}
Body: { "message": "Assalam o Alaikum!" }
→ 201 Created — REQUEST_ID auto-saved
```
A notification is created for User B + Socket.io event fired.

**Step 5.2 — Check sent requests**
```
GET /api/connections/sent
→ shows pending request with status: "pending"
```

**Step 5.3 — Login as User B** (in a second Postman tab, login with zara@test.com)
Copy User B's token.

**Step 5.4 — User B checks received requests**
```
GET /api/connections/received (with User B's token)
→ shows the request from Ahmed
```

**Step 5.5 — User B accepts the request**
```
POST /api/connections/accept/{{REQUEST_ID}} (User B's token)
→ 200 OK — Conversation created, CONVERSATION_ID auto-saved
→ Socket.io "connection:accepted" event fires to both users
```

**Step 5.6 — Try sending duplicate request** → should return `409 Conflict`

---

## Module 6 — 💬 Chat

> [!IMPORTANT]
> Chat only works **after** a connection request is accepted (Step 5.5).

**Step 6.1** — **Get All Conversations**
```
GET /api/chat/conversations
→ shows conversation with User B, unread count, last message
```

**Step 6.2** — **Get Messages** (starts empty)
```
GET /api/chat/conversations/{{CONVERSATION_ID}}/messages?page=1&limit=30
→ { messages: [], pagination: { total: 0 } }
```

**Step 6.3 — Test real-time messaging with Socket.io**

Open browser console or use [socketio-client-tool](https://amritb.github.io/socketio-client-tool/):
```js
const socket = io('http://localhost:5000', { auth: { token: 'Bearer YOUR_TOKEN' } });

// Join the conversation room
socket.emit('chat:join', { conversationId: '{{CONVERSATION_ID}}' });

// Send a message
socket.emit('chat:send-message', {
  conversationId: '{{CONVERSATION_ID}}',
  text: 'Assalam o Alaikum! Great to connect.',
  mediaType: 'text'
});

// Listen for new messages
socket.on('chat:new-message', (msg) => console.log('New message:', msg));

// Typing indicator
socket.emit('chat:typing', { conversationId: '{{CONVERSATION_ID}}', isTyping: true });
```

**Step 6.4** — **Mark as Read** → resets unread count to 0

---

## Module 7 — 🧠 Personality Test

**Step 7.1** — **Get Questions** → 10 Big Five questions
**Step 7.2** — **Submit Answers** (scores 1–5 for each)
```json
{ "answers": [ {"questionId":1,"score":4}, {"questionId":2,"score":5}, ... ] }
→ { scores: { extraversion:80, conscientiousness:100, ... }, personalityType: "The Planner" }
```
After submission: `profileCompletion` increases by 15%, match pool is regenerated.

**Step 7.3** — **Get My Result** → retrieve stored personality profile

---

## Module 8 — 📱 Social Media

> [!NOTE]
> OAuth requires real app credentials in `.env`. For testing, use the **Analyze** endpoint directly after manually setting `socialMediaConnected.instagram: true` in MongoDB.

**Step 8.1** — **Get OAuth URL** → copy the URL, open in browser to complete OAuth flow
**Step 8.2** — **Analyze Platform** (manual trigger — works if platform is connected)
```json
{ "platform": "instagram" }
→ { detectedInterests: ["Travel","Food"], lifestyleScore: 8.4, matchImprovement: 23 }
```
**Step 8.3** — **Get Social Insights** → combined view of all platforms
**Step 8.4** — **Disconnect Platform**

**Testing without OAuth** — directly update MongoDB:
```js
db.users.updateOne({ email: "ahmed@test.com" }, {
  $set: { "socialMediaConnected.instagram": true }
})
```
Then hit **Analyze Platform**.

---

## Module 9 — 🔔 Notifications

Notifications are created automatically by connection/match/verification events.

**Step 9.1** — **Get Unread Count** (should be > 0 after connection events)
**Step 9.2** — **Get All Notifications** → list of notification objects
**Step 9.3** — **Mark All Read** → resets all to `isRead: true`

**Real-time notifications via Socket.io:**
```js
socket.on('notification:new', (notif) => {
  console.log('🔔 New notification:', notif.title, notif.body);
});
```

---

## Module 10 — 🚨 Reports & Block

**Step 10.1** — **Report a User**
```json
{ "reportedUserId": "{{TARGET_USER_ID}}", "reason": "fake_profile", "description": "..." }
→ 201 Created
```
**Step 10.2** — **Block a User** → adds to blocked list, excluded from future matches
**Step 10.3** — **Get Blocked Users**
**Step 10.4** — **Unblock a User**

---

## Module 11 — 🪪 CNIC Verification

**Step 11.1** — **Upload CNIC** (form-data with `cnic` file field)
```
POST /api/verify/upload-cnic  (multipart/form-data)
→ { url: "cloudinary_url" }
```
**Step 11.2** — **Upload Selfie** (form-data with `selfie` file field)

**Step 11.3** — **Run Verification**
```
→ { verified: true/false, similarity: 0.94, distance: 0.12 }
```
- If `verified: true` → user gets `verified: true` badge + notification + `profileCompletion += 15`
- If `verified: false` → `verificationStatus: "rejected"`

**Step 11.4** — **Get Status**
```
→ { verified: true, status: "verified" }
```

> [!NOTE]
> Face matching uses `faceMatch.service.js`. Cloudinary credentials must be configured in `.env` for file uploads to work.

---

## Module 12 — 🛡️ Admin

> [!IMPORTANT]
> Admin endpoints require `role: "admin"` in the user document. Set it manually in MongoDB:
> ```js
> db.users.updateOne({ email: "ahmed@test.com" }, { $set: { role: "admin" } })
> ```
> Then login again to get a fresh token.

**Step 12.1** — **Get Platform Stats**
```
→ { totalUsers: 2, verifiedUsers: 1, totalMatches: 4, openReports: 1 }
```
**Step 12.2** — **List All Users** (with search/filter query params)
**Step 12.3** — **Get Open Reports**
**Step 12.4** — **Manually Verify User CNIC** → bypasses AI face-match
**Step 12.5** — **Block/Unblock User**

---

## Frontend Integration Guide

Once all modules are verified in Postman, connect the frontend:

### 1. Create an API service layer

```ts
// frontend/src/app/services/api.ts
const BASE = 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const api = {
  auth: {
    login: (data) => fetch(`${BASE}/auth/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }),
    register: (data) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }),
    me: () => fetch(`${BASE}/auth/me`, { headers: authHeaders() }),
  },
  matches: {
    getAIMatches: () => fetch(`${BASE}/matches`, { headers: authHeaders() }),
    explore: (params) => fetch(`${BASE}/matches/explore?${new URLSearchParams(params)}`, { headers: authHeaders() }),
  },
  connections: {
    send: (userId, msg) => fetch(`${BASE}/connections/send/${userId}`, { method:'POST', headers: authHeaders(), body: JSON.stringify({ message: msg }) }),
    accept: (requestId) => fetch(`${BASE}/connections/accept/${requestId}`, { method: 'POST', headers: authHeaders() }),
    received: () => fetch(`${BASE}/connections/received`, { headers: authHeaders() }),
  },
  chat: {
    conversations: () => fetch(`${BASE}/chat/conversations`, { headers: authHeaders() }),
    messages: (convId, page=1) => fetch(`${BASE}/chat/conversations/${convId}/messages?page=${page}`, { headers: authHeaders() }),
  },
};
```

### 2. Replace AuthContext mock with real API calls

```ts
// In AuthContext.tsx — replace the mock login:
const login = async (email, password) => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.accessToken);
    setUser(data.data.user);
    navigate('/app');
  }
};
```

### 3. Socket.io connection in frontend

```ts
// frontend/src/app/services/socket.ts
import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000', {
  auth: { token: `Bearer ${localStorage.getItem('token')}` },
  autoConnect: false,
});

// Call socket.connect() after login
// Listen for events in MessagesPage, DashboardLayout etc.
```

Install socket.io-client in frontend:
```powershell
cd d:\innovate\Rishtaai\frontend
npm install socket.io-client
```

---

## Error Reference

| HTTP Code | Meaning | Fix |
|---|---|---|
| `401 Unauthorized` | Missing/expired token | Re-login, update `{{TOKEN}}` |
| `403 Forbidden` | Not admin | Set `role: "admin"` in MongoDB |
| `404 Not Found` | Wrong ID in variable | Re-run the source request to capture ID |
| `409 Conflict` | Duplicate request | Already sent/registered |
| `500 Internal` | Server crash | Check backend terminal for stack trace |
