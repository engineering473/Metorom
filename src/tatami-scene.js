import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Procedural tatami weave texture — real tatami is woven igusa rush, which
// reads visually as fine parallel ridges + a subtle color variation. No
// external texture files needed.
function makeTatamiTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c2b573';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 5) {
    ctx.fillStyle = y % 10 === 0 ? 'rgba(90,80,30,0.18)' : 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, y, size, 2);
  }
  // subtle mottling
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(80,70,20,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function buildTatamiFloor() {
  const group = new THREE.Group();
  const texture = makeTatamiTexture();
  const matW = 1.8, matD = 0.9, matH = 0.06;
  const matMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0 });
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x1a1a18, roughness: 0.6 });

  // Simple 6-mat layout: two rows, alternating orientation per mat for the
  // classic tatami look (mats never share all four corners at one point).
  const layout = [
    { x: -matW, z: -matD / 2, rot: 0 },
    { x: 0, z: -matD / 2, rot: 0 },
    { x: matW, z: -matD / 2, rot: 0 },
    { x: -matW, z: matD / 2, rot: 0 },
    { x: 0, z: matD / 2, rot: 0 },
    { x: matW, z: matD / 2, rot: 0 }
  ];

  layout.forEach(({ x, z, rot }) => {
    const mat = new THREE.Mesh(new THREE.BoxGeometry(matW - 0.04, matH, matD - 0.04), matMat);
    mat.position.set(x, matH / 2, z);
    mat.rotation.y = rot;
    mat.receiveShadow = true;
    mat.castShadow = true;
    group.add(mat);

    const border = new THREE.Mesh(new THREE.BoxGeometry(matW, matH * 0.4, matD), borderMat);
    border.position.set(x, matH * 0.02, z);
    border.rotation.y = rot;
    group.add(border);
  });

  return group;
}

// A stylized, faceless, low-poly seated figure — deliberately abstract
// rather than an attempt at a realistic character.
function buildSeatedFigure() {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2b3a5c, roughness: 0.7 }); // indigo
  const skin = new THREE.MeshStandardMaterial({ color: 0xdcbd97, roughness: 0.6 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.42, 4, 12), cloth);
  torso.position.y = 0.5;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 16), skin);
  head.position.y = 0.88;
  head.castShadow = true;
  group.add(head);

  // Folded legs — two flattened, curved forms resting on the mat.
  [-1, 1].forEach(side => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 4, 10), cloth);
    leg.rotation.z = Math.PI / 2;
    leg.rotation.y = side * 0.5;
    leg.position.set(side * 0.22, 0.13, 0.15 * side);
    leg.scale.y = 0.85;
    leg.castShadow = true;
    group.add(leg);
  });

  // Hands resting on knees.
  [-1, 1].forEach(side => {
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), skin);
    hand.position.set(side * 0.34, 0.22, 0.28);
    hand.castShadow = true;
    group.add(hand);
  });

  return group;
}

export function initTatamiScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
  camera.position.set(2.6, 2.2, 3.4);
  camera.lookAt(0, 0.3, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a18, 0.5));
  const key = new THREE.DirectionalLight(0xffe9c9, 1.3);
  key.position.set(3, 4, 2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
  scene.add(key);

  const rig = new THREE.Group();
  rig.add(buildTatamiFloor());
  const figure = buildSeatedFigure();
  figure.position.set(0.9, 0.03, 0);
  rig.add(figure);
  scene.add(rig);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    requestAnimationFrame(animate);
    rig.rotation.y += 0.0015; // slow idle turn — calm, not spinny
    renderer.render(scene, camera);
  }
  animate();
}
