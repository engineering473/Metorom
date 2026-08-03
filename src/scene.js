import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const ASSEMBLY_URL = '/models/assembly.glb';

// Fixed orientation correction for the imported model.
const FRONT_ROTATION_Y = -Math.PI / 2;

// Clean line-art rendering instead of full shaded materials: each mesh's
// fill goes near-invisible and its real edges (silhouette + hard creases,
// not every triangulation diagonal) get drawn as thin lines. Flip to
// false to go back to the textured PBR look.
const WIREFRAME_MODE = true;
const EDGE_ANGLE_THRESHOLD = 15; // degrees — only edges sharper than this get a line

// Static labels shown on the right side of the viewer, always visible.
const SIDE_LABELS = ['Alpha 6A', 'BMS4540ND', 'LAB 12'];

const VIEWS = [
  { name: 'Front', rx: 0, ry: 0, rz: 0 },
  { name: 'Back', rx: 0, ry: Math.PI, rz: 0 },
  { name: 'Top', rx: 0, ry: Math.PI, rz: Math.PI / 2 }
];

const MAX_TILT = 0.05;

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(t) { return Math.min(Math.max(t, 0), 1); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function baseRotationFromProgress(progress) {
  if (progress <= 0.5) {
    const t = easeInOutCubic(clamp01(progress / 0.5));
    return {
      rx: lerp(VIEWS[0].rx, VIEWS[1].rx, t),
      ry: lerp(VIEWS[0].ry, VIEWS[1].ry, t),
      rz: 0
    };
  }
  const t = easeInOutCubic(clamp01((progress - 0.5) / 0.5));
  return {
    rx: VIEWS[1].rx,
    ry: VIEWS[1].ry,
    rz: lerp(VIEWS[1].rz, VIEWS[2].rz, t)
  };
}

export function initScene({ canvas, annotationsRoot, introEl, fillEl, readoutEl, sectionEl }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.05, 500);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe4e2dc, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  scene.add(fill);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShadowMaterial({ opacity: WIREFRAME_MODE ? 0 : 0.14 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // rig > pivot (fixed correction) > turntable (X/Y) > zTurntable (Z only) > model
  const rig = new THREE.Group();
  scene.add(rig);
  const pivot = new THREE.Group();
  pivot.rotation.y = FRONT_ROTATION_Y;
  rig.add(pivot);
  const turntable = new THREE.Group();
  pivot.add(turntable);
  const zTurntable = new THREE.Group();
  turntable.add(zTurntable);

  let progress = 0;

  const mouse = { x: 0, y: 0 };
  const mouseSmoothed = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(ASSEMBLY_URL, gltf => {
    const model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(center);
    zTurntable.add(model);

    const radius = size.length() / 2;
    camera.position.set(0, radius * 0.15, radius * 2.4);
    camera.lookAt(0, 0, 0);
    camera.near = radius * 0.02;
    camera.far = radius * 20;
    camera.updateProjectionMatrix();

    key.position.set(radius * 1.2, radius * 1.8, radius * 1.6);
    key.shadow.camera.left = -radius * 2.5;
    key.shadow.camera.right = radius * 2.5;
    key.shadow.camera.top = radius * 2.5;
    key.shadow.camera.bottom = -radius * 1.5;
    key.shadow.camera.far = radius * 6;
    key.shadow.bias = -0.0005;
    fill.position.set(-radius * 1.5, radius * 0.5, radius * 1.2);

    shadowPlane.scale.setScalar(radius * 10);
    shadowPlane.position.y = -size.y / 2 - radius * 0.02;

    const meshes = [];
    model.traverse(obj => { if (obj.isMesh) meshes.push(obj); });

    meshes.forEach(mesh => {
      mesh.castShadow = !WIREFRAME_MODE;
      mesh.receiveShadow = !WIREFRAME_MODE;

      if (WIREFRAME_MODE) {
        mesh.material = new THREE.MeshBasicMaterial({
          color: 0x0a0a0a,
          transparent: true,
          opacity: 0.15,
          depthWrite: true
        });
        const edges = new THREE.EdgesGeometry(mesh.geometry, EDGE_ANGLE_THRESHOLD);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
        );
        mesh.add(line);
      }
    });

    buildSideText();
  }, undefined, err => {
    console.error('Could not load /models/assembly.glb —', err);
  });

  // ---------- Static side text, always visible ----------
  function buildSideText() {
    annotationsRoot.innerHTML = '';
    SIDE_LABELS.forEach((text, idx) => {
      const div = document.createElement('div');
      div.className = 'annotation-label';
      div.textContent = text;
      div.style.opacity = 1;
      div.style.left = (window.innerWidth - 32 - 150) + 'px';
      div.style.top = (window.innerHeight * 0.35 + idx * 48) + 'px';
      annotationsRoot.appendChild(div);
    });
  }
  window.addEventListener('resize', buildSideText);

  const VIEW_CENTERS = { Front: 0, Back: 0.5, Top: 1 };
  function updateReadout() {
    const activeName = Object.entries(VIEW_CENTERS).sort(
      (a, b) => Math.abs(progress - a[1]) - Math.abs(progress - b[1])
    )[0][0];
    readoutEl.textContent = activeName;
  }

  function updateProgress() {
    const rect = sectionEl.getBoundingClientRect();
    const total = sectionEl.offsetHeight - window.innerHeight;
    const scrolledIntoSection = -rect.top;
    progress = clamp01(scrolledIntoSection / Math.max(total, 1));
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    mouseSmoothed.x = lerp(mouseSmoothed.x, mouse.x, 0.08);
    mouseSmoothed.y = lerp(mouseSmoothed.y, mouse.y, 0.08);

    const base = baseRotationFromProgress(progress);
    turntable.rotation.x = base.rx - mouseSmoothed.y * MAX_TILT;
    turntable.rotation.y = base.ry + mouseSmoothed.x * MAX_TILT;
    zTurntable.rotation.z = base.rz;

    updateReadout();
    fillEl.style.width = progress * 100 + '%';

    renderer.render(scene, camera);

    introEl.style.opacity = progress > 0.02 ? 0 : 1;
  }
  animate();
}
