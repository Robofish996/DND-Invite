# Firebase Setup Instructions

To enable shared character roster across all players, you need to set up Firebase Realtime Database.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if you want)

## Step 2: Enable Realtime Database

1. In your Firebase project, go to **Realtime Database** in the left sidebar
2. Click **Create Database**
3. Choose a location (select the closest to your users)
4. Start in **test mode** (we'll secure it in step 4)
5. Click **Enable**

## Step 3: Get Your Firebase Config

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. If you don't have a web app, click **</>** (web icon) to add one
5. Register your app (you can name it "DND Invite")
6. Copy the `firebaseConfig` object

## Step 4: Update main.js

Open `main.js` and replace the `firebaseConfig` object (around line 7) with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Secure Your Database (Important!)

1. Go back to **Realtime Database** in Firebase Console
2. Click on the **Rules** tab
3. Replace the rules with:

```json
{
  "rules": {
    "roster": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. Click **Publish**

**Note:** These rules allow anyone to read/write. For production, you might want to add authentication, but for a simple D&D invite, this is fine.

## Step 6: Deploy

After updating `main.js` with your Firebase config:

```bash
git add main.js
git commit -m "Add Firebase configuration"
git push
```

The site will automatically redeploy, and now all players will see the same roster in real-time!

## Troubleshooting

- **Characters not showing up?** Check the browser console (F12) for errors
- **Firebase not connecting?** Make sure your config values are correct
- **Still using localStorage?** Check the console - it will say "Firebase not configured" if the config isn't set up

## Fallback

If Firebase isn't configured, the site will automatically fall back to localStorage (which only works per-browser). You'll see a warning in the console.

