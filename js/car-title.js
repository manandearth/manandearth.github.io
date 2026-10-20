(() => {
  const els = document.querySelectorAll('[data-car]');
  if (!els.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => 1 - Math.pow(1 - t, 3); // ease-out so it "brakes" into place
  let ticking = false;

  function update() {
    const vh = innerHeight, vw = innerWidth;
    els.forEach(el => {
      const car = el.querySelector('.car-title__car');
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const p = reduced ? 1 : clamp((vh - center) / (vh / 2));
      const distance = vw - r.left;            // from rest position to right edge
      car.style.transform = `translateX(${(1 - ease(p)) * distance}px)`;
    });
    ticking = false;
  }

  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  addEventListener('resize', update);
  update();
})();
