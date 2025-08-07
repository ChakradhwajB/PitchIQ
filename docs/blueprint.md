# **App Name**: Goal Getter

## Core Features:

- Data Display: Display comprehensive soccer match statistics and visualizations sourced from a free API.
- Interactive Visualizations: Interactive D3.js charts and graphs to visualize player and team performance.
- Data Filtering: Sort and filter match data by date, league, team, and player.
- Smart Highlights: AI-powered commentary tool suggesting relevant insights based on statistics.
- Responsive Design: Responsive layout, for a range of display sizes.
- League & Season Selection: Simple dropdown menus allowing the user to select a major league (e.g., Premier League, La Liga, Serie A, Bundesliga) and a season (e.g., 2024-2025, 2023-2024).
- The Standings Table: A clean, responsive table built with HTML and styled with Tailwind CSS. It must be easy to read on both desktop and mobile. Display the following columns: Rank, Team Logo & Team Name, Games Played (P), Wins (W), Draws (D), Losses (L), Goals For (GF), Goals Against (GA), Goal Difference (GD), Points (Pts), Form (A visual representation of the last 5 matches, e.g., W-W-L-D-W)
- Core Data Visualization: A simple, clean bar chart that dynamically updates when the league or season changes to provide an immediate visual comparison of the teams. For example, a horizontal bar chart showing the Points for each team, ordered from highest to lowest. The bars could be colored with your primary brand color.
- Team Page: When a user clicks on a team in the standings table, they are taken to a dedicated Team Page, including: Team logo, name, stadium, and country; a table listing the current squad's players, their positions, and nationality; a list of the team's recent results and upcoming matches; and Visual cards showing key stats for the current season (e.g., Total Goals Scored, Goals Conceded, Average Possession %).
- Player Page: When a user clicks on a player from the squad list, they are taken to a Player Page. Display: Photo, full name, position, age, height, nationality, a clean table or set of cards showing their performance metrics for the current season (e.g., Appearances, Minutes Played, Goals, Assists), and a simple list of clubs they have played for.
- Match Page: When a user clicks on a specific fixture or result, they are taken to a Match Page. Display: Head-to-head history between the two teams, starting lineups, and formation visualizations; Final score, goalscorers, substitutions, and a timeline of key events (goals, cards); and a comparison table showing stats for both teams (e.g., Shots, Shots on Target, Possession, Fouls, Corners).
- Advanced Visualizations: Go beyond bar charts and implement compelling, interactive graphics on the Match and Player pages. Shot Maps: On a Match Page, display a graphic of the pitch showing the location of every shot taken by a team. Color-code the dots to represent a goal, a saved shot, or a missed shot. Player Heatmaps: On a Player Page, show a heatmap of the pitch indicating where the player was most active during their last match. Passing Networks: A more advanced chart showing which players on a team pass to each other most frequently.
- Advanced Statistics: Integrate modern "expected" stats (xG, xA) if your API plan includes it. Display the xG for and against a team in the standings to show if they are over or under-performing their chances, and a player's xA stat to measure the quality of their chance creation.

## Style Guidelines:

- Background: A clean white (#FFFFFF) or a very light, warm gray/beige (#F7F7F7).
- Primary Text: A dark charcoal gray, not pure black (#212121).
- Primary Accent: Navy Blue (#1F3A93) - Professional and trustworthy or Vibrant Orange (#D46600) - Energetic and action-oriented.
- Secondary Accent/UI Elements: A softer, muted color for backgrounds of containers or less important buttons. Light Lavender (#E8EAF6) or Light Green (#F1F8E9).
- Data Visualization Palette (for charts): Dark Teal (#056875), Red (#C9495E), Sky Blue (#50C2E5), Orange (#D46600), Green (#27AE60).
- Headline font: 'Space Grotesk' (sans-serif) for headlines and short amounts of body text. Body font: 'Inter' (sans-serif) for longer sections of text.
- Use simple, sports-themed icons for navigation and data representation.
- Use a clear and structured layout to showcase key match data.
- Incorporate subtle transitions and animations to improve the user experience.
- HEADER: Logo, App Name, Main Navigation
- MAIN CONTENT AREA (This is where the unique page content will go)
- FOOTER: About, Contact, Data Source Credit
- Body & UI Text: Inter
- Headings (H1, H2): Rubik