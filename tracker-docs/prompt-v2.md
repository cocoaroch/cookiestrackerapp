
# Prompt Script v2

## Goal

I tested my first version of The Delusion Index. I want to improve the website while keeping the same basic idea and pink early-2000s magazine style.

The website should still allow users to log their delusion levels from 1 to 10 in different categories.

## What I Want to Improve

1. Add a section that displays all previously saved entries, including the date, category, level, and description.

2. Add an average delusion score to the dashboard. The number should update whenever a new entry is added.

3. Add a funny message based on the average score:
   - 1–3: "Suspiciously grounded in reality."
   - Above 3–6: "A little delusion never hurt anyone."
   - Above 6–8: "Reality is becoming optional."
   - Above 8–10: "Please contact your publicist."

4. Improve the navigation between the form and dashboard.

5. Make the layout easier to use on smaller screens.

## Technical Requirements

- Keep Version 1 completely unchanged.
- Add new routes at /tracker/v2 and /tracker/v2/dashboard.
- Use a separate cookie named delusion_v2.
- Use Express and cookie-parser.
- Do not use localStorage or document.cookie.
- Keep the cookie expiration at 30 days.
- Keep both Chart.js charts:
  - Delusion Over Time (line chart)
  - Sources of Delusion (doughnut chart)
- Keep the p5.js floating hearts.
- Use Chart.js and p5.js from CDNs.
- Do not install additional npm packages.
- Use beginner-friendly HTML, CSS, and JavaScript.
- Keep the existing homepage and all Version 1 routes working.

## Design

Keep the pink, slightly dramatic teen magazine aesthetic. I want the website to be funny without looking overly complicated or professionally designed.

Please generate only the additional code needed for Version 2 and explain where to paste it in my existing app.js.