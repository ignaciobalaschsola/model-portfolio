/*
 * Ignacio Balasch Sola — Portfolio
 * Handles: polaroid + editorial galleries (with "See more"), video grid, lightbox
 */

// ---- MEDIA ---------------------------------------------------
// Order each list with the best shots FIRST — those become the
// initial "above the fold" selection. Rest reveal on "See more".

const polaroids = [
  // Best — shown initially
  'media/polaroids/Nacho_Polas_MIAH (1).jpg',
  'media/polaroids/Nacho_Polas_MIAH (2).jpg',
  'media/polaroids/Nacho_Polas_MIAH (3).jpg',
  'media/polaroids/Nacho_Polas_MIAH (4).jpg',
  'media/polaroids/Nacho_Polas_MIAH (5).jpg',
  'media/polaroids/Nacho_Polas_MIAH (6).jpg',
  // Rest — revealed on "See more"
  'media/polaroids/Nacho_Polas_MIAH (7).jpg',
  'media/polaroids/Nacho_Polas_MIAH (8).jpg',
  'media/polaroids/Nacho_Polas_MIAH (9).jpg',
  'media/polaroids/Nacho_Polas_MIAH (10).jpg',
  'media/polaroids/Nacho_Polas_MIAH (11).jpg',
  'media/polaroids/Nacho_Polas_MIAH (12).jpg',
  'media/polaroids/Nacho_Polas_MIAH (13).jpg',
  'media/polaroids/Nacho_Polas_MIAH (14).jpg',
  'media/polaroids/Nacho_Polas_MIAH (19).jpg',
  'media/polaroids/Nacho_Polas_MIAH (20).jpg',
  'media/polaroids/Nacho_Polas_MIAH (21).jpg',
  'media/polaroids/Nacho_Polas_MIAH (22).jpg',
];

const editorial = [
  // Featured — shown initially
  'media/editorial-shots/0. Tier S/DSC07306.jpg',
  'media/editorial-shots/2. Tier B/DSC07696.jpg',
  'media/editorial-shots/0. Tier S/DSC07526.jpg',
  'media/editorial-shots/0. Tier S/DSC07388.jpg',
  // Rest — revealed on "See more"
  'media/editorial-shots/1. Tier A/DSC07162.jpg',
  'media/editorial-shots/2. Tier B/DSC07607.jpg',
  'media/editorial-shots/1. Tier A/DSC07009.jpg',
  'media/editorial-shots/2. Tier B/DSC07155.jpg',
  'media/editorial-shots/2. Tier B/DSC07702.jpg',
];

const intros = [
  { src: 'media/introductions/intro_english_horizontal.mp4', label: 'English' },
  { src: 'media/introductions/intro_spanish_horizontal.mp4', label: 'Spanish' },
];

const videos = [
  { src: 'media/videos/tennis.mp4',      label: 'Tennis'  },
  { src: 'media/videos/golf.mp4',        label: 'Golf'    },
  { src: 'media/videos/ski.mp4',         label: 'Ski'     },
  { src: 'media/videos/raisingsail.mp4', label: 'Sailing' },
];

// Lightbox order: polaroids → editorial → videos → intros
const allItems = [
  ...polaroids.map(src => ({ type: 'image', src, alt: 'Polaroid' })),
  ...editorial.map(src => ({ type: 'image', src, alt: 'Editorial' })),
  ...videos.map(v => ({ type: 'video', src: v.src, alt: v.label })),
  ...intros.map(v => ({ type: 'video', src: v.src, alt: v.label })),
];

const POLAROIDS_OFFSET = 0;
const EDITORIAL_OFFSET = polaroids.length;
const VIDEOS_OFFSET    = polaroids.length + editorial.length;
const INTROS_OFFSET    = polaroids.length + editorial.length + videos.length;

let currentIndex = 0;

// ---- BUILD GALLERIES ----------------------------------------
function buildPhotoGrid(containerId, srcs, baseIndex) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';
  srcs.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = '';
    item.appendChild(img);
    item.addEventListener('click', () => openLightbox(baseIndex + i));
    grid.appendChild(item);
  });
}

function buildIntroGrid() {
  const grid = document.getElementById('intro-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const introVideos = [];

  intros.forEach((vid, i) => {
    const item = document.createElement('div');
    item.className = 'video-item intro-item';

    const video = document.createElement('video');
    // No loop attribute — sync controller restarts both manually
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('aria-label', vid.label);

    const source = document.createElement('source');
    source.src = vid.src;
    source.type = 'video/mp4';
    video.appendChild(source);

    const label = document.createElement('span');
    label.className = 'video-label';
    label.textContent = vid.label;

    item.appendChild(video);
    item.appendChild(label);
    item.addEventListener('click', () => openLightbox(INTROS_OFFSET + i));
    grid.appendChild(item);

    introVideos.push(video);
  });

  syncIntroVideos(introVideos, grid);
}

// Keep both intro videos in sync: start together; whichever ends first
// waits for the other to finish, then both restart from 0 together.
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
      if (e.intersectionRatio > 0.2) {
        playAll();
      } else {
        pauseAll();
      }
    });
  }, { threshold: 0.2 });
  io.observe(grid);
}

function buildVideoGrid() {
  const grid = document.getElementById('video-grid');
  grid.innerHTML = '';

  videos.forEach((vid, i) => {
    const item = document.createElement('div');
    item.className = 'video-item';

    const video = document.createElement('video');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('aria-label', vid.label);

    const source = document.createElement('source');
    source.src = vid.src;
    source.type = 'video/mp4';
    video.appendChild(source);

    const label = document.createElement('span');
    label.className = 'video-label';
    label.textContent = vid.label;

    item.appendChild(video);
    item.appendChild(label);
    item.addEventListener('click', () => openLightbox(VIDEOS_OFFSET + i));
    grid.appendChild(item);
  });

  observeVideos();
}

function observeVideos() {
  const vids = document.querySelectorAll('#video-grid .video-item video');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.intersectionRatio > 0.2) {
          e.target.play().catch(() => {});
        } else {
          e.target.pause();
        }
      });
    },
    { threshold: 0.2 }
  );
  vids.forEach((v) => obs.observe(v));
}

// ---- LIGHTBOX -----------------------------------------------
const lightbox = document.getElementById('lightbox');
const lbContent = lightbox.querySelector('.lb-content');
const lbClose   = lightbox.querySelector('.lb-close');
const lbPrev    = lightbox.querySelector('.lb-prev');
const lbNext    = lightbox.querySelector('.lb-next');

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
    img.alt = item.alt;
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

function prevItem() {
  if (currentIndex > 0) { currentIndex--; renderLightbox(); }
}

function nextItem() {
  if (currentIndex < allItems.length - 1) { currentIndex++; renderLightbox(); }
}

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

// ---- INIT ---------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  buildIntroGrid();
  buildPhotoGrid('polaroids-grid', polaroids, POLAROIDS_OFFSET);
  buildPhotoGrid('editorial-grid', editorial, EDITORIAL_OFFSET);
  buildVideoGrid();
});
