import { useEffect, useRef, useState } from "react";
import "./site-chrome.css";

// Match the rhythm of the bars in the 3D speaker viewer.
const bars = Array.from({ length: 48 }, (_, index) => {
  const envelope = Math.pow(Math.sin(Math.PI * (index + 1) / 49), 0.55);
  const variation = 0.5 + 0.5 * Math.abs(Math.sin(index * 1.47) * Math.cos(index * 0.53));
  return Math.round(16 + 76 * envelope * variation);
});

function usePageProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(range > 0 ? Math.min(100, Math.max(0, (window.scrollY / range) * 100)) : 100);
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

function WaveBars() {
  return bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />);
}

function PageProgress() {
  const progress = usePageProgress();
  return (
    <div className="page-progress" role="progressbar" aria-label="Page progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <div className="page-progress__bars page-progress__track" aria-hidden="true"><WaveBars /></div>
      <div className="page-progress__bars page-progress__value" style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }} aria-hidden="true"><WaveBars /></div>
    </div>
  );
}

function playSoundCue(context: AudioContext, pitch: number, volume: number, delay = 0) {
  const start = context.currentTime + delay;
  const gain = context.createGain();
  const voice = context.createOscillator();
  const harmonic = context.createOscillator();
  voice.type = "sine";
  harmonic.type = "sine";
  voice.frequency.setValueAtTime(pitch, start);
  voice.frequency.exponentialRampToValueAtTime(pitch * 0.92, start + 0.15);
  harmonic.frequency.setValueAtTime(pitch * 1.5, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
  voice.connect(gain);
  harmonic.connect(gain);
  gain.connect(context.destination);
  voice.start(start);
  harmonic.start(start);
  voice.stop(start + 0.19);
  harmonic.stop(start + 0.19);
  harmonic.onended = () => {
    voice.disconnect();
    harmonic.disconnect();
    gain.disconnect();
  };
}

function useScrollSound() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const lastCueRef = useRef(0);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const context = audioRef.current;
      if (!context || context.state !== "running" || document.hidden) return;
      const delta = window.scrollY - lastYRef.current;
      lastYRef.current = window.scrollY;
      if (Math.abs(delta) < 2) return;
      const now = performance.now();
      if (now - lastCueRef.current < 115) return;
      lastCueRef.current = now;

      // A brief, quiet tone follows scroll speed. No continuous audio loop runs.
      const speed = Math.min(1, Math.abs(delta) / 90);
      const pitch = 180 + speed * 220 + (delta > 0 ? 0 : 55);
      playSoundCue(context, pitch, 0.012 + speed * 0.006);
    };
    const onVisibility = () => { lastYRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  useEffect(() => () => { void audioRef.current?.close(); }, []);

  const toggle = async () => {
    if (enabled) {
      setEnabled(false);
      await audioRef.current?.suspend();
      return;
    }
    try {
      const context = audioRef.current ?? new AudioContext();
      audioRef.current = context;
      await context.resume();
      playSoundCue(context, 294, 0.022);
      playSoundCue(context, 392, 0.018, 0.12);
      setEnabled(true);
    } catch {
      setEnabled(false);
    }
  };
  return { enabled, toggle };
}

export function SiteChrome({ contact = false }: { contact?: boolean }) {
  const sound = useScrollSound();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const base = import.meta.env.BASE_URL;
  const home = contact ? "./index.html" : "";
  const links = [
    { label: "System", href: `${home}#system` },
    { label: "3D object", href: `${home}#object` },
    { label: "Components", href: `${home}#components` },
    { label: "Method", href: `${home}#method` },
    { label: "Event", href: `${home}#event` },
    { label: "Contact", href: "./contact.html" },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <PageProgress />
      <header className="site-header" id="top" ref={headerRef}>
        <a href={contact ? "./index.html" : "#top"} className="site-header__brand" aria-label="Metorom, home">
          <img src={`${base}images/taste-v2/metorom-logo.webp`} alt="Metorom" width="260" height="107" />
        </a>
        <button
          ref={menuButtonRef}
          className="site-header__menu"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="metorom-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-header__menu-glyph" aria-hidden="true"><i /><i /></span>
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav id="metorom-navigation" className={`site-header__nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => <a key={link.label} href={link.href} aria-current={contact && link.label === "Contact" ? "page" : undefined} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
        </nav>
        <button className="site-header__sound" type="button" aria-pressed={sound.enabled} aria-label={sound.enabled ? "Turn off scroll sound" : "Turn on scroll sound"} onClick={() => void sound.toggle()}>
          <span className="site-header__sound-glyph" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span>Sound {sound.enabled ? "on" : "off"}</span>
        </button>
      </header>
    </>
  );
}

export default SiteChrome;
