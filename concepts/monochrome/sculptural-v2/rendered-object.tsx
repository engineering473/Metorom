import { useEffect, useRef, useState } from "react";
import type { SiteCopy } from "./site-copy";

type Driver = "sub" | "mid" | "right" | "tweeter";
type Direction = "forward" | "reverse";
type Film = `${Driver}-${Direction}`;
type Playback = { driver: Driver; direction: Direction };

const POSTER = `${import.meta.env.BASE_URL}images/concepts/speaker-interactive-front.png`;
const FRAME_RATE = 24;
const FILMS: Record<Film, string> = {
  "sub-forward": `${import.meta.env.BASE_URL}videos/speaker-sub.mp4`,
  "sub-reverse": `${import.meta.env.BASE_URL}videos/speaker-sub-reverse.mp4`,
  "mid-forward": `${import.meta.env.BASE_URL}videos/speaker-mid-left.mp4`,
  "mid-reverse": `${import.meta.env.BASE_URL}videos/speaker-mid-left-reverse.mp4`,
  "right-forward": `${import.meta.env.BASE_URL}videos/speaker-mid-right.mp4`,
  "right-reverse": `${import.meta.env.BASE_URL}videos/speaker-mid-right-reverse.mp4`,
  "tweeter-forward": `${import.meta.env.BASE_URL}videos/speaker-tweeter.mp4`,
  "tweeter-reverse": `${import.meta.env.BASE_URL}videos/speaker-tweeter-reverse.mp4`,
};

function lastFrameTime(video: HTMLVideoElement) {
  return Math.max(0, video.duration - 1 / FRAME_RATE);
}

function waitForVideo(video: HTMLVideoElement, event: "loadedmetadata" | "loadeddata" | "seeked", signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const cleanUp = () => {
      video.removeEventListener(event, ready);
      video.removeEventListener("error", failed);
      signal.removeEventListener("abort", aborted);
    };
    const ready = () => { cleanUp(); resolve(); };
    const failed = () => { cleanUp(); reject(new Error("Video unavailable")); };
    const aborted = () => { cleanUp(); reject(new Error("Playback interrupted")); };
    video.addEventListener(event, ready, { once: true });
    video.addEventListener("error", failed, { once: true });
    signal.addEventListener("abort", aborted, { once: true });
    if (signal.aborted) aborted();
    else if (video.error) failed();
  });
}

export default function RenderedObject({ copy }: { copy: SiteCopy }) {
  const videos = useRef<Partial<Record<Film, HTMLVideoElement>>>({});
  const requestedPlayback = useRef<Playback | null>(null);
  const pendingPlayback = useRef<AbortController | null>(null);
  const visibleFilm = useRef<Film | null>(null);
  const pinned = useRef(false);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [visibleVideo, setVisibleVideo] = useState<Film | null>(null);
  const [locked, setLocked] = useState(false);
  const [failedDrivers, setFailedDrivers] = useState<Set<Driver>>(() => new Set());
  const [playbackError, setPlaybackError] = useState(false);

  const drivers = [
    { id: "sub" as const, label: copy.objectSubLabel },
    { id: "mid" as const, label: copy.objectMidLeftLabel },
    { id: "right" as const, label: copy.objectMidRightLabel },
    { id: "tweeter" as const, label: copy.objectTweeterLabel },
  ];
  const activeLabel = drivers.find(({ id }) => id === activeDriver)?.label;

  useEffect(() => () => {
    pendingPlayback.current?.abort();
    for (const video of Object.values(videos.current)) video?.pause();
  }, []);

  function stopVideos() {
    for (const video of Object.values(videos.current)) {
      if (!video) continue;
      video.pause();
    }
  }

  function reset() {
    pendingPlayback.current?.abort();
    requestedPlayback.current = null;
    visibleFilm.current = null;
    pinned.current = false;
    stopVideos();
    setActiveDriver(null);
    setVisibleVideo(null);
    setLocked(false);
    setPlaybackError(false);
  }

  function progressFor(driver: Driver) {
    const film = visibleFilm.current;
    const video = film && videos.current[film];
    if (!film?.startsWith(`${driver}-`) || !video || !Number.isFinite(video.duration)) return 0;
    // Reverse clips contain the same frames in the opposite order. Their last
    // frame is one frame interval before duration, so duration - time is offset.
    const time = Math.floor(Math.min(video.currentTime, lastFrameTime(video)) * FRAME_RATE + 0.0001) / FRAME_RATE;
    return film.endsWith("forward") ? time : lastFrameTime(video) - time;
  }

  async function playFrom(driver: Driver, direction: Direction, time: number, pin: boolean) {
    const film: Film = `${driver}-${direction}`;
    const video = videos.current[film];
    if (!video) return;
    pendingPlayback.current?.abort();
    const controller = new AbortController();
    pendingPlayback.current = controller;
    requestedPlayback.current = { driver, direction };
    pinned.current = pin;
    stopVideos();
    setActiveDriver(driver);
    setLocked(pin);
    setPlaybackError(false);
    try {
      if (video.readyState < 1) await waitForVideo(video, "loadedmetadata", controller.signal);
      if (controller.signal.aborted) return;
      if (video.error) throw new Error("Video unavailable");
      const target = Math.max(0, Math.min(time, lastFrameTime(video)));
      const needsSeek = Math.abs(video.currentTime - target) > 0.0001;
      if (video.seeking || needsSeek) {
        const sought = waitForVideo(video, "seeked", controller.signal);
        if (needsSeek) video.currentTime = target;
        await sought;
      } else if (video.readyState < 2) {
        await waitForVideo(video, "loadeddata", controller.signal);
      }
      if (controller.signal.aborted) return;
      // Keep the old frame on screen until its counterpart has finished seeking.
      visibleFilm.current = film;
      setVisibleVideo(film);
      await video.play();
    } catch {
      if (controller.signal.aborted) return;
      reset();
      if (pin || direction === "reverse") setPlaybackError(true);
    }
  }

  function playDriver(driver: Driver, pin: boolean) {
    if (failedDrivers.has(driver)) return;
    const current = requestedPlayback.current;
    if (current?.driver === driver && current.direction === "forward") {
      if (pin) { pinned.current = true; setLocked(true); }
      return;
    }
    void playFrom(driver, "forward", progressFor(driver), pin);
  }

  function preview(driver: Driver, pointerType: string) {
    if ((pointerType === "mouse" || pointerType === "pen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !pinned.current) {
      playDriver(driver, false);
    }
  }

  function leavePreview(driver: Driver) {
    const current = requestedPlayback.current;
    if (pinned.current || current?.driver !== driver || current.direction !== "forward") return;
    const progress = progressFor(driver);
    const video = videos.current[`${driver}-forward`];
    if (!video || progress <= 0) { reset(); return; }
    void playFrom(driver, "reverse", lastFrameTime(video) - progress, false);
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
            {(Object.entries(FILMS) as [Film, string][]).map(([film, source]) => (
              <video
                key={film}
                ref={(element) => { if (element) videos.current[film] = element; else delete videos.current[film]; }}
                className={`sc-object__film${visibleVideo === film ? " is-visible" : ""}`}
                data-driver={film.split("-")[0]}
                data-direction={film.split("-")[1]}
                src={source}
                preload="auto"
                muted
                playsInline
                disablePictureInPicture
                aria-hidden="true"
                onEnded={() => {
                  const current = requestedPlayback.current;
                  if (current && `${current.driver}-${current.direction}` === film && current.direction === "reverse") reset();
                }}
                onError={() => {
                  const [driver, direction] = film.split("-") as [Driver, Direction];
                  if (direction === "forward") setFailedDrivers((current) => new Set(current).add(driver));
                  const current = requestedPlayback.current;
                  if (current && `${current.driver}-${current.direction}` === film) { reset(); setPlaybackError(true); }
                }}
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
