import { useEffect, useRef, useState } from "react";
import type { SceneLoadPhase, SceneView } from "@/src/scene.js";
import "./speaker-viewer.css";

type SpeakerViewerProps = {
  id?: string;
  className?: string;
};

type LoadState = {
  phase: "waiting" | SceneLoadPhase;
  percent: number;
};

const BAR_COUNT = 48;
const BARS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const envelope = Math.pow(Math.sin(Math.PI * (index + 1) / (BAR_COUNT + 1)), 0.55);
  const variation = 0.5 + 0.5 * Math.abs(Math.sin(index * 1.47) * Math.cos(index * 0.53));
  return Math.round(16 + 76 * envelope * variation);
});

const VIEW_DETAILS: Record<SceneView, { index: string; note: string }> = {
  Front: {
    index: "01 / 03",
    note: "The face of the system: three acoustic paths sharing one listening point.",
  },
  Back: {
    index: "02 / 03",
    note: "Turn the form around and follow the volume behind the sound.",
  },
  Top: {
    index: "03 / 03",
    note: "Look from above at the geometry that gives every part its place.",
  },
};

export default function SpeakerViewer({ id = "object", className = "" }: SpeakerViewerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ phase: "waiting", percent: 0 });
  const [position, setPosition] = useState<{ percent: number; view: SceneView }>({ percent: 0, view: "Front" });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "650px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearViewport) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;
    setLoadState({ phase: "loading", percent: 0 });

    import("@/src/scene.js").then(({ initScene }) => {
      if (cancelled) return;
      dispose = initScene({
        canvas,
        sectionEl: section,
        renderFallback: false,
        onProgress(progress, view) {
          const percent = Math.round(progress * 100);
          setPosition((current) => current.percent === percent && current.view === view
            ? current
            : { percent, view });
        },
        onLoadProgress(percent, phase) {
          setLoadState((current) => current.percent === percent && current.phase === phase
            ? current
            : { phase, percent });
        },
      });
    }).catch((error: unknown) => {
      if (cancelled) return;
      console.warn("Could not start the 3D speaker view.", error);
      setLoadState({ phase: "error", percent: 0 });
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [nearViewport]);

  const activeBars = Math.round((position.percent / 100) * BAR_COUNT);
  const view = VIEW_DETAILS[position.view];
  const isReady = loadState.phase === "ready";
  const isError = loadState.phase === "error";
  const loadingLabel = loadState.phase === "preparing" ? "Preparing the 3D view"
    : loadState.phase === "waiting" ? "Speaker model will load as you approach"
      : "Loading speaker model";

  return (
    <section ref={sectionRef} id={id} className={`speaker-viewer ${className}`.trim()} aria-labelledby={`${id}-title`}>
      <div className="speaker-viewer__sticky">
        <div className="speaker-viewer__editorial">
          <div className="speaker-viewer__topline">
            <span>OBJECT / 3D STUDY</span>
            <span>METOROM — 001</span>
          </div>
          <div className="speaker-viewer__story">
            <p className="speaker-viewer__kicker">A form made for sound</p>
            <h2 id={`${id}-title`}>TURN THE<br /><em>OBJECT.</em></h2>
            <p className="speaker-viewer__intro">The speaker is a system you can move around. Scroll to see its front, back, and top.</p>
          </div>
          <div className="speaker-viewer__progress-area">
            <div className="speaker-viewer__view-meta" aria-live="off">
              <span>VIEW {view.index}</span>
              <strong>{position.view.toUpperCase()}</strong>
            </div>
            <div
              className="speaker-viewer__wave"
              role="progressbar"
              aria-label="Speaker rotation progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={position.percent}
              aria-valuetext={`${position.view} view, ${position.percent}%`}
            >
              {BARS.map((height, index) => (
                <span
                  className={index < activeBars ? "speaker-viewer__bar is-active" : "speaker-viewer__bar"}
                  style={{ height: `${height}%` }}
                  aria-hidden="true"
                  key={index}
                />
              ))}
            </div>
            <p className="speaker-viewer__view-note">{view.note}</p>
          </div>
        </div>

        <div className="speaker-viewer__stage" aria-busy={!isReady && !isError}>
          <div className="speaker-viewer__stage-top" aria-hidden="true">
            <span>MODEL / ASSEMBLY</span><span>01 : 01</span>
          </div>
          <canvas
            ref={canvasRef}
            className="speaker-viewer__canvas"
            role="img"
            aria-label="Three-dimensional outline of the Metorom speaker, turning as the page scrolls"
          />
          <div className="speaker-viewer__stage-bottom" aria-hidden="true">
            <span>SCROLL TO ROTATE ↘</span><span>FRONT · BACK · TOP</span>
          </div>
          {!isReady && (
            <div className={`speaker-viewer__loading${isError ? " is-error" : ""}`} role="status" aria-live="polite">
              {isError ? (
                <>
                  <span className="speaker-viewer__loading-mark" aria-hidden="true">◎</span>
                  <span>The 3D model is unavailable on this device.</span>
                </>
              ) : (
                <>
                  <span className="speaker-viewer__loading-label">{loadingLabel}</span>
                  <span className="speaker-viewer__loading-number" aria-hidden="true">{loadState.percent.toString().padStart(2, "0")}%</span>
                  <progress max={100} value={loadState.percent} aria-label="Speaker model loading progress" />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
