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
    Create a `.env.local` file in the root of your project and add your API keys. You can get a free API key from TheSportsDB.

    ```env
    NEXT_PUBLIC_THESPORTSDB_API_KEY=YOUR_API_KEY
    ```

4.  **Set up Firebase**
    - The Firebase configuration object is located in `src/lib/firebase.ts`.
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

5.  **Run the development server**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

