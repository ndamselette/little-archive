# Little Archive — About Me Website

A responsive, single-page personal archive built with plain HTML, CSS, and JavaScript. No build step, framework, or paid service is required.

## Preview locally

1. Download and unzip the project.
2. Open `index.html` in your browser.
3. Click the archive cards, filter the testimony tags, use the carousel arrows, and click a testimony to open its modal. Open “Movies & series” to test the searchable movie/series library and its genre/type filters. The hero stickers float, the cards animate in, and sections reveal as you scroll.

## Personalize the site

Open `index.html` in a code editor (VS Code is free). Near the bottom, find the `EDIT THIS DATA` comment.

- `archive`: edit card titles, summaries, detail text, tags, and symbols.
- `testimonies`: replace the fictional sample notes with real messages only if the people who wrote them agree to have them published. Change `dynamic` to one of the filter names (`Friends`, `Romantic`, `Roleplay`) or add your own filter category in `filters`.
- `watchlist`: replace the example movies and series with your own watched titles. Each item has `title`, `type` (`Movie` or `Series`), `year`, `genres` (an array), `emoji`, `color`, and `note`. Search matches titles; genre and type filters can be combined.
- Replace `Your Name`, the intro copy, email address, and footer details.
- The hero portrait is currently a decorative placeholder. To use a photo, replace the `.portrait-frame` contents with an `<img>` element and style it with `object-fit: cover; width:100%; height:100%`.
- The card artwork uses CSS gradients and emoji placeholders so the website works immediately. Replace symbols with your own images when ready.
- For music, you can add an official Spotify embed. In Spotify, open a playlist → Share → Embed playlist, then add the iframe markup to your preferred card/detail section.

## Free deployment option A: GitHub Pages

1. Create or sign in to a GitHub account.
2. Create a new **public** repository, for example `little-archive`.
3. Upload `index.html` and (optionally) `README.md` to the repository root.
4. Open **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
6. Wait for GitHub Pages to publish. Your URL will look like `https://YOUR-USERNAME.github.io/little-archive/` (or `https://YOUR-USERNAME.github.io/` if the repository is named exactly `YOUR-USERNAME.github.io`).

## Free deployment option B: Netlify

1. Sign in to Netlify and choose the option to add a new site by deploying manually.
2. Drag the unzipped project folder (the folder containing `index.html`) into the deployment drop area.
3. Netlify will publish it and give you a generated `*.netlify.app` URL.

## Notes

- Hosting is static and free on the platforms' free tiers, subject to their current terms and limits.
- Google Fonts and any future external images/embeds require an internet connection. The core layout and interactions are local.
- Do not publish private conversations, full names, or personal information without permission.

## Latest update: intro, ships/dynamics, and MP3 music

- **Introduction is now its own section** above the archive cards. Edit the `#introText` text in `index.html`; replace the decorative `.intro-photo` with your own photo if you like.
- **Ships & dynamics are combined** into one popup with search across titles, characters, fandoms, tropes, and notes. Filters can be combined: `Ship` vs `Dynamic`, plus a trope. Edit the `shipsAndDynamics` array.
- **Songs on repeat** opens a music popup. Use **Add MP3 files** to preview audio files from your own device in the current browser session. This local picker does not upload files to the server and selections do not persist after a refresh.
- To make MP3s play for every visitor on your deployed website, add files you own or have permission to distribute to `assets/music/`, then add track entries in the code with paths like `assets/music/song-name.mp3`. Keep file sizes reasonable for free static hosting and respect copyright; do not publish commercial music without the necessary rights.
- Searchable movie/series collection and its genre/type filters are unchanged.


## Latest update: introduction, gallery, moving character names, and code-managed songs

### Full-picture introduction
- The introduction is now a large photo-led panel with a gradient overlay behind the writing.
- The slideshow displays one large image at a time and now uses a horizontal slide transition: the current photo moves left as the next photo enters from the right. The writing and gradient stay stationary; this is not a conveyor-belt carousel or a crossfade. It advances approximately every 5.2 seconds.
- The eight slideshow assets are `assets/images/gallery-01.svg` through `assets/images/gallery-08.svg`. Each is an SVG with a `viewBox` of `800 × 600` (4:3 landscape). They are pastel placeholder illustrations, not real photos.
- `assets/images/introduction-hero.svg` is a separate static background/fallback image with a `viewBox` of `1600 × 1000` (16:10 landscape); it is not one of the eight rotating slides.
- For replacement photos, use landscape 4:3 images around `1600 × 1200` px or larger for the eight slides, ideally WebP or JPG. For the background image, use landscape 16:10 around `1920 × 1200` px or larger. Compress images for the web (roughly 200–500 KB each is a useful target). If you use `.webp`, `.jpg`, or `.png`, update the corresponding file paths in `index.html` and the CSS background path instead of renaming a photo to `.svg`.

### Moving character-name carousel
- Find `const characterNames = [...]` in `index.html` and replace the example names with the characters you use.
- The names scroll continuously; hover pauses the motion, and reduced-motion preferences are respected.

### Add songs through code (no upload button on the website)
1. Put MP3/audio files you have permission to publish in `assets/music/`.
2. Find `const songs = [...]` in `index.html`. Add one object per track, for example:

```js
const songs = [
  { title: 'Song title', artist: 'Artist name', src: 'assets/music/song-title.mp3', mood: 'late-night' },
  { title: 'Another song', artist: 'Another artist', src: 'assets/music/another-song.mp3', mood: 'comfort song' },
];
```

- The `src` path must exactly match the file name and folder. Audio files need to be included when you deploy the website so visitors can play them.
- Keep the array's brackets and commas intact.

The website uses plain HTML, CSS, and JavaScript; no build step is required.


## Latest update: moving archive and hobbies
- The introduction slideshow now uses a one-frame horizontal slide transition rather than a crossfade or continuously moving carousel.
- The four archive cards now appear one at a time with a peek of the next card and previous/next controls.
- Hobbies & interests opens a searchable, filterable collection with Painting, Singing, Walking, and QuarterJade prefilled as starter entries. Edit the `hobbiesAndInterests` array in `index.html`.
- Browser audio autoplay is restricted by most browsers. A sound may not start until the visitor clicks/taps the page. For a respectful experience, keep manual playback controls; muted autoplay is more likely to work but cannot start audible sound automatically.

## Moderated visitor guestbook (Supabase)

The guestbook form lets visitors submit a display name, category, and message. Submissions are saved as `pending`; they are **not visible to the public** until you approve them. Approved entries are loaded into the existing testimony carousel and popup, keeping the current Little Archive design.

### 1. Create the free database
1. Create a project at [Supabase](https://supabase.com/).
2. In the project, open **SQL Editor → New query**.
3. Copy and run the complete contents of `supabase/guestbook.sql`.
4. Open **Project Settings → API** (the wording may vary). Copy the Project URL and the publishable key (or legacy `anon` key).
5. In `index.html`, find `SUPABASE_URL` and `SUPABASE_ANON_KEY`; replace the placeholders with those two values.
6. Save, reload the page, and test by submitting a note. The public website needs internet access to contact Supabase.

**Security:** only use the project's publishable/anon key in `index.html`. Never put a `service_role` key or secret key in website code. The SQL enables Row Level Security, permits public reads of approved rows only, and permits public inserts only when status is `pending`. Visitors cannot approve, edit, or delete messages through the public API.

### 2. Approve or reject messages
1. Open Supabase → **Table Editor → `guestbook`**.
2. New entries appear with `status = pending`. Read the message before publishing it.
3. To publish a note, change its `status` to `approved`. To decline it, change status to `rejected` (or delete the row).
4. The public website loads approved messages on page load. Refresh the site to see newly approved notes.

You can also approve a specific row using SQL Editor, replacing the UUID with the row's actual `id`:

```sql
update public.guestbook
set status = 'approved'
where id = 'PASTE-ROW-UUID-HERE'::uuid
  and status = 'pending';
```

### 3. Migrate your existing Padlet posts
The previous sample testimonials have been removed so the site does not misrepresent example text as real messages. Add your actual Padlet entries to the `testimonies` array in `index.html` if you want them to remain static, or import them into the Supabase `guestbook` table with `status = 'approved'` after confirming you have permission to publish them. For static entries, use this shape:

```js
{
  name: 'Display name',
  initials: 'DN',
  dynamic: 'Friend', // Romantics, Family, Friend, Friends, Romantic, Roleplay, or Others
  date: '2025-04-23',
  quote: 'A short excerpt shown on the card.',
  full: 'The complete original message, keeping its wording and line breaks.',
  tags: ['friendship', 'kind words'],
  tone: 'rose' // rose, lilac, butter, or sage
}
```

For a database import, keep the original author/display name and message as provided, set `status` to `approved` only for entries you have permission to publish, and choose one of the supported category values. Do not upload private messages without the writer's permission.

### Free deployment setup
- Host the static site on GitHub Pages or Netlify's free tier.
- Use Supabase's free tier for the database, subject to current quotas and inactivity/usage policies.
- GitHub Pages only serves static files; Supabase provides the remote data store and API. See [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Supabase secure data guidance](https://supabase.com/docs/guides/database/secure-data).

This starter includes a basic hidden honeypot field, but a public form can still attract spam. If you share the site widely, add CAPTCHA or another rate-limiting layer and periodically review pending messages.


## Project file layout

- `index.html` — page structure and content sections.
- `css/style.css` — colors, gradients, responsive layout, and slide transitions.
- `js/script.js` — archive data, slideshow behavior, guestbook requests, and Supabase connection.
- `assets/images/` — SVG decorative images.
- `supabase/guestbook.sql` — database and moderation policies.

The Supabase URL and publishable key in `js/script.js` are placeholders in this shared project copy. Paste your own project URL and publishable key into those constants before testing. Never use a Supabase secret or `service_role` key in frontend code.

## Supabase-backed archive + private admin dashboard

The curated collections (Movies & series, Ships & dynamics, Songs, and Hobbies & interests) now load from `public.archive_entries`. The public website reads only published rows. The private dashboard is `admin.html` and uses Supabase Auth; database RLS policies restrict create/edit/delete access to one specific Supabase Auth user UUID. The moderated guestbook remains separate and unchanged.

### One-time setup

1. **Create your admin login first.** In Supabase Dashboard, open **Authentication → Users → Add user**. Create a user with your own email and a strong password. Keep public sign-ups disabled; the admin page has sign-in only, no sign-up flow.
2. Copy the user's **UUID** from the Auth users list.
3. Open `supabase/archive_entries.sql`. Replace every occurrence of `REPLACE_WITH_ADMIN_AUTH_USER_UUID` with that UUID (keep the single quotes around the UUID in the SQL), then run the full SQL in Supabase **SQL Editor**. This creates the table and RLS policies without changing `guestbook`.
4. In both `js/script.js` and `js/admin.js`, set `SUPABASE_URL` to your project URL and `SUPABASE_ANON_KEY` to your `sb_publishable_...` key (or legacy public `anon` key). Use the same values that work for your guestbook. **Never put a `sb_secret_` or `service_role` key in either file.**
5. Open `admin.html` through Live Server (or the published site) and sign in using the Auth user you created. You can add, edit, hide/show, and delete entries.
6. Refresh `index.html` to see published entries in the relevant archive section. Uncheck **Visible on website** to keep an entry in the database but hide it publicly.

### Entry fields in the dashboard

- **Movies & series** metadata example: `{"type":"Movie","year":2024,"genres":["Fantasy","Drama"],"emoji":"🎬","color":"poster-lilac"}`
- **Ships & dynamics** metadata example: `{"kind":"Ship","fandom":"Fandom name","characters":"A × B","tropes":["Slow burn","Mutual pining"],"emoji":"💌"}`
- **Songs** metadata example: `{"artist":"Artist name","src":"assets/music/song.mp3","mood":"late night","url":"https://open.spotify.com/track/..."}`
- **Hobbies & interests** metadata example: `{"kind":"Hobby","category":"Creative","emoji":"🎨"}`

Metadata must be valid JSON. The public site reads the expected keys above; tags are entered separately as a comma-separated list. For song playback, put audio files in `assets/music/` and set `src` to their relative path. If you use an external song URL instead, add it as `url` metadata; an external URL is not automatically a playable audio file.

### Security notes

- The `archive_entries` table has RLS enabled. Anonymous visitors can only select `is_published = true` rows. Only the UUID you placed in the SQL can insert, update, or delete rows.
- Do not rely on the admin page being hidden as security; the SQL policy is what enforces permissions.
- Do not enable public user sign-up unless you intentionally want other people to be able to create Auth accounts. Even if someone else signs in, the RLS policy should deny archive writes unless their UUID matches your admin UUID.
- Keep `supabase/guestbook.sql` and `supabase/archive_entries.sql` as separate scripts. Guestbook moderation continues to use the existing `pending`/`approved` workflow.


## Books in Movies & Series

Books share the existing `movies` section in Supabase. In `admin.html`, choose Movies & series and set Extra details JSON to something like `{"type":"Book","author":"Author name","year":2024,"genres":["Fantasy"],"image_path":"assets/images/archive/books/1.png","emoji":"📚"}`. Put the cover file at `assets/images/archive/books/1.png`. The public modal includes a Books type filter.
