import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import "./media-preloader.css";
import "./gallery-loader.css";

type GalleryLoaderProps = {
  visible: boolean;
  completed: number;
  total: number;
  failed: number;
  language: "en" | "ja";
};

/** The site's Newton loading treatment, scoped to the photograph stage. */
export default function GalleryLoader({ visible, completed, total, failed, language }: GalleryLoaderProps) {
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) { setMounted(true); return; }
    // Preserve the exit fade, then stop the Newton animation completely.
    const timeout = window.setTimeout(() => setMounted(false), 260);
    return () => window.clearTimeout(timeout);
  }, [visible]);
  if (!mounted && !visible) return null;
  const japanese = language === "ja";
  const count = Math.max(0, Math.min(total, completed));
  const percent = total > 0 ? Math.round(count / total * 100) : 0;
  const status = failed > 0
    ? japanese ? "利用可能な写真を準備しています" : "Preparing available photographs"
    : japanese ? "写真を準備しています" : "Preparing the photographs";

  return <div className={`sc-gallery-loader${visible ? " is-visible" : ""}`} aria-hidden={!visible} inert={!visible}>
    <div className="sc-preloader__content">
      <div className="sc-preloader__motion" aria-hidden="true">
        <Loader variant="newton" size={110} speed={0.85} className="sc-preloader__newton" />
      </div>
      <p className="sc-preloader__brand">Metorom</p>
      <div className="sc-preloader__readout">
        <span role="status" aria-live="polite">{status}</span>
        <span aria-hidden="true">{percent}%</span>
      </div>
      <div className="sc-preloader__track" role="progressbar"
        aria-label={japanese ? "写真の準備" : "Photograph preparation"}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${count} / ${total}`}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  </div>;
}
