# Firebase Deployment Instructions

## ✅ Files Created

I've created the following Firebase configuration files:

1. **firestore.rules** - Security rules for all Firestore collections
2. **storage.rules** - Security rules for Firebase Storage
3. **firestore.indexes.json** - Updated with indexes for efficient querying

## 📋 Deploy These Rules to Firebase

Since Firebase CLI is not installed locally, please deploy these rules manually:

### Option 1: Using Firebase Console (Easiest)

#### Deploy Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`testapp-e72cc`)
3. Click **Firestore Database** → **Rules** tab
4. Copy the content from `firestore.rules` and paste it
5. Click **Publish**

#### Deploy Storage Rules:
1. In Firebase Console, click **Storage** → **Rules** tab  
2. Copy the content from `storage.rules` and paste it
3. Click **Publish**

#### Deploy Firestore Indexes:
1. In Firebase Console, click **Firestore Database** → **Indexes** tab
2. Firebase will automatically detect missing indexes when queries run
3. Or manually add indexes based on `firestore.indexes.json`

### Option 2: Install Firebase CLI (For Future Use)

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

---

## 🔐 Create Admin User

After deploying rules, create an admin user in Firestore:

1. Go to **Firestore Database** in Firebase Console
2. Click **users** collection (create if it doesn't exist)
3. Add a document with your admin email as the document ID
4. Add a field: `isAdmin` (boolean) = `true`
5. Add other fields as needed: `email`, `displayName`, etc.

Example:
```
Document ID: your-admin-uid (get from Authentication tab)
Fields:
  - isAdmin: true
  - email: "admin@example.com"
  - displayName: "Admin User"
  - createdAt: <timestamp>
```

---

## ✅ Next Steps

After deploying rules and creating admin user:
1. Continue with Phase 1.2: Flutter Project Setup ✅ (Ready to proceed)
2. Phase 1.3: Admin Panel Setup ✅ (Ready to proceed)
