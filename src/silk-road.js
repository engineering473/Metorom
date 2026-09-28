const STOP_POSITIONS = [0, 0.33, 0.67, 1];
const SVG_NS = 'http://www.w3.org/2000/svg';

const clamp01 = value => Math.min(1, Math.max(0, value));

/**
 * Bind the Silk Road narrative to its SVG curve and the section's scroll range.
 * The section supplies the sticky layout; this module only measures and updates it.
 * Returns a cleanup function for callers that replace the section.
 */
export function initSilkRoad(section) {
  if (!section) return () => {};

  const path = section.querySelector('[data-road-path]');
  const progressPath = section.querySelector('[data-road-progress]');
  const stops = section.querySelector('[data-road-stops]');
  const panels = [...section.querySelectorAll('[data-road-panel]')];
  const count = section.querySelector('[data-road-count]');
  if (!path || !progressPath || !stops || panels.length !== 4) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const markers = STOP_POSITIONS.map((_, index) => {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.classList.add('road-stop');
    circle.setAttribute('data-road-stop-marker', String(index));
    circle.setAttribute('r', '6');
    circle.setAttribute('aria-hidden', 'true');
    stops.append(circle);
    return circle;
  });

  let pathLength = 0;
  let progressLength = 0;
  let activeIndex = -1;
  let lastProgress = -1;
  let frame = 0;

  const syncMotionPreference = () => {
    section.classList.toggle('is-reduced-motion', reducedMotion.matches);
  };

  const measurePath = () => {
    const pathData = path.getAttribute('d');
    if (pathData && progressPath.getAttribute('d') !== pathData) {
      progressPath.setAttribute('d', pathData);
    }

    pathLength = path.getTotalLength();
    progressLength = progressPath.getTotalLength();
    progressPath.style.strokeDasharray = `${progressLength} ${progressLength}`;

    // Convert path-local coordinates to the marker group's coordinates. This
    // also keeps markers on the curve if either SVG element is transformed.
    const pathMatrix = path.getCTM();
    const stopMatrix = stops.getCTM();
    const matrix = pathMatrix && stopMatrix
      ? stopMatrix.inverse().multiply(pathMatrix)
      : null;

    markers.forEach((marker, index) => {
      const point = path.getPointAtLength(pathLength * STOP_POSITIONS[index]);
      const x = matrix ? matrix.a * point.x + matrix.c * point.y + matrix.e : point.x;
      const y = matrix ? matrix.b * point.x + matrix.d * point.y + matrix.f : point.y;
      marker.setAttribute('cx', String(x));
      marker.setAttribute('cy', String(y));
    });
  };

  const update = () => {
    frame = 0;
    const bounds = section.getBoundingClientRect();
    const scrollRange = Math.max(1, bounds.height - window.innerHeight);
    const progress = clamp01(-bounds.top / scrollRange);

    if (Math.abs(progress - lastProgress) > 0.0001) {
      progressPath.style.strokeDashoffset = String(progressLength * (1 - progress));
      section.style.setProperty('--road-progress', String(progress));
      lastProgress = progress;
    }

    const nextActive = STOP_POSITIONS.reduce((nearest, position, index) =>
      Math.abs(progress - position) < Math.abs(progress - STOP_POSITIONS[nearest])
        ? index
        : nearest, 0);

    if (nextActive !== activeIndex) {
      activeIndex = nextActive;
      section.dataset.roadActive = String(activeIndex);
      if (count) count.textContent = String(activeIndex + 1).padStart(2, '0');
      panels.forEach((panel, index) => {
        const isActive = index === activeIndex;
        panel.classList.toggle('is-active', isActive);
        if (isActive) panel.setAttribute('aria-current', 'step');
        else panel.removeAttribute('aria-current');
      });
      markers.forEach((marker, index) => {
        marker.classList.toggle('is-active', index === activeIndex);
      });
    }

    markers.forEach((marker, index) => {
      marker.classList.toggle('is-past', STOP_POSITIONS[index] < progress);
    });
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  const onResize = () => {
    measurePath();
    lastProgress = -1;
    requestUpdate();
  };

  syncMotionPreference();
  measurePath();
  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', onResize);
  reducedMotion.addEventListener('change', syncMotionPreference);

  return () => {
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', onResize);
    reducedMotion.removeEventListener('change', syncMotionPreference);
    if (frame) window.cancelAnimationFrame(frame);
    markers.forEach(marker => marker.remove());
  };
}
