"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import "./inversion-circle-scroll-animation.css";

type InversionCircleScrollAnimationProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  scrollLabel: string;
  caption: string;
  contentId?: string;
  children: ReactNode;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** The supplied two-phase circle animation, using the document's scroll context. */
export default function InversionCircleScrollAnimation({
  title, description, actionLabel, actionHref, scrollLabel, caption, contentId = "concept", children,
}: InversionCircleScrollAnimationProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const hero = heroRef.current;
    if (!track || !hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = hero.clientHeight;
      const width = hero.clientWidth;
      if (!height || !width) return;
      const progress = Math.max(0, -track.getBoundingClientRect().top / height);
      const phaseOne = reduced.matches ? 0 : clamp(progress);
      const phaseTwo = reduced.matches ? 0 : clamp(progress - 1);
      const easedRise = phaseOne < .5 ? 8 * phaseOne ** 4 : 1 - (-2 * phaseOne + 2) ** 4 / 2;
      const baseSize = Math.min(380, width * .84);
      const offset = (1 - easedRise) * (height / 2 + baseSize / 2);
      const diameter = baseSize + phaseTwo ** 2 * (Math.max(width, height) * 2.8 - baseSize);
      track.style.setProperty("--icsa-ball-size", `${baseSize}px`);
      track.style.setProperty("--icsa-y", `${offset}px`);
      track.style.setProperty("--icsa-scale", `${diameter / baseSize}`);
      track.style.setProperty("--icsa-clip", `circle(${diameter / 2}px at ${width / 2}px ${height / 2 + offset}px)`);
      track.dataset.scrollProgress = String(Math.min(2, progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(hero);
    window.addEventListener("scroll", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setContentVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setContentVisible(true); observer.disconnect(); }
    }, { threshold: .25 });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const lettering = (duplicate: boolean) => <>
    <div className="icsa-statement">
      {duplicate ? <div className="icsa-title">{title}</div> : <h1 className="icsa-title" id="landing-title">{title}</h1>}
      <p className="icsa-description">{description}</p>
      {duplicate
        ? <span className="icsa-action">{actionLabel}<ArrowUpRight size={17} /></span>
        : <a className="icsa-action" href={actionHref}>{actionLabel}<ArrowUpRight size={17} aria-hidden="true" /></a>}
    </div>
    <div className="icsa-foot">
      <span>{caption}</span>
      {duplicate
        ? <span className="icsa-scroll">{scrollLabel}<ArrowDown size={16} /></span>
        : <a className="icsa-scroll" href={`#${contentId}`}>{scrollLabel}<ArrowDown size={16} aria-hidden="true" /></a>}
    </div>
  </>;

  return <div className="icsa-wrap">
    <div ref={trackRef} className="icsa-track" id="top">
      <section ref={heroRef} className="icsa-hero" aria-labelledby="landing-title">
        <div className="icsa-ball" aria-hidden="true" />
        <div className="icsa-layer icsa-dark">{lettering(false)}</div>
        <div className="icsa-layer icsa-light" aria-hidden="true">{lettering(true)}</div>
      </section>
    </div>
    <section ref={contentRef} className={`icsa-cs${contentVisible ? " on" : ""}`} id={contentId} aria-labelledby="landing-concept-title">
      <div className="icsa-inner">{children}</div>
    </section>
  </div>;
}
