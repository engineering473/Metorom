import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const MODEL_URL = new URL(`${import.meta.env.BASE_URL}models/assembly.glb`, location.origin).href;
const FRONT_ROTATION_Y = -Math.PI / 2;
const EDGE_ANGLE_THRESHOLD = 15;
const MAX_TILT = 0.05;

const VIEWS = [
  { name: 'Front', ry: 0, rz: 0 },
  { name: 'Back', ry: Math.PI, rz: 0 },
  { name: 'Top', ry: Math.PI, rz: Math.PI / 2 },
];

const clamp01 = value => Math.min(1, Math.max(0, value));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = t => t < 0.5
  ? 4 * t * t * t
  : 1 - Math.pow(-2 * t + 2, 3) / 2;

function rotationAt(progress) {
  if (progress <= 0.5) {
    const t = easeInOutCubic(clamp01(progress * 2));
    return { ry: lerp(VIEWS[0].ry, VIEWS[1].ry, t), rz: 0 };
  }

  const t = easeInOutCubic(clamp01((progress - 0.5) * 2));
  return { ry: VIEWS[1].ry, rz: lerp(VIEWS[1].rz, VIEWS[2].rz, t) };
}

function viewNameAt(progress) {
  if (progress < 0.25) return VIEWS[0].name;
  if (progress < 0.75) return VIEWS[1].name;
  return VIEWS[2].name;
}

export function initScene({ canvas, sectionEl, onProgress = () => {}, onLoadProgress = () => {}, renderFallback = true, appearance = 'wireframe', captureFrames = false }) {
  if (!canvas || !sectionEl) {
    throw new Error('initScene requires canvas and sectionEl.');
  }

  let renderer;
  let observer;
  let resizeObserver;
  let frame = 0;
  let inView = false;
  let modelReady = false;
  let disposed = false;
  let failed = false;
  let progress = 0;
  let renderedProgress = 0;
  let modelRadius = 1;
  let modelSize = new THREE.Vector3(1, 1, 1);
  let lastWidth = 0;
  let lastHeight = 0;
  const pointer = { x: 0, y: 0 };
  const smoothedPointer = { x: 0, y: 0 };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.5);

  function showFallback() {
    if (disposed || failed || canvas.parentElement?.querySelector('[data-scene-fallback]')) return;
    failed = true;
    stopRendering();
    onLoadProgress(0, 'error');
    canvas.style.display = 'none';

    if (!renderFallback) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

    const message = document.createElement('div');
    message.dataset.sceneFallback = '';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    message.dataset.en = 'The 3D speaker view is unavailable on this device.';
    message.dataset.ja = 'この端末ではスピーカーの3D表示を利用できません。';
    message.textContent = document.documentElement.lang === 'ja' ? message.dataset.ja : message.dataset.en;
    Object.assign(message.style, {
      position: 'absolute',
      inset: '0',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      color: 'inherit',
      textAlign: 'center',
      background: '#171714',
    });
    parent.appendChild(message);
  }

  try {
    onLoadProgress(0, 'loading');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: captureFrames });
    renderer.setPixelRatio(pixelRatio());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (appearance === 'rendered') {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    }
  } catch (error) {
    console.warn('Could not start the 3D speaker view.', error);
    showFallback();
    return () => {};
  }

  canvas.setAttribute('role', 'img');

  const scene = new THREE.Scene();
  if (appearance === 'rendered') {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c2ae, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-4, 7, 9);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc7d9ee, 0.9);
    fill.position.set(6, 1, -5);
    scene.add(fill);
  }
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 500);
  const pivot = new THREE.Group();
  pivot.rotation.y = FRONT_ROTATION_Y;
  scene.add(pivot);
  const turntable = new THREE.Group();
  pivot.add(turntable);
  const zTurntable = new THREE.Group();
  turntable.add(zTurntable);

  function fitCamera() {
    const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
    const width = Math.max(modelSize.x, modelSize.z);
    const height = Math.max(modelSize.y, modelSize.z);
    const fitWidth = width / (2 * Math.tan(horizontalHalfFov));
    const fitHeight = height / (2 * Math.tan(verticalHalfFov));
    const distance = Math.max(fitWidth, fitHeight, modelRadius * 1.8) * 1.35 + modelRadius * 0.5;
    camera.position.set(0, modelRadius * 0.12, distance);
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(0.01, distance - modelRadius * 3);
    camera.far = distance + modelRadius * 4;
    camera.updateProjectionMatrix();
  }

  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width !== lastWidth || height !== lastHeight) {
      lastWidth = width;
      lastHeight = height;
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      fitCamera();
      startRendering();
    }
    updateProgress();
  }

  function updateProgress() {
    if (disposed) return;
    const rect = sectionEl.getBoundingClientRect();
    const scrollRange = Math.max(1, rect.height - window.innerHeight);
    progress = clamp01(-rect.top / scrollRange);
    onProgress(progress, viewNameAt(progress));
    startRendering();
  }

  function render() {
    frame = 0;
    if (disposed || failed || !inView || document.hidden || !modelReady) return;

    const smoothing = reducedMotion ? 1 : 0.14;
    renderedProgress = lerp(renderedProgress, progress, smoothing);
    smoothedPointer.x = lerp(smoothedPointer.x, pointer.x, smoothing);
    smoothedPointer.y = lerp(smoothedPointer.y, pointer.y, smoothing);
    const base = rotationAt(renderedProgress);
    turntable.rotation.x = -smoothedPointer.y * MAX_TILT;
    turntable.rotation.y = base.ry + smoothedPointer.x * MAX_TILT;
    zTurntable.rotation.z = base.rz;

    try {
      renderer.render(scene, camera);
    } catch (error) {
      console.warn('Could not render the 3D speaker view.', error);
      showFallback();
      return;
    }
    if (
      Math.abs(renderedProgress - progress) > 0.001 ||
      Math.abs(smoothedPointer.x - pointer.x) > 0.001 ||
      Math.abs(smoothedPointer.y - pointer.y) > 0.001
    ) {
      frame = requestAnimationFrame(render);
    }
  }

  function startRendering() {
    if (!frame && !disposed && !failed && inView && !document.hidden && modelReady) {
      frame = requestAnimationFrame(render);
    }
  }

  function stopRendering() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function onPointerMove(event) {
    if (reducedMotion) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = clamp01((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    pointer.y = clamp01((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    startRendering();
  }

  function onPointerLeave() {
    pointer.x = 0;
    pointer.y = 0;
    startRendering();
  }

  function onVisibilityChange() {
    if (document.hidden) stopRendering();
    else startRendering();
  }

  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  observer = new IntersectionObserver(entries => {
    inView = entries[0]?.isIntersecting ?? false;
    if (inView) startRendering();
    else stopRendering();
  }, { rootMargin: '80px 0px' });
  observer.observe(canvas);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(MODEL_URL, gltf => {
    if (disposed) return;
    try {
      onLoadProgress(92, 'preparing');
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) {
        showFallback();
        return;
      }
      const center = box.getCenter(new THREE.Vector3());
      modelSize = box.getSize(new THREE.Vector3());
      modelRadius = Math.max(modelSize.length() / 2, 0.01);
      model.position.sub(center);
      zTurntable.add(model);

      if (appearance === 'wireframe') {
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.72,
        });
        const surfaceMaterial = new THREE.MeshBasicMaterial({
          color: 0x11110f,
          transparent: true,
          opacity: 0.14,
          depthWrite: true,
        });
        model.traverse(object => {
          if (!object.isMesh) return;
          object.material = surfaceMaterial;
          object.add(new THREE.LineSegments(
            new THREE.EdgesGeometry(object.geometry, EDGE_ANGLE_THRESHOLD),
            edgeMaterial,
          ));
        });
      } else {
        // The GLB was exported with several named materials but default white
        // base colours. Restore the dark driver and trim treatment of the
        // supplied studio render while retaining its original textures.
        const materialColors = {
          'Soft Rubber': 0x252a26,
          'Warnex Black': 0x222723,
          'Special Yellow Kevlar': 0x202521,
          'Leather_-_Perforated_(Yellow)': 0x232923,
          'Fabric mesh': 0x343b35,
          'Dark metal': 0x343a35,
        };
        model.traverse(object => {
          if (!object.isMesh) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            const color = materialColors[material.name];
            if (color && material.color) material.color.setHex(color);
          });
        });
      }

      fitCamera();
      modelReady = true;
      startRendering();
      onLoadProgress(100, 'ready');
    } catch (error) {
      console.warn('Could not prepare the 3D speaker model.', error);
      showFallback();
    }
  }, event => {
    if (event.lengthComputable && event.total > 0) {
      onLoadProgress(Math.min(90, Math.floor(event.loaded / event.total * 90)), 'loading');
    }
  }, error => {
    console.warn('Could not load the speaker model.', error);
    showFallback();
  });

  function onContextLost(event) {
    event.preventDefault();
    showFallback();
  }
  canvas.addEventListener('webglcontextlost', onContextLost, { once: true });

  const dispose = () => {
    disposed = true;
    stopRendering();
    observer?.disconnect();
    resizeObserver?.disconnect();
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('scroll', updateProgress);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    scene.traverse(object => {
      if (object.isMesh || object.isLineSegments) object.geometry?.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      }
    });
    renderer.dispose();
  };

  // Used by the offline capture harness only. The site plays the resulting
  // video and does not load this scene for its scroll-controlled speaker.
  if (captureFrames) {
    dispose.captureAt = value => {
      if (!modelReady || disposed || failed) return false;
      stopRendering();
      const position = clamp01(value);
      const rotation = rotationAt(position);
      turntable.rotation.set(0, rotation.ry, 0);
      zTurntable.rotation.z = rotation.rz;
      renderer.render(scene, camera);
      return true;
    };
  }
  return dispose;
}
