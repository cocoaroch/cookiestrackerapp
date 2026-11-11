
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>The Delusion Index</h1>
    <p>Because self-awareness is overrated.</p>
    <a href="/tracker/v1">Open Tracker</a>
  `);
});

 // Keep the allowed categories in one place so the form and validation match.
const delusionCategories = [
  'Romance',
  'Career',
  'Appearance',
  'Social Life',
  'General Life'
];

// Check that a date is a real date in YYYY-MM-DD format.
function isValidDelusionDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value;
}

// Read and validate entries from the cookie.
function readDelusionEntries(req) {
  const cookieValue = req.cookies.delusion_v1;

  if (!cookieValue) {
    return [];
  }

  try {
    const savedEntries = JSON.parse(cookieValue);

    if (!Array.isArray(savedEntries)) {
      return [];
    }

    return savedEntries.filter((entry) =>
      entry &&
      isValidDelusionDate(entry.date) &&
      Number.isInteger(entry.level) &&
      entry.level >= 1 &&
      entry.level <= 10 &&
      delusionCategories.includes(entry.category) &&
      (entry.description === undefined ||
        typeof entry.description === 'string')
    );
  } catch (error) {
    console.error('Could not read the delusion_v1 cookie:', error);
    return [];
  }
}

// Wrap each route's content in the shared page layout and styles.
function renderDelusionPage(title, content) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #4b1641;
            font-family: Arial, sans-serif;
            background: repeating-linear-gradient(
              135deg, #ffe8f4, #ffe8f4 12px, #fff5fa 12px, #fff5fa 24px
            );
          }
          header, main { width: min(100% - 32px, 1000px); margin: 24px auto; }
          header, .card {
            padding: 24px;
            border: 3px solid #f080bb;
            border-radius: 18px;
            background: #fffafd;
            box-shadow: 5px 5px 0 #e8a1ca;
          }
          header { text-align: center; }
          h1 { margin: 0 0 8px; color: #d82c91; }
          h2 { color: #b51c7a; }
          .tagline { margin: 0; font-style: italic; }
          .card { margin: 18px 0; }
          label { display: block; margin: 16px 0 6px; font-weight: bold; }
          input, select, textarea, button, .button {
            width: 100%;
            padding: 11px;
            border: 2px solid #e78abd;
            border-radius: 10px;
            font: inherit;
          }
          textarea { min-height: 90px; resize: vertical; }
          button, .button {
            display: inline-block;
            width: auto;
            margin-top: 16px;
            color: white;
            background: #d82c91;
            border: 0;
            cursor: pointer;
            font-weight: bold;
            text-decoration: none;
          }
          a { color: #a01670; font-weight: bold; }
          .actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
          .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
          .chart-box { height: 320px; }
          #heart-sketch { min-height: 260px; overflow: hidden; border-radius: 12px; background: #fff0f8; }
          #heart-sketch canvas { display: block; max-width: 100%; }
          @media (max-width: 520px) {
            header, .card { padding: 18px; }
            .chart-box { height: 280px; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>The Delusion Index</h1>
          <p class="tagline">Because self-awareness is overrated.</p>
        </header>
        <main>${content}</main>
      </body>
    </html>
  `;
}

// Show the form and save a submitted entry in the cookie.
app.get('/tracker/v1', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const categoryOptions = delusionCategories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join('');

  const content = `
    <section class="card">
      <h2>Log today's delusion</h2>
      <form method="POST" action="/tracker/v1">
        <label for="date">Date</label>
        <input id="date" name="date" type="date" value="${today}" required>

        <label for="level">Delusion level (1–10)</label>
        <input id="level" name="level" type="number" min="1" max="10" required>

        <label for="category">Category</label>
        <select id="category" name="category" required>
          ${categoryOptions}
        </select>

        <label for="description">Optional explanation</label>
        <textarea id="description" name="description" maxlength="200"></textarea>

        <button type="submit">Log My Delusion</button>
      </form>
      <p><a href="/tracker/v1/dashboard">Go to the dashboard</a></p>
    </section>
  `;

  res.send(renderDelusionPage('Log a Delusion | The Delusion Index', content));
});

// Save a valid entry and redirect to the dashboard.
app.post('/tracker/v1', (req, res) => {
  const date = req.body.date;
  const level = Number(req.body.level);
  const category = req.body.category;
  const description = typeof req.body.description === 'string'
    ? req.body.description.trim()
    : '';

  if (
    !isValidDelusionDate(date) ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 10 ||
    !delusionCategories.includes(category) ||
    description.length > 200
  ) {
    return res.status(400).send('Please provide a valid date, level, category, and short description.');
  }

  const entries = readDelusionEntries(req);
  entries.push({ date, level, category, description });

  res.cookie('delusion_v1', JSON.stringify(entries), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  res.redirect('/tracker/v1/dashboard');
});

// Show charts and a floating heart for each saved entry.
app.get('/tracker/v1/dashboard', (req, res) => {
  const entries = readDelusionEntries(req);
  // Escape "<" so cookie contents cannot close the JSON script element.
  const safeEntries = JSON.stringify(entries).replace(/</g, '\\u003c');

  const content = `
    <section class="card">
      <div class="actions">
        <a class="button" href="/tracker/v1">Log another delusion</a>
        <form method="POST" action="/tracker/v1/clear">
          <button type="submit">Clear all data</button>
        </form>
      </div>
    </section>

    <section class="card">
      <h2>Delusion Over Time</h2>
      <div class="chart-box"><canvas id="time-chart"></canvas></div>
    </section>

    <section class="card">
      <h2>Sources of Delusion</h2>
      <div class="chart-box"><canvas id="category-chart"></canvas></div>
    </section>

    <section class="card">
      <h2>Delusion Cloud</h2>
      <div id="heart-sketch"></div>
    </section>

    <script id="tracker-data" type="application/json">${safeEntries}</script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script>
    <script>
      const entries = JSON.parse(document.getElementById('tracker-data').textContent);
      const categories = ${JSON.stringify(delusionCategories)};

      const chronologicalEntries = entries.slice().sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      new Chart(document.getElementById('time-chart'), {
        type: 'line',
        data: {
          labels: chronologicalEntries.map((entry) => entry.date),
          datasets: [{
            label: 'Delusion level',
            data: chronologicalEntries.map((entry) => entry.level),
            borderColor: '#e83e9b',
            backgroundColor: '#f7a8d5',
            pointBackgroundColor: '#d82c91',
            pointRadius: 5,
            tension: 0.25
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 1, max: 10, ticks: { stepSize: 1 } },
            x: { title: { display: true, text: 'Entry date' } }
          }
        }
      });

      const categoryColors = ['#f080bb', '#c084fc', '#ef476f', '#d946a6', '#9d4edd'];
      const categoryCounts = categories.map((category) =>
        entries.filter((entry) => entry.category === category).length
      );

      new Chart(document.getElementById('category-chart'), {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: categoryCounts,
            backgroundColor: categoryColors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });

      // Draw a gently floating heart for each entry.
      new p5((p) => {
        const colors = {
          'Romance': '#f72585',
          'Career': '#9d4edd',
          'Appearance': '#ff70a6',
          'Social Life': '#c77dff',
          'General Life': '#e63946'
        };

        p.setup = () => {
          const mount = document.getElementById('heart-sketch');
          p.createCanvas(mount.clientWidth || 600, 260).parent(mount);
        };

        p.windowResized = () => {
          const mount = document.getElementById('heart-sketch');
          p.resizeCanvas(mount.clientWidth || 600, 260);
        };

        p.draw = () => {
          p.clear();

          if (entries.length === 0) {
            p.noStroke();
            p.fill('#7b4770');
            p.textAlign(p.CENTER, p.CENTER);
            p.text('Log an entry to fill your cloud with hearts!', p.width / 2, p.height / 2);
            return;
          }

          entries.forEach((entry, index) => {
            const x = ((index + 1) * p.width) / (entries.length + 1);
            const y = p.height * 0.62 + Math.sin(p.frameCount * 0.04 + index) * 18;
            const size = 18 + entry.level * 5;

            p.push();
            p.translate(x, y);
            p.scale(size / 100);
            p.noStroke();
            p.fill(colors[entry.category] || '#e83e9b');
            p.beginShape();
            p.vertex(0, 30);
            p.bezierVertex(-50, -5, -50, -40, -25, -40);
            p.bezierVertex(-8, -40, 0, -25, 0, -15);
            p.bezierVertex(0, -25, 8, -40, 25, -40);
            p.bezierVertex(50, -40, 50, -5, 0, 30);
            p.endShape(p.CLOSE);
            p.pop();
          });
        };
      }, 'heart-sketch');
    </script>
  `;

  res.send(renderDelusionPage('Dashboard | The Delusion Index', content));
});

// Remove the saved entries cookie.
app.post('/tracker/v1/clear', (req, res) => {
  res.clearCookie('delusion_v1', { path: '/' });
  res.redirect('/tracker/v1/dashboard');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});