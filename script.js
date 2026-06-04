/*
 * Ignacio Balasch Sola — Portfolio
 * Two pages share this script:
 *   - index.html       (data-page="main"):     polaroids + editorial + skills + intros
 *   - off-duty.html    (data-page="off-duty"): casual media
 * Builders no-op when their grid is missing, so the script is safe on both.
 */

// ---- MEDIA ---------------------------------------------------
// Every item:   { src, type, location, date, label? }
// type:         'image' | 'video'
// location:     "City, Country" — drives the pill text
// date:         "MM.YYYY" if confirmed, "YYYY" if approximate

const MIAH_LOC  = 'Barcelona, Spain';
const MIAH_DATE = '05.2026';

const polaroidFiles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,21,22];
const polaroids = polaroidFiles.map(n => ({
  type: 'image',
  src: `media/polaroids/Nacho_Polas_MIAH (${n}).jpg`,
  location: MIAH_LOC,
  date: MIAH_DATE,
}));

const editorial = [
  '0. Tier S/DSC07306.jpg',
  '2. Tier B/DSC07696.jpg',
  '0. Tier S/DSC07526.jpg',
  '0. Tier S/DSC07388.jpg',
  '1. Tier A/DSC07162.jpg',
  '2. Tier B/DSC07607.jpg',
  '1. Tier A/DSC07009.jpg',
  '2. Tier B/DSC07155.jpg',
  '2. Tier B/DSC07702.jpg',
].map(p => ({
  type: 'image',
  src: `media/editorial-shots/${p}`,
  location: MIAH_LOC,
  date: MIAH_DATE,
}));

const skills = [
  { type: 'video', src: 'media/skills/tennis.mp4',      label: 'Tennis',  location: 'Madrid, Spain',             date: '2023'   },
  { type: 'video', src: 'media/skills/golf.mp4',        label: 'Golf',    location: 'Madrid, Spain',             date: '05.2026' },
  { type: 'video', src: 'media/skills/ski.mp4',         label: 'Ski',     location: 'Benasque, Spain',           date: '03.2026' },
  { type: 'video', src: 'media/skills/raisingsail.mp4', label: 'Sailing', location: 'Mediterranean Sea',         date: '2024'   },
];

const intros = [
  { type: 'video', src: 'media/introductions/intro_english_horizontal.mp4', label: 'English', location: 'Self-Tape', date: '05.2026' },
  { type: 'video', src: 'media/introductions/intro_spanish_horizontal.mp4', label: 'Spanish', location: 'Self-Tape', date: '05.2026' },
];

// Sorted by date, most recent first.
const casual = [
  { type: 'video', src: 'media/casual/river.mp4',           label: 'River',       location: 'Rascafría, Spain',     date: '06.2026' },
  { type: 'image', src: 'media/casual/hike_smile.jpeg',     label: 'Hike',        location: 'Sitges, Spain',        date: '05.2026' },
  { type: 'image', src: 'media/casual/hike_serious.jpeg',   label: 'Hike',        location: 'Sitges, Spain',        date: '05.2026' },
  { type: 'image', src: 'media/casual/skiing_far.jpeg',     label: 'Ski',         location: 'Benasque, Spain',      date: '03.2026' },
  { type: 'video', src: 'media/casual/skiing.mp4',          label: 'Ski',         location: 'Benasque, Spain',      date: '03.2026' },
  { type: 'image', src: 'media/casual/alhambra.jpeg',       label: 'Alhambra',    location: 'Granada, Spain',       date: '12.2025' },
  { type: 'video', src: 'media/casual/palas.mp4',           label: 'Palas',       location: 'Sitges, Spain',        date: '08.2025' },
  { type: 'image', src: 'media/casual/dog_beach.jpeg',      label: 'Beach',       location: 'Sitges, Spain',        date: '08.2025' },
  { type: 'image', src: 'media/casual/desert.jpeg',         label: 'Desert',      location: 'Merzouga, Morocco',    date: '12.2024' },
  { type: 'image', src: 'media/casual/paddleboarding.jpeg', label: 'Paddleboard', location: 'Valencia, Spain',      date: '06.2024' },
  { type: 'image', src: 'media/casual/filomena.jpeg',       label: 'Filomena',    location: 'Madrid, Spain',        date: '01.2021' },
  { type: 'image', src: 'media/casual/madrid_door.jpeg',    label: 'Madrid',      location: 'Madrid, Spain',        date: '09.2020' },
];

// ---- PAGE-SCOPED LIGHTBOX LIST ------------------------------
const page = document.body.dataset.page || 'main';
const allItems = page === 'off-duty'
  ? casual
  : [...polaroids, ...editorial, ...skills, ...intros];

let currentIndex = 0;

// ---- BUILD HELPERS ------------------------------------------
function makeMetaPill(it) {
  if (!it.location && !it.date) return null;
  const pill = document.createElement('div');
  pill.className = 'meta-pill';
  if (it.location) {
    const loc = document.createElement('span');
    loc.className = 'meta-loc';
    loc.textContent = it.location;
    pill.appendChild(loc);
  }
  if (it.date) {
    const d = document.createElement('span');
    d.className = 'meta-date';
    d.textContent = it.date;
    pill.appendChild(d);
  }
  return pill;
}

function makeVideo(it, opts = {}) {
  const video = document.createElement('video');
  video.setAttribute('muted', '');
  if (opts.loop !== false) video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', opts.preload || 'metadata');
  video.muted = true;
  if (opts.loop !== false) video.loop = true;
  video.playsInline = true;
  if (it.label) video.setAttribute('aria-label', it.label);

  const source = document.createElement('source');
  source.src = it.src;
  source.type = 'video/mp4';
  video.appendChild(source);
  return video;
}

function autoPlayOnScroll(selector) {
  const vids = document.querySelectorAll(selector);
  if (!vids.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.intersectionRatio > 0.2) e.target.play().catch(() => {});
      else e.target.pause();
    });
  }, { threshold: 0.2 });
  vids.forEach((v) => obs.observe(v));
}

// ---- BUILD GALLERIES ----------------------------------------
function buildPhotoGrid(containerId, items, baseIndex) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach((it, i) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    const img = document.createElement('img');
    img.src = it.src;
    img.loading = 'lazy';
    img.alt = '';
    item.appendChild(img);
    const pill = makeMetaPill(it);
    if (pill) item.appendChild(pill);
    item.addEventListener('click', () => openLightbox(baseIndex + i));
    grid.appendChild(item);
  });
}

function buildIntroGrid() {
  const grid = document.getElementById('intro-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const introVideos = [];
  const baseIndex = polaroids.length + editorial.length + skills.length;

  intros.forEach((it, i) => {
    const item = document.createElement('div');
    item.className = 'video-item intro-item';

    // No loop attribute — sync controller restarts both manually
    const video = makeVideo(it, { loop: false, preload: 'auto' });
    const label = document.createElement('span');
    label.className = 'video-label';
    label.textContent = it.label;

    item.appendChild(video);
    item.appendChild(label);

    const pill = makeMetaPill(it);
    if (pill) item.appendChild(pill);

    item.addEventListener('click', () => openLightbox(baseIndex + i));
    grid.appendChild(item);

    introVideos.push(video);
  });

  syncIntroVideos(introVideos, grid);
}

function syncIntroVideos(vids, grid) {
  if (!vids.length) return;
  const ended = new Set();

  const playAll = () => {
    ended.clear();
    Promise.all(vids.map(v => {
      try { v.currentTime = 0; } catch (_) {}
      return v.play().catch(() => {});
    }));
  };

  const pauseAll = () => vids.forEach(v => v.pause());

  vids.forEach(v => {
    v.addEventListener('ended', () => {
      ended.add(v);
      if (ended.size === vids.length) playAll();
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.intersectionRatio > 0.2) playAll();
      else pauseAll();
    });
  }, { threshold: 0.2 });
  io.observe(grid);
}

function buildSkillsGrid() {
  const grid = document.getElementById('video-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const baseIndex = polaroids.length + editorial.length;

  skills.forEach((it, i) => {
    const item = document.createElement('div');
    item.className = 'video-item';

    item.appendChild(makeVideo(it));

    const label = document.createElement('span');
    label.className = 'video-label';
    label.textContent = it.label;
    item.appendChild(label);

    const pill = makeMetaPill(it);
    if (pill) item.appendChild(pill);

    item.addEventListener('click', () => openLightbox(baseIndex + i));
    grid.appendChild(item);
  });

  autoPlayOnScroll('#video-grid .video-item video');
}

function buildCasualGrid() {
  const grid = document.getElementById('casual-grid');
  if (!grid) return;
  grid.innerHTML = '';

  casual.forEach((it, i) => {
    const item = document.createElement('div');
    item.className = it.type === 'video' ? 'casual-item casual-video' : 'casual-item casual-image';

    if (it.type === 'video') {
      item.appendChild(makeVideo(it));
    } else {
      const img = document.createElement('img');
      img.src = it.src;
      img.loading = 'lazy';
      img.alt = it.label || '';
      item.appendChild(img);
    }

    const pill = makeMetaPill(it);
    if (pill) item.appendChild(pill);

    item.addEventListener('click', () => openLightbox(i));
    grid.appendChild(item);
  });

  autoPlayOnScroll('#casual-grid .casual-video video');
}

// ---- LIGHTBOX -----------------------------------------------
const lightbox = document.getElementById('lightbox');
const lbContent = lightbox ? lightbox.querySelector('.lb-content') : null;
const lbClose   = lightbox ? lightbox.querySelector('.lb-close')   : null;
const lbPrev    = lightbox ? lightbox.querySelector('.lb-prev')    : null;
const lbNext    = lightbox ? lightbox.querySelector('.lb-next')    : null;

function openLightbox(index) {
  currentIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderLightbox() {
  const item = allItems[currentIndex];
  const prevVid = lbContent.querySelector('video');
  if (prevVid) prevVid.pause();
  lbContent.innerHTML = '';

  if (item.type === 'image') {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.label || '';
    lbContent.appendChild(img);
  } else {
    const vid = document.createElement('video');
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    const source = document.createElement('source');
    source.src = item.src;
    source.type = 'video/mp4';
    vid.appendChild(source);
    lbContent.appendChild(vid);
  }

  const pill = makeMetaPill(item);
  if (pill) {
    pill.classList.add('lb-pill');
    lbContent.appendChild(pill);
  }

  lbPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
  lbNext.style.visibility = currentIndex < allItems.length - 1 ? 'visible' : 'hidden';
}

function closeLightbox() {
  const vid = lbContent.querySelector('video');
  if (vid) vid.pause();
  lbContent.innerHTML = '';
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function prevItem() { if (currentIndex > 0) { currentIndex--; renderLightbox(); } }
function nextItem() { if (currentIndex < allItems.length - 1) { currentIndex++; renderLightbox(); } }

if (lightbox) {
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prevItem(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); nextItem(); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevItem();
    if (e.key === 'ArrowRight')  nextItem();
  });
}

// ---- INIT ---------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (page === 'main') {
    buildPhotoGrid('polaroids-grid', polaroids, 0);
    buildPhotoGrid('editorial-grid', editorial, polaroids.length);
    buildSkillsGrid();
    buildIntroGrid();
  } else if (page === 'off-duty') {
    buildCasualGrid();
  }
});
