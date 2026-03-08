/*
 * Simple data-driven flow layout for the portfolio.
 * Each item has metadata used for previews and the lightbox.
 */
const mediaItems = [
  // photos (remaining)
  { type: 'image', src: 'media/photos/main.jpeg', alt: 'Editorial portrait', matchHeight: 'portrait' },
  // videos (remaining)
  { type: 'video', src: 'media/videos/tennis.mp4', alt: 'Tennis action' },
  { type: 'video', src: 'media/videos/golf.mp4', alt: 'Golf swing' },
  { type: 'video', src: 'media/videos/ski.mp4', alt: 'Skiing clip' },
  { type: 'video', src: 'media/videos/raisingsail.mp4', alt: 'Raising sail', size: 'xl' }
];



let buildCount = 0;
let lastContainerWidth = 0;

// preload image/video dimensions so we can calculate heights before layout
function preloadSizes() {
  const promises = mediaItems.map((item) => {
    if (item.type === 'image') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          item.imgWidth = img.naturalWidth;
          item.imgHeight = img.naturalHeight;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = item.src;
      });
    } else if (item.type === 'video') {
      return new Promise((resolve) => {
        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.onloadedmetadata = () => {
          item.videoWidth = vid.videoWidth;
          item.videoHeight = vid.videoHeight;
          resolve();
        };
        vid.onerror = () => resolve();
        vid.src = item.src;
      });
    }
    return Promise.resolve();
  });
  return Promise.all(promises);
}

function buildFlow() {
  console.log('buildFlow run', ++buildCount);

  const container = document.getElementById('portfolio');
  container.style.position = 'relative';
  container.innerHTML = ''; // clear previous items

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  // reset width cache on every build so Masonry can reflow values if container width changes
  mediaItems.forEach(item => delete item._w);

  const containerWidth = container.clientWidth;
  // Masonry handles columns and height; we simply supply items

  const baseWidth = 250; // you can adjust this constant to taste
  const portraitRef = mediaItems.find(
    (item) =>
      item.type === 'video' &&
      item.videoWidth &&
      item.videoHeight &&
      item.videoHeight > item.videoWidth
  );
  const portraitRefScale = portraitRef?.size === 'xl' ? 1.8 : portraitRef?.size === 'lg' ? 1.4 : 1;
  const portraitTargetHeight = portraitRef
    ? Math.round((portraitRef.videoHeight / portraitRef.videoWidth) * (baseWidth * portraitRefScale))
    : null;

  mediaItems.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'flow-item reveal';
    el.setAttribute('data-index', index);

    // fixed width for all items to eliminate randomness
    const sizeScale = item.size === 'xl' ? 1.8 : item.size === 'lg' ? 1.4 : 1;
    let w = Math.round(baseWidth * sizeScale);
    if (item.matchHeight === 'portrait' && portraitTargetHeight && item.imgWidth && item.imgHeight) {
      w = Math.round((portraitTargetHeight * item.imgWidth) / item.imgHeight);
    }
    el.style.width = w + 'px';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      el.appendChild(img);

      // compute height using stored aspect ratio if available
      if (item.imgWidth && item.imgHeight) {
        const h = (item.imgHeight / item.imgWidth) * w;
        el.style.height = h + 'px';
      }
    } else if (item.type === 'video') {
      const vid = document.createElement('video');
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.autoplay = true;
      vid.setAttribute('aria-label', item.alt || '');
      vid.preload = 'metadata';
      vid.style.width = w + 'px';
      const srcEl = document.createElement('source');
      srcEl.src = item.src;
      if (item.src.endsWith('.mp4')) srcEl.type = 'video/mp4';
      vid.appendChild(srcEl);
      el.appendChild(vid);

      // set height from preloaded dimensions if available
      if (item.videoWidth && item.videoHeight) {
        const h = (item.videoHeight / item.videoWidth) * w;
        vid.style.height = h + 'px';
      }

      vid.play().catch(() => {});
    }

    // wrap element in an anchor for lightGallery
      const link = document.createElement('a');
    // we still give href as hint but the gallery will open via JS
    link.href = item.src;
    link.appendChild(el);
    container.appendChild(link);

  });

  // Masonry takes care of container height
  observeVideos();
  lastContainerWidth = containerWidth;

  // initialize/reflow Masonry
  if (window.Masonry) {
    // destroy existing instance if width changed to avoid stale measurements
    if (container.msnry) {
      container.msnry.destroy();
      container.msnry = null;
    }
    container.msnry = new Masonry(container, {
      itemSelector: '.flow-item',
      columnWidth: '.flow-item',
      gutter: 20,
      fitWidth: true,
      percentPosition: true
    });

    // ensure layout after images/videos are ready
    if (window.imagesLoaded) {
      imagesLoaded(container, () => {
        container.msnry.layout();
      });
    }
  }
}

let videoObserver = null;
function observeVideos() {
  const vids = document.querySelectorAll('.flow-item video');
  if (videoObserver) {
    videoObserver.disconnect();
  }
  videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.intersectionRatio > 0.1) {
          en.target.play().catch(() => {});
        } else {
          en.target.pause();
        }
      });
    },
    { threshold: 0.1 }
  );
  vids.forEach((v) => videoObserver.observe(v));
}


function revealOnScroll() {
  const elems = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  elems.forEach((e) => obs.observe(e));
}

function addNoise() {
  const size = 100;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = 10; // low alpha for subtle noise
  }
  ctx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--noise-image', `url(${canvas.toDataURL()})`);
}

function debounce(fn, wait) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, wait);
  };
}


function init() {
  if (window.location.protocol === 'file:') {
    console.warn('file:// protocol detected – video galleries may fail. Run a simple HTTP server (e.g. `python -m http.server`) before testing.');
  }
  addNoise();
  // create lightbox instance now (will be reloaded after items are added)
  // gallery items are simple anchors; lightGallery will bind later

  let lastContainerWidth = 0;
  window.addEventListener('resize', debounce(() => {
    const container = document.getElementById('portfolio');
    const w = container.clientWidth;
    if (w !== lastContainerWidth) {
      lastContainerWidth = w;
      // recompute widths/heights then rebuild
      mediaItems.forEach((item) => delete item._w);
      buildFlow();
      revealOnScroll();
      initGallery();
    }
  }, 200));

  // preload dimensions then layout
  preloadSizes().then(() => {
    buildFlow();
    revealOnScroll();
    initGallery();
  });
}


// lightGallery initialization replaces the old Fancybox logic
function openSimpleMedia(item) {
  let overlay = document.getElementById('video-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'video-overlay';
    overlay.innerHTML = '<span class="close-btn">&times;</span>';
    document.body.appendChild(overlay);
    overlay.querySelector('.close-btn').addEventListener('click', () => {
      overlay.style.display = 'none';
      overlay.querySelector('video')?.pause();
      const media = overlay.querySelector('video, img');
      if (media) overlay.removeChild(media);
    });
  }

  let media;
  if (item.type === 'video') {
    media = document.createElement('video');
    media.controls = true;
    media.autoplay = true;
    media.src = item.src;
  } else {
    media = document.createElement('img');
    media.src = item.src;
    media.alt = item.alt || '';
  }
  overlay.appendChild(media);
  overlay.style.display = 'flex';
}

function initGallery() {
  const container = document.getElementById('portfolio');
  if (!container) return;

  // if we're testing via file://, skip lightGallery and use simple overlay
  if (window.location.protocol === 'file:') {
    const items = container.querySelectorAll('.flow-item');
    items.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(el.getAttribute('data-index'));
        const item = mediaItems[idx];
        if (item) {
          openSimpleMedia(item);
        }
      });
    });
    return;
  }

  if (!window.lightGallery) return;
  // destroy previous instance if present
  if (container.lgInstance) {
    container.lgInstance.destroy();
    container.lgInstance = null;
  }
  // build array of items for dynamic mode (avoid any XHR by providing html/video directly)
  const dynamicItems = mediaItems.map((item) => {
    if (item.type === 'video') {
      const videoItem = {
        video: {
          source: [{ src: item.src, type: 'video/mp4' }],
          attributes: {
            preload: 'metadata',
            controls: true,
            playsinline: true
          }
        }
      };
      if (item.poster) {
        videoItem.poster = item.poster;
        videoItem.thumb = item.poster;
      }
      return videoItem;
    }
    return { src: item.src };
  });

  const videoPlugin = window.lgVideo || null;
  container.lgInstance = lightGallery(container, {
    dynamic: true,
    dynamicEl: dynamicItems,
    plugins: videoPlugin ? [videoPlugin] : [],
    download: false,
    zoom: false,
    fullScreen: true,
    thumbWidth: 80,
    mobileSettings: {
      controls: true,
      showCloseIcon: false,
    }
  });

  // attach click handlers to links so that they trigger the dynamic gallery
  const items = container.querySelectorAll('.flow-item');
  items.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idx = Number(el.getAttribute('data-index'));
      if (Number.isFinite(idx) && container.lgInstance) {
        container.lgInstance.openGallery(idx);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
