import './site.css';
import './atelier.css';
import './signal.css';
import './journey.css';
import homeTemplate from './home.html?raw';
import eventTemplate from './event.html?raw';
import signalHomeTemplate from './home-signal.html?raw';
import signalEventTemplate from './event-signal.html?raw';
import journeyHomeTemplate from './home-journey.html?raw';
import journeyEventTemplate from './event-journey.html?raw';
import { initSilkRoad } from './silk-road.js';
import { initSound } from './sound.js';

const app = document.getElementById('app');
const isEvent = document.body.dataset.page === 'event';
const theme = document.body.dataset.theme || 'atelier';
const templates = {
  atelier: { home: homeTemplate, event: eventTemplate },
  signal: { home: signalHomeTemplate, event: signalEventTemplate },
  journey: { home: journeyHomeTemplate, event: journeyEventTemplate }
};
app.innerHTML = templates[theme]?.[isEvent ? 'event' : 'home'] || homeTemplate;

const pageProgress = document.createElement('div');
pageProgress.className = 'site-progress';
pageProgress.setAttribute('role', 'progressbar');
pageProgress.setAttribute('aria-valuemin', '0');
pageProgress.setAttribute('aria-valuemax', '100');
pageProgress.setAttribute('aria-valuenow', '0');
pageProgress.dataset.enAria = 'Page scroll progress';
pageProgress.dataset.jaAria = 'ページのスクロール進行度';
const pageProgressFill = document.createElement('span');
pageProgressFill.className = 'site-progress-fill';
pageProgress.append(pageProgressFill);
document.body.prepend(pageProgress);

let progressFrame = 0;
function updatePageProgress() {
  progressFrame = 0;
  const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const value = Math.min(100, Math.max(0, Math.round(window.scrollY / range * 100)));
  pageProgress.style.setProperty('--page-progress', value + '%');
  pageProgress.setAttribute('aria-valuenow', String(value));
}
function requestPageProgress() {
  if (!progressFrame) progressFrame = requestAnimationFrame(updatePageProgress);
}
window.addEventListener('scroll', requestPageProgress, { passive: true });
window.addEventListener('resize', requestPageProgress);
window.addEventListener('load', requestPageProgress, { once: true });
if ('ResizeObserver' in window) new ResizeObserver(requestPageProgress).observe(app);
requestPageProgress();

function assetUrl(path) {
  return new URL('../../' + path, window.location.href).href;
}
document.querySelectorAll('[data-asset]').forEach(element => {
  element.src = assetUrl(element.dataset.asset);
});

let language = 'en';
try {
  language = localStorage.getItem('metorom-language') === 'ja' ? 'ja' : 'en';
} catch { /* Private browsing can disable storage. */ }

const langToggle = document.querySelector('.lang-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.header-nav');
const header = document.querySelector('.site-header');
const soundButton = document.querySelector('.sound-toggle');
let modelLoading;
let modelLoadingLabel;
let modelLoadProgress;
let modelReadyTimer;
if (!isEvent) {
  const canvas = document.getElementById('canvas');
  const visual = canvas.closest('.viewer-visual') || canvas.parentElement;
  modelLoading = visual.querySelector('.model-loading');
  if (!modelLoading) {
    modelLoading = document.createElement('div');
    modelLoading.className = 'model-loading';
    modelLoading.setAttribute('role', 'status');
    modelLoadingLabel = document.createElement('span');
    modelLoadingLabel.dataset.modelLoadLabel = '';
    modelLoadProgress = document.createElement('progress');
    modelLoadProgress.className = 'model-load-progress';
    modelLoadProgress.max = 100;
    modelLoadProgress.value = 0;
    modelLoading.append(modelLoadingLabel, modelLoadProgress);
    visual.append(modelLoading);
  } else {
    modelLoadingLabel = modelLoading.querySelector('[data-model-load-label]');
    modelLoadProgress = modelLoading.querySelector('.model-load-progress');
    if (!modelLoadingLabel) {
      modelLoadingLabel = document.createElement('span');
      modelLoadingLabel.dataset.modelLoadLabel = '';
      modelLoading.prepend(modelLoadingLabel);
    }
    if (!modelLoadProgress) {
      modelLoadProgress = document.createElement('progress');
      modelLoadProgress.className = 'model-load-progress';
      modelLoadProgress.max = 100;
      modelLoadProgress.value = 0;
      modelLoading.append(modelLoadProgress);
    }
  }
  modelLoadProgress.dataset.enAria = 'Speaker model loading progress';
  modelLoadProgress.dataset.jaAria = 'スピーカーモデルの読み込み進行度';
}

function updateModelLoading(percent, phase) {
  if (!modelLoading) return;
  const messages = {
    en: {
      loading: 'Loading speaker model',
      preparing: 'Preparing the 3D view',
      ready: 'Ready — scroll to explore',
      error: '3D model unavailable'
    },
    ja: {
      loading: 'スピーカーのモデルを読み込み中',
      preparing: '3D表示を準備中',
      ready: '準備完了 — スクロールして探索',
      error: '3Dモデルを表示できません'
    }
  };
  const label = messages[language][phase] || messages[language].loading;
  modelLoadingLabel.textContent = phase === 'loading' && percent > 0
    ? label + ' · ' + percent + '%'
    : label;
  modelLoadProgress.value = Math.max(0, Math.min(100, percent));
  modelLoading.classList.toggle('is-ready', phase === 'ready');
  modelLoading.classList.toggle('is-error', phase === 'error');
  if (phase === 'ready') {
    clearTimeout(modelReadyTimer);
    modelReadyTimer = setTimeout(() => { modelLoading.hidden = true; }, 1400);
  } else {
    modelLoading.hidden = false;
  }
  modelLoading.dataset.phase = phase;
  modelLoading.dataset.percent = String(percent);
}
if (!isEvent) updateModelLoading(0, 'loading');

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-en]').forEach(element => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll('[data-en-alt]').forEach(element => {
    element.alt = element.dataset[language + 'Alt'];
  });
  document.querySelectorAll('[data-en-aria]').forEach(element => {
    element.setAttribute('aria-label', element.dataset[language + 'Aria']);
  });
  langToggle.textContent = language === 'en' ? '日本語' : 'EN';
  document.title = (isEvent ? (language === 'ja' ? '試聴イベント' : 'Listening Event') + ' — ' : '') + 'Metorom';
  updateViewReadout();
  if (modelLoading) {
    const wasHidden = modelLoading.hidden;
    updateModelLoading(Number(modelLoading.dataset.percent || 0), modelLoading.dataset.phase || 'loading');
    if (wasHidden) {
      clearTimeout(modelReadyTimer);
      modelLoading.hidden = true;
    }
  }
}

let currentView = 'Front';
const viewNames = {
  en: { Front: 'FRONT', Back: 'BACK', Top: 'TOP' },
  ja: { Front: '前面', Back: '背面', Top: '上面' }
};
function updateViewReadout() {
  const readout = document.querySelector('[data-view-readout]');
  if (readout) readout.textContent = viewNames[language][currentView];
}

langToggle.addEventListener('click', () => {
  language = language === 'en' ? 'ja' : 'en';
  try { localStorage.setItem('metorom-language', language); } catch { /* Keep this session working. */ }
  applyLanguage();
});
applyLanguage();

function closeMenu() {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.dataset.enAria = 'Open menu';
  menuToggle.dataset.jaAria = 'メニューを開く';
  menuToggle.setAttribute('aria-label', menuToggle.dataset[language + 'Aria']);
}
menuToggle.addEventListener('click', () => {
  const isOpen = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.dataset.enAria = isOpen ? 'Close menu' : 'Open menu';
  menuToggle.dataset.jaAria = isOpen ? 'メニューを閉じる' : 'メニューを開く';
  menuToggle.setAttribute('aria-label', menuToggle.dataset[language + 'Aria']);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});

let headerFrame = 0;
function updateHeader() {
  headerFrame = 0;
  header.classList.toggle('is-scrolled', window.scrollY > 40);
  header.classList.toggle('is-compact', window.scrollY > window.innerHeight * 0.52);
}
window.addEventListener('scroll', () => {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
}, { passive: true });
updateHeader();

initSound({ button: soundButton, canvases: document.querySelectorAll('[data-scope]') });

if (!isEvent) {
  const wave = document.querySelector('.wave-progress');
  const bars = [];
  const count = 48;
  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement('span');
    bar.className = 'wave-bar';
    const envelope = Math.pow(Math.sin(Math.PI * (index + 1) / (count + 1)), 0.55);
    const modulation = 0.5 + 0.5 * Math.abs(Math.sin(index * 1.47) * Math.cos(index * 0.53));
    bar.style.setProperty('--bar-height', Math.round(16 + 76 * envelope * modulation) + '%');
    wave.append(bar);
    bars.push(bar);
  }

  let lastActiveBars = -1;
  function updateWave(progress) {
    const activeBars = Math.round(progress * count);
    if (activeBars === lastActiveBars) return;
    lastActiveBars = activeBars;
    bars.forEach((bar, index) => bar.classList.toggle('is-active', index < activeBars));
    wave.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }

  const section = document.getElementById('project');
  const loadScene = async () => {
    try {
      const { initScene } = await import('./scene.js');
      initScene({
        canvas: document.getElementById('canvas'),
        sectionEl: section,
        onLoadProgress: updateModelLoading,
        onProgress(progress, viewName) {
          currentView = viewName;
          updateViewReadout();
          updateWave(progress);
        }
      });
    } catch (error) {
      console.warn('Could not start the speaker viewer.', error);
      updateModelLoading(0, 'error');
    }
  };
  if ('IntersectionObserver' in window) {
    const sceneLoader = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        sceneLoader.disconnect();
        loadScene();
      }
    }, { rootMargin: '1400px 0px' });
    sceneLoader.observe(section);
  } else {
    loadScene();
  }
  document.getElementById('skip-btn').addEventListener('click', () => {
    section.nextElementSibling?.scrollIntoView({ behavior: 'smooth' });
  });
  initSilkRoad(document.getElementById('road'));
}

if (window.location.hash) {
  requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
}
