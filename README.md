# 📖 Cordel — Register Your Story

> A mobile application for registering and managing occurrences and feedback at cultural spaces such as theaters, museums, and cultural centers.

---

## 📋 Description

Cordel is a mobile app developed to solve a common problem in cultural spaces: feedback is usually scattered across complaint books, social media, emails, and informal conversations. Cordel centralizes this process, allowing visitors to quickly register occurrences by category, while managers get a full administrative panel with statistics and filters to support decision-making.

The app has no legal or official character — it is exclusively a feedback collection and internal management tool, using clear and friendly language.

---

## ✨ Features

### 👤 Visitor

- Register occurrences with type (structure, service, accessibility, cleanliness, etc.), description, date, and location
- Rate the experience with 1 to 5 stars and optional comments
- View personal history of all submitted records, ordered by date
- Edit or delete occurrences while status is still "Pending"
- Receive in-app notifications when an occurrence status is updated

### 🛡️ Administrator

- View all occurrences registered by all visitors
- Change occurrence status (Pending → In Analysis → In Progress → Resolved)
- Filter occurrences by date range and cultural space
- Search occurrences by keyword or protocol number
- Statistics dashboard showing most frequent problem types and average visitor ratings

---

## 🛠️ Technologies

| Category         | Technology                            |
| ---------------- | ------------------------------------- |
| Language         | TypeScript                            |
| Framework        | React Native with Expo                |
| Authentication   | Firebase Auth (email & password)      |
| Database         | Firebase Firestore (NoSQL, real-time) |
| State Management | React Hooks (useState, useEffect)     |
| Navigation       | Bottom Tab Navigator                  |
| Icons            | Expo Vector Icons (Ionicons)          |
| Animations       | React Native Reanimated               |

---

## 🗂️ Project Structure

```
src/
├── screens/         # App screens (Login, Form, Admin, Profile, Alerts...)
├── components/      # Reusable components (Toast, modals...)
├── constants/       # Colors, status config, occurrence types
├── hooks/           # Custom hooks (useToast...)
├── types/           # TypeScript interfaces and types
├── firebase/        # Firebase configuration
└── styles/          # Shared stylesheets
App.tsx              # Root component and global state
```

---

## ▶️ How to Run

**Requirements:** Node.js 18+ and Expo CLI installed.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start

# 3. Open the app
# - Scan the QR code with Expo Go (Android/iOS)
# - Or press 'a' for Android emulator / 'i' for iOS simulator
```

> **Note:** An active internet connection is required to communicate with Firebase.

---

## 🔒 Firebase Security Rules

The Firestore security rules must allow authenticated users to read and write to the `occurrences`, `notifications`, and `users` collections:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 👥 Team

| Name                        | Registration |
| --------------------------- | ------------ |
| Lucas Figueredo De Oliveira | 2427447      |
| Samuel Brito                | 2410541      |
| Adryan Uchôa                | 2417363      |
| Ariel Dias                  | 2412871      |
| Artur Barroso               | 2416748      |

**Supervisor:** Lyndainês Santos, Esp.  
**Course:** Technology in Systems Analysis and Development — UNIFOR  
**Subject:** T197 — Mobile Platform Development · 2026.1
