import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "./language";
import type { SiteCopy } from "./site-copy";
import { CoverflowCarousel } from "./coverflow-carousel";
import "./gallery.css";

export type CloserLookSlide = { src: string; alt: string; title?: string; subtitle?: string; placeholder?: string };

export default function CloserLook({ copy, slides }: { copy: SiteCopy; slides: CloserLookSlide[] }) {
  const [language] = useLanguage();
  const [paused, setPaused] = useState(false);
  const ja = language === "ja";

  return <section className="sc-gallery sc-shell" id="gallery" aria-labelledby="sc-gallery-title">
    <span className="sc-rail-label">{copy.galleryRail}</span>
    <div className="sc-gallery__body">
      <div className="sc-gallery__intro">
        <div><h2 id="sc-gallery-title">{copy.galleryTitle}</h2><p>{copy.galleryIntroduction}</p></div>
        <button className="sc-gallery__playback" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          {paused ? (ja ? "自動再生を再開" : "Resume slideshow") : (ja ? "自動再生を停止" : "Pause slideshow")}
        </button>
      </div>
      <CoverflowCarousel slides={slides} label={copy.galleryLabel} paginationLabel={copy.galleryGoTo} previousLabel={copy.galleryPrevious} nextLabel={copy.galleryNext} closeLabel={copy.galleryClose} cardWidth="var(--sc-gallery-card-size)" wheelNavigation autoPlay={!paused} showPagination showCaption />
    </div>
  </section>;
}
