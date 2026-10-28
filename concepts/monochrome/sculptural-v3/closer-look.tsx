import type { SiteCopy } from "./site-copy";
import { CoverflowCarousel } from "./coverflow-carousel";
import "./gallery.css";

export type CloserLookSlide = { src: string; alt: string; title?: string; subtitle?: string; placeholder?: string };

export default function CloserLook({ copy, slides }: { copy: SiteCopy; slides: CloserLookSlide[] }) {
  return <section className="sc-gallery sc-shell" id="gallery" aria-labelledby="sc-gallery-title">
    <span className="sc-rail-label">{copy.galleryRail}</span>
    <div className="sc-gallery__body">
      <div className="sc-gallery__intro">
        <div><h2 id="sc-gallery-title">{copy.galleryTitle}</h2><p>{copy.galleryIntroduction}</p></div>
      </div>
      <CoverflowCarousel slides={slides} label={copy.galleryLabel} paginationLabel={copy.galleryGoTo} previousLabel={copy.galleryPrevious} nextLabel={copy.galleryNext} closeLabel={copy.galleryClose} cardWidth="var(--sc-gallery-card-size)" wheelNavigation autoPlay showPagination showCaption />
    </div>
  </section>;
}
