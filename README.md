# Halwani Food Service App, Collections & Journey Plan Update

**Release:** 28 June 2026, Collections & Journey Plan

## What must appear after the update

1. A rectangular green header with only **Halwani Food Service**. There is no **Visit Tracker** text.
2. A green label on the Home page: **Collections & Journey Plan update · 28 Jun 2026**.
3. A monthly **Collections** card directly below **START VISIT**.
4. A **Plan** tab in the bottom navigation.
5. Buttons for **This Month Plan** and **Add Approved Customer**.
6. The visit screen uses **Check In** and **Close Visit**.

## Replace the live app in GitHub

1. Open the live app repository in GitHub.
2. Open the `public` folder.
3. Delete all files and folders inside that `public` folder.
4. Upload everything inside this package's `public` folder: `index.html`, `app.js`, `data.js`, `styles.css`, `manifest.json`, `assets`, and `templates`.
5. Return to the repository root and replace `vercel.json` with this package's `vercel.json`.
6. Commit directly to the `main` branch.
7. Wait for Vercel to finish its automatic deployment.
8. Open the *new Vercel deployment URL* in Safari with `?release=collections-20260628` added at the end.

Example:
`https://your-app.vercel.app/?release=collections-20260628`

If the iPhone home screen app still shows the older layout, close it completely, remove its home-screen icon, reopen the link in Safari, and choose **Share > Add to Home Screen** again.


Updated 2026-06-29: Top header redesigned to match approved green banner style.


Update 2026-06-29: Header title is responsive and always fully visible, wrapping on smaller screens instead of truncating.
