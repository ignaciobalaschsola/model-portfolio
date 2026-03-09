/*
 * Ignacio Balasch Sola — Portfolio
 * Handles: video grid, autoplay on scroll, composites, lightbox with navigation
 */

const videos = [
  { src: 'media/videos/tennis.mp4',      label: 'Tennis'  },
  { src: 'media/videos/golf.mp4',        label: 'Golf'    },
  { src: 'media/videos/ski.mp4',         label: 'Ski'     },
  { src: 'media/videos/raisingsail.mp4', label: 'Sailing' },
];

const photos = [
  { src: 'media/photos/headshot.jpg', alt: 'Headshot' },
  { src: 'media/photos/34shot.jpg',   alt: '3/4 shot' },
];

// Unified gallery: 0 = hero, 1-2 = composites, 3-6 = videos
const allItems = [
  { type: 'image', src: 'media/photos/main.jpeg', alt: 'Portrait' },
  ...photos.map(p => ({ type: 'image', src: p.src, alt: p.alt })),
  ...videos.map(v => ({ type: 'video', src: v.src, alt: v.label })),
];

let currentIndex = 0;

// BUILD VIDEO GRID ---------------------------------------------
function buildVideoGrid() {
  const grid = document.getElementById('video-grid');
  grid.innerHTML = '';

  videos.forEach((vid, i) => {
    const item = document.createElement('div');
    item.className = 'video-item';

    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
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

    // Offset by 1 (hero) + photos.length so index lines up with allItems
    item.addEventListener('click', () => openLightbox(1 + photos.length + i));
    grid.appendChild(item);
  });

  observeVideos();
}

// HERO PHOTO — click to open lightbox -------------------------
function initHeroPhoto() {
  const heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto) heroPhoto.addEventListener('click', () => openLightbox(0));
}

// COMPOSITES — wire up click handlers --------------------------
function initComposites() {
  document.querySelectorAll('.comp-item').forEach((el) => {
    const idx = parseInt(el.dataset.index, 10);
    el.addEventListener('click', () => openLightbox(idx));
  });
}

// INTERSECTION OBSERVER — play/pause videos on scroll ----------
function observeVideos() {
  const vids = document.querySelectorAll('.video-item video');
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

// LIGHTBOX -----------------------------------------------------
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

  // Pause any playing video before swapping content
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

// Event listeners
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

// INIT ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  buildVideoGrid();
  initHeroPhoto();
  initComposites();
});
