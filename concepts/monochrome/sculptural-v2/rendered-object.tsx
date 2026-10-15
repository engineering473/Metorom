import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { SiteCopy } from "./site-copy";

type Driver = "sub" | "mid" | "right" | "tweeter";
type Direction = "forward" | "reverse";
type Film = `${Driver}-${Direction}` | "mid-explode";
type Playback = { driver: Driver; direction: Direction } | { driver: "mid"; direction: "explode" };

const POSTER = `${import.meta.env.BASE_URL}images/concepts/speaker-interactive-front.png`;
const FRAME_RATE = 24;
const FILMS: Record<Film, string> = {
  "sub-forward": `${import.meta.env.BASE_URL}videos/speaker-sub.mp4`,
  "sub-reverse": `${import.meta.env.BASE_URL}videos/speaker-sub-reverse.mp4`,
  "mid-forward": `${import.meta.env.BASE_URL}videos/speaker-mid-left.mp4`,
  "mid-reverse": `${import.meta.env.BASE_URL}videos/speaker-mid-left-reverse.mp4`,
  "mid-explode": `${import.meta.env.BASE_URL}videos/speaker-mid-left-explode.mp4`,
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
  const keyboardPreview = useRef<Driver | null>(null);
  const touchGesture = useRef<{ driver: Driver; pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const autoReturnDriver = useRef<Driver | null>(null);
  const explosionQueued = useRef(false);
  const lastPointerType = useRef("");
  const media = useRef<HTMLDivElement | null>(null);
  const [showFullFrame, setShowFullFrame] = useState(false);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [visibleVideo, setVisibleVideo] = useState<Film | null>(null);
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

  useEffect(() => {
    if (!showFullFrame || !window.matchMedia("(pointer: coarse)").matches) return;
    const frame = requestAnimationFrame(() => {
      media.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [showFullFrame]);

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
    keyboardPreview.current = null;
    autoReturnDriver.current = null;
    explosionQueued.current = false;
    stopVideos();
    setActiveDriver(null);
    setVisibleVideo(null);
    setShowFullFrame(false);
    setPlaybackError(false);
  }

  function progressFor(driver: Driver) {
    const film = visibleFilm.current;
    const video = film && videos.current[film];
    if (film === "mid-explode" || !film?.startsWith(`${driver}-`) || !video || !Number.isFinite(video.duration)) return 0;
    // Reverse clips contain the same frames in the opposite order. Their last
    // frame is one frame interval before duration, so duration - time is offset.
    const time = Math.floor(Math.min(video.currentTime, lastFrameTime(video)) * FRAME_RATE + 0.0001) / FRAME_RATE;
    return film.endsWith("forward") ? time : lastFrameTime(video) - time;
  }

  async function playFilm(film: Film, playback: Playback, time: number) {
    const video = videos.current[film];
    if (!video) return;
    pendingPlayback.current?.abort();
    const controller = new AbortController();
    pendingPlayback.current = controller;
    requestedPlayback.current = playback;
    stopVideos();
    setActiveDriver(playback.driver);
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
      if (film === "mid-explode") setShowFullFrame(true);
      setVisibleVideo(film);
      await video.play();
    } catch {
      if (controller.signal.aborted) return;
      reset();
      setPlaybackError(true);
    }
  }

  function playFrom(driver: Driver, direction: Direction, time: number) {
    return playFilm(`${driver}-${direction}`, { driver, direction }, time);
  }

  function startExplosion() {
    explosionQueued.current = false;
    void playFilm("mid-explode", { driver: "mid", direction: "explode" }, 0);
  }

  function playExplodedView() {
    if (explosionQueued.current || requestedPlayback.current?.direction === "explode") return;
    keyboardPreview.current = null;
    autoReturnDriver.current = null;
    explosionQueued.current = true;
    const current = requestedPlayback.current;
    const light = videos.current["mid-forward"];
    if (current?.driver === "mid" && current.direction === "forward" && light) {
      if (light.ended) startExplosion();
      return;
    }
    // The supplied explosion begins with the left midrange fully illuminated.
    void playFrom("mid", "forward", progressFor("mid"));
  }

  function activate(driver: Driver) {
    if (driver === "mid") playExplodedView();
    else playDriver(driver, true);
  }

  function playDriver(driver: Driver, autoReturn = false) {
    if (explosionQueued.current || requestedPlayback.current?.direction === "explode" || showFullFrame) return;
    if (failedDrivers.has(driver)) return;
    explosionQueued.current = false;
    autoReturnDriver.current = autoReturn ? driver : null;
    const current = requestedPlayback.current;
    if (current?.driver === driver && current.direction === "forward") return;
    void playFrom(driver, "forward", progressFor(driver));
  }

  function preview(driver: Driver, pointerType: string) {
    if (showFullFrame || explosionQueued.current || requestedPlayback.current?.direction === "explode") return;
    if ((pointerType === "mouse" || pointerType === "pen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playDriver(driver);
    }
  }

  function leavePreview(driver: Driver) {
    if (explosionQueued.current) return;
    const current = requestedPlayback.current;
    if (current?.driver !== driver || current.direction !== "forward") return;
    const progress = progressFor(driver);
    const video = videos.current[`${driver}-forward`];
    if (!video || progress <= 0) { reset(); return; }
    void playFrom(driver, "reverse", lastFrameTime(video) - progress);
  }

  function previewEvents(driver: Driver) {
    const isPreviewKey = (event: KeyboardEvent<HTMLButtonElement>) => event.key === "Enter" || event.key === " ";
    return {
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        // Assistive technology can activate a button without a pointer gesture.
        if (event.detail === 0 || (driver === "mid" && lastPointerType.current !== "touch")) activate(driver);
      },
      onPointerEnter: (event: PointerEvent<HTMLButtonElement>) => preview(driver, event.pointerType),
      onPointerLeave: (event: PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType !== "touch") leavePreview(driver);
      },
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        lastPointerType.current = event.pointerType;
        if (event.pointerType !== "touch") return;
        event.currentTarget.setPointerCapture(event.pointerId);
        touchGesture.current = { driver, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      },
      onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
        const gesture = touchGesture.current;
        if (gesture?.pointerId === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10) {
          gesture.moved = true;
        }
      },
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType !== "touch") return;
        const gesture = touchGesture.current;
        touchGesture.current = null;
        if (gesture?.driver === driver && gesture.pointerId === event.pointerId && !gesture.moved
          && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) <= 10) {
          activate(driver);
        }
      },
      onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType === "touch") touchGesture.current = null;
        else leavePreview(driver);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isPreviewKey(event)) return;
        event.preventDefault();
        if (!event.repeat) {
          if (driver === "mid") playExplodedView();
          else {
            keyboardPreview.current = driver;
            playDriver(driver);
          }
        }
      },
      onKeyUp: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isPreviewKey(event)) return;
        event.preventDefault();
        if (keyboardPreview.current === driver) {
          keyboardPreview.current = null;
          leavePreview(driver);
        }
      },
      onBlur: () => {
        if (keyboardPreview.current === driver) {
          keyboardPreview.current = null;
          leavePreview(driver);
        }
      },
    };
  }

  return (
    <section className="sc-object" id="object" aria-labelledby="sc-object-title">
      <div className="sc-object__sticky">
        <div className="sc-object__copy">
          <p className="sc-overline">{copy.objectOverline}</p>
          <h2 id="sc-object-title">{copy.objectTitle}</h2>
          <p className="sc-object__intro">{copy.objectBody}</p>
        </div>
        <div className="sc-object__stage">
          <div ref={media} className={`sc-object__media${showFullFrame ? " is-exploding" : ""}`}>
            <img className="sc-object__front" src={POSTER} alt={copy.objectPosterAlt} width="1920" height="1920" loading="lazy" decoding="async" />
            {(Object.entries(FILMS) as [Film, string][]).map(([film, source]) => (
              <video
                key={film}
                ref={(element) => { if (element) videos.current[film] = element; else delete videos.current[film]; }}
                className={`sc-object__film${film === "mid-explode" ? " sc-object__explosion" : ""}${visibleVideo === film ? " is-visible" : ""}`}
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
                  if (!current || `${current.driver}-${current.direction}` !== film) return;
                  if (current.direction === "reverse") reset();
                  else if (current.direction === "explode") void playFrom("mid", "reverse", 0);
                  else if (explosionQueued.current && current.driver === "mid") startExplosion();
                  else if (autoReturnDriver.current === current.driver) leavePreview(current.driver);
                }}
                onError={() => {
                  const [driver, direction] = film.split("-") as [Driver, Direction | "explode"];
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
                aria-label={`${id === "mid" ? copy.objectExplodeLabel : copy.objectPlayLabel}: ${label}`}
                disabled={showFullFrame || failedDrivers.has(id)}
                aria-describedby="sc-object-hint"
                {...previewEvents(id)}
              ><span>{label}</span></button>
            ))}
          </div>
          <div className="sc-object__stage-label">
            <span>{copy.objectBrand} / {copy.objectStageModel}</span>
            <span aria-live="polite">{activeLabel ? `${visibleVideo === "mid-explode" ? copy.objectStageExploded : copy.objectStageFilm} / ${activeLabel}` : copy.objectStageStudy}</span>
          </div>
          {playbackError && <p className="sc-object__fallback" role="status">{copy.objectFallback}</p>}
        </div>
        <div className="sc-object__interaction">
          <div className="sc-object__controls" role="group" aria-label={copy.objectPlayLabel}>
            {drivers.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`sc-object__control${activeDriver === id ? " is-active" : ""}`}
                aria-label={`${id === "mid" ? copy.objectExplodeLabel : copy.objectPlayLabel}: ${label}`}
                aria-describedby="sc-object-hint"
                disabled={failedDrivers.has(id) || (showFullFrame && id !== "mid")}
                {...previewEvents(id)}
              >
                {label}
              </button>
            ))}
            <button type="button" className="sc-object__reset" disabled={!activeDriver} onClick={() => { touchGesture.current = null; reset(); }}>{copy.objectResetLabel}</button>
          </div>
          <p className="sc-object__hint" id="sc-object-hint">{copy.objectHint}</p>
        </div>
      </div>
    </section>
  );
}
