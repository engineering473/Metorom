import './style.css';
import { initScene } from './scene.js';

const canvas = document.getElementById('canvas');
const sectionEl = document.getElementById('speaker-section');
const introEl = document.getElementById('intro');
const fillEl = document.getElementById('fill');
const readoutEl = document.getElementById('readout');
const annotationsRoot = document.getElementById('annotations');
const skipBtn = document.getElementById('skip-btn');

// Skip straight past the 3D section to whatever comes next on the page.
skipBtn.addEventListener('click', () => {
  const target = sectionEl.offsetTop + sectionEl.offsetHeight - window.innerHeight + 2;
  window.scrollTo({ top: target, behavior: 'smooth' });
});

initScene({ canvas, sectionEl, annotationsRoot, introEl, fillEl, readoutEl });

// ---------- Language toggle (EN / JA) ----------
// Elements with data-en / data-ja get their text swapped. Add more pairs
// as you translate more copy — see index.html for the pattern.
const langToggle = document.getElementById('lang-toggle');
let currentLang = 'en';
function applyLang(lang) {
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = lang === 'ja' ? (el.dataset.ja || el.dataset.en) : el.dataset.en;
    el.textContent = text;
  });
  currentLang = lang;
  langToggle.textContent = lang === 'en' ? '日本語' : 'EN';
}
langToggle.addEventListener('click', () => applyLang(currentLang === 'en' ? 'ja' : 'en'));
