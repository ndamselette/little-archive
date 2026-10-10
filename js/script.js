
// Gentle decorative sparkles in the page background
function initBackgroundSparkles() {
  const layer = document.getElementById("sparkleLayer");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const count = window.innerWidth < 700 ? 16 : 30;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.setProperty("--x", `${Math.random() * 100}%`);
    sparkle.style.setProperty("--y", `${Math.random() * 100}%`);
    sparkle.style.setProperty("--size", `${2 + Math.random() * 3}px`);
    sparkle.style.setProperty("--duration", `${5 + Math.random() * 7}s`);
    sparkle.style.setProperty("--delay", `${-Math.random() * 12}s`);
    fragment.appendChild(sparkle);
  }
  layer.appendChild(fragment);
}
initBackgroundSparkles();

// EDIT THIS DATA to personalize the cards and testimonies. See README.md for tips.
const archive = [
  {
    id: "shipsDynamics",
    number: "01",
    title: "Ships & dynamics",
    short: "Pairings, tropes, character chemistry, and story ideas on my mind.",
    label: "fictional feelings",
    symbol: "💌",
    art: "art-ships",
    image: "assets/images/archive/ships/1.png",
    tags: ["ships", "tropes", "dynamics"],
    body: "Search my ships and favorite relationship dynamics, then filter by fandom, pairing type, or trope.",
    note: "Use the searchable collection below to explore pairings and dynamics.",
  },
  {
    id: "watchlist",
    number: "02",
    title: "Movies, series & books",
    short:
      "Stories I’ve watched, loved, read, cried over, or still need to finish.",
    label: "now showing",
    symbol: "🎬",
    art: "art-screen",
    image: "assets/images/archive/movies/1.png",
    tags: ["movies", "series", "anime"],
    body: "A little shelf for movies, series, anime, and books. Search by title, filter by type or genre, and browse the stories that stay with me.",
    note: "Tip: use poster images you have permission to share.",
  },
  {
    id: "music",
    number: "03",
    title: "Songs on repeat",
    short: "A soundtrack for different moods, memories, and versions of me.",
    label: "press play",
    symbol: "♫",
    art: "art-music",
    tags: ["playlist", "lyrics"],
    body: "Add the songs you listen to, favorite artists, playlists, and the lyrics that mean something to you. You can paste a Spotify playlist link here later or embed an official player.",
    note: "Spotify embed: open a playlist → Share → Embed playlist, then add the provided iframe in this card’s detail view.",
  },
  {
    id: "hobbies",
    number: "04",
    title: "Hobbies & interests",
    short:
      "Painting, singing, long walks, and creators I love watching — including QuarterJade.",
    label: "little joys",
    symbol: "✿",
    art: "art-hobbies",
    image: "assets/images/archive/hobbies/1.png",
    tags: ["painting", "singing", "streamers"],
    body: "Browse the little things I love doing and the creators I enjoy following.",
    note: "Open the searchable Hobbies & Interests collection.",
  },
];
// Your real Padlet messages can be added here after you have permission to publish them.
// New visitor submissions are loaded from Supabase only after you approve them.
const testimonies = [];
// Archive content is loaded from Supabase. Keep these arrays empty so stale demo content
// never appears if the database is empty or not configured.
let watchlist = [];
let shipsAndDynamics = [];
let songs = [];
let hobbiesAndInterests = [];
// EDIT THESE NAMES for the continuously moving character-name carousel under your introduction.
const characterNames = [
  "Zheng Shuyi",
  "Quarterjade",
  "Kafka",
  "Thalia Roem Guirta",
  "Jang Wonyoung",
  "Rudbeckia de Borgia",
];
// Supabase public project settings. Safe to expose only the publishable/anon key with the RLS rules in supabase/guestbook.sql.
// Fill these two values after creating your free Supabase project. NEVER put a service_role/secret key here.
const SUPABASE_URL = "https://fdqctimtqehetboszlbg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gHfal4nlxw_5j67FTmV_0w_hIzRMjLu";
const guestbookConfigured =
  /^https:\/\//.test(SUPABASE_URL) &&
  !SUPABASE_URL.includes("YOUR_") &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes("YOUR_");
async function loadArchiveEntries() {
  if (!guestbookConfigured) {
    console.warn(
      "Archive database is not configured. Add the Supabase URL and publishable key in js/script.js.",
    );
    watchlist = [];
    shipsAndDynamics = [];
    songs = [];
    hobbiesAndInterests = [];
    return;
  }
  try {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/archive_entries?select=id,section,title,description,metadata,tags,sort_order&is_published=eq.true&order=sort_order.asc,created_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!response.ok)
      throw new Error(`Archive request failed (${response.status})`);
    const rows = await response.json();
    watchlist = rows
      .filter((r) => r.section === "movies")
      .map((r) => ({
        title: r.title,
        type: r.metadata?.type || "Movie",
        year: r.metadata?.year || "",
        author: r.metadata?.author || "",
        genres: Array.isArray(r.metadata?.genres)
          ? r.metadata.genres
          : r.tags || [],
        image:
          r.metadata?.image_path ||
          (r.metadata?.type === "Book"
            ? "assets/images/archive/books/1.png"
            : ""),
        emoji: r.metadata?.emoji || (r.metadata?.type === "Book" ? "📚" : "🎬"),
        color: r.metadata?.color || "poster-rose",
        note: r.description || "",
      }));
    shipsAndDynamics = rows
      .filter((r) => r.section === "ships")
      .map((r) => ({
        title: r.title,
        kind: r.metadata?.kind || "Ship",
        fandom: r.metadata?.fandom || "",
        characters: r.metadata?.characters || "",
        tropes: Array.isArray(r.metadata?.tropes)
          ? r.metadata.tropes
          : r.tags || [],
        image: r.metadata?.image_path || "",
        emoji: r.metadata?.emoji || "💌",
        note: r.description || "",
      }));
    songs = rows
      .filter((r) => r.section === "songs")
      .map((r) => ({
        title: r.title,
        artist: r.metadata?.artist || "",
        src: r.metadata?.src || "",
        mood: r.metadata?.mood || "",
        url: r.metadata?.url || "",
      }));
    hobbiesAndInterests = rows
      .filter((r) => r.section === "hobbies")
      .map((r) => ({
        title: r.title,
        kind: r.metadata?.kind || "Hobby",
        category: r.metadata?.category || "Others",
        image: r.metadata?.image_path || "",
        emoji: r.metadata?.emoji || "✿",
        note: r.description || "",
      }));
  } catch (error) {
    console.error("Could not load archive entries from Supabase:", error);
    watchlist = [];
    shipsAndDynamics = [];
    songs = [];
    hobbiesAndInterests = [];
  }
}
const filters = ["All", "Lovers", "Family", "Friends", "Others"];
let activeFilter = "All",
  currentIndex = 0,
  lastFocus = null;
const $ = (s) => document.querySelector(s);
const archiveGrid = $("#archiveGrid"),
  filterRow = $("#filterRow"),
  quoteStage = $("#quoteStage"),
  dots = $("#dots");
const modal = $(".modal"),
  standardModalContent = $("#standardModalContent"),
  movieBrowser = $("#movieBrowser"),
  shipBrowser = $("#shipBrowser"),
  musicBrowser = $("#musicBrowser");
let archiveIndex = 0;
function renderArchive() {
  archiveGrid.innerHTML = archive
    .map(
      (c, i) =>
        `<button class="archive-card ${i === archiveIndex ? "current-card" : ""}" data-card="${c.id}" aria-label="Open ${c.title}"><div class="card-art ${c.art} ${c.image ? "has-art" : ""}" ${c.image ? `style="background-image:url('${c.image}')"` : ""}><span class="art-label">${c.label}</span><span class="symbol">${c.symbol}</span></div><div class="card-copy"><div class="eyebrow">${c.number} · peek inside</div><div class="card-top"><h3>${c.title}</h3><span class="arrow">↗</span></div><p>${c.short}</p><div class="mini-tags">${c.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div><span class="read-more">Open this collection ↗</span></div></button>`,
    )
    .join("");
  updateArchiveCarousel();
}
function updateArchiveCarousel() {
  const cards = [...archiveGrid.children];
  if (!cards.length) return;
  archiveIndex = ((archiveIndex % cards.length) + cards.length) % cards.length;
  cards.forEach((c, i) =>
    c.classList.toggle("current-card", i === archiveIndex),
  );
  const card = cards[archiveIndex];
  const viewport = $("#archiveCarousel");
  const shift = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
  archiveGrid.style.transform = `translateX(${-shift}px)`;
  $("#archivePosition").textContent =
    `${String(archiveIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
}

function filteredQuotes() {
  return testimonies.filter(
    (t) => activeFilter === "All" || t.dynamic === activeFilter,
  );
}
function renderFilters() {
  filterRow.innerHTML = filters
    .map(
      (f) =>
        `<button class="filter ${f === activeFilter ? "active" : ""}" data-filter="${escapeHTML(f)}" aria-pressed="${f === activeFilter}">${f === "All" ? "✳ All notes" : escapeHTML(f)}</button>`,
    )
    .join("");
}
function renderQuote() {
  const list = filteredQuotes();
  if (!list.length) {
    quoteStage.innerHTML =
      '<div class="empty">No approved notes in this category yet. Leave a little note above ♡</div>';
    dots.innerHTML = "";
    return;
  }
  currentIndex = ((currentIndex % list.length) + list.length) % list.length;
  const t = list[currentIndex],
    idx = testimonies.indexOf(t);
  quoteStage.innerHTML = `<div class="quote-layout"><button class="quote-card" data-testimony="${idx}" aria-label="Read full testimony from ${escapeHTML(t.name)}"><div><div class="quote-mark">“</div><p class="quote-text">${escapeHTML(t.quote)}</p></div><div class="quote-footer"><div><div class="quote-author">${escapeHTML(t.name)}</div><div class="quote-meta">${escapeHTML(t.date)} · ${escapeHTML(t.dynamic)}</div></div><span class="read-more">Read the full note ↗</span></div></button><aside class="quote-side"><div class="quote-side-card"><span>little things people remember</span><strong>the words<br>we keep ♡</strong><span>tap a note to open it</span></div><div class="quote-side-card lilac"><span>currently viewing</span><strong>${String(currentIndex + 1).padStart(2, "0")} <span style="font-size:.85rem">/ ${String(list.length).padStart(2, "0")}</span></strong><span>filtered by ${escapeHTML(activeFilter.toLowerCase())}</span></div></aside></div>`;
  dots.innerHTML = list
    .map(
      (_, i) =>
        `<span class="dot ${i === currentIndex ? "active" : ""}" aria-hidden="true"></span>`,
    )
    .join("");
}
async function loadApprovedGuestbook() {
  if (!guestbookConfigured) {
    const status = $("#guestbookStatus");
    status.textContent =
      "Setup needed: add your Supabase project URL and publishable/anon key in index.html, then run the SQL setup file.";
    return;
  }
  try {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/guestbook?select=id,name,category,message,tags,created_at&status=eq.approved&order=created_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!response.ok)
      throw new Error(
        "Could not load approved notes. Check the Supabase URL, key, and policies.",
      );
    const rows = await response.json();
    // Keep only locally authored entries and replace previously fetched remote entries on refresh.
    for (let i = testimonies.length - 1; i >= 0; i--) {
      if (testimonies[i].source === "guestbook") testimonies.splice(i, 1);
    }
    rows.forEach((row) => {
      const full = String(row.message || "");
      testimonies.push({
        name: String(row.name || "Anonymous friend"),
        initials: String(row.name || "A")
          .slice(0, 2)
          .toUpperCase(),
        dynamic: String(row.category || "Others"),
        date: row.created_at
          ? new Date(row.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "a little note",
        quote: full.length > 180 ? full.slice(0, 177) + "…" : full,
        full,
        tags: Array.isArray(row.tags) ? row.tags : [],
        tone: "rose",
        source: "guestbook",
      });
    });
    renderFilters();
    renderQuote();
  } catch (error) {
    const status = $("#guestbookStatus");
    status.textContent =
      "Guestbook is temporarily unavailable. You can still browse the existing notes.";
    status.classList.add("error");
    console.error(error);
  }
}
async function submitGuestbook(event) {
  event.preventDefault();
  const status = $("#guestbookStatus"),
    button = $("#guestbookSubmit");
  if ($("#guestbookWebsite").value) return;
  if (!guestbookConfigured) {
    status.textContent =
      "The guestbook is not connected yet. Follow the setup guide to connect Supabase.";
    status.className = "guestbook-status error";
    return;
  }
  const anonymous = $("#guestbookAnonymous").checked,
    name = anonymous ? "Anonymous" : $("#guestbookName").value.trim(),
    category = $("#guestbookCategory").value,
    message = $("#guestbookMessage").value.trim();
  if ((!name && !anonymous) || !message) {
    status.textContent = "Please add a display name or choose anonymous, and write your message.";
    status.className = "guestbook-status error";
    return;
  }
  button.disabled = true;
  button.textContent = "Sending…";
  status.textContent = "Sending your note for approval…";
  status.className = "guestbook-status";
  try {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/guestbook`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name,
          category,
          message,
          tags: [],
          status: "pending",
        }),
      },
    );
    if (!response.ok)
      throw new Error("Submission failed. Please try again later.");
    $("#guestbookForm").reset();
    status.textContent =
      "Thank you! Your note was sent privately and will appear after approval. ♡";
    status.className = "guestbook-status success";
  } catch (error) {
    status.textContent =
      "Sorry, your note could not be sent. Please try again later.";
    status.className = "guestbook-status error";
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = "Send for approval ♡";
  }
}
function showModal(
  { eyebrow, title, body, tags = [], note = "", cover = "", art = "", socialLinks = [] },
  isQuote = false,
) {
  lastFocus = document.activeElement;
  $("#mobileModalTitle").textContent = title;
  modal.classList.remove("movie-mode", "wide-mode");
  standardModalContent.hidden = false;
  movieBrowser.hidden = true;
  shipBrowser.hidden = true;
  musicBrowser.hidden = true;
  $("#hobbiesBrowser").hidden = true;
  $("#modalEyebrow").textContent = eyebrow;
  $("#modalTitle").textContent = title;
  $("#modalBody").textContent = body;
  $("#modalTags").innerHTML = socialLinks.length
    ? socialLinks.map((link) => `<a class="social-modal-link" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer"><span class="social-modal-icon">↗</span><span>${escapeHTML(link.label)}</span><span aria-hidden="true">↗</span></a>`).join("")
    : tags.map((t) => `<span class="tag">${t}</span>`).join("");
  $("#modalNote").textContent = note;
  $("#modalCover").className = "modal-cover " + art;
  $("#modalCover").textContent = cover;
  $("#modalBackdrop").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#modalClose").focus();
}
function closeModal() {
  $("#modalBackdrop").classList.remove("open");
  modal.classList.remove("movie-mode");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
archiveGrid.addEventListener("click", (e) => {
  const b = e.target.closest("[data-card]");
  if (!b) return;
  const c = archive.find((x) => x.id === b.dataset.card);
  showModal({
    eyebrow: `archive · ${c.number}`,
    title: c.title,
    body: c.body,
    tags: c.tags,
    note: c.note,
    cover: c.symbol,
    art: c.art,
  });
  if (["watchlist", "shipsDynamics", "music", "hobbies"].includes(c.id)) {
    modal.classList.add("movie-mode", "wide-mode");
    standardModalContent.hidden = true;
    if (c.id === "watchlist") {
      movieBrowser.hidden = false;
      renderMovies();
      $("#movieSearch").focus();
    }
    if (c.id === "shipsDynamics") {
      shipBrowser.hidden = false;
      renderShips();
      $("#shipSearch").focus();
    }
    if (c.id === "music") {
      musicBrowser.hidden = false;
      renderTracks();
    }
    if (c.id === "hobbies") {
      $("#hobbiesBrowser").hidden = false;
      renderHobbies();
      $("#hobbySearch").focus();
    }
  }
});
function renderMovies() {
  const genreSelect = $("#genreFilter");
  const currentGenre = genreSelect.value || "all";
  const genres = [...new Set(watchlist.flatMap((m) => m.genres))].sort((a, b) =>
    a.localeCompare(b),
  );
  genreSelect.innerHTML =
    '<option value="all">All genres</option>' +
    genres.map((g) => `<option value="${g}">${g}</option>`).join("");
  genreSelect.value = genres.includes(currentGenre) ? currentGenre : "all";
  const q = $("#movieSearch").value.trim().toLowerCase(),
    type = $("#typeFilter").value,
    genre = genreSelect.value;
  const results = watchlist.filter(
    (m) =>
      (!q || m.title.toLowerCase().includes(q)) &&
      (type === "all" || m.type === type) &&
      (genre === "all" || m.genres.includes(genre)),
  );
  $("#movieCount").textContent =
    `${results.length} ${results.length === 1 ? "title" : "titles"} in the collection`;
  $("#movieGrid").innerHTML = results.length
    ? results
        .map(
          (m, i) =>
            `<article class="movie-card" style="animation-delay:${Math.min(i, 8) * 35}ms"><div class="movie-poster ${m.color}">${m.image ? `<img src="${escapeHTML(m.image)}" alt="${escapeHTML(m.title)} poster" loading="lazy" onerror="this.remove()">` : ``}<span>${m.emoji}</span></div><div class="movie-info"><h3 class="movie-title">${m.title}</h3><div class="movie-meta">${m.type}${m.year ? " · " + m.year : ""}${m.author ? " · by " + escapeHTML(m.author) : ""}</div><div class="movie-tags"><span class="tag">${m.type}</span>${m.genres.map((g) => `<span class="tag">${g}</span>`).join("")}</div><p style="font-size:.78rem;color:var(--muted);margin:10px 0 0">${m.note}</p></div></article>`,
        )
        .join("")
    : '<div class="movie-empty">No titles found ♡<br><small>Try another title or remove a filter.</small></div>';
}
function renderShips() {
  const tropeSelect = $("#shipTrope"),
    previous = tropeSelect.value || "all";
  const tropes = [...new Set(shipsAndDynamics.flatMap((x) => x.tropes))].sort(
    (a, b) => a.localeCompare(b),
  );
  tropeSelect.innerHTML =
    '<option value="all">All tropes</option>' +
    tropes.map((t) => `<option value="${t}">${t}</option>`).join("");
  tropeSelect.value = tropes.includes(previous) ? previous : "all";
  const q = $("#shipSearch").value.trim().toLowerCase(),
    kind = $("#shipKind").value,
    trope = tropeSelect.value;
  const results = shipsAndDynamics.filter(
    (x) =>
      (!q ||
        [x.title, x.fandom, x.characters, x.note, ...x.tropes]
          .join(" ")
          .toLowerCase()
          .includes(q)) &&
      (kind === "all" || x.kind === kind) &&
      (trope === "all" || x.tropes.includes(trope)),
  );
  $("#shipCount").textContent =
    `${results.length} ${results.length === 1 ? "entry" : "entries"} in the collection`;
  $("#shipGrid").innerHTML = results.length
    ? results
        .map(
          (x, i) =>
            `<article class="archive-result" style="animation-delay:${Math.min(i, 8) * 35}ms"><div class="result-art">${x.image ? `<img src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title)}" loading="lazy" onerror="this.remove()">` : x.emoji}</div><div class="result-copy"><span class="tag">${escapeHTML(x.kind)}</span><h3>${escapeHTML(x.title)}</h3><div class="track-sub">${x.fandom} · ${x.characters}</div><div class="movie-tags" style="margin-top:8px">${x.tropes.map((t) => `<span class="tag">${t}</span>`).join("")}</div><p>${x.note}</p></div></article>`,
        )
        .join("")
    : '<div class="movie-empty">No ships or dynamics found ♡<br><small>Try another search or filter.</small></div>';
}
$("#shipSearch").addEventListener("input", renderShips);
$("#shipKind").addEventListener("change", renderShips);
$("#shipTrope").addEventListener("change", renderShips);
function renderHobbies() {
  const select = $("#hobbyCategory"),
    prev = select.value || "all";
  const cats = [...new Set(hobbiesAndInterests.map((x) => x.category))].sort();
  select.innerHTML =
    '<option value="all">All categories</option>' +
    cats
      .map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
      .join("");
  select.value = cats.includes(prev) ? prev : "all";
  const q = $("#hobbySearch").value.trim().toLowerCase(),
    kind = $("#hobbyKind").value,
    cat = select.value;
  const results = hobbiesAndInterests.filter(
    (x) =>
      (!q ||
        [x.title, x.kind, x.category, x.note]
          .join(" ")
          .toLowerCase()
          .includes(q)) &&
      (kind === "all" || x.kind === kind) &&
      (cat === "all" || x.category === cat),
  );
  $("#hobbyCount").textContent =
    `${results.length} ${results.length === 1 ? "entry" : "entries"} in my little joys`;
  $("#hobbyGrid").innerHTML = results.length
    ? results
        .map(
          (x) =>
            `<article class="archive-result"><div class="result-art">${x.image ? `<img src="${escapeHTML(x.image)}" alt="${escapeHTML(x.title)}" loading="lazy" onerror="this.remove()">` : x.emoji}</div><div class="result-copy"><span class="tag">${escapeHTML(x.kind)}</span><h3>${escapeHTML(x.title)}</h3><div class="hobby-tags"><span class="hobby-tag ${String(x.kind).toLowerCase()}">${escapeHTML(x.kind)}</span><span class="hobby-tag ${String(x.kind).toLowerCase()}">${escapeHTML(x.category)}</span></div><p>${escapeHTML(x.note)}</p></div></article>`,
        )
        .join("")
    : '<div class="movie-empty">Nothing found yet ♡</div>';
}
$("#hobbySearch").addEventListener("input", renderHobbies);
$("#hobbyCategory").addEventListener("change", renderHobbies);
$("#hobbyKind").addEventListener("change", renderHobbies);
function renderTracks() {
  $("#trackCount").textContent =
    `${songs.length} ${songs.length === 1 ? "track" : "tracks"} in the soundtrack`;
  $("#trackList").innerHTML = songs.length
    ? songs
        .map(
          (t, i) =>
            `<div class="track-row"><div class="track-icon">♫</div><div><div class="track-name">${escapeHTML(t.title)}</div><div class="track-sub">${escapeHTML(t.artist || "Unknown artist")}${t.mood ? " · " + escapeHTML(t.mood) : ""}</div></div><audio controls preload="metadata" src="${escapeHTML(t.src)}" aria-label="Play ${escapeHTML(t.title)}"></audio></div>`,
        )
        .join("")
    : '<div class="empty">Your soundtrack is waiting ♡<br><small>Add songs in your private archive dashboard.</small></div>';
}
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
$("#prevArchive").addEventListener("click", () => {
  archiveIndex--;
  updateArchiveCarousel();
});
$("#nextArchive").addEventListener("click", () => {
  archiveIndex++;
  updateArchiveCarousel();
});
window.addEventListener("resize", () =>
  requestAnimationFrame(updateArchiveCarousel),
);
$("#movieSearch").addEventListener("input", renderMovies);
$("#genreFilter").addEventListener("change", renderMovies);
$("#typeFilter").addEventListener("change", renderMovies);
filterRow.addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (!b) return;
  activeFilter = b.dataset.filter;
  currentIndex = 0;
  renderFilters();
  renderQuote();
});
$("#guestbookAnonymous").addEventListener("change", (event) => {
  const nameInput = $("#guestbookName");
  nameInput.disabled = event.target.checked;
  nameInput.required = !event.target.checked;
  if (event.target.checked) nameInput.value = "";
});
$("#guestbookForm").addEventListener("submit", submitGuestbook);
quoteStage.addEventListener("click", (e) => {
  const b = e.target.closest("[data-testimony]");
  if (!b) return;
  const t = testimonies[Number(b.dataset.testimony)];
  if (!t) return;
  showModal(
    {
      eyebrow: `guestbook · ${t.dynamic}`,
      title: `A note from ${t.name}`,
      body: `“${t.full}”`,
      tags: t.tags,
      note:
        t.source === "guestbook"
          ? "Shared by a visitor and approved for the archive."
          : `${t.date} · Example content: replace with a real message shared with permission.`,
      cover: "“",
      art:
        t.tone === "rose"
          ? "art-intro"
          : t.tone === "lilac"
            ? "art-ships"
            : t.tone === "butter"
              ? "art-dynamics"
              : "art-hobbies",
    },
    true,
  );
});
$("#prevQuote").addEventListener("click", () => {
  currentIndex--;
  renderQuote();
});
$("#nextQuote").addEventListener("click", () => {
  currentIndex++;
  renderQuote();
});
$("#modalClose").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", (e) => {
  if (e.target === $("#modalBackdrop")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (
    !$("#modalBackdrop").classList.contains("open") &&
    e.key === "ArrowLeft"
  ) {
    currentIndex--;
    renderQuote();
  }
  if (
    !$("#modalBackdrop").classList.contains("open") &&
    e.key === "ArrowRight"
  ) {
    currentIndex++;
    renderQuote();
  }
});
function renderCharacterMarquee() {
  const doubled = [...characterNames, ...characterNames];
  $("#characterTrack").innerHTML = doubled
    .map(
      (name) =>
        `<span class="character-pill"><span>✦</span>${escapeHTML(name)}</span>`,
    )
    .join("");
}
function initIntroSlideshow() {
  const slides = [...document.querySelectorAll("#introPhotoTrack img")];
  if (!slides.length) return;
  let active = 0;
  slides.forEach((img, i) => {
    img.classList.remove("is-active", "is-entering", "is-leaving");
    if (i === 0) img.classList.add("is-active");
  });
  window.setInterval(() => {
    const previous = slides[active];
    active = (active + 1) % slides.length;
    const next = slides[active];
    previous.classList.remove("is-active", "is-entering");
    next.classList.remove("is-leaving", "is-entering");
    previous.classList.add("is-leaving");
    next.classList.add("is-active", "is-entering");
    window.setTimeout(() => {
      previous.classList.remove("is-leaving");
      next.classList.remove("is-entering");
    }, 850);
  }, 3200);
}
document
  .querySelector('[data-quick="social"]')
  ?.addEventListener("click", () =>
    showModal(
      {
        eyebrow: "little directory · socials",
        title: "Where to find me",
        body: "Pick a little corner of mine to visit. ♡",
        socialLinks: [
          { label: "Valoureth", url: "https://t.me/Valoureth" },
          { label: "HEARTERMS", url: "https://t.me/HEARTERMS" },
          { label: "WeebsRent", url: "https://t.me/WeebsRent" },
        ],
        note: "See you there! ♡",
        cover: "⌁",
        art: "art-intro",
      },
      true,
    ),
  );
document
  .querySelector('[data-quick="services"]')
  ?.addEventListener("click", () =>
    showModal(
      {
        eyebrow: "little directory · requests & dates",
        title: "What I can do",
        body: [
          "⌖ BASIC REQUESTS",
          "Ava, name, typing style, and bio",
          "OTP unmute / mute",
          "VN talk or sing",
          "VN / OTP bedtime stories",
          "",
          "⌖ VIRTUAL DATES & ACTIVITIES",
          "Movie date on Rave or Hyperbeam",
          "Reading date (AU on X or e-book)",
          "Food date (bill on cust; please ask first)",
          "Listening date on Spotify",
          "Game date on Plato or Roblox",
          "Digital drawing or coloring date",
          "PAP activity (faceless or in muse)",
          "Deeptalk",
          "Stay up late (please ask first)",
          "",
          "⌖ OTHER REQUESTS",
          "IC as AU cast, ex, HTS, crush, family, idol, etc. (please ask first)",
          "Move platforms to Discord or LINE",
          "Public display of affection via story, channel, or profile (V/VIP only)",
        ].join("\n"),
        tags: ["requests open", "virtual dates", "ask-first activities"],
        note: [
          "A small note before requesting:",
          "• For OTP unmute in romantic dynamics, let's have a short session beforehand to see whether our dynamics work well together.",
          "• I'm 22, so interactions with anyone under 19 will stay platonic, okay? ♡",
        ].join("\n\n"),
        cover: "✦",
        art: "art-intro",
      },
      true,
    ),
  );
async function bootLittleArchive() {
  await loadArchiveEntries();
  $("#year").textContent = new Date().getFullYear();
  renderArchive();
  renderFilters();
  renderQuote();
  renderCharacterMarquee();
  initIntroSlideshow();
  loadApprovedGuestbook();
  renderMovies();
  renderShips();
  renderHobbies();
  renderTracks();
}
bootLittleArchive();
// Gentle reveal on scroll, with a graceful fallback for older browsers.
document
  .querySelectorAll(
    "#introduction .section-head,#about .section-head,#testimonials .section-head,.intro-panel,.archive-card,.quote-stage",
  )
  .forEach((el) => el.classList.add("reveal"));
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
} else {
  document
    .querySelectorAll(".reveal")
    .forEach((el) => el.classList.add("is-visible"));
}
