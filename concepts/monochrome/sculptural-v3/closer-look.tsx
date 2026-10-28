import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useLanguage } from "./language";
import type { SiteCopy } from "./site-copy";
import "./gallery.css";

export type CloserLookSlide = { src: string; alt: string; title?: string; subtitle?: string; placeholder?: string };

export default function CloserLook({ copy, slides }: { copy: SiteCopy; slides: CloserLookSlide[] }) {
  const [language] = useLanguage();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [resumeRequested, setResumeRequested] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [announcement, setAnnouncement] = useState("");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const section = useRef<HTMLElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; time: number } | null>(null);
  const wheel = useRef({ distance: 0, last: 0, advanced: 0 });
  const count = slides.length;
  const index = count ? selected % count : 0;
  const active = slides[index];
  const playing = !paused && (resumeRequested || (!hovered && !focused)) && !reduced && visible && count > 1;
  const ja = language === "ja";

  const go = useCallback((next: number, announce = true) => {
    if (!count) return;
    setResumeRequested(false);
    const target = ((next % count) + count) % count;
    setSelected(target);
    if (announce) setAnnouncement(`${target + 1} / ${count} — ${slides[target]?.title || slides[target]?.alt || ""}`);
  }, [count, slides]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setSelected((current) => (current + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [count, playing]);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    // Advance the images without consuming the page's native vertical scroll.
    const onWheel = (event: WheelEvent) => {
      if (count < 2 || event.ctrlKey) return;
      setResumeRequested(false);
      const now = performance.now();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      if (now - wheel.current.last > 200 || Math.sign(delta) !== Math.sign(wheel.current.distance)) wheel.current.distance = 0;
      wheel.current.last = now;
      wheel.current.distance += delta * scale;
      if (Math.abs(wheel.current.distance) < 60 || now - wheel.current.advanced < 400) return;
      const direction = Math.sign(wheel.current.distance);
      wheel.current.distance = 0;
      wheel.current.advanced = now;
      setSelected((current) => (current + direction + count) % count);
    };
    node.addEventListener("wheel", onWheel, { passive: true });
    return () => node.removeEventListener("wheel", onWheel);
  }, [count]);

  const finishGesture = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    const speed = Math.abs(x) / Math.max(1, performance.now() - start.time);
    if (Math.abs(x) > Math.max(35, Math.abs(y) * 1.2) && (Math.abs(x) > 75 || speed > 0.3)) go(index + (x < 0 ? 1 : -1));
  };

  return <section ref={section} className="sc-gallery sc-closer-look" id="gallery" aria-labelledby="sc-gallery-title" data-index-theme="dark">
    <div className="sc-closer-look__images" aria-hidden="true">
      {slides.map((slide, slideIndex) => <div key={`${slideIndex}-${slide.src}`} className={`sc-closer-look__image${slideIndex === index ? " is-active" : ""}`}>
        {slide.src && !failedImages[slide.src]
          ? <img src={slide.src} alt="" draggable={false} loading="eager" decoding="async" onError={() => setFailedImages((current) => ({ ...current, [slide.src]: true }))} />
          : <div className="sc-closer-look__placeholder"><span>{copy.brandName}</span><p>{slide.placeholder || copy.galleryPlaceholder}</p></div>}
      </div>)}
    </div>
    <header className="sc-closer-look__heading">
      <h2 id="sc-gallery-title">{copy.galleryTitle}</h2>
      <p>{copy.galleryIntroduction}</p>
    </header>
    <div className="sc-closer-look__stage" role="region" aria-roledescription={ja ? "カルーセル" : "carousel"} aria-label={copy.galleryLabel} tabIndex={count > 1 ? 0 : -1}
      onMouseEnter={() => { setHovered(true); setResumeRequested(false); }} onMouseLeave={() => { setHovered(false); setResumeRequested(false); }}
      onFocus={() => { setFocused(true); setResumeRequested(false); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); setResumeRequested(false); } }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
        if (event.key === "Home") { event.preventDefault(); go(0); }
        if (event.key === "End") { event.preventDefault(); go(count - 1); }
      }}>
      <div className="sc-closer-look__swipe" onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        setResumeRequested(false);
        event.currentTarget.setPointerCapture(event.pointerId);
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
      }} onPointerUp={finishGesture} onPointerCancel={() => { gesture.current = null; }} />
      <div className="sc-closer-look__bottom">
        <div className="sc-closer-look__caption" role="group" aria-roledescription={ja ? "スライド" : "slide"} aria-label={`${index + 1} / ${count}: ${active?.alt || copy.galleryPlaceholder}`}>
          <span className="sc-closer-look__counter">{String(count ? index + 1 : 0).padStart(2, "0")} <span>/ {String(count).padStart(2, "0")}</span></span>
          <div><p>{active?.title || copy.galleryPlaceholder}</p>{active?.subtitle && <span>{active.subtitle}</span>}</div>
        </div>
        <div className="sc-closer-look__controls">
          <p className="sc-closer-look__hint">{ja ? "スワイプ・スクロールで次へ" : "Swipe or scroll to explore"}</p>
          <div>
            <button type="button" disabled={count < 2} aria-label={copy.galleryPrevious} onClick={() => go(index - 1)}><ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" /></button>
            <button type="button" disabled={count < 2 || reduced} aria-label={paused ? (ja ? "自動再生を再開" : "Resume automatic slideshow") : (ja ? "自動再生を一時停止" : "Pause automatic slideshow")} aria-pressed={paused} onClick={() => { setPaused(!paused); setResumeRequested(paused); }}>{paused || reduced ? <Play size={17} strokeWidth={1.5} aria-hidden="true" /> : <Pause size={17} strokeWidth={1.5} aria-hidden="true" />}</button>
            <button type="button" disabled={count < 2} aria-label={copy.galleryNext} onClick={() => go(index + 1)}><ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      <div className="sc-closer-look__pagination" role="group" aria-label={copy.galleryLabel}>
        {slides.map((_, slideIndex) => <button key={slideIndex} type="button" aria-label={`${copy.galleryGoTo} ${slideIndex + 1}`} aria-current={slideIndex === index ? "true" : undefined} onClick={() => go(slideIndex)}><span /></button>)}
      </div>
    </div>
    <span className="sc-closer-look__announcement" aria-live="polite" aria-atomic="true">{announcement}</span>
  </section>;
}
