import { useRef, useState } from "react";
import type { SiteCopy } from "./site-copy";

type Driver = "sub" | "mid";

const POSTER = `${import.meta.env.BASE_URL}images/concepts/speaker-interactive-front.png`;
const FILMS: Record<Driver, string> = {
  sub: `${import.meta.env.BASE_URL}videos/speaker-sub.mp4`,
  mid: `${import.meta.env.BASE_URL}videos/speaker-mid-left.mp4`,
};

export default function RenderedObject({ copy }: { copy: SiteCopy }) {
  const videos = useRef<Record<Driver, HTMLVideoElement | null>>({ sub: null, mid: null });
  const requestedDriver = useRef<Driver | null>(null);
  const playbackGeneration = useRef(0);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [visibleVideo, setVisibleVideo] = useState<Driver | null>(null);
  const [locked, setLocked] = useState(false);
  const [failedDrivers, setFailedDrivers] = useState<Set<Driver>>(() => new Set());
  const [playbackError, setPlaybackError] = useState(false);

  const drivers = [
    { id: "sub" as const, label: copy.objectSubLabel },
    { id: "mid" as const, label: copy.objectMidLeftLabel },
  ];
  const activeLabel = activeDriver === "sub" ? copy.objectSubLabel : activeDriver === "mid" ? copy.objectMidLeftLabel : null;

  function stopVideos() {
    for (const video of Object.values(videos.current)) {
      if (!video) continue;
      video.pause();
      video.loop = false;
      try { video.currentTime = 0; } catch { /* The still image remains visible. */ }
    }
  }

  function reset() {
    playbackGeneration.current += 1;
    requestedDriver.current = null;
    stopVideos();
    setActiveDriver(null);
    setVisibleVideo(null);
    setLocked(false);
    setPlaybackError(false);
  }

  function playDriver(driver: Driver, pin: boolean) {
    if (failedDrivers.has(driver)) return;
    const video = videos.current[driver];
    if (!video) return;
    const generation = ++playbackGeneration.current;
    requestedDriver.current = driver;
    stopVideos();
    video.loop = false;
    setActiveDriver(driver);
    setVisibleVideo(null);
    setLocked(pin);
    setPlaybackError(false);
    void video.play().catch(() => {
      // Muted hover playback can be restricted in some browsers. Click remains available.
      if (playbackGeneration.current !== generation) return;
      reset();
      if (pin) setPlaybackError(true);
    });
  }

  function preview(driver: Driver, pointerType: string) {
    if ((pointerType === "mouse" || pointerType === "pen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !locked && activeDriver !== driver) {
      playDriver(driver, false);
    }
  }

  function leavePreview(driver: Driver) {
    if (!locked && activeDriver === driver) reset();
  }

  return (
    <section className="sc-object" id="object" aria-labelledby="sc-object-title">
      <div className="sc-object__sticky">
        <div className="sc-object__copy">
          <p className="sc-overline">{copy.objectOverline}</p>
          <h2 id="sc-object-title">{copy.objectTitle}</h2>
          <p className="sc-object__intro">{copy.objectBody}</p>
          <div className="sc-object__controls" role="group" aria-label={copy.objectPlayLabel}>
            {drivers.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`sc-object__control${activeDriver === id ? " is-active" : ""}`}
                aria-label={`${copy.objectPlayLabel}: ${label}`}
                aria-pressed={locked && activeDriver === id}
                disabled={failedDrivers.has(id)}
                onPointerEnter={(event) => preview(id, event.pointerType)}
                onPointerLeave={() => leavePreview(id)}
                onClick={() => playDriver(id, true)}
              >
                <span className="sc-object__control-dot" aria-hidden="true" />
                {label}
              </button>
            ))}
            <button type="button" className="sc-object__reset" disabled={!activeDriver} onClick={reset}>{copy.objectResetLabel}</button>
          </div>
          <p className="sc-object__hint">{copy.objectHint}</p>
        </div>
        <div className="sc-object__stage">
          <div className="sc-object__media">
            <img className="sc-object__front" src={POSTER} alt={copy.objectPosterAlt} width="1920" height="1920" loading="lazy" decoding="async" />
            {drivers.map(({ id }) => (
              <video
                key={id}
                ref={(element) => { videos.current[id] = element; }}
                className={`sc-object__film${visibleVideo === id ? " is-visible" : ""}`}
                src={FILMS[id]}
                preload="auto"
                muted
                playsInline
                disablePictureInPicture
                aria-hidden="true"
                onPlaying={() => { if (requestedDriver.current === id) setVisibleVideo(id); }}
                onError={() => { setFailedDrivers((current) => new Set(current).add(id)); if (requestedDriver.current === id) reset(); setPlaybackError(true); }}
              />
            ))}
            {drivers.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`sc-object__hotspot sc-object__hotspot--${id}${activeDriver === id ? " is-active" : ""}`}
                aria-label={`${copy.objectPlayLabel}: ${label}`}
                aria-pressed={locked && activeDriver === id}
                disabled={failedDrivers.has(id)}
                onPointerEnter={(event) => preview(id, event.pointerType)}
                onPointerLeave={() => leavePreview(id)}
                onClick={() => playDriver(id, true)}
              ><span>{label}</span></button>
            ))}
          </div>
          <div className="sc-object__stage-label">
            <span>{copy.objectBrand} / {copy.objectStageModel}</span>
            <span aria-live="polite">{activeLabel ? `${copy.objectStageFilm} / ${activeLabel}` : copy.objectStageStudy}</span>
          </div>
          {playbackError && <p className="sc-object__fallback" role="status">{copy.objectFallback}</p>}
        </div>
      </div>
    </section>
  );
}
