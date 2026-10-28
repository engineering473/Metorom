import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { SiteCopy } from "./site-copy";
import { OBJECT_POSTER, VIDEO_SOURCES, usePreparedMediaSources } from "./media-assets";

type Driver = "sub" | "mid" | "right" | "tweeter";
type Direction = "forward" | "reverse";
type ExplosionPhase = "opening" | "open" | "closing";
type Film = `${Driver}-${Direction}` | "mid-explode" | "mid-return";
type Playback = { driver: Driver; direction: Direction } | { driver: "mid"; direction: "explode" | "return" };

const POSTER = OBJECT_POSTER;
const FRAME_RATE = 24;
const STARTUP_TIMEOUT = 15000;

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
  const films = usePreparedMediaSources(VIDEO_SOURCES);
  const [preloadMode] = useState<"metadata" | "auto">(() => window.matchMedia("(pointer: coarse)").matches ? "metadata" : "auto");
  const videos = useRef<Partial<Record<Film, HTMLVideoElement>>>({});
  const requestedPlayback = useRef<Playback | null>(null);
  const pendingPlayback = useRef<AbortController | null>(null);
  const visibleFilm = useRef<Film | null>(null);
  const keyboardPreview = useRef<Driver | null>(null);
  const touchGesture = useRef<{ driver: Driver; pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const autoReturnDriver = useRef<Driver | null>(null);
  const explosionPhaseRef = useRef<ExplosionPhase | null>(null);
  const returnQueued = useRef(false);
  const lastPointerType = useRef("");
  const media = useRef<HTMLDivElement | null>(null);
  const closeControl = useRef<HTMLButtonElement | null>(null);
  const midControl = useRef<HTMLButtonElement | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const focusFrame = useRef<number | null>(null);
  const [explosionPhase, setExplosionPhase] = useState<ExplosionPhase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    for (const video of Object.values(videos.current)) video?.pause();
  }, []);

  useEffect(() => {
    if (!showFullFrame) return;
    // Keep the complete movie and its close control below the floating header.
    // scroll-margin applies only when the expanded frame is partly obscured.
    media.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    const frame = requestAnimationFrame(() => {
      if (explosionPhaseRef.current !== "closing") closeControl.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [showFullFrame]);

  useEffect(() => {
    if (!explosionPhase) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeExplodedView();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [explosionPhase]);

  function changeExplosionPhase(phase: ExplosionPhase | null) {
    explosionPhaseRef.current = phase;
    setExplosionPhase(phase);
  }

  function stopVideos() {
    for (const video of Object.values(videos.current)) {
      if (!video) continue;
      video.pause();
    }
  }

  function reset() {
    const focusTarget = returnFocus.current;
    returnFocus.current = null;
    pendingPlayback.current?.abort();
    pendingPlayback.current = null;
    requestedPlayback.current = null;
    visibleFilm.current = null;
    keyboardPreview.current = null;
    autoReturnDriver.current = null;
    returnQueued.current = false;
    changeExplosionPhase(null);
    stopVideos();
    setActiveDriver(null);
    setVisibleVideo(null);
    setShowFullFrame(false);
    setIsLoading(false);
    setPlaybackError(false);
    if (focusTarget) {
      focusFrame.current = requestAnimationFrame(() => {
        if (focusTarget.isConnected && !focusTarget.disabled) focusTarget.focus({ preventScroll: true });
        focusFrame.current = null;
      });
    }
  }

  function progressFor(driver: Driver) {
    const film = visibleFilm.current;
    const video = film && videos.current[film];
    if (film === "mid-explode" || film === "mid-return" || !film?.startsWith(`${driver}-`) || !video || !Number.isFinite(video.duration)) return 0;
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
    setIsLoading(true);
    let rejectStartup: (error: Error) => void = () => {};
    const startupFailure = new Promise<never>((_, reject) => { rejectStartup = reject; });
    const timeout = window.setTimeout(() => rejectStartup(new Error("Video loading timed out")), STARTUP_TIMEOUT);
    const cancelled = () => rejectStartup(new Error("Playback interrupted"));
    controller.signal.addEventListener("abort", cancelled, { once: true });
    try {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      if (video.error) video.load();
      // iPhone can defer preload entirely. Start playback inside the tap handler
      // before waiting for metadata or frames, or loading may never begin.
      const started = video.play();
      void started.catch(rejectStartup);
      if (video.readyState < 1) await Promise.race([waitForVideo(video, "loadedmetadata", controller.signal), startupFailure]);
      if (controller.signal.aborted) return;
      if (video.error) throw new Error("Video unavailable");
      const target = Math.max(0, Math.min(time, lastFrameTime(video)));
      const needsSeek = Math.abs(video.currentTime - target) > 0.0001;
      if (video.seeking || needsSeek) {
        const sought = waitForVideo(video, "seeked", controller.signal);
        if (needsSeek) video.currentTime = target;
        await Promise.race([sought, startupFailure]);
      } else if (video.readyState < 2) {
        await Promise.race([waitForVideo(video, "loadeddata", controller.signal), startupFailure]);
      }
      await Promise.race([started, startupFailure]);
      if (controller.signal.aborted) return;
      // Keep the old frame on screen until its counterpart has finished seeking.
      visibleFilm.current = film;
      if (film === "mid-explode" || film === "mid-return") setShowFullFrame(true);
      setVisibleVideo(film);
      setIsLoading(false);
    } catch {
      if (controller.signal.aborted) return;
      reset();
      setPlaybackError(true);
    } finally {
      window.clearTimeout(timeout);
      controller.signal.removeEventListener("abort", cancelled);
    }
  }

  function playFrom(driver: Driver, direction: Direction, time: number) {
    return playFilm(`${driver}-${direction}`, { driver, direction }, time);
  }

  function startReturn() {
    returnQueued.current = false;
    changeExplosionPhase("closing");
    void playFilm("mid-return", { driver: "mid", direction: "return" }, 0);
  }

  function playExplodedView() {
    if (explosionPhaseRef.current || showFullFrame) return;
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    const focused = document.activeElement;
    returnFocus.current = focused instanceof HTMLButtonElement && focused.closest(".sc-object") ? focused : midControl.current;
    keyboardPreview.current = null;
    autoReturnDriver.current = null;
    returnQueued.current = false;
    changeExplosionPhase("opening");
    // Start the supplied Go clip directly; the light preview added a 2.4s wait.
    void playFilm("mid-explode", { driver: "mid", direction: "explode" }, 0);
  }

  function closeExplodedView() {
    const phase = explosionPhaseRef.current;
    if (!phase || phase === "closing") return;
    changeExplosionPhase("closing");
    const go = videos.current["mid-explode"];
    if (phase === "open" || go?.ended) startReturn();
    // The two clips have different motion timing. Join their matching endpoints
    // if close is pressed midflight instead of cutting to different geometry.
    else returnQueued.current = true;
  }

  function activate(driver: Driver) {
    if (driver === "mid") playExplodedView();
    else playDriver(driver, true);
  }

  function playDriver(driver: Driver, autoReturn = false) {
    if (explosionPhaseRef.current || showFullFrame) return;
    if (failedDrivers.has(driver)) return;
    autoReturnDriver.current = autoReturn ? driver : null;
    const current = requestedPlayback.current;
    if (current?.driver === driver && current.direction === "forward") return;
    void playFrom(driver, "forward", progressFor(driver));
  }

  function preview(driver: Driver, pointerType: string) {
    if (showFullFrame || explosionPhaseRef.current) return;
    if ((pointerType === "mouse" || pointerType === "pen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playDriver(driver);
    }
  }

  function leavePreview(driver: Driver) {
    if (explosionPhaseRef.current) return;
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
          <div ref={media} className={`sc-object__media${showFullFrame ? " is-exploding" : ""}`} data-explosion-state={explosionPhase ?? undefined} aria-busy={explosionPhase ? isLoading : undefined}>
            <img className="sc-object__front" src={POSTER} alt={copy.objectPosterAlt} width="1920" height="1920" loading="lazy" decoding="async" />
            {(Object.entries(films) as [Film, string][]).map(([film, source]) => (
              <video
                key={film}
                ref={(element) => { if (element) videos.current[film] = element; else delete videos.current[film]; }}
                className={`sc-object__film${film === "mid-explode" || film === "mid-return" ? " sc-object__explosion" : ""}${visibleVideo === film ? " is-visible" : ""}`}
                data-driver={film.split("-")[0]}
                data-direction={film.split("-")[1]}
                src={source || undefined}
                preload={preloadMode}
                muted
                playsInline
                disablePictureInPicture
                aria-hidden="true"
                onEnded={() => {
                  const current = requestedPlayback.current;
                  if (!current || `${current.driver}-${current.direction}` !== film) return;
                  if (current.direction === "reverse") reset();
                  else if (current.direction === "explode") {
                    if (returnQueued.current) startReturn();
                    else changeExplosionPhase("open");
                  }
                  else if (current.direction === "return") void playFrom("mid", "reverse", 0);
                  else if (autoReturnDriver.current === current.driver) leavePreview(current.driver);
                }}
                onError={() => {
                  const [driver, direction] = film.split("-") as [Driver, Direction | "explode" | "return"];
                  if (direction === "forward") setFailedDrivers((current) => new Set(current).add(driver));
                  const current = requestedPlayback.current;
                  if (current && `${current.driver}-${current.direction}` === film) { reset(); setPlaybackError(true); }
                }}
              />
            ))}
            {explosionPhase && <>
              <button ref={closeControl} type="button" className="sc-object__close" aria-label={copy.objectCloseExplodeLabel} disabled={explosionPhase === "closing"} onClick={closeExplodedView}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
              {isLoading && <span className="sc-object__loading-status" role="status">{copy.objectLoadingLabel}</span>}
            </>}
            {drivers.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`sc-object__hotspot sc-object__hotspot--${id}${activeDriver === id ? " is-active" : ""}`}
                aria-label={`${id === "mid" ? copy.objectExplodeLabel : copy.objectPlayLabel}: ${label}`}
                disabled={!!explosionPhase || showFullFrame || (id !== "mid" && failedDrivers.has(id))}
                aria-describedby="sc-object-hint"
                {...previewEvents(id)}
              ><span>{label}</span></button>
            ))}
          </div>
          <div className="sc-object__stage-label">
            <span>{copy.objectBrand} / {copy.objectStageModel}</span>
            <span aria-live="polite">{activeLabel ? `${explosionPhase ? copy.objectStageExploded : copy.objectStageFilm} / ${activeLabel}` : copy.objectStageStudy}</span>
          </div>
          {playbackError && <p className="sc-object__fallback" role="status">{copy.objectFallback}</p>}
        </div>
        <div className="sc-object__interaction">
          <div className="sc-object__controls" role="group" aria-label={copy.objectPlayLabel}>
            {drivers.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                ref={id === "mid" ? midControl : undefined}
                className={`sc-object__control${activeDriver === id ? " is-active" : ""}`}
                aria-label={`${id === "mid" ? copy.objectExplodeLabel : copy.objectPlayLabel}: ${label}`}
                aria-describedby="sc-object-hint"
                disabled={id !== "mid" && (failedDrivers.has(id) || !!explosionPhase || showFullFrame)}
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
