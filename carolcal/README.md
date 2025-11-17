## CarolCal Webapp

This folder contains a lightweight HTML/CSS/JS version of the CarolCal app that you can host on GitHub Pages. It uses Firebase for authentication and data, just like the iOS app.

### 1. Set up a Firebase Web app

1. Go to the Firebase console for the CarolCal project.
2. In **Project settings → General → Your apps**, add a new **Web app** (if you don't already have one).
3. Copy the Web app config object (it will look like `const firebaseConfig = { ... }`).

### 2. Configure `app.js`

1. Open `webapp/app.js`.
2. Find the `firebaseConfig` placeholder:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID", // likely "carolcal"
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

3. Replace the placeholder values with the real values from the Firebase console for the Web app.
4. Make sure the `projectId` points to the same project the iOS app uses (e.g. `carolcal`).

### 3. Enable Google sign‑in for web

1. In the Firebase console, go to **Authentication → Sign-in method**.
2. Enable **Google** as a provider for the project (if not already enabled).
3. Add your GitHub Pages domain to the **Authorized domains** list, e.g.:
   - `your-username.github.io`
   - or `your-username.github.io/your-repo-name` for a project site.

### 4. Deploy to GitHub Pages

You can host this folder directly on GitHub Pages. A simple approach:

1. Add the `webapp` folder to your repo and push to GitHub.
2. In GitHub, go to **Settings → Pages** for the repository.
3. Under **Source**, choose the branch that contains `webapp` and set the root folder (or keep root and link to `/webapp/`).
4. After GitHub Pages finishes building, visit the published URL (for example `https://your-username.github.io/CarolCal/webapp/`).

### 5. How it works

- **Authentication**: Uses Firebase Authentication with Google sign‑in (`signInWithPopup`).
- **Data**: Reads and writes appointments from the same `appointments` collection used by the iOS app.
- **Roles**: Uses the same email → role mapping as the iOS app:
  - Admins (Susan/David) can create, edit, and delete any appointment.
  - Carol can create appointments and edit/delete only the ones she created.
- **Notifications**: The webapp does **not** schedule local notifications; those are still handled by the iOS app. The web UI is focused on viewing and editing appointments.


