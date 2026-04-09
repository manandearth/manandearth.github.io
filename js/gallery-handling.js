document.addEventListener('DOMContentLoaded', () => {

  const gallery = document.querySelector('.gallery');
  if (!gallery) return;  // page has no gallery, bail cleanly

  gallery.addEventListener('keydown', (e) => {
    const modal = gallery.querySelector('.modal');

    if (e.key === 'Escape') {
      modal.classList.remove('loaded', 'visible');
      return;
    }

    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

    // Only act while the modal is open
    if (!modal.classList.contains('visible')) return;

    const currentSrc = modal.querySelector('img').getAttribute('src');
    const links = Array.from(gallery.querySelectorAll('.inner article a.image'));
    const currentIndex = links.findIndex(a => a.getAttribute('href') === currentSrc);

    if (currentIndex === -1) return;

    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + links.length) % links.length;

    // Trigger the existing jQuery click handler on the target <a>
    links[nextIndex].click();
  });
});
