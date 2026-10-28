import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader } from "@/components/ui/loader";
import { BRAND_IMAGE, HERO_IMAGE, OBJECT_POSTER, prepareImage, prepareVideo, resourceIsReady, VIDEO_SOURCES } from "./media-assets";
import "./media-preloader.css";

type Props = { language?: "en" | "ja"; images?: string[]; onReady?: () => void };
type Progress = { completed: number; total: number; failed: number; phase: "images" | "films" | "ready" };

export default function PagePreloader({ language = "en", images = [], onReady }: Props) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [progress, setProgress] = useState<Progress>({ completed: 0, total: 1, failed: 0, phase: "images" });
  const overlay = useRef<HTMLDivElement>(null);
  const released = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const imageKey = images.filter(Boolean).join("\n");
  const japanese = language === "ja";

  useLayoutEffect(() => {
    if (!visible) return;
    const root = document.getElementById("root");
    const wasInert = root?.inert ?? false;
    const overflow = document.body.style.overflow;
    const focused = document.activeElement;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    overlay.current?.focus({ preventScroll: true });
    return () => {
      if (root) root.inert = wasInert;
      document.body.style.overflow = overflow;
      if (focused instanceof HTMLElement && focused.isConnected && focused !== document.body) focused.focus({ preventScroll: true });
    };
  }, [visible]);

  useEffect(() => {
    let cancelled = false;
    let finishing = false;
    let exitTimer = 0;
    let completed = 0;
    let failed = 0;
    const imageSources = [...new Set([HERO_IMAGE, OBJECT_POSTER, BRAND_IMAGE, ...imageKey.split("\n")].filter(Boolean))];
    const videoSources = Object.values(VIDEO_SOURCES);
    const total = imageSources.length + videoSources.length + 1;
    const allCached = [...imageSources, ...videoSources].every(resourceIsReady);
    const started = performance.now();
    const update = (phase: Progress["phase"]) => {
      if (!cancelled) setProgress({ completed, total, failed, phase });
    };
    const finish = () => {
      if (cancelled || finishing) return;
      finishing = true;
      setExiting(true);
      exitTimer = window.setTimeout(() => {
        if (cancelled || released.current) return;
        released.current = true;
        setVisible(false);
        onReadyRef.current?.();
      }, 260);
    };
    const skipTimer = window.setTimeout(() => { if (!cancelled) setCanContinue(true); }, 5000);
    const deadline = window.setTimeout(() => {
      if (cancelled) return;
      // On an unavailable or very slow connection release the gate; actual
      // player fallbacks remain available while pending requests settle.
      finish();
    }, 20000);
    update("images");
    const settle = (ready: boolean, phase: Progress["phase"]) => {
      completed++;
      if (!ready) failed++;
      update(phase);
    };
    void (async () => {
      // Images enter the shared bounded queue first, so the hero is prepared
      // before lower-page films without a competing download stampede.
      const pictures = imageSources.map((source) => prepareImage(source).then((ready) => settle(ready, "images")));
      const films = videoSources.map((source) => prepareVideo(source).then((ready) => settle(ready, "films")));
      const fonts = document.fonts.ready.then(() => settle(true, "images"), () => settle(false, "images"));
      await Promise.all([...pictures, ...films, fonts]);
      if (cancelled) return;
      update("ready");
      window.clearTimeout(deadline);
      // Let a cold-load completion register without imposing a delay on
      // cached navigation. The displayed percentage is actual task completion.
      const remaining = Math.max(0, (allCached ? 0 : 650) - (performance.now() - started));
      exitTimer = window.setTimeout(finish, remaining);
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(skipTimer);
      window.clearTimeout(deadline);
      window.clearTimeout(exitTimer);
    };
  }, [imageKey]);

  function continueToSite() {
    setExiting(true);
    window.setTimeout(() => {
      if (released.current) return;
      released.current = true;
      setVisible(false);
      onReadyRef.current?.();
    }, 260);
  }

  if (!visible) return null;
  const percent = Math.round(progress.completed / progress.total * 100);
  const status = progress.phase === "ready"
    ? progress.failed ? japanese ? "利用可能なメディアを準備しました" : "Available media ready" : japanese ? "準備ができました" : "Ready to explore"
    : progress.phase === "films" ? japanese ? "スピーカーの映像を準備しています" : "Preparing the speaker films" : japanese ? "画像を準備しています" : "Preparing the images";

  return createPortal(
    <div ref={overlay} className={`sc-preloader${exiting ? " is-leaving" : ""}`} tabIndex={-1} aria-label={japanese ? "Metoromを読み込み中" : "Loading Metorom"}>
      <div className="sc-preloader__content">
        <div className="sc-preloader__motion" aria-hidden="true"><Loader variant="newton" size={110} speed={0.85} className="sc-preloader__newton" /></div>
        <p className="sc-preloader__brand">Metorom</p>
        <div className="sc-preloader__readout"><span role="status" aria-live="polite">{status}</span><span aria-hidden="true">{percent}%</span></div>
        <div className="sc-preloader__track" role="progressbar" aria-label={japanese ? "メディアの準備" : "Media preparation"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${progress.completed} / ${progress.total}`}><span style={{ width: `${percent}%` }} /></div>
        {canContinue && <button type="button" className="sc-preloader__continue" disabled={exiting} onClick={continueToSite}>{japanese ? "サイトを開く" : "Continue to the site"}<span aria-hidden="true">→</span></button>}
      </div>
    </div>, document.body,
  );
}
