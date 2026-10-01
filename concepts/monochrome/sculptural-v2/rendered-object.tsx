import { useCallback, useEffect, useRef, useState } from "react";

const POSTER = `${import.meta.env.BASE_URL}images/concepts/speaker-wireframe-poster.png`;
const FILM = `${import.meta.env.BASE_URL}videos/speaker-scroll.mp4`;

type Position = { percent: number; view: "Front" | "Back" | "Top" };

function viewAt(progress: number): Position["view"] {
  if (progress < 0.25) return "Front";
  if (progress < 0.75) return "Back";
  return "Top";
}

export default function RenderedObject() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);
  const [position, setPosition] = useState<Position>({ percent: 0, view: "Front" });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const outro = Math.min(1, Math.max(0, (position.percent / 100 - 0.82) / 0.18));

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
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
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
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [seekToScroll]);

  return (
    <section ref={sectionRef} className="sc-object" id="object" aria-labelledby="sc-object-title">
      <div className="sc-object__sticky">
        <div className="sc-object__copy">
          <p className="sc-overline">ONE FORM / THREE ACOUSTIC PATHS</p>
          <h2 id="sc-object-title">The object<br />in the room.</h2>
          <p className="sc-object__intro">The horn, midrange drivers, and lower cabinet make one clear system. Scroll to follow the speaker from front to back and over the top.</p>
          <div className="sc-object__view">
            <span>VIEW / {position.view.toUpperCase()}</span>
            <span>{position.percent.toString().padStart(2, "0")}%</span>
          </div>
          <div className="sc-object__track" role="progressbar" aria-label="Speaker film progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={position.percent} aria-valuetext={`${position.view} view, ${position.percent}%`}><span style={{ transform: `scaleX(${position.percent / 100})` }} /></div>
          <p className="sc-object__hint">The film follows your scroll. Move up to turn the speaker back.</p>
        </div>
        <div className="sc-object__stage" aria-busy={!ready && !error}>
          {!ready && <img className="sc-object__poster" src={POSTER} alt="Wireframe study of the Metorom loudspeaker" width="640" height="760" loading="lazy" decoding="async" />}
          {!error && <video
            ref={videoRef}
            className={`sc-object__video${ready ? " is-ready" : ""}`}
            src={FILM}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-label="Scroll-controlled wireframe film of the Metorom loudspeaker rotating from the front to the back and top"
            onLoadedMetadata={seekToScroll}
            onLoadedData={() => { setReady(true); seekToScroll(); }}
            onSeeked={seekToScroll}
            onError={() => setError(true)}
          />}
          <div className="sc-object__transition" style={{ opacity: outro }} aria-hidden="true" />
          <div className="sc-object__stage-label" style={{ opacity: 1 - outro * 0.65 }}><span>METOROM / MODEL 001</span><span>{ready ? "WIREFRAME FILM" : error ? "WIREFRAME STUDY" : "PREPARING FILM"}</span></div>
          {!ready && !error && <div className="sc-object__loading" role="status">Loading the speaker film</div>}
          {error && <p className="sc-object__fallback" role="status">The film is unavailable here. The wireframe still shows the speaker.</p>}
        </div>
      </div>
    </section>
  );
}
