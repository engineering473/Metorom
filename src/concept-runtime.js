// Lightweight shared behaviour for the ten image-free concept studies.
const progressBar = document.querySelector('[data-scroll-progress] > span');

if (progressBar) {
  let scheduled = false;
  const updateProgress = () => {
    const distance = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 1;
    progressBar.style.transform = `scaleX(${progress})`;
    scheduled = false;
  };
  const requestProgress = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateProgress);
    }
  };
  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress, { passive: true });
  window.addEventListener('load', requestProgress, { once: true });
  requestProgress();
}
