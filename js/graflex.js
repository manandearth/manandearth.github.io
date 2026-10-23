(() => {
  const els = document.querySelectorAll('[data-graflex]');
  if (!els.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => 1 - Math.pow(1 - t, 3); // ease-out so it "brakes" into place
  let ticking = false;

  function update() {
    const vh = innerHeight;
    const vw = window.screen.width;
    els.forEach(el => {
      const graflex = el.querySelector('.graflex__img');
      graflex.style.position = 'absolute';
      const r = el.getBoundingClientRect();
      const distance = vh - r.top; 
      
      console.log('distance', distance)
      console.log('vw', vw)
      graflex.style.opacity = 0;
      vw > 1023 ? vw > 1920 ? graflex.style.height = '20rem': graflex.style.height = '16rem': graflex.style.height = '25rem';
      vw > 1023 ? vw > 1920 ? graflex.style.transform = `translate(-32px, -279px) scale(${1 + Math.abs(distance)/1000})` : graflex.style.transform = `translate(-16px, -288px) scale(${1 + Math.abs(distance)/1000})` : graflex.style.transform = `translate(2px, -360px) scale(${1 + Math.abs(distance)/1000})` ;
      vw > 1023 ? graflex.style.opacity = `${0 + distance/1200}` : graflex.style.opacity = `${0 + distance/800}`;
      graflex.style['z-index'] = -1
    });
    ticking = false;
  }

  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  addEventListener('resize', update);
  update();
})();
