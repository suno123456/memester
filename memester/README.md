# 🔥 MEMESTER — הוראות הקמה

## שלב 1 — התקנת תלויות
```bash
npm install
```

## שלב 2 — יצירת פרויקט Firebase

1. לך ל-https://firebase.google.com
2. לחץ **"Go to console"** → **"Add project"**
3. תן שם: `memester` → המשך
4. לאחר יצירה, לחץ **"Web"** (סמל `</>`) → רשום את האפליקציה
5. **העתק את ה-firebaseConfig** שמופיע

## שלב 3 — הכנס את הקונפיג

פתח את הקובץ `src/firebase/config.js` והחלף את הערכים:
```js
const firebaseConfig = {
  apiKey: "...",         // מה-Firebase
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## שלב 4 — הפעל Authentication

בקונסולת Firebase:
1. **Authentication** → **Get Started** → **Google** → Enable ✅
2. הוסף את הדומיין שלך ל-Authorized domains (localhost כבר שם)

## שלב 5 — הגדר Firestore

1. **Firestore Database** → **Create database** → **Start in test mode**
2. בחר Region: `europe-west1` (הכי קרוב לישראל)

### Rules (לפרודקשן, לאחר בדיקות):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memes/{memeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## שלב 6 — הרצה מקומית
```bash
npm run dev
```
פותח על: http://localhost:5173

## שלב 7 — Deploy ל-Vercel (אופציונלי)
```bash
npm install -g vercel
vercel
```

---

## מבנה הפרויקט
```
memester/
├── src/
│   ├── firebase/
│   │   └── config.js          ← פרטי Firebase שלך
│   ├── hooks/
│   │   ├── useAuth.js         ← Google Auth
│   │   ├── useMemes.js        ← CRUD מימסים
│   │   └── useLeaderboard.js  ← דירוג בזמן אמת
│   ├── components/
│   │   └── LoginScreen.jsx    ← מסך כניסה
│   ├── App.jsx                ← האפליקציה הראשית
│   └── main.jsx               ← Entry point
├── index.html
├── vite.config.js
└── package.json
```
