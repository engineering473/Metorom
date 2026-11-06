"use client";

import { gsap } from "gsap";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WebGLErrorBoundary } from "@/components/ui/liquid-glass-carousel-utils/webgl-error-boundary";

export interface LiquidGlassCarouselItem {
  src: string;
  title: string;
  /** Width / height. Measured from the image when omitted. */
  aspect?: number;
  /** Normalized object-position, measured from the top-left. Originals stay intact. */
  focalPoint?: readonly [number, number];
}

export interface LiquidGlassCarouselProps {
  items?: LiquidGlassCarouselItem[];
  /** Zero-based photograph centered when the carousel first loads. */
  initialIndex?: number;
  /** Target panel height in CSS pixels. Scaled down when the container is shorter. */
  panelHeight?: number;
  gap?: number;
  background?: string;
  /** Play the rise-and-grow intro. Ignored when the user prefers reduced motion. */
  entry?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  showTitle?: boolean;
  labels?: {
    previous: string; next: string; view: string; close: string; help: string;
    loading?: string; error?: string;
    previewHelp?: string;
  };
  onActiveChange?: (index: number) => void;
  onFocusChange?: (focused: boolean) => void;
  /** Continue past the unused scroll track when leaving an open photograph. */
  onPreviewScroll?: (delta: number) => void;
  /** Native page progress through one complete turn, starting at initialIndex. */
  scrollProgress?: number;
  /** User arrows / horizontal dragging request a matching page position. */
  onScrollProgressChange?: (progress: number) => void;
  onReadyChange?: (ready: boolean) => void;
  onLoadProgress?: (progress: { completed: number; total: number; failed: number }) => void;
}

const PORTRAIT_ASPECT = 3 / 4;

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=1200&q=85&auto=format&fit=crop`;

export const liquidGlassCarouselDefaultItems: LiquidGlassCarouselItem[] = [
  {
    title: "Project One",
    src: photo("1600585154340-be6161a56a0c"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Two",
    src: photo("1514906689926-25ba6dcb584b"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Three",
    src: photo("1568557412756-7d219873dd11"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Four",
    src: photo("1581892805885-73bdd91beff0"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Five",
    src: photo("1482938289607-e9573fc25ebb"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Six",
    src: photo("1610846202780-b4d9837371ea"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Seven",
    src: photo("1527630941-4a229fd674ab"),
    aspect: PORTRAIT_ASPECT,
  },
  {
    title: "Project Eight",
    src: photo("1603786420263-ad59136a7409"),
    aspect: PORTRAIT_ASPECT,
  },
];

const LENS = {
  sizeX: 0.565,
  sizeY: 1,
  posX: 0.5,
  posY: 0.5,
  rotation: 65,
  spin: 0,
  zoom: 0,
  dispersion: 11,
  blur: 0,
  glow: 0,
  whiteGlow: 0,
  novaSize: 12,
  blueRing: 0,
  ringRadius: 0.49,
  ringWidth: 0.014,
  shimmer: true,
  shimmerFreq: 12,
  shimmerSpeed: 3.5,
  shimmerDepth: 0.12,
  rimStart: 0.578,
  rimTangential: 0.6,
  rimInward: 0,
  rimFreq1: 2,
  rimFreq2: 1,
  blueColor: "#009dff",
  rimLine: 0,
  rimLinePos: 0.488,
  rimLineWidth: 0.003,
  vignette: 0,
  vignetteSize: 0.3,
  samples: 16,
};

const FOCUS = {
  cardDuration: 0.7,
  focusDuration: 0.9,
  cardEase: "power4.out",
  focusEase: "power3.out",
  stagger: 0.06,
  dropDist: 1.4,
  centerScale: 1.18,
  lensFade: 0.85,
};

const ENTRY = {
  delay: 0.5,
  startH: 80,
  riseDuration: 1.0,
  stagger: 0.07,
  riseEase: "power3.out",
  fromBelow: 0.9,
  growDelay: 0.25,
  growDuration: 2.15,
  growEase: "expo.inOut",
  growStagger: 0.085,
  lensBloom: 1.4,
  lensBloomEase: "power2.inOut",
};

const LENS_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const LENS_FRAGMENT = /* glsl */ `
#define PI 3.14159265
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uSizeX;
uniform float uSizeY;
uniform float uAspect;
uniform float uZoom;
uniform float uDispersion;
uniform float uBlur;
uniform float uGlow;
uniform float uWhiteGlow;
uniform float uNovaSize;
uniform float uBlueRing;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uShimmer;
uniform float uShimmerFreq;
uniform float uShimmerSpeed;
uniform float uShimmerDepth;
uniform float uTime;
uniform float uRimStart;
uniform float uRimTangential;
uniform float uRimInward;
uniform float uRimFreq1;
uniform float uRimFreq2;
uniform vec3 uBlueColor;
uniform float uRimLine;
uniform float uRimLinePos;
uniform float uRimLineWidth;
uniform float uVignette;
uniform float uVignetteSize;
uniform float uShape;
uniform float uSquareRound;
uniform float uRotation;
uniform int uSamples;

const int MAX_SAMPLES = 16;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 discLens(vec2 center, float aspectCorrect, out float outA) {
  vec2 p = (vUv - center);
  p.x *= aspectCorrect;
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 halfSize = vec2(uSizeX, uSizeY);
  float dist = length(p / halfSize);
  outA = 0.0;

  float maskND;
  if (uShape > 0.5) {
    float corner = min(uSizeX, uSizeY) * clamp(uSquareRound, 0.0, 1.0);
    float sd = sdRoundBox(p, halfSize, corner);
    maskND = 1.0 + sd / min(uSizeX, uSizeY);
  } else {
    maskND = dist;
  }
  if (maskND > 1.0) return vec3(0.0);

  float shapeND = clamp(maskND, 0.0, 1.0);
  float nd = clamp(dist, 0.0, 1.0);
  vec2 offset = vUv - center;
  vec2 radialDir = normalize(offset + 1e-6);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
  float angle = atan(p.y, p.x);

  float pull = uZoom * 0.30 * (nd * nd);
  float rimStrength = smoothstep(uRimStart, 1.0, nd);
  float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
  float rScreen = (uSizeX + uSizeY) * 0.5;
  vec2 rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
  vec2 rimPull = -radialDir * rimStrength * rScreen * uRimInward;

  vec2 baseUV = center + offset * (1.0 - pull) + rimOff + rimPull;

  float rimMask = smoothstep(0.55, 1.0, nd);
  vec2 dispDir = offset * uDispersion * 0.004 * rimMask;
  int N = uSamples;
  if (N < 2) N = 2;
  if (N > MAX_SAMPLES) N = MAX_SAMPLES;
  vec3 col = vec3(0.0);
  vec3 caW = vec3(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= N) break;
    float t = float(i) / float(N - 1);
    vec2 sUV = baseUV + dispDir * (t - 0.5);
    vec3 s = texture2D(uTex, sUV).rgb;
    vec3 w = vec3(
      exp(-pow((t - 0.00) / 0.38, 2.0)),
      exp(-pow((t - 0.50) / 0.38, 2.0)),
      exp(-pow((t - 1.00) / 0.38, 2.0))
    );
    col += s * w;
    caW += w;
  }
  col /= max(caW, vec3(0.001));

  float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
  if (uBlur > 0.01 && blurFade > 0.01) {
    vec2 blurRad = vec2(uBlur) / uRes * blurFade;
    vec3 bcol = vec3(0.0);
    float btw = 0.0;
    for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
      for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
        vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
        float w = 1.0 - rr * 0.38;
        bcol += texture2D(uTex, baseUV + o).rgb * w;
        btw += w;
      }
    }
    col = mix(bcol / btw, col, rimMask);
  }

  // Refraction samples the original photograph without added light or grading.

  outA = smoothstep(1.0, 0.93, maskND);
  return col;
}

void main(){
  vec3 base = texture2D(uTex, vUv).rgb;
  vec3 outc = base;
  float a = 0.0;
  vec3 c = discLens(uCenter, uAspect, a);
  outc = mix(outc, c, a);
  if (uVignette > 0.001) {
    vec2 vc = vUv - 0.5;
    vc.x *= uAspect;
    float d = length(vc) / max(uVignetteSize, 0.0001);
    float vig = 1.0 - uVignette * smoothstep(0.5, 1.0, d);
    outc *= clamp(vig, 0.0, 1.0);
  }
  gl_FragColor = vec4(outc, 1.0);
  #include <colorspace_fragment>
}
`;

const LENS_FX_KEYS = [
  "uDispersion",
  "uBlueRing",
  "uRimLine",
  "uVignette",
  "uZoom",
  "uRimTangential",
  "uRimInward",
] as const;

const REPEATS = 4;
const CLICK_SLOP = 6;
const TOUCH_CLICK_SLOP = 12;
const FLICK_IDLE_MS = 90;

function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) {
    throw new Error("Index out of range.");
  }
  return item;
}

type PanelRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  poolIdx: number;
  srcIndex: number;
  centerX: number;
};

type PoolItem = {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  srcIndex: number;
  bound: boolean;
};

type Source = {
  tex: THREE.Texture | null;
  fullTex: THREE.Texture | null;
  aspect: number;
  imageAspect: number;
  locked: boolean;
};

export type LiquidGlassCarouselHandle = {
  closeFocus: () => void;
  openFocus: () => void;
  next: () => void;
  previous: () => void;
  setScrollProgress: (progress: number) => void;
  setPreviewOpen: (open: boolean) => void;
  destroy: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function hexToNumber(background: string) {
  const value = background.trim();
  if (value.startsWith("#") && (value.length === 7 || value.length === 4)) {
    const hex =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value;
    const parsed = Number.parseInt(hex.slice(1), 16);
    return Number.isFinite(parsed) ? parsed : 0xffffff;
  }
  return 0xffffff;
}

function createCarousel(
  mount: HTMLElement,
  cursorElement: HTMLElement | null,
  options: {
    items: LiquidGlassCarouselItem[];
    initialIndex: number;
    panelHeight: number;
    gap: number;
    background: string;
    entry: boolean;
    scrollProgress?: number;
    onActiveChange: (index: number) => void;
    onFocusChange: (open: boolean) => void;
    onPreviewOpen?: () => void;
    onEntryDone: (done: boolean) => void;
    onLoadingChange: (loading: boolean) => void;
    onReadyChange: (ready: boolean) => void;
    onLoadProgress: (progress: { completed: number; total: number; failed: number }) => void;
    onImageLoaded: (imageIndex: number) => void;
    onScrollProgressChange: (progress: number) => void;
    onFailure: (imageIndex?: number) => void;
  },
): LiquidGlassCarouselHandle | null {
  const reduced = prefersReducedMotion();
  const entryOn = options.entry && !reduced;
  const items = options.items;
  if (items.length === 0) return null;
  let disposed = false;
  let raf = 0;
  let running = true;
  let visible = false;
  let hasBeenVisible = false;
  let entryStarted = false;
  let previewOpen = false;
  const scrollDriven = options.scrollProgress !== undefined;
  let controlledProgress = Math.max(0, Math.min(1, options.scrollProgress ?? 0));
  let prepared = false;
  let programsWarmed = false;
  const settled = new Set<number>();
  const imageFailures = new Set<number>();
  const imageTimers = new Map<number, ReturnType<typeof setTimeout>>();

  let W = Math.max(1, mount.clientWidth);
  let H = Math.max(1, mount.clientHeight);
  const panelHFor = () =>
    Math.max(120, Math.min(options.panelHeight, Math.round(H * 0.68), W * 0.76 / PORTRAIT_ASPECT));
  let PANEL_H = panelHFor();
  const GAP = options.gap;
  const EASE = reduced ? 0.28 : 0.09;
  const SNAP_EASE = reduced ? 0.22 : 0.05;
  const WHEEL = 1.4;
  const DRAG = 1.6;
  const TOUCH_DRAG = 1;
  const TOUCH_EASE = 0.22;
  const FRICTION = 0.865;
  const SNAP_IDLE_MS = 120;
  const SHRINK_MAX = 60;
  const SHRINK_ATTACK = 0.25;
  const SHRINK_DECAY = 0.06;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.setClearColor(hexToNumber(options.background), 1);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.style.userSelect = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -W / 2,
    W / 2,
    H / 2,
    -H / 2,
    -100,
    100,
  );
  camera.position.z = 10;

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const sources: Source[] = items.map(img => ({
    tex: null,
    fullTex: null,
    aspect: img.aspect || PORTRAIT_ASPECT,
    imageAspect: img.aspect || PORTRAIT_ASPECT,
    locked: img.aspect != null,
  }));

  function settleImage(imageIndex: number, failed: boolean) {
    if (disposed || settled.has(imageIndex)) return false;
    settled.add(imageIndex);
    const timer = imageTimers.get(imageIndex);
    if (timer) clearTimeout(timer);
    imageTimers.delete(imageIndex);
    if (failed) {
      imageFailures.add(imageIndex);
      if (imageIndex === options.initialIndex && entryOn && !entryStarted) {
        entryStarted = true;
        entryActive = false;
        entrySettled = false;
        pEntry.fill(1);
        growArr.fill(1);
        focusState.lensFx = 1;
        options.onEntryDone(true);
      }
      options.onFailure(imageIndex);
    } else options.onImageLoaded(imageIndex);
    options.onLoadProgress({ completed: settled.size, total: items.length, failed: imageFailures.size });
    startLoop();
    return true;
  }

  function loadSources() {
    options.onReadyChange(false);
    options.onLoadProgress({ completed: 0, total: items.length, failed: 0 });
    // Request the selected photo and its immediate neighbours first.
    const order = Array.from({ length: items.length }, (_, index) => index).sort((a, b) => {
      const distance = (index: number) => Math.min((index - options.initialIndex + items.length) % items.length, (options.initialIndex - index + items.length) % items.length);
      return distance(a) - distance(b);
    });
    for (const imageIndex of order) {
      const img = items[imageIndex];
      const source = sources[imageIndex];
      imageTimers.set(imageIndex, setTimeout(() => settleImage(imageIndex, true), 15000));
      loader.load(img.src, async tex => {
        if (disposed || settled.has(imageIndex)) { tex.dispose(); return; }
        try {
          const image = tex.image as HTMLImageElement;
          if (typeof image.decode === "function") await image.decode();
          if (disposed || settled.has(imageIndex)) { tex.dispose(); return; }
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          tex.colorSpace = THREE.SRGBColorSpace;
          if (!source.locked && image) source.aspect = image.width / image.height;
          const imageAspect = image.width / image.height;
          source.imageAspect = imageAspect;
          const repeatX = Math.min(1, source.aspect / imageAspect);
          const repeatY = Math.min(1, imageAspect / source.aspect);
          const focal = img.focalPoint ?? [0.5, 0.5];
          tex.repeat.set(repeatX, repeatY);
          tex.offset.set((1 - repeatX) * Math.max(0, Math.min(1, focal[0])), (1 - repeatY) * (1 - Math.max(0, Math.min(1, focal[1]))));
          // Upload before completion so a photo's first frame is never blank.
          renderer.initTexture(tex);
          source.tex = tex;
          source.fullTex = tex.clone();
          source.fullTex.needsUpdate = true;
          recomputeTotal();
          if (scrollDriven) {
            target = controlledTarget();
            scroll = target;
          } else if (!userInteracted) {
            scroll = centerForIndex(options.initialIndex);
            target = scroll;
          }
          options.onLoadingChange(!at(sources, centerIndex(scroll)).tex);
          settleImage(imageIndex, false);
          maybeStartEntry();
        } catch {
          tex.dispose();
          settleImage(imageIndex, true);
        }
      }, undefined, () => settleImage(imageIndex, true));
    }
  }

  function slotWidth(srcIndex: number) {
    return at(sources, srcIndex).aspect * PANEL_H + GAP;
  }

  let offsets: number[] = [];
  let totalWidth = 0;
  function recomputeTotal() {
    offsets = [];
    let acc = 0;
    for (let i = 0; i < sources.length; i++) {
      offsets.push(acc);
      acc += slotWidth(i);
    }
    totalWidth = acc;
  }
  recomputeTotal();

  function centerForIndex(idx: number) {
    const N = sources.length;
    const loop = Math.floor(idx / N);
    const s = ((idx % N) + N) % N;
    return at(offsets, s) + slotWidth(s) / 2 - GAP / 2 + loop * totalWidth;
  }

  function controlledTarget() {
    return centerForIndex(options.initialIndex) + controlledProgress * totalWidth;
  }

  function setScrollProgress(progress: number) {
    controlledProgress = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
    if (!scrollDriven) return;
    userInteracted = true;
    velocity = 0;
    if (!focusState.active) target = controlledTarget();
  }

  function requestScrollProgress(progress: number) {
    setScrollProgress(progress);
    options.onScrollProgressChange(controlledProgress);
  }

  function nearestIndex(value: number) {
    if (!totalWidth) return 0;
    const N = sources.length;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        best = i + k * N;
      }
    }
    return best;
  }

  function centerIndex(value: number) {
    if (!totalWidth) return 0;
    let bestI = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sources.length; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        bestI = i;
      }
    }
    return bestI;
  }

  let lastCenter = -1;
  const pool: PoolItem[] = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < sources.length; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xdddddd,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat);
      mesh.visible = false;
      scene.add(mesh);
      pool.push({ mesh, mat, srcIndex: i, bound: false });
    }
  }

  let scroll = scrollDriven ? controlledTarget() : centerForIndex(options.initialIndex);
  let target = scroll;
  let userInteracted = false;
  let velocity = 0;
  let prevScroll = 0;
  let scrollEnergy = 0;
  let pendingFocus: { srcIndex: number } | null = null;
  let lastInput = performance.now();
  let snapped = false;

  const rt = new THREE.WebGLRenderTarget(W * dpr, H * dpr);
  const lensScene = new THREE.Scene();
  const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const lensUniforms = {
    uTex: { value: rt.texture },
    uRes: { value: new THREE.Vector2(W * dpr, H * dpr) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uSizeX: { value: LENS.sizeX },
    uSizeY: { value: LENS.sizeY },
    uShape: { value: 0 },
    uSquareRound: { value: 0 },
    uRotation: { value: 0 },
    uAspect: { value: W / H },
    uZoom: { value: LENS.zoom },
    uDispersion: { value: LENS.dispersion },
    uBlur: { value: LENS.blur },
    uGlow: { value: LENS.glow },
    uWhiteGlow: { value: LENS.whiteGlow },
    uNovaSize: { value: LENS.novaSize },
    uBlueRing: { value: LENS.blueRing },
    uRingRadius: { value: LENS.ringRadius },
    uRingWidth: { value: LENS.ringWidth },
    uShimmer: { value: reduced || !LENS.shimmer ? 0 : 1 },
    uShimmerFreq: { value: LENS.shimmerFreq },
    uShimmerSpeed: { value: LENS.shimmerSpeed },
    uShimmerDepth: { value: LENS.shimmerDepth },
    uTime: { value: 0 },
    uRimStart: { value: LENS.rimStart },
    uRimTangential: { value: LENS.rimTangential },
    uRimInward: { value: LENS.rimInward },
    uRimFreq1: { value: LENS.rimFreq1 },
    uRimFreq2: { value: LENS.rimFreq2 },
    uBlueColor: { value: new THREE.Color(LENS.blueColor) },
    uRimLine: { value: LENS.rimLine },
    uRimLinePos: { value: LENS.rimLinePos },
    uRimLineWidth: { value: LENS.rimLineWidth },
    uVignette: { value: LENS.vignette },
    uVignetteSize: { value: LENS.vignetteSize },
    uSamples: { value: LENS.samples },
  };
  const lensMat = new THREE.ShaderMaterial({
    uniforms: lensUniforms as unknown as THREE.ShaderMaterial["uniforms"],
    vertexShader: LENS_VERTEX,
    fragmentShader: LENS_FRAGMENT,
  });
  const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat);
  lensScene.add(lensQuad);

  const focusState = {
    active: false,
    closing: false,
    srcIndex: -1,
    poolIdx: -1,
    lensFx: entryOn ? 0 : 1,
    anim: null as gsap.core.Timeline | null,
  };
  const drop = new Array(REPEATS * sources.length).fill(0);
  let focusScale = 1;
  let focusProgress = 0;
  const lastCenterX: Array<number | undefined> = new Array(
    REPEATS * sources.length,
  );
  const pEntry = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryActive = entryOn;
  let entrySettled = false;
  const growArr = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryAnim: gsap.core.Timeline | null = null;

  const lensFxFull: Record<(typeof LENS_FX_KEYS)[number], number> = {
    uDispersion: lensUniforms.uDispersion.value,
    uBlueRing: lensUniforms.uBlueRing.value,
    uRimLine: lensUniforms.uRimLine.value,
    uVignette: lensUniforms.uVignette.value,
    uZoom: lensUniforms.uZoom.value,
    uRimTangential: lensUniforms.uRimTangential.value,
    uRimInward: lensUniforms.uRimInward.value,
  };

  let panelRects: PanelRect[] = [];
  let centeredPanel: {
    srcIndex: number;
    centerX: number;
    wPx: number;
    h: number;
    poolIdx: number;
  } | null = null;

  function layout() {
    panelRects = [];
    centeredPanel = null;
    let centeredDist = Infinity;
    const half = W / 2;
    const buffer = PANEL_H;
    pool.forEach((p, poolIdx) => {
      const rep = Math.floor(poolIdx / sources.length);
      const i = p.srcIndex;
      const src = at(sources, i);
      const slotCenterInLoop = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      let x = slotCenterInLoop - scroll;
      x = ((x % totalWidth) + totalWidth) % totalWidth;
      x += (rep - Math.floor(REPEATS / 2)) * totalWidth;
      if (x > half + totalWidth) x -= totalWidth * REPEATS;

      const centerX = x;
      const inEntry = entryActive || entrySettled;
      if (!inEntry && (centerX < -half - buffer || centerX > half + buffer)) {
        p.mesh.visible = false;
        lastCenterX[poolIdx] = undefined;
        return;
      }
      lastCenterX[poolIdx] = centerX;

      const shrink = 1 - 0.25 * scrollEnergy;
      const h = PANEL_H * shrink;
      const wPx = src.aspect * PANEL_H * shrink;

      const isFocused = focusState.active && focusState.poolIdx === poolIdx;
      const texture = isFocused && src.fullTex ? src.fullTex : src.tex;
      if (isFocused && src.fullTex && src.tex) {
        src.fullTex.repeat.set(
          src.tex.repeat.x + (1 - src.tex.repeat.x) * focusProgress,
          src.tex.repeat.y + (1 - src.tex.repeat.y) * focusProgress,
        );
        src.fullTex.offset.copy(src.tex.offset).multiplyScalar(1 - focusProgress);
      }
      if (texture && p.mat.map !== texture) {
        p.mat.map = texture;
        p.mat.color.set(0xffffff);
        p.mat.needsUpdate = true;
        p.bound = true;
      }

      let y = 0;
      const d = drop[poolIdx] || 0;
      let drawW = wPx;
      let drawH = h;
      if (isFocused) {
        drawW = wPx * (1 + (src.imageAspect / src.aspect - 1) * focusProgress) * focusScale;
        drawH = h * focusScale;
      } else if (d > 0) {
        y = -d * H * FOCUS.dropDist;
      }

      p.mesh.visible = true;
      let finalX = centerX;
      let finalY = y;
      let finalW = drawW;
      let finalH = drawH;
      if (entryActive || entrySettled) {
        const pe = pEntry[poolIdx] || 0;
        const g = growArr[poolIdx] || 0;
        const curH = ENTRY.startH + (drawH - ENTRY.startH) * g;
        finalH = curH;
        finalW = curH * src.aspect;

        const cSrc = centerIndex(scroll);
        let di = i - cSrc;
        if (di > sources.length / 2) di -= sources.length;
        if (di < -sources.length / 2) di += sources.length;
        const N = sources.length;
        const midRep = Math.floor(REPEATS / 2);
        if (rep !== midRep) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const slotH = (s: number) => {
          const gg = growArr[midRep * N + s] || 0;
          return ENTRY.startH + (PANEL_H - ENTRY.startH) * gg;
        };
        let off = 0;
        if (di > 0) {
          for (let k = 0; k < di; k++) {
            const sa = (((cSrc + k) % N) + N) % N;
            const sb = (((cSrc + k + 1) % N) + N) % N;
            off +=
              (at(sources, sa).aspect * slotH(sa) +
                at(sources, sb).aspect * slotH(sb)) /
                2 +
              GAP;
          }
        } else if (di < 0) {
          for (let k = 0; k < -di; k++) {
            const sa = (((cSrc - k) % N) + N) % N;
            const sb = (((cSrc - k - 1) % N) + N) % N;
            off -=
              (at(sources, sa).aspect * slotH(sa) +
                at(sources, sb).aspect * slotH(sb)) /
                2 +
              GAP;
          }
        }
        finalX = off;
        if (finalX < -half - buffer || finalX > half + buffer) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const below = -H * ENTRY.fromBelow;
        finalY = below + (y - below) * pe;
      }

      p.mesh.position.set(finalX, finalY, 0);
      p.mesh.scale.set(finalW, finalH, 1);

      const sx = centerX + W / 2;
      const sy = H / 2 - y;
      panelRects.push({
        left: sx - drawW / 2,
        right: sx + drawW / 2,
        top: sy - drawH / 2,
        bottom: sy + drawH / 2,
        poolIdx,
        srcIndex: i,
        centerX,
      });

      if (Math.abs(centerX) < centeredDist) {
        centeredDist = Math.abs(centerX);
        centeredPanel = { srcIndex: i, centerX, wPx, h, poolIdx };
      }
    });
  }

  function panelAtPointer(px: number, py: number) {
    for (const r of panelRects) {
      if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
        return r;
      }
    }
    return null;
  }

  function localPoint(e: { clientX: number; clientY: number }) {
    const rect = renderer.domElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const el = renderer.domElement;
  let dragging = false;
  let dragPointerId: number | null = null;
  let dragLastX = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragActivated = false;
  let dragDist = 0;
  let dragVel = 0;
  let dragMoveT = 0;
  let suppressClick = false;
  let dragPointerType = "mouse";
  let lastPointerX = Number.NaN;
  let lastPointerY = Number.NaN;
  let pointerInside = false;
  let lastPointerType = "mouse";

  if (cursorElement) {
    gsap.set(cursorElement, {
      xPercent: 20,
      yPercent: 30,
      scale: 0,
      autoAlpha: 0,
    });
  }
  const moveX = cursorElement
    ? gsap.quickTo(cursorElement, "x", { duration: 0.5, ease: "power3.out" })
    : null;
  const moveY = cursorElement
    ? gsap.quickTo(cursorElement, "y", { duration: 0.5, ease: "power3.out" })
    : null;

  let overPanel = false;
  let hoverPanel = false;
  let cursorNow = "";
  function setCursor(v: string) {
    if (v === cursorNow) return;
    cursorNow = v;
    el.style.cursor = v;
  }

  function updateCursor() {
    if (focusState.active || entryActive || entrySettled) return setCursor("");
    if (dragging) return setCursor("grabbing");
    if (!hoverPanel) return setCursor("");
    return setCursor("grab");
  }

  function setHover(on: boolean) {
    hoverPanel = on;
    setView(on);
  }

  function refreshHover() {
    if (!pointerInside || lastPointerType !== "mouse") return;
    if (!Number.isFinite(lastPointerX)) return;
    if (focusState.active) {
      setHover(false);
      return;
    }
    setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
  }

  function setView(on: boolean) {
    if (entryActive || entrySettled) on = false;
    if (dragging) on = false;
    if (on === overPanel) {
      updateCursor();
      return;
    }
    overPanel = on;
    updateCursor();
    if (!cursorElement) return;
    gsap.killTweensOf(cursorElement, "scale,autoAlpha,opacity,visibility");
    gsap.to(cursorElement, {
      scale: on ? 1 : 0,
      autoAlpha: on ? 1 : 0,
      duration: on ? 0.35 : 0.25,
      ease: on ? "power3.out" : "power3.in",
    });
  }

  function inputLocked() {
    return !prepared || focusState.active || entryActive || entrySettled;
  }

  function onWheel(e: WheelEvent) {
    // Leave ordinary vertical page scrolling available above the gallery.
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !e.shiftKey) return;
    if (inputLocked()) return;
    e.preventDefault();
    userInteracted = true;
    pendingFocus = null;
    if (scrollDriven) requestScrollProgress(controlledProgress + (e.shiftKey ? e.deltaY : e.deltaX) * WHEEL / totalWidth);
    else target += (e.shiftKey ? e.deltaY : e.deltaX) * WHEEL;
    lastInput = performance.now();
    snapped = false;
  }

  function onPointerDown(e: PointerEvent) {
    suppressClick = false;
    if (inputLocked()) return;
    if (dragging) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragging = true;
    dragPointerId = e.pointerId;
    dragPointerType = e.pointerType || "mouse";
    dragActivated = dragPointerType === "mouse";
    if (dragActivated) {
      try { el.setPointerCapture(e.pointerId); } catch { /* best effort */ }
    }
    const p = localPoint(e);
    dragStartX = p.x;
    dragStartY = p.y;
    dragLastX = p.x;
    lastPointerX = p.x;
    lastPointerY = p.y;
    dragDist = 0;
    dragVel = 0;
    dragMoveT = performance.now();
    setView(false);
    velocity = 0;
    pendingFocus = null;
    userInteracted = true;
    snapped = false;
    lastInput = dragMoveT;
  }

  function onPointerMove(e: PointerEvent) {
    const p = localPoint(e);
    if (dragging && e.pointerId === dragPointerId) {
      if (!dragActivated) {
        const dx = p.x - dragStartX;
        const dy = p.y - dragStartY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          dragging = false;
          dragPointerId = null;
          return;
        }
        dragActivated = true;
        try { el.setPointerCapture(e.pointerId); } catch { /* best effort */ }
      }
      const sens = dragPointerType === "mouse" ? DRAG : TOUCH_DRAG;
      const dx = p.x - dragLastX;
      dragLastX = p.x;
      dragDist += Math.abs(dx);
      if (scrollDriven) requestScrollProgress(controlledProgress - dx * sens / totalWidth);
      else target -= dx * sens;
      dragVel = dragVel * 0.6 + -dx * sens * 0.4;
      dragMoveT = performance.now();
      lastInput = dragMoveT;
      snapped = false;
    }
    lastPointerX = p.x;
    lastPointerY = p.y;
    lastPointerType = e.pointerType || "mouse";
    pointerInside = true;
    if (e.pointerType !== "mouse") return;
    if (moveX) moveX(p.x);
    if (moveY) moveY(p.y);
    if (focusState.active) {
      setHover(false);
      return;
    }
    setHover(panelAtPointer(p.x, p.y) !== null);
  }

  function onPointerUp(e?: PointerEvent) {
    if (!dragging) return;
    if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return;
    dragging = false;
    if (dragPointerId !== null) {
      try {
        el.releasePointerCapture(dragPointerId);
      } catch {
        /* already released */
      }
      dragPointerId = null;
    }
    velocity = scrollDriven || reduced || performance.now() - dragMoveT > FLICK_IDLE_MS ? 0 : dragVel;
    dragVel = 0;
    lastInput = performance.now();
    snapped = false;
    suppressClick =
      dragDist > (dragPointerType === "mouse" ? CLICK_SLOP : TOUCH_CLICK_SLOP);
    if (dragPointerType === "mouse") {
      setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
    } else {
      updateCursor();
    }
  }

  function onEnter(e: PointerEvent) {
    pointerInside = true;
    lastPointerType = e.pointerType || "mouse";
  }
  function onLeave() {
    pointerInside = false;
    setHover(false);
  }

  function onClick(e: MouseEvent) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (inputLocked()) return;
    const p = localPoint(e);
    const hit = panelAtPointer(p.x, p.y);
    if (!hit) return;
    if (centeredPanel && hit.poolIdx === centeredPanel.poolIdx) {
      pendingFocus = null;
      openFocus();
      return;
    }
    userInteracted = true;
    velocity = 0;
    if (scrollDriven) {
      let index = nearestIndex(scroll + hit.centerX);
      while (index < options.initialIndex) index += sources.length;
      while (index > options.initialIndex + sources.length) index -= sources.length;
      requestScrollProgress((centerForIndex(index) - centerForIndex(options.initialIndex)) / totalWidth);
    } else target = centerForIndex(nearestIndex(scroll + hit.centerX));
    snapped = true;
    pendingFocus = { srcIndex: hit.srcIndex };
    setView(false);
  }

  function openFocus() {
    if (options.onPreviewOpen) {
      pendingFocus = null;
      options.onPreviewOpen();
      return;
    }
    if (focusState.active || !centeredPanel) return;
    const src = sources[centeredPanel.srcIndex];
    if (!src?.tex) return;

    focusState.active = true;
    focusState.closing = false;
    focusState.srcIndex = centeredPanel.srcIndex;
    const focusPoolIdx = centeredPanel.poolIdx;
    focusState.poolIdx = focusPoolIdx;
    target = centerForIndex(nearestIndex(scroll));

    const focusX = lastCenterX[focusPoolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.idx !== focusPoolIdx && o.x !== undefined)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => a.dist - b.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && o.dist - prevDist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    for (const key of LENS_FX_KEYS) {
      lensFxFull[key] = lensUniforms[key].value;
    }

    if (focusState.anim) focusState.anim.kill();
    const scaleProxy = { v: focusScale, p: focusProgress };
    const tl = gsap.timeline();
    tl.to(
      focusState,
      { lensFx: 0, duration: reduced ? 0 : FOCUS.lensFade, ease: "power3.out" },
      0,
    );
    tl.to(
      scaleProxy,
      {
        v: Math.min(1.3, (H * 0.78) / PANEL_H, (W * 0.9) / (PANEL_H * src.imageAspect)),
        p: 1,
        duration: reduced ? 0 : FOCUS.focusDuration,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = scaleProxy.v;
          focusProgress = scaleProxy.p;
        },
      },
      0,
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        { [o.idx]: 1, duration: reduced ? 0 : FOCUS.cardDuration, ease: FOCUS.cardEase },
        reduced ? 0 : o.rank * FOCUS.stagger,
      );
    });
    focusState.anim = tl;
    setView(false);
    options.onFocusChange(true);
  }

  function closeFocus() {
    if (!focusState.active) return;
    if (focusState.anim) focusState.anim.kill();
    focusState.closing = true;

    const focusX = lastCenterX[focusState.poolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.x !== undefined && (drop[o.idx] || 0) > 0)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => b.dist - a.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && prevDist - o.dist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    options.onFocusChange(false);
    const scaleProxy = { v: focusScale, p: focusProgress };
    const tl = gsap.timeline({
      onComplete: () => {
        focusState.active = false;
        focusState.closing = false;
        focusState.srcIndex = -1;
        if (scrollDriven) target = controlledTarget();
        updateCursor();
      },
    });
    tl.to(
      focusState,
      { lensFx: 1, duration: reduced ? 0 : FOCUS.lensFade * 0.8, ease: "power3.inOut" },
      0,
    );
    tl.to(
      scaleProxy,
      {
        v: 1,
        p: 0,
        duration: reduced ? 0 : FOCUS.focusDuration * 0.85,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = scaleProxy.v;
          focusProgress = scaleProxy.p;
        },
      },
      0,
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        {
          [o.idx]: 0,
          duration: reduced ? 0 : FOCUS.cardDuration * 0.85,
          ease: FOCUS.cardEase,
        },
        reduced ? 0 : o.rank * FOCUS.stagger * 0.7,
      );
    });
    focusState.anim = tl;
  }

  function playEntry() {
    if (!entryOn) {
      options.onEntryDone(true);
      return;
    }
    if (entryAnim) entryAnim.kill();
    for (let k = 0; k < pEntry.length; k++) pEntry[k] = 0;
    entryActive = true;
    entrySettled = false;
    options.onEntryDone(false);
    for (let k = 0; k < growArr.length; k++) growArr[k] = 0;
    focusState.lensFx = 0;
    target = centerForIndex(nearestIndex(scroll));
    scroll = target;
    velocity = 0;
    snapped = true;
    layout();
    const visible: number[] = [];
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] !== undefined) visible.push(k);
    }
    const tl = gsap.timeline({ delay: ENTRY.delay });
    const spread = ENTRY.stagger * Math.max(visible.length - 1, 1);
    let lastRiseEnd = 0;
    visible.forEach((idx) => {
      const at = Math.random() * spread;
      lastRiseEnd = Math.max(lastRiseEnd, at + ENTRY.riseDuration);
      tl.to(
        pEntry,
        { [idx]: 1, duration: ENTRY.riseDuration, ease: ENTRY.riseEase },
        at,
      );
    });
    tl.call(
      () => {
        entryActive = false;
        entrySettled = true;
      },
      [],
      lastRiseEnd,
    );
    const cSrcG = centerIndex(scroll);
    const Ng = sources.length;
    const midRepG = Math.floor(REPEATS / 2);
    const growList: { idx: number; rank: number }[] = [];
    let maxRank = 0;
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] === undefined) continue;
      if (Math.floor(k / Ng) !== midRepG) continue;
      let di = (k % Ng) - cSrcG;
      if (di > Ng / 2) di -= Ng;
      if (di < -Ng / 2) di += Ng;
      const r = Math.abs(di);
      maxRank = Math.max(maxRank, r);
      growList.push({ idx: k, rank: r });
    }
    const growRanked = growList.map((v) => ({
      idx: v.idx,
      rank: maxRank - v.rank,
    }));
    const growStart = lastRiseEnd + ENTRY.growDelay;
    let growEnd = growStart;
    tl.to(
      focusState,
      { lensFx: 1, duration: ENTRY.lensBloom, ease: ENTRY.lensBloomEase },
      growStart,
    );
    growRanked.forEach((o) => {
      const at = growStart + o.rank * ENTRY.growStagger;
      growEnd = Math.max(growEnd, at + ENTRY.growDuration);
      tl.to(
        growArr,
        { [o.idx]: 1, duration: ENTRY.growDuration, ease: ENTRY.growEase },
        at,
      );
    });
    tl.call(
      () => {
        entrySettled = false;
        for (let k = 0; k < growArr.length; k++) growArr[k] = 1;
        options.onEntryDone(true);
        updateCursor();
      },
      [],
      growEnd,
    );
    entryAnim = tl;
  }

  function step(direction: number) {
    if (inputLocked()) return;
    userInteracted = true;
    velocity = 0;
    pendingFocus = null;
    if (scrollDriven) {
      const index = Math.max(options.initialIndex, Math.min(options.initialIndex + sources.length, nearestIndex(target) + direction));
      requestScrollProgress((centerForIndex(index) - centerForIndex(options.initialIndex)) / totalWidth);
    } else target = centerForIndex(nearestIndex(target) + direction);
    snapped = true;
    lastInput = performance.now();
  }

  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("click", onClick);

  function tick() {
    if (!running) return;
    if (!visible || document.hidden || previewOpen) {
      raf = 0;
      return;
    }
    if (!scrollDriven && !dragging) {
      target += velocity;
      velocity *= FRICTION;
      if (Math.abs(velocity) < 0.05) velocity = 0;
      if (
        !snapped &&
        !focusState.active &&
        performance.now() - lastInput > SNAP_IDLE_MS
      ) {
        target = centerForIndex(nearestIndex(scroll));
        snapped = true;
      }
    }
    const follow =
      dragging && dragPointerType !== "mouse"
        ? TOUCH_EASE
        : snapped && !pendingFocus
          ? SNAP_EASE
          : EASE;
    scroll += (target - scroll) * (scrollDriven || reduced ? 1 : follow);

    const ci = centerIndex(scroll);
    if (ci !== lastCenter) {
      lastCenter = ci;
      options.onActiveChange(ci);
      options.onLoadingChange(!at(sources, ci).tex);
    }

    const rawSpeed = scroll - prevScroll;
    prevScroll = scroll;
    const norm = Math.min(1, Math.abs(rawSpeed) / Math.max(1, SHRINK_MAX));
    const k = norm > scrollEnergy ? SHRINK_ATTACK : SHRINK_DECAY;
    scrollEnergy = reduced ? 0 : scrollEnergy + (norm - scrollEnergy) * k;

    layout();
    refreshHover();

    if (pendingFocus && !focusState.active) {
      if (Math.abs(target - scroll) < 0.5) {
        const pf = pendingFocus;
        pendingFocus = null;
        if (centeredPanel && centeredPanel.srcIndex === pf.srcIndex) {
          openFocus();
        }
      }
    }

    lensUniforms.uCenter.value.set(LENS.posX, LENS.posY);
    lensUniforms.uAspect.value = W / H;
    lensUniforms.uTime.value = performance.now() * 0.001;
    const rad = (a: number) => (a * Math.PI) / 180;
    lensUniforms.uRotation.value =
      rad(LENS.rotation) + rad(LENS.spin) * (performance.now() * 0.001);
    const fx = focusState.lensFx;
    for (const key of LENS_FX_KEYS) {
      lensUniforms[key].value = lensFxFull[key] * fx;
    }

    try {
      if (settled.size === items.length && !programsWarmed) {
        renderer.compile(scene, camera);
        renderer.compile(lensScene, lensCam);
        programsWarmed = true;
      }
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(lensScene, lensCam);
      if (!prepared && programsWarmed && !entryActive && !entrySettled) {
        prepared = true;
        options.onReadyChange(true);
      }
    } catch {
      running = false;
      raf = 0;
      options.onFailure();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!running || raf) return;
    raf = requestAnimationFrame(tick);
  }

  function maybeStartEntry() {
    if (!entryOn || entryStarted || !hasBeenVisible || !at(sources, options.initialIndex).tex) return;
    entryStarted = true;
    playEntry();
  }
  if (!entryOn) options.onEntryDone(true);

  function onResize() {
    // Retain the logical photograph and in-progress drag offset as pixel slots resize.
    const scrollIndex = nearestIndex(scroll);
    const targetIndex = nearestIndex(target);
    const sourceIndex = (index: number) => ((index % sources.length) + sources.length) % sources.length;
    const oldScrollSlot = slotWidth(sourceIndex(scrollIndex));
    const scrollOffset = (scroll - centerForIndex(scrollIndex)) / oldScrollSlot;
    const targetOffset = (target - centerForIndex(targetIndex)) / slotWidth(sourceIndex(targetIndex));
    W = Math.max(1, mount.clientWidth);
    H = Math.max(1, mount.clientHeight);
    PANEL_H = panelHFor();
    recomputeTotal();
    scroll = centerForIndex(scrollIndex) + scrollOffset * slotWidth(sourceIndex(scrollIndex));
    target = centerForIndex(targetIndex) + targetOffset * slotWidth(sourceIndex(targetIndex));
    velocity *= slotWidth(sourceIndex(scrollIndex)) / oldScrollSlot;
    prevScroll = scroll;
    scrollEnergy = 0;
    renderer.setSize(W, H);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    rt.setSize(W * ratio, H * ratio);
    lensUniforms.uRes.value.set(W * ratio, H * ratio);
    if (focusState.active) {
      focusState.anim?.kill();
      if (focusState.closing) {
        focusState.active = false;
        focusState.closing = false;
        focusState.srcIndex = -1;
        focusState.poolIdx = -1;
        focusScale = 1;
        focusProgress = 0;
        focusState.lensFx = 1;
        drop.fill(0);
        updateCursor();
      } else {
        const source = at(sources, focusState.srcIndex);
        focusScale = Math.min(1.3, (H * 0.78) / PANEL_H, (W * 0.9) / (PANEL_H * source.imageAspect));
        focusProgress = 1;
        focusState.lensFx = 0;
        drop.forEach((_, index) => { drop[index] = index === focusState.poolIdx ? 0 : 1; });
      }
    }
    if (scrollDriven && !focusState.active) {
      scroll = controlledTarget();
      target = scroll;
    } else if (!scrollDriven && !userInteracted) {
      scroll = centerForIndex(options.initialIndex);
      target = scroll;
    }
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(mount);
  const intersection = new IntersectionObserver(([entry]) => {
    const box = entry?.boundingClientRect;
    if (!box || (box.width === 0 && box.height === 0)) return;
    visible = entry?.isIntersecting ?? true;
    if (visible) {
      hasBeenVisible = true;
      maybeStartEntry();
      startLoop();
    }
  });
  intersection.observe(mount);
  const onVisibility = () => {
    if (!document.hidden) startLoop();
  };
  document.addEventListener("visibilitychange", onVisibility);
  const onContextLost = (event: Event) => {
    event.preventDefault();
    if (!disposed) options.onFailure();
  };
  el.addEventListener("webglcontextlost", onContextLost);
  loadSources();

  function destroy() {
    disposed = true;
    running = false;
    imageTimers.forEach(timer => clearTimeout(timer));
    imageTimers.clear();
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    el.removeEventListener("webglcontextlost", onContextLost);
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("click", onClick);
    if (focusState.anim) focusState.anim.kill();
    if (entryAnim) entryAnim.kill();
    if (cursorElement) gsap.killTweensOf(cursorElement);
    renderer.dispose();
    rt.dispose();
    lensQuad.geometry.dispose();
    lensMat.dispose();
    pool.forEach((p) => {
      p.mesh.geometry.dispose();
      p.mat.dispose();
    });
    sources.forEach((s) => {
      s.tex?.dispose();
      s.fullTex?.dispose();
    });
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return {
    closeFocus,
    openFocus,
    next: () => step(1),
    previous: () => step(-1),
    setScrollProgress,
    setPreviewOpen: (open) => {
      previewOpen = open;
      if (!open) startLoop();
    },
    destroy,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Infinite photograph row with the supplied liquid-glass WebGL lens. */
export function LiquidGlassCarousel({
  items = liquidGlassCarouselDefaultItems,
  initialIndex = 0,
  panelHeight = 450,
  gap = 18,
  background = "#ffffff",
  entry = true,
  className,
  style,
  ariaLabel = "Speaker photographs",
  showTitle = true,
  labels = {
    previous: "Previous photograph", next: "Next photograph",
    view: "Enlarge photograph", close: "Close enlarged photograph",
    help: "Drag to explore · select a photograph to view",
  },
  onActiveChange,
  onFocusChange,
  onPreviewScroll,
  scrollProgress,
  onScrollProgressChange,
  onReadyChange,
  onLoadProgress,
}: LiquidGlassCarouselProps) {
  const firstIndex = Math.max(0, Math.min(items.length - 1, Number.isFinite(initialIndex) ? Math.trunc(initialIndex) : 0));
  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LiquidGlassCarouselHandle | null>(null);
  const [active, setActive] = useState(firstIndex);
  const [focused, setFocused] = useState(false);
  const focusedRef = useRef(false);
  const galleryActiveRef = useRef(firstIndex);
  const previewGesture = useRef<{ x: number; y: number; id: number; horizontal: boolean } | null>(null);
  const suppressPreviewClick = useRef(false);
  const [entryDone, setEntryDone] = useState(!entry);
  const [failed, setFailed] = useState(false);
  const [engineLoading, setEngineLoading] = useState(true);
  const [prepared, setPrepared] = useState(false);
  const [sourceErrors, setSourceErrors] = useState<ReadonlySet<string>>(() => new Set());
  const [fallbackLoaded, setFallbackLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const labelId = useId();
  const current = items[active] ?? items[0];
  const onActiveChangeRef = useRef(onActiveChange);
  const onFocusChangeRef = useRef(onFocusChange);
  const onScrollProgressChangeRef = useRef(onScrollProgressChange);
  const onReadyChangeRef = useRef(onReadyChange);
  const onLoadProgressRef = useRef(onLoadProgress);
  const scrollProgressRef = useRef(scrollProgress);
  onActiveChangeRef.current = onActiveChange;
  onFocusChangeRef.current = onFocusChange;
  onScrollProgressChangeRef.current = onScrollProgressChange;
  onReadyChangeRef.current = onReadyChange;
  onLoadProgressRef.current = onLoadProgress;
  scrollProgressRef.current = scrollProgress;
  const scrollDriven = scrollProgress !== undefined;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setDimensions((previous) => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      return previous.width === width && previous.height === height ? previous : { width, height };
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || items.length === 0 || failed) return;
    setActive(firstIndex);
    galleryActiveRef.current = firstIndex;
    focusedRef.current = false;
    setFocused(false);
    setEntryDone(!entry);
    setEngineLoading(true);
    setPrepared(false);
    onReadyChangeRef.current?.(false);
    let engine: LiquidGlassCarouselHandle | null = null;
    try {
      engine = createCarousel(mount, cursorRef.current, {
        items,
        initialIndex: firstIndex,
        panelHeight,
        gap,
        background,
        entry,
        scrollProgress: scrollProgressRef.current,
        onActiveChange: (index) => {
          galleryActiveRef.current = index;
          if (!focusedRef.current) setActive(index);
          onActiveChangeRef.current?.(index);
        },
        onPreviewOpen: () => {
          focusedRef.current = true;
          setFocused(true);
          engineRef.current?.setPreviewOpen(true);
          onFocusChangeRef.current?.(true);
          rootRef.current?.focus({ preventScroll: true });
        },
        onFocusChange: (open) => {
          focusedRef.current = open;
          setFocused(open);
          onFocusChangeRef.current?.(open);
        },
        onEntryDone: setEntryDone,
        onLoadingChange: setEngineLoading,
        onReadyChange: (ready) => {
          setPrepared(ready);
          onReadyChangeRef.current?.(ready);
        },
        onLoadProgress: (progress) => onLoadProgressRef.current?.(progress),
        onImageLoaded: (imageIndex) => {
          const source = items[imageIndex]?.src;
          if (source) {
            setFallbackLoaded(previous => new Set(previous).add(source));
            setSourceErrors(previous => {
              if (!previous.has(source)) return previous;
              const next = new Set(previous);
              next.delete(source);
              return next;
            });
          }
        },
        onScrollProgressChange: (progress) => onScrollProgressChangeRef.current?.(progress),
        onFailure: (imageIndex) => {
          if (imageIndex !== undefined) {
            const source = items[imageIndex]?.src;
            if (source) setSourceErrors((previous) => new Set(previous).add(source));
          } else {
            setFailed(true);
            focusedRef.current = false;
            setFocused(false);
            onFocusChangeRef.current?.(false);
          }
        },
      });
    } catch {
      setFailed(true);
    }
    if (!engine) {
      setFailed(true);
      return;
    }
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [items, firstIndex, panelHeight, gap, background, entry, failed, scrollDriven]);

  useEffect(() => {
    if (scrollProgress !== undefined) engineRef.current?.setScrollProgress(scrollProgress);
  }, [scrollProgress, failed, scrollDriven]);

  useEffect(() => {
    if (!failed || items.length === 0) return;
    let cancelled = false;
    const cleanups: (() => void)[] = [];
    // The non-WebGL path prepares the complete turn too, so scrolling never
    // trades a finished photograph for a new download at every step.
    for (const item of items) {
      const image = new Image();
      image.decoding = "async";
      let settled = false;
      const finish = (error: boolean) => {
        if (cancelled || settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (error) setSourceErrors(previous => new Set(previous).add(item.src));
        else {
          setFallbackLoaded(previous => new Set(previous).add(item.src));
          setSourceErrors(previous => {
            if (!previous.has(item.src)) return previous;
            const next = new Set(previous);
            next.delete(item.src);
            return next;
          });
        }
      };
      const timer = window.setTimeout(() => finish(true), 15000);
      image.onload = () => {
        const decoded = typeof image.decode === "function" ? image.decode() : Promise.resolve();
        void decoded.then(() => finish(false), () => finish(true));
      };
      image.onerror = () => finish(true);
      image.src = item.src;
      cleanups.push(() => {
        window.clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
      });
    }
    return () => {
      cancelled = true;
      cleanups.forEach(cleanup => cleanup());
    };
  }, [failed, items]);

  useEffect(() => {
    if (!failed) return;
    const sourceList = new Set(items.map(item => item.src));
    const completed = new Set([...fallbackLoaded, ...sourceErrors].filter(source => sourceList.has(source))).size;
    const failureCount = [...sourceErrors].filter(source => sourceList.has(source)).length;
    const ready = completed === items.length;
    setPrepared(ready);
    onReadyChangeRef.current?.(ready);
    onLoadProgressRef.current?.({ completed, total: items.length, failed: failureCount });
  }, [failed, fallbackLoaded, sourceErrors, items]);

  useEffect(() => {
    if (!failed || focused || scrollProgress === undefined || items.length === 0) return;
    const progress = Math.max(0, Math.min(1, Number.isFinite(scrollProgress) ? scrollProgress : 0));
    const next = (firstIndex + Math.round(progress * items.length)) % items.length;
    galleryActiveRef.current = next;
    setActive(next);
    onActiveChangeRef.current?.(next);
  }, [failed, focused, scrollProgress, firstIndex, items.length]);

  const move = (direction: number) => {
    if (focusedRef.current) {
      setActive(index => (index + direction + items.length) % items.length);
      return;
    }
    if (failed) {
      if (scrollProgress !== undefined) {
        const index = Math.round(scrollProgress * items.length) + direction;
        onScrollProgressChangeRef.current?.(Math.max(0, Math.min(1, index / items.length)));
        return;
      }
      setActive((index) => {
        const next = (index + direction + items.length) % items.length;
        galleryActiveRef.current = next;
        onActiveChangeRef.current?.(next);
        return next;
      });
      return;
    }
    if (direction > 0) engineRef.current?.next();
    else engineRef.current?.previous();
  };
  const toggleFocus = () => {
    if (focusedRef.current) { closeFocus(); return; }
    if (sourceFailed || loading || unavailable) return;
    focusedRef.current = true;
    setFocused(true);
    engineRef.current?.setPreviewOpen(true);
    onFocusChangeRef.current?.(true);
  };
  function closeFocus() {
    if (!focusedRef.current) return;
    focusedRef.current = false;
    setFocused(false);
    setActive(galleryActiveRef.current);
    engineRef.current?.setPreviewOpen(false);
    onFocusChangeRef.current?.(false);
  }
  useEffect(() => {
    if (!focused) return;
    const startY = window.scrollY;
    const leaveWithScroll = (delta: number) => {
      if (!focusedRef.current) return;
      closeFocus();
      if (onPreviewScroll) onPreviewScroll(delta);
      else window.scrollBy({ top: delta, behavior: "instant" });
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      leaveWithScroll(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1));
    };
    // Native touch, keyboard and scrollbar scrolling share the same exit.
    const scroll = () => {
      const delta = window.scrollY - startY;
      if (Math.abs(delta) > 1) leaveWithScroll(delta);
    };
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeFocus();
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointerdown", outside);
    };
  }, [focused, onPreviewScroll]);
  const previewPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    suppressPreviewClick.current = false;
    previewGesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId, horizontal: false };
  };
  const previewPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = previewGesture.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      gesture.horizontal = true;
      event.preventDefault();
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* released by native scrolling */ }
    }
  };
  const previewPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = previewGesture.current;
    previewGesture.current = null;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (gesture.horizontal) suppressPreviewClick.current = true;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Native buttons keep their Enter/Space behavior.
    const isRoot = event.target === event.currentTarget;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeFocus();
    } else if ((event.key === "Enter" || event.key === " ") && isRoot) {
      event.preventDefault();
      toggleFocus();
    }
  };
  const unavailable = !prepared || (!entryDone && !failed);
  const focal = current?.focalPoint ?? [0.5, 0.5];
  const sourceFailed = !!current && sourceErrors.has(current.src);
  const loading = !!current && !sourceFailed && (failed ? !fallbackLoaded.has(current.src) : engineLoading);
  const fallbackHeight = Math.max(120, Math.min(panelHeight, Math.round(dimensions.height * 0.68), dimensions.width * 0.76 / PORTRAIT_ASPECT));
  const errorMessage = labels.error ?? "This photograph could not load. Use the arrows to try another.";
  const loadingMessage = labels.loading ?? "Loading photographs…";
  const fallback = current ? (
    sourceFailed ? (
      <p role="status" style={{ position: "absolute", top: "50%", left: "10%", right: "10%", margin: 0, textAlign: "center", transform: "translateY(-50%)", fontSize: 13 }}>{errorMessage}</p>
    ) : (
    <button
      type="button"
      className="liquid-glass-carousel__photo"
      aria-label={`${focused ? labels.close : labels.view}: ${current.title}`}
      onClick={toggleFocus}
      style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)", padding: 0,
        width: focused ? dimensions.width * 0.9 : fallbackHeight * (current.aspect ?? PORTRAIT_ASPECT),
        height: focused ? dimensions.height * 0.78 : fallbackHeight,
        border: 0, background: "transparent",
      }}
    >
      <img
        src={current.src}
        alt={current.title}
        decoding="async"
        onLoad={(event) => {
          void event.currentTarget.decode().catch(() => {}).then(() => setFallbackLoaded((previous) => new Set(previous).add(current.src)));
        }}
        onError={() => {
          setSourceErrors((previous) => new Set(previous).add(current.src));
          setFocused(false);
          onFocusChangeRef.current?.(false);
        }}
        style={{
          display: "block", width: "100%", height: "100%",
          objectFit: focused ? "contain" : "cover",
          objectPosition: `${focal[0] * 100}% ${focal[1] * 100}%`,
        }}
      />
    </button>)
  ) : null;

  return (
    <div
      ref={rootRef}
      className={cn("liquid-glass-carousel", className)}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 420, overflow: "hidden", background, color: "#111111", ...style }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      aria-busy={!prepared || loading}
      onKeyDown={onKeyDown}
    >
      <style>{`
        .liquid-glass-carousel:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
        .liquid-glass-carousel button { color: inherit; font: inherit; cursor: pointer; }
        .liquid-glass-carousel button:focus-visible { outline: 2px solid currentColor; outline-offset: 5px; }
        .liquid-glass-carousel button:disabled { opacity: .35; cursor: default; }
        .liquid-glass-carousel__control { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; padding: 10px; border: 0; border-radius: 0; background: transparent; }
        .liquid-glass-carousel__control:not(:disabled):hover { opacity: .6; }
        .liquid-glass-carousel__controls { display: flex; align-items: center; gap: 18px; }
        .liquid-glass-carousel__preview { position: absolute; inset: 0; z-index: 1; touch-action: pan-y; cursor: default; }
        .liquid-glass-carousel__preview img { position: absolute; left: 50%; top: 47%; max-width: 90%; max-height: 78%; width: auto; height: auto; transform: translate(-50%, -50%); user-select: none; -webkit-user-drag: none; transition: opacity .24s cubic-bezier(.16,1,.3,1); }
        @media (prefers-reduced-motion: reduce) { .liquid-glass-carousel__preview img { transition-duration: .1s; } }
        @media (max-width: 540px) { .liquid-glass-carousel__controls { gap: 9px; } }
      `}</style>
      <span id={labelId} className="sr-only">{ariaLabel}</span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {current ? `${current.title}, ${active + 1}/${items.length}${focused ? `, ${labels.view}` : ""}` : ""}
      </span>
      {items.length === 0 ? (
        <p style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>No photographs to display.</p>
      ) : (
        <>
          <div inert={focused} aria-hidden={focused} style={{ position: "absolute", inset: 0, visibility: focused ? "hidden" : undefined }}>
            <WebGLErrorBoundary fallback={fallback} onError={() => setFailed(true)}>
              {failed ? fallback : <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />}
            </WebGLErrorBoundary>
          </div>
          {focused && <div className="liquid-glass-carousel__preview" style={{ background }} role="group" aria-label={labels.view}
            onPointerDown={previewPointerDown} onPointerMove={previewPointerMove} onPointerUp={previewPointerUp}
            onPointerCancel={() => { previewGesture.current = null; }}
            onClick={() => {
              if (suppressPreviewClick.current) { suppressPreviewClick.current = false; return; }
              closeFocus();
            }}>
            {items.map((item, index) => !sourceErrors.has(item.src) && <img key={item.src} src={item.src} alt={item.title}
              draggable={false} decoding="async" aria-hidden={index !== active} data-preview-active={index === active}
              onClick={event => event.stopPropagation()}
              onError={() => setSourceErrors(previous => new Set(previous).add(item.src))}
              style={{ opacity: index === active ? 1 : 0, pointerEvents: index === active ? "auto" : "none" }} />)}
            {sourceFailed && <p role="status" style={{ position: "absolute", top: "45%", left: "10%", right: "10%", margin: 0, textAlign: "center", fontSize: 13 }}>{errorMessage}</p>}
          </div>}
          {!failed && sourceFailed && <p role="status" style={{ pointerEvents: "none", position: "absolute", top: "50%", left: "10%", right: "10%", margin: 0, padding: "10px 16px", textAlign: "center", transform: "translateY(-50%)", background, fontSize: 13 }}>{errorMessage}</p>}
          {loading && <p role="status" style={{ pointerEvents: "none", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", margin: 0, padding: "10px 16px", textAlign: "center", background, fontSize: 13 }}>{loadingMessage}</p>}
          {showTitle && <p style={{ position: "absolute", top: "5%", left: "8%", right: "8%", margin: 0, textAlign: "center", fontSize: 13, pointerEvents: "none" }}>
            {current?.title}
          </p>}
          <div
            className="liquid-glass-carousel__controls"
            style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", zIndex: 2 }}
          >
            <button type="button" className="liquid-glass-carousel__control" aria-label={labels.previous} disabled={unavailable || items.length < 2 || (!focused && scrollProgress !== undefined && scrollProgress <= 0)} onClick={() => move(-1)}>
              <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <span aria-hidden="true" style={{ fontSize: 12, minWidth: 48, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{pad(active + 1)} / {pad(items.length)}</span>
            <button type="button" className="liquid-glass-carousel__control" aria-label={labels.next} disabled={unavailable || items.length < 2 || (!focused && scrollProgress !== undefined && scrollProgress >= 1)} onClick={() => move(1)}>
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" className="liquid-glass-carousel__control" aria-label={focused ? labels.close : labels.view} aria-pressed={focused} disabled={!focused && (unavailable || loading || sourceFailed)} onClick={toggleFocus}>
              {focused ? <X size={17} strokeWidth={1.5} aria-hidden="true" /> : <Maximize2 size={16} strokeWidth={1.5} aria-hidden="true" />}
            </button>
          </div>
          <p aria-hidden="true" style={{ position: "absolute", zIndex: 2, bottom: "1%", left: "6%", right: "6%", margin: 0, textAlign: "center", fontSize: 11, pointerEvents: "none" }}>{focused ? labels.previewHelp ?? labels.close : labels.help}</p>
          <div ref={cursorRef} aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", left: 0, top: 0, zIndex: 3, fontSize: 12, color: "inherit" }}>{labels.view}</div>
        </>
      )}
    </div>
  );
}

export default LiquidGlassCarousel;
