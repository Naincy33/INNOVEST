# 🚀 Innovest – AI Powered Idea Investing App

Innovest is a modern mobile application where users can **share startup ideas, invest virtual coins, collaborate with teams, and track portfolio growth**.

The platform combines **innovation, social interaction, gamification, and investment simulation** to create an engaging ecosystem for aspiring entrepreneurs and investors.

---

# ✨ Features

## 💡 Idea Sharing
- Post startup ideas with:
  - Title
  - Category
  - Problem Statement
  - Solution
- AI-style prediction score & market demand indicators

## ❤️ Community Engagement
- Like ideas
- Comment on posts
- Trending badges for popular ideas
- Interactive social feed UI

## 💰 Virtual Investment System
- Invest virtual coins into ideas
- Portfolio earnings tracking
- ROI calculations
- Dynamic growth indicators

## 📊 Portfolio Analytics
- Investment trend graph
- Total invested amount
- Total earnings overview
- Smart investment insights

## 🤝 Team Collaboration
- Send team join requests
- Accept / reject requests
- Reward system with bonus coins

## 🏆 Leaderboard System
- Top investors ranking
- Most popular ideas
- Competitive engagement system

## 🔐 Authentication
- Firebase Email Authentication
- Email verification support
- Persistent login system

## 🎨 Modern UI/UX
- Soft pastel custom theme
- Animated floating navigation
- Responsive card-based layout
- Instagram-inspired interactions

---

# 🛠️ Tech Stack

## Frontend
- React Native
- Expo

## Backend & Database
- Firebase Authentication
- Cloud Firestore

## Libraries & Tools
- React Navigation
- React Native Chart Kit
- Expo Linear Gradient
- Expo Image Picker

---

# 📱 Screens

- 🏠 Home Feed
- ➕ Post Idea
- 💼 Portfolio
- 🏆 Leaderboard
- 👤 Profile
- 💬 Comments
- 🤝 Team Requests
- 🧠 Quiz Section

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Naincy33/innovest.git
cd innovest
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Start Development Server

```bash
npx expo start
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_api_key_here
```

⚠️ Never push `.env` files to GitHub.

---

# 🔥 Firebase Setup

1. Create a Firebase Project
2. Enable:
   - Authentication → Email/Password
   - Cloud Firestore
3. Add Firebase config inside `firebase.js`

Example:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};
```

---

# 📊 Firestore Collections

- users
- ideas
- comments
- investments
- teamRequests

---

# 🚀 Future Improvements

- 🔔 Push Notifications
- 🤖 AI-powered idea recommendations
- 👥 Real-time chat system
- 📈 Advanced analytics dashboard
- 🌎 Public investor profiles
- 🧵 Threaded comments & replies
- 🎯 Smart recommendation engine

---




GitHub:
https://github.com/Naincy33

---

# 📜 License

This project is licensed under the MIT License.
