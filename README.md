# PitchIQ

PitchIQ is your ultimate destination for comprehensive soccer statistics, real-time match data, and in-depth player analysis. This Next.js application provides a rich, interactive experience for soccer fans to explore league standings, team and player details, match results, and the latest news.

## Key Features

- **League Standings:** View up-to-date tables for major leagues, including form guides and team statistics.
- **Match Details:** Get a comprehensive overview of match results, including lineups, key events, and timelines.
- **Player & Team Profiles:** Dive deep into detailed pages for individual players and teams, showing stats, career history, and squad information.
- **Latest News:** Stay informed with a dedicated news page powered by the ESPN API.
- **User Authentication:** Secure user sign-up and login functionality powered by Firebase Authentication.
- **Subscription System:** A two-tier subscription model (Free and Pro) with gated features. User plan information is stored securely in Firestore.
- **Pro Features:**
    - In-depth match statistics for Pro users.
    - Detailed player heatmaps (Pro feature).
    - Placeholder for AI-powered Smart Highlights.

## Tech Stack

<p align="center">
  <a href="https://nextjs.org/" target="_blank">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://ui.shadcn.com/" target="_blank">
    <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="ShadCN/UI">
  </a>
  <a href="https://firebase.google.com/" target="_blank">
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  </a>
</p>

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Data Source:** [TheSportsDB API](https://www.thesportsdb.com/api.php) & [ESPN API](https://www.espn.com/apis/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/pitchiq.git
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up Environment Variables**
    Create a `.env.local` file in the root of your project and add your API keys and Firebase configuration.
    
    You can get a free API key from TheSportsDB. For the Firebase keys, go to your Firebase project settings. For the reCAPTCHA key, you'll need to set up reCAPTCHA v3 in your Google Cloud console and add your site.

    ```env
    NEXT_PUBLIC_THESPORTSDB_API_KEY=YOUR_SPORTS_DB_API_KEY

    # Firebase Config
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

    # Firebase App Check (reCAPTCHA v3)
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=YOUR_RECAPTCHA_SITE_KEY
    ```

4.  **Set up Firebase**
    - Go to your [Firebase Console](https://console.firebase.google.com/).
    - In the **Authentication > Sign-in method** tab, enable the **Email/Password** provider.
    - In the **Firestore Database > Rules** tab, paste the following security rules and publish them:
      ```
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /users/{userId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
      ```
    - Go to **App Check** in the Firebase console. Select your app, and in the "Apps" section, click on your app's name. In the providers list, enable **reCAPTCHA v3** and follow the prompts to link it.

5.  **Run the development server**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment

### Netlify

Deploying your PitchIQ app to Netlify is a straightforward process.

1.  **Push to GitHub:** Make sure your project is pushed to a GitHub repository.

2.  **Create a New Site on Netlify:**
    - Log in to your Netlify account.
    - Click "Add new site" and choose "Import an existing project".
    - Connect to GitHub and select your project's repository.

3.  **Configure Build Settings:**
    Netlify should automatically detect that you're using Next.js via the `@netlify/plugin-nextjs` plugin defined in `netlify.toml`. If you need to enter the settings manually, use the following:
    - **Base directory:** Leave this field **blank**.
    - **Build command:** `npm run build`
    - **Publish directory:** `.next`

4.  **Add Environment Variables:**
    This is the most important step. Your app needs the API keys and Firebase config to function.
    - In your site's settings on Netlify, go to **Site configuration > Environment variables**.
    - Add all the variables from your `.env.local` file. Netlify provides a more secure way to manage these secrets than committing them to your repository.

5.  **Deploy:**
    - Click the "Deploy site" button. Netlify will start the build process and deploy your application. Once it's done, you'll get a public URL for your live site.
