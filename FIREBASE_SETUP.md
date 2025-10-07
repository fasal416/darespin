# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "dare-game")
4. Follow the setup wizard

## 2. Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider
   - Add your support email
   - Click Save

## 3. Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll add rules later)
3. Select your preferred region
4. Click **Enable**

## 4. Get Web App Credentials
1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to "Your apps" section
3. Click **Web** icon (</>)
4. Register app with a nickname (e.g., "Dare Game Web")
5. Copy the config object values to your `.env.local` file

## 5. Deploy Security Rules
1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Copy the contents from `firestore.rules` file in your project
3. Paste into the rules editor
4. Click **Publish**

## 6. Import Dares Data

### Option A: Using Firebase Console (Manual)
1. Go to **Firestore Database** → **Data**
2. Click **Start collection**
3. Collection ID: `dares`
4. For each dare in `data/dares.json`:
   - Click **Add document**
   - Document ID: use the `id` field from JSON (e.g., "silly_1")
   - Add fields: `category`, `text`, `timeLimit`

### Option B: Using Import Script (Recommended)
1. Download Service Account Key:
   - Go to **Project Settings** → **Service accounts**
   - Click **Generate new private key**
   - Save as `serviceAccountKey.json` in your project root
   - ⚠️ **Add this file to `.gitignore`** (never commit it!)

2. Run the import script:
```bash
   node scripts/importDares.js