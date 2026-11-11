
# Prompt Script v1

## Goal
I want to create a website called The Delusion Index. It is a funny daily tracker where people rate how delusional they are feeling in different areas of their lives from 1 to 10. The website should have a playful, pink, early-2000s magazine aesthetic.

## Where it lives
- This is part of my existing Express.js application.
- My main Express file is app.js.
- The app already uses cookie-parser.
- Add the new routes to my existing app.js file.
- Do not change any existing routes.
- Do not install new npm packages.

## Data
Each entry should contain:
- date: a date in YYYY-MM-DD format
- level: a number between 1 and 10
- category: Romance, Career, Appearance, Social Life, or General Life
- description: an optional short text explanation

Example:
{
  date: "2026-11-11",
  level: 9,
  category: "Romance",
  description: "Convinced myself someone was in love with me."
}

Use a cookie named delusion_v1 to store the entries.
The cookie should last 30 days.

## Routes (Express + cookie-parser)

### /tracker/v1
Create a page with a form containing:
- Date input, defaulting to today
- Number input for delusion level from 1 to 10
- Dropdown for category
- Optional description field
- Submit button labeled "Log My Delusion"
- Link to the dashboard

When the form is submitted:
- Read existing entries using req.cookies.
- Add the new entry.
- Save the updated array using res.cookie.
- Redirect to the dashboard.

### /tracker/v1/dashboard
Create a dashboard with:
- Heading: "The Delusion Index"
- Subtitle: "Because self-awareness is overrated."
- Two Chart.js charts
- One p5.js sketch
- A link back to the entry form
- A "Clear all data" button

The clear button should use res.clearCookie to remove the saved data.

## Chart 1 (Chart.js)
Create a line chart titled "Delusion Over Time."

- X-axis: Entry dates
- Y-axis: Delusion level from 1 to 10
- Use pink for the line and points
- Build the chart using the saved cookie entries
- Show readable labels

## Chart 2 (Chart.js)
Create a doughnut chart titled "Sources of Delusion."

- Show the number of entries in each category
- Use different shades of pink, purple, and red
- Include a legend showing the categories
- Build the chart using the saved cookie entries

## p5.js Sketch
Create a sketch titled "Delusion Cloud."

- Draw one floating heart for each entry
- Bigger delusion levels create bigger hearts
- Use different colors depending on category
- Keep the hearts inside the dashboard section
- The sketch should change when entries are added or cleared

## Rules / Constraints
- Use basic HTML, CSS, and JavaScript.
- No React or other frameworks.
- Use cookie-parser and Express cookies to store data.
- Do not use localStorage or document.cookie.
- Load Chart.js and p5.js from a CDN.
- Keep the code simple and readable for a beginner.
- Add comments explaining what each function does.
- Make the design pink, playful, and inspired by early-2000s teen magazines.
- Make the form and dashboard easy to navigate.
- Do not change the existing parts of my Express app.
