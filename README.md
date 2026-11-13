# cookiestrackerapp
# The Delusion Index

**Video Walkthrough:** https://drive.google.com/file/d/1_w64AICZgBvMUJOIYYDs2rpZNW37Mk2U/view?usp=sharing 

## What I Tracked and Why

The Delusion Index is a site where you rate how delusional you're feeling from 1 to 10.

You pick a category (Romance, Career, Appearance, Social Life, or General Life) and can write a little note about what you're being delusional about.

I didn't want to do a normal habit tracker. I thought it'd be funny to take something as unserious as delusion and treat it like real data, with charts and everything. That's kind of the joke.

## Version 1 (Prompt v1)

[View my first prompt](tracker-docs/prompt-v1.md)

![Version 1 Dashboard](tracker-docs/images/v1-dashboard.png)

### Testing Version 1

**What worked:**

Pretty much everything worked. The buttons worked, and the form wouldn't let me put in a rating over 10 or under 1.

I refreshed the page to see if my entries would disappear, and they stayed. Both charts worked, the hearts showed up, and the clear button deleted my entries when I tried it.

**What didn't work as well:**

The main problem was I couldn't find my notes anywhere. I could type an explanation for each entry, but once I submitted it, I couldn't see it again.

The charts also weren't that interesting. They just showed the numbers I typed in. I wanted the site to actually say something about my data, even if it was just a funny message about how delusional I was.

The categories were fine but kind of boring, and the design looked more basic than I pictured.

## Version 2 – Final (Prompt v2)

[View my second prompt](tracker-docs/prompt-v2.md)

### Version 2 Form

![Version 2 Form](tracker-docs/images/v2-form.png)

### Version 2 Dashboard

![Version 2 Dashboard](tracker-docs/images/v2-dashboard.png)

### Cookie Storage

![Version 2 Cookies](tracker-docs/images/v2-cookie-devtools.png)

### Biggest Changes From Version 1 to Version 2

For Version 2, I mostly fixed what bugged me about Version 1.

I added a table on the dashboard that shows all my entries, newest first, so I can actually read my descriptions now. Those are honestly the funniest part.

I also added an average delusion score with a message that changes depending on how high it is. If your average is 3 or under, it says "Suspiciously grounded in reality." If it's above 8, it says "Please contact your publicist."

I kept the charts and the floating hearts because I liked them.

The design is still really similar to Version 1. I noticed that as soon as I opened it. Most of what changed was making the information more useful, not the look.

### Hand Edits I Made

Copilot wrote the code for both versions.

I came up with the idea, wrote the prompts, tested everything, and decided what to change for Version 2.

## How My Code Works (In My Own Words)

### 1. Saving the Cookie

```js
app.post('/tracker/v2', (req, res) => {
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

  const entries = readDelusionEntriesV2(req);
  entries.push({ date, level, category, description });

  res.cookie('delusion_v2', JSON.stringify(entries), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  res.redirect('/tracker/v2/dashboard');
});
```

**My explanation:**

This runs when you hit submit. First it checks that the entry is valid: a real date, a rating from 1 to 10, one of the five categories, and a description under 200 characters. If any of that is wrong, it doesn't save.

If it's fine, it gets your old entries, adds the new one, and saves the whole list in a cookie called `delusion_v2`. `JSON.stringify` turns the list into text, because cookies can only hold text.

The cookie lasts 30 days, so your entries stay when you refresh. Then it takes you to the dashboard.

### 2. Getting Data to the Dashboard

```js
function readDelusionEntriesV2(req) {
  const cookieValue = req.cookies.delusion_v2;

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
      typeof entry.description === 'string' &&
      entry.description.length <= 200
    );
  } catch (error) {
    console.error('Could not read the delusion_v2 cookie:', error);
    return [];
  }
}

// In the dashboard route:
const entries = readDelusionEntriesV2(req);
```

**My explanation:**

This is basically the opposite of saving. It reads the `delusion_v2` cookie and uses `JSON.parse` to turn the text back into a list of entries.

If there's no cookie yet, it just gives back an empty list. It also filters out any entries that don't look right, so one broken entry doesn't break the whole dashboard.

The dashboard uses this list for everything: the charts, the average, and the entries table.

### 3. Chart 1: Delusion Over Time

```js
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
```

**My explanation:**

This makes the line chart using Chart.js. It sorts the entries by date first, so the line is in order even if I logged things out of order.

The dates go along the bottom and the ratings go up the side from 1 to 10. Each entry is one point, so you can see if your delusion is going up or down over time.

### 4. p5.js Sketch: Delusion Cloud

```js
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
```

**My explanation:**

Every entry gets a heart, spaced out evenly across the box. The size depends on the rating, so a 10 makes a way bigger heart than a 1. The color depends on the category, like pink for Romance and purple for Career.

The `Math.sin` part is what makes them float up and down. If there aren't any entries yet, it just shows a message telling you to log one.

I kept this in Version 2 because it's the most fun part of the site.

## Something the AI Got Wrong

I wouldn't say Copilot got the code wrong, since Version 1 worked. The problem was that it did exactly what I asked and nothing else. It didn't think about whether the site would actually be useful.

For example, I asked for a place to write descriptions but didn't ask for a place to see them later, so it never added one. So I had a feature that technically worked but was kind of pointless.

I also learned that charts don't automatically make data interesting. I wanted the site to give me some kind of reaction, not just show my numbers back to me. I had to be way more specific in my second prompt.

## Final Thoughts

I liked that this assignment let me make something kind of weird. I don't think I would've made a delusion tracker if the assignment had been more strict.

I was surprised how much the prompts mattered. Copilot could write the code, but it couldn't guess what I was picturing, so I had to test it myself to figure out what was missing.

Version 2 is more useful than Version 1, even though they look pretty similar. If I kept working on it, I'd change the design more and come up with better categories.