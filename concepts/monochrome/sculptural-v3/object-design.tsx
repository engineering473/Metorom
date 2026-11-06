import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ObjectDesignDialog, { type DesignPart, type PartId } from "./object-design-dialog";
import { DESIGN_COPY_EN, DESIGN_COPY_JA } from "./design-copy";
import { PageEditor, usePagePreview } from "./page-editor";
import { useLanguage } from "./language";
import { speakerPhotos } from "./speaker-photos";
import GalleryLoader from "./gallery-loader";
import type { SiteCopy } from "./site-copy";
import "./object-design.css";

const preloadCarousel = () => import("@/components/ui/liquid-glass-carousel");
const LiquidGlassCarousel = lazy(preloadCarousel);
const INITIAL_PHOTO_INDEX = 3;
const assets = {
  render: import.meta.env.BASE_URL + "images/concepts/speaker-interactive-front-v3.webp",
  assembly: import.meta.env.BASE_URL + "images/concepts/speaker-exploded-study-v3.webp",
  horn: import.meta.env.BASE_URL + "images/concepts/horn-assembly-study-v3.webp",
  proposal: import.meta.env.BASE_URL + "drawings/horn-design-proposal.pdf",
};
type GalleryProgress = { completed: number; total: number; failed: number };
type ScrollGeometry = { start: number; distance: number };

class GalleryModuleBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function selectedFromHash(): PartId | null {
  const match = /^#object-design-(horn|midrange|bass)$/.exec(window.location.hash);
  return match ? match[1] as PartId : null;
}
function clampProgress(value: number) { return Math.max(0, Math.min(1, value)); }

export default function ObjectDesign({ copy: siteCopy }: { copy: SiteCopy }) {
  const [copy, settings, setSettings] = usePagePreview("design", DESIGN_COPY_EN, DESIGN_COPY_JA);
  const [language] = useLanguage();
  const [selected, setSelected] = useState<PartId | null>(selectedFromHash);
  const [mountCarousel, setMountCarousel] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState<GalleryProgress>({ completed: 0, total: 8, failed: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);
  const progressRef = useRef(0);
  const geometryRef = useRef<ScrollGeometry | null>(null);
  const scheduleRef = useRef<(() => void) | null>(null);
  const initialDeepLink = useRef(selected !== null);
  const items = useMemo(() => speakerPhotos(language), [language]);
  const initialPhoto = items[INITIAL_PHOTO_INDEX];
  const ja = language === "ja";
  const parts: DesignPart[] = [
    { id: "horn", title: copy.hornTitle, part: copy.hornPart, body: copy.hornFunction, detail: copy.hornDetail, material: copy.hornMaterial, drawing: assets.horn, drawingAlt: copy.hornDrawingAlt, caption: copy.hornDrawing },
    { id: "midrange", title: copy.midTitle, part: copy.midPart, body: copy.midFunction, detail: copy.midDetail, material: copy.midMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
    { id: "bass", title: copy.bassTitle, part: copy.bassPart, body: copy.bassFunction, detail: copy.bassDetail, material: copy.bassMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
  ];

  useEffect(() => {
    const syncHash = () => setSelected(selectedFromHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Fetch the module before the visitor arrives; mount near the gallery so
    // texture preparation also starts before the sticky sequence enters view.
    let idle = 0;
    let timer = 0;
    const prefetch = () => { void preloadCarousel().catch(() => {}); };
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(prefetch, { timeout: 1200 });
    else timer = window.setTimeout(prefetch, 500);
    const section = sectionRef.current;
    let observer: IntersectionObserver | undefined;
    if (!section || !("IntersectionObserver" in window)) setMountCarousel(true);
    else {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setMountCarousel(true); observer?.disconnect(); }
      }, { rootMargin: "1400px" });
      observer.observe(section);
    }
    return () => {
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  const measureScroll = useCallback((): ScrollGeometry | null => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return null;
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
    const geometry = {
      start: section.getBoundingClientRect().top + window.scrollY - top,
      distance: Math.max(1, section.getBoundingClientRect().height - stage.getBoundingClientRect().height),
    };
    geometryRef.current = geometry;
    return geometry;
  }, []);

  useEffect(() => {
    if (reducedMotion) { geometryRef.current = null; return; }
    let frame = 0;
    let preserveAfterResize: number | null = null;
    const update = () => {
      frame = 0;
      const geometry = measureScroll();
      if (!geometry) return;
      if (preserveAfterResize !== null && !focusedRef.current) {
        window.scrollTo({ top: geometry.start + preserveAfterResize * geometry.distance, behavior: "instant" });
        preserveAfterResize = null;
      }
      const next = clampProgress((window.scrollY - geometry.start) / geometry.distance);
      progressRef.current = next;
      if (!focusedRef.current) setScrollProgress(previous => Math.abs(previous - next) < .00001 ? previous : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => {
      if (geometryRef.current && progressRef.current > 0 && progressRef.current < 1 && !focusedRef.current) preserveAfterResize = progressRef.current;
      schedule();
    };
    scheduleRef.current = schedule;
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(schedule);
    if (sectionRef.current) observer.observe(sectionRef.current);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      scheduleRef.current = null;
    };
  }, [measureScroll, reducedMotion]);

  const navigateScroll = useCallback((requested: number) => {
    if (focusedRef.current) return;
    const geometry = measureScroll();
    if (!geometry) return;
    const next = clampProgress(requested);
    progressRef.current = next;
    setScrollProgress(next);
    // Arrows and horizontal drag move through the same finite page track.
    window.scrollTo({ top: geometry.start + next * geometry.distance, behavior: "instant" });
  }, [measureScroll]);
  const handleFocusChange = useCallback((focused: boolean) => {
    focusedRef.current = focused;
    if (!focused) scheduleRef.current?.();
  }, []);
  const continueFromPreview = useCallback((delta: number) => {
    if (reducedMotion) { window.scrollBy({ top: delta, behavior: "instant" }); return; }
    const geometry = measureScroll();
    if (!geometry) return;
    // A preview is an alternative way to browse the photographs, so it does
    // not require completing an unseen carousel turn before leaving.
    const boundary = delta > 0 ? geometry.start + geometry.distance : geometry.start;
    window.scrollTo({ top: boundary + delta, behavior: "instant" });
  }, [measureScroll, reducedMotion]);
  const handleReadyChange = useCallback((ready: boolean) => setCarouselReady(ready), []);
  const handleLoadProgress = useCallback((progress: GalleryProgress) => {
    setLoadProgress(previous => previous.completed === progress.completed && previous.total === progress.total && previous.failed === progress.failed ? previous : progress);
  }, []);
  const handleModuleFailure = useCallback(() => setCarouselReady(true), []);

  const revealPart = useCallback((id: PartId) => {
    setSelected(id);
    window.history.replaceState(null, "", window.location.pathname + window.location.search + "#object-design-" + id);
  }, []);
  const closeDetails = useCallback(() => {
    setSelected(null);
    if (window.location.hash.startsWith("#object-design-")) window.history.replaceState(null, "", window.location.pathname + window.location.search + "#architecture");
  }, []);
  const restoreFocus = useCallback(() => {
    if (initialDeepLink.current) {
      initialDeepLink.current = false;
      sectionRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    sectionRef.current?.focus({ preventScroll: true });
  }, []);

  const placeholder = <div className="sc-speaker-gallery__placeholder" aria-hidden="true">
    <img src={initialPhoto.src} alt="" style={{ objectPosition: (initialPhoto.focalPoint?.[0] ?? .5) * 100 + "% " + (initialPhoto.focalPoint?.[1] ?? .5) * 100 + "%" }} width="1800" height="1200" loading="eager" decoding="async" />
  </div>;
  const moduleError = <div className="sc-speaker-gallery__error" role="alert">
    <p>{ja ? "写真を読み込めませんでした。" : "The photographs could not load."}</p>
    <button type="button" onClick={() => window.location.reload()}>{ja ? "ページを再読み込み" : "Reload page"}</button>
  </div>;

  return <>
    <div className={"sc-speaker-gallery" + (!reducedMotion ? " sc-speaker-gallery--scroll" : "") + (carouselReady ? " is-ready" : "")}
      id="listening-design" ref={sectionRef} tabIndex={-1}
      data-scroll-progress={Math.round(scrollProgress * 1000) / 1000}
      data-scroll-driven={!reducedMotion} data-gallery-state={carouselReady ? "ready" : "loading"}
      style={{ "--sc-gallery-photo-count": items.length } as CSSProperties}>
      <div className="sc-speaker-gallery__stage" ref={stageRef} aria-busy={!carouselReady}>
        <div className="sc-speaker-gallery__content" inert={!carouselReady}>
          {mountCarousel ? <GalleryModuleBoundary fallback={moduleError} onFailure={handleModuleFailure}>
            <Suspense fallback={placeholder}>
              <LiquidGlassCarousel items={items} initialIndex={INITIAL_PHOTO_INDEX} panelHeight={480} gap={24} background="#ffffff" entry={false} showTitle={false}
                className="sc-speaker-gallery__carousel" style={{ color: "#101d8f", minHeight: 0 }}
                scrollProgress={reducedMotion ? undefined : scrollProgress}
                onScrollProgressChange={reducedMotion ? undefined : navigateScroll}
                onFocusChange={handleFocusChange} onPreviewScroll={continueFromPreview} onReadyChange={handleReadyChange} onLoadProgress={handleLoadProgress}
                ariaLabel={ja ? "Metorom スピーカーの写真" : "Metorom speaker photographs"}
                labels={ja
                  ? { previous: "前の写真", next: "次の写真", view: "写真を拡大", close: "写真を閉じる", help: reducedMotion ? "ドラッグで移動・タップで拡大" : "スクロールで移動・タップで拡大", previewHelp: "左右にスワイプ・写真の外側で閉じる", loading: "写真を読み込み中…", error: "写真を読み込めませんでした。前後の写真をお試しください。" }
                  : { previous: "Previous photograph", next: "Next photograph", view: "View photograph", close: "Close photograph", help: reducedMotion ? "Drag to explore · tap to view" : "Scroll to explore · tap to view", previewHelp: "Swipe to browse · tap outside to close", loading: "Loading photograph…", error: "This photograph could not load. Try the previous or next photograph." }} />
            </Suspense>
          </GalleryModuleBoundary> : placeholder}
        </div>
        <GalleryLoader visible={!carouselReady} completed={loadProgress.completed} total={loadProgress.total} failed={loadProgress.failed} language={language} />
      </div>
    </div>
    <ObjectDesignDialog part={parts.find(part => part.id === selected) ?? null} parts={parts} copy={copy} siteCopy={siteCopy} language={language} render={assets.render} proposal={assets.proposal} onSelect={revealPart} onClose={closeDetails} onRestoreFocus={restoreFocus} />
    {new URLSearchParams(window.location.search).get("editor") === "design" && <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />}
  </>;
}
