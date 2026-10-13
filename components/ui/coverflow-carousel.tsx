import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import "./coverflow-carousel.css";

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  paginationLabel?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(170px, 23vw, 280px)",
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = "Image carousel",
  previousLabel = "Previous image",
  nextLabel = "Next image",
  paginationLabel = "Go to image",
  className = "",
  cardClassName = "",
}: CoverflowCarouselProps) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{ id: number; x: number; pos: number; v: number; t: number } | null>(null);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback((pos: number) => count ? ((Math.round(pos) % count) + count) % count : 0, [count]);

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width || !count) return;
    const pitch = width * (1 + gap);
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - posRef.current;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }
      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
      const edge = loop && count > 1 ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.visibility = edge > 0 ? "visible" : "hidden";
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback((target: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    targetRef.current = target;
    setSelected(indexAt(target));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      posRef.current = target;
      paint();
      rafRef.current = null;
      return;
    }
    const step = () => {
      const remaining = target - posRef.current;
      if (Math.abs(remaining) < 0.0004) {
        posRef.current = target;
        paint();
        rafRef.current = null;
        return;
      }
      posRef.current += remaining * 0.16;
      paint();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [indexAt, paint]);

  const clampPosition = React.useCallback((pos: number) => loop ? pos : Math.max(0, Math.min(count - 1, pos)), [count, loop]);
  const goTo = React.useCallback((index: number) => {
    if (!count) return;
    const target = loop ? index + Math.round((targetRef.current - index) / count) * count : index;
    settle(clampPosition(target));
  }, [clampPosition, count, loop, settle]);
  const nudge = React.useCallback((by: number) => {
    if (count) settle(clampPosition(Math.round(targetRef.current) + by));
  }, [clampPosition, count, settle]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!count) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = { id: event.pointerId, x: event.clientX, pos: posRef.current, v: 0, t: performance.now() };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clampPosition(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;
    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clampPosition(Math.round(posRef.current + carried)));
  };

  React.useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      frame.style.perspective = `${widthRef.current * perspective}px`;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint, perspective]);

  React.useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  React.useEffect(() => {
    if (selected < count) return;
    posRef.current = 0;
    targetRef.current = 0;
    setSelected(0);
    paint();
  }, [count, paint, selected]);

  const active = slides[selected];
  return <div className={`cf-root ${className}`.trim()} style={{ "--cf-card": cardWidth } as React.CSSProperties} role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="cf-viewer">
      <div ref={frameRef} className="cf-frame" tabIndex={count ? 0 : -1} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); nudge(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); nudge(1); }
      }}>
        <div className="cf-stage">
          {slides.map((slide, index) => <div key={index} ref={(node) => { cardRefs.current[index] = node; }} className={`cf-card ${cardClassName}`.trim()} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`} aria-hidden={index !== selected}>
            {slide.src ? <img src={slide.src} alt={slide.alt} draggable={false} loading="lazy" decoding="async" /> : <div className="cf-placeholder"><span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span><Plus size={36} strokeWidth={1} aria-hidden="true" /><p>{slide.placeholder || slide.alt}</p></div>}
          </div>)}
        </div>
      </div>
      {showNavigation && count > 1 && <>
        <button className="cf-nav cf-nav--previous" type="button" aria-label={previousLabel} onClick={() => nudge(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button className="cf-nav cf-nav--next" type="button" aria-label={nextLabel} onClick={() => nudge(1)}><ChevronRight size={20} aria-hidden="true" /></button>
      </>}
    </div>
    {showCaption && active && <div className="cf-caption" aria-live="polite"><p>{active.title}</p>{active.subtitle && <span>{active.subtitle}</span>}{active.meta && <dl>{active.meta.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}</div>}
    {showPagination && count > 1 && <div className="cf-pagination" role="group" aria-label={label}>{slides.map((_, index) => <button key={index} type="button" aria-label={`${paginationLabel} ${index + 1}`} aria-current={index === selected ? "true" : undefined} onClick={() => goTo(index)} />)}</div>}
  </div>;
}
