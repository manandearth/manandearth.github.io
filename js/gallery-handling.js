document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  const links = Array.from(gallery.querySelectorAll('article a.image'));
  if (!links.length) return;

  // ---- Build lightbox (lives on <body>, so theme gallery CSS can't interfere) ----
  const lb = document.createElement('div');
  lb.className = 'gl-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <div class="gl-stage">
      <img class="gl-img" alt="">
    </div>
    <div class="gl-spinner" aria-hidden="true"></div>
    <div class="gl-caption"></div>
    <div class="gl-counter"></div>
    <button class="gl-btn gl-close" aria-label="Close">&times;</button>
    <button class="gl-btn gl-nav gl-prev" aria-label="Previous image">&#8249;</button>
    <button class="gl-btn gl-nav gl-next" aria-label="Next image">&#8250;</button>
  `;
  document.body.appendChild(lb);

  const stage   = lb.querySelector('.gl-stage');
  const img     = lb.querySelector('.gl-img');
  const caption = lb.querySelector('.gl-caption');
  const counter = lb.querySelector('.gl-counter');

  let current = -1;
  let token = 0;       // guards against out-of-order loads when navigating quickly
  let direction = 0;   // -1 = came from the left, 1 = from the right

  const srcOf = (i) => links[(i + links.length) % links.length].getAttribute('href');

  function preload(i) {
    const p = new Image();
    p.src = srcOf(i);
  }

  function show(index, dir = 0) {
    current = (index + links.length) % links.length;
    direction = dir;
    const myToken = ++token;
    const src = srcOf(current);

    // Clear the old image immediately: backdrop + spinner only until the new one is ready
    img.classList.remove('is-loaded');
    lb.classList.add('is-loading');
    lb.classList.remove('is-error');

    const capEl = links[current].closest('article').querySelector('.caption p');
    caption.textContent = capEl ? capEl.textContent : '';
    counter.textContent = `${current + 1} / ${links.length}`;

    const loader = new Image();
    loader.onload = () => {
      if (myToken !== token) return;            // user already moved on
      img.src = src;
      img.alt = caption.textContent;
      img.style.setProperty('--from', `${direction * 60}px`);
      lb.classList.remove('is-loading');
      // restart the fade/slide-in animation
      void img.offsetWidth;
      img.classList.add('is-loaded');
      preload(current + 1);
      preload(current - 1);
    };
    loader.onerror = () => {
      if (myToken !== token) return;
      lb.classList.remove('is-loading');
      lb.classList.add('is-error');
    };
    loader.src = src;
  }

  function open(index) {
    lb.classList.add('visible');
    document.documentElement.style.overflow = 'hidden';
    show(index);
  }

  function close() {
    token++;                                     // cancel any pending load
    lb.classList.remove('visible', 'is-loading');
    img.classList.remove('is-loaded');
    document.documentElement.style.overflow = '';
  }

  const next = () => show(current + 1, 1);
  const prev = () => show(current - 1, -1);

  // ---- Intercept thumbnail clicks before the theme's handler (capture phase) ----
  gallery.addEventListener('click', (e) => {
    const a = e.target.closest('a.image');
    if (!a || !gallery.contains(a)) return;
    e.preventDefault();
    e.stopPropagation();
    open(links.indexOf(a));
  }, true);

  // ---- Buttons / backdrop ----
  lb.querySelector('.gl-next').addEventListener('click', (e) => { e.stopPropagation(); next(); });
  lb.querySelector('.gl-prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  lb.querySelector('.gl-close').addEventListener('click', close);
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target === stage) close();
  });

  // ---- Keyboard (on document, so focus doesn't matter) ----
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('visible')) return;
    if (e.key === 'Escape')           close();
    else if (e.key === 'ArrowRight')  next();
    else if (e.key === 'ArrowLeft')   prev();
  });

  // ---- Touch: swipe left/right to navigate, swipe down to close ----
  let startX = 0, startY = 0, dx = 0, dy = 0, axis = null, tracking = false;

  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true;
    axis = null;
    dx = dy = 0;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    stage.style.transition = 'none';
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!tracking) return;
    dx = e.touches[0].clientX - startX;
    dy = e.touches[0].clientY - startY;
    if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axis === 'x')      stage.style.transform = `translateX(${dx}px)`;
    else if (axis === 'y' && dy > 0) stage.style.transform = `translateY(${dy}px)`;
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    if (!tracking) return;
    tracking = false;
    stage.style.transition = 'transform 0.2s ease';
    stage.style.transform = '';

    const threshold = Math.min(80, window.innerWidth * 0.2);
    if (axis === 'x' && Math.abs(dx) > threshold) {
      dx < 0 ? next() : prev();
    } else if (axis === 'y' && dy > 100) {
      close();
    }
  });

  stage.addEventListener('touchcancel', () => {
    tracking = false;
    stage.style.transition = 'transform 0.2s ease';
    stage.style.transform = '';
  });
});
