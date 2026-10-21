(() => {
  const items = document.querySelectorAll('.gallery.style2 article');
  if (!items.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('is-centered', e.isIntersecting));
  }, {
    // shrink the "viewport" to a 2%-wide strip in the middle of the screen
    rootMargin: '0px -49% 0px -49%',
    threshold: 0
  });

  items.forEach(el => io.observe(el));
})();
