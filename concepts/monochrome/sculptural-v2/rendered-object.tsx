import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteCopy } from "./site-copy";

const POSTER = `${import.meta.env.BASE_URL}images/concepts/speaker-wireframe-poster.png`;
const FILM = `${import.meta.env.BASE_URL}videos/speaker-scroll.mp4`;
const FRAMES = `${import.meta.env.BASE_URL}images/concepts/speaker-turntable.webp`;
const FRAME_COUNT = 25;
const FRAME_COLUMNS = 5;

type Position = { percent: number; view: "Front" | "Back" | "Top" };

function viewAt(progress: number): Position["view"] {
  if (progress < 0.25) return "Front";
  if (progress < 0.75) return "Back";
  return "Top";
}

export default function RenderedObject({ copy }: { copy: SiteCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);
  const [position, setPosition] = useState<Position>({ percent: 0, view: "Front" });
  const [frameMode, setFrameMode] = useState(() => window.matchMedia("(max-width: 760px), (pointer: coarse)").matches);
  const [framesReady, setFramesReady] = useState(false);
  const [framesError, setFramesError] = useState(false);
  const [filmReady, setFilmReady] = useState(false);
  const [filmError, setFilmError] = useState(false);
  const frame = Math.min(FRAME_COUNT - 1, Math.round(position.percent / 100 * (FRAME_COUNT - 1)));
  const frameColumn = frame % FRAME_COLUMNS;
  const frameRow = Math.floor(frame / FRAME_COLUMNS);
  const showFilm = !frameMode && !filmError;
  const showingFilm = showFilm && filmReady;
  const ready = showingFilm || framesReady;
  const view = position.view === "Front" ? copy.viewFront : position.view === "Back" ? copy.viewBack : copy.viewTop;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const update = () => { setFrameMode(query.matches); setFilmReady(false); };
    if (query.addEventListener) {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    query.addListener(update);
    return () => query.removeListener(update);
  }, []);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setFramesReady(true);
    image.onerror = () => setFramesError(true);
    image.src = FRAMES;
    return () => { image.onload = null; image.onerror = null; };
  }, []);

  const seekToScroll = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || video.seeking) return;
    const lastFrame = Math.max(0, video.duration - 1 / 24);
    const target = Math.min(lastFrame, Math.max(0, progressRef.current * lastFrame));
    if (Math.abs(video.currentTime - target) > 1 / 40) {
      try { video.currentTime = target; } catch { /* The poster remains visible until the browser can seek. */ }
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      if (!section || !sticky) return;
      const rect = section.getBoundingClientRect();
      // Use the pinned element's own height: svh can differ from innerHeight
      // when mobile browser chrome opens, and the desktop layout has a floor.
      const range = Math.max(1, rect.height - sticky.getBoundingClientRect().height);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      progressRef.current = progress;
      const next = { percent: Math.round(progress * 100), view: viewAt(progress) };
      setPosition((previous) => previous.percent === next.percent && previous.view === next.view ? previous : next);
      seekToScroll();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    if (sectionRef.current) resizeObserver.observe(sectionRef.current);
    if (stickyRef.current) resizeObserver.observe(stickyRef.current);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [seekToScroll]);

  return (
    <section ref={sectionRef} className="sc-object" id="object" aria-labelledby="sc-object-title">
      <div ref={stickyRef} className="sc-object__sticky">
        <div className="sc-object__copy">
          <p className="sc-overline">{copy.objectOverline}</p>
          <h2 id="sc-object-title">{copy.objectTitle}</h2>
          <p className="sc-object__intro">{copy.objectBody}</p>
          <div className="sc-object__view">
            <span>{copy.viewLabel} / {view}</span>
            <span>{position.percent.toString().padStart(2, "0")}%</span>
          </div>
          <div className="sc-object__track" role="progressbar" aria-label={copy.objectProgressAria} aria-valuemin={0} aria-valuemax={100} aria-valuenow={position.percent} aria-valuetext={`${copy.viewLabel} / ${view}, ${position.percent}%`}><span style={{ transform: `scaleX(${position.percent / 100})` }} /></div>
          <p className="sc-object__hint">{copy.objectHint}</p>
        </div>
        <div className="sc-object__stage" aria-busy={!ready && !framesError}>
          {!ready && <img className="sc-object__poster" src={POSTER} alt={copy.objectPosterAlt} width="640" height="760" loading="lazy" decoding="async" />}
          <div className={`sc-object__sprite${framesReady && !showingFilm ? " is-ready" : ""}`} aria-hidden="true">
            <div className="sc-object__sprite-frame" style={{ backgroundImage: `url("${FRAMES}")`, backgroundPosition: `${frameColumn * 25}% ${frameRow * 25}%` }} />
          </div>
          {showFilm && <video
            ref={videoRef}
            className={`sc-object__video${filmReady ? " is-ready" : ""}`}
            src={FILM}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-label={copy.objectVideoAlt}
            onLoadedMetadata={seekToScroll}
            onLoadedData={() => { setFilmReady(true); seekToScroll(); }}
            onSeeked={seekToScroll}
            onError={() => setFilmError(true)}
          />}
          <div className="sc-object__stage-label"><span>{copy.objectBrand} / {copy.objectStageModel}</span><span>{showingFilm ? copy.objectStageFilm : framesReady ? copy.objectStageStudy : copy.objectStageModel}</span></div>
          {framesError && !showingFilm && <p className="sc-object__fallback" role="status">{copy.objectFallback}</p>}
        </div>
      </div>
    </section>
  );
}
