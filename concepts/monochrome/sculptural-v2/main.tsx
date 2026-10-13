import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import HalftoneFlow from "@/components/ui/halftone-flow";
import { Navbar1 } from "@/components/ui/navbar-1";
import FrequencyResponseCards from "@/components/ui/frequency-response-cards";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import RenderedObject from "./rendered-object";
import SectionIndex from "./section-index";
import { SiteEditor, useSitePreview } from "./site-editor";
import { previewHref, useLanguage } from "./language";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./philosophy.css";
import "./gallery.css";
import "./site-editor.css";

const RENDER = `${import.meta.env.BASE_URL}images/concepts/speaker-render-front.png`;

function App() {
  const [settings, setSettings] = useSitePreview();
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});
  const [galleryPreviews, setGalleryPreviews] = useState<Record<number, string>>({});
  const galleryPreviewUrls = useRef<Record<number, string>>({});
  const [language] = useLanguage();
  const copy = language === "ja" ? settings.copyJa : settings.copy;
  const philosophyParagraphs = copy.philosophyBody.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const gallerySlides = ([1, 2, 3, 4, 5] as const).map((slot) => ({
    src: galleryPreviews[slot] || copy[`galleryImage${slot}`],
    alt: copy[`galleryAlt${slot}`],
    title: copy[`galleryTitle${slot}`],
    subtitle: copy[`gallerySubtitle${slot}`],
    placeholder: copy.galleryPlaceholder,
  }));
  const selectGalleryFile = (slot: number, file: File) => {
    const previous = galleryPreviewUrls.current[slot];
    if (previous) URL.revokeObjectURL(previous);
    const url = URL.createObjectURL(file);
    galleryPreviewUrls.current[slot] = url;
    setGalleryPreviews({ ...galleryPreviewUrls.current });
    setGalleryFiles((current) => ({ ...current, [slot]: file }));
  };

  useEffect(() => () => {
    Object.values(galleryPreviewUrls.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);
  const paths = [
    { id: "high", title: copy.pathHighTitle, part: copy.pathHighPart, body: copy.pathHighBody },
    { id: "mid", title: copy.pathMidTitle, part: copy.pathMidPart, body: copy.pathMidBody },
    { id: "low", title: copy.pathLowTitle, part: copy.pathLowPart, body: copy.pathLowBody },
  ];

  useEffect(() => {
    document.title = `${copy.brandName} — ${copy.heroTitle.replace(/\s+/g, " ").trim()}`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", copy.heroBody);
  }, [copy.brandName, copy.heroTitle, copy.heroBody]);

  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>("[data-motion-card], [data-section-reveal]")];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar1 copy={copy} />
      <SectionIndex copy={copy} />
      <main id="main">
        <div className="sc-opening">
          <HalftoneFlow className="sc-opening__flow" mode="light" hue={168} saturation={0.58} brightness={1.02} waveDensity={1.75} dotDensity={3} />
          <section className="sc-hero" id="top" aria-labelledby="sc-hero-title">
          <div className="sc-hero__content">
            <div className="sc-hero__meta"><span>{copy.heroMeta}</span><span>{copy.heroLocation}</span></div>
            <div className="sc-hero__statement">
              <h1 id="sc-hero-title">{copy.heroTitle}</h1>
              <p>{copy.heroBody}</p>
              <a className="sc-outline-link" href="#object">{copy.heroButton} <ArrowDownRight size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <figure className="sc-hero__render">
            <img src={RENDER} alt={copy.heroImageAlt} width="2880" height="3840" fetchPriority="high" />
            <figcaption><span>{copy.heroObjectTag}</span><span>{copy.heroRenderTag}</span></figcaption>
          </figure>
          </section>

          <section className="sc-intro sc-shell" aria-labelledby="sc-intro-title">
          <span className="sc-rail-label">{copy.ideaRail}</span>
          <div className="sc-intro__body"><h2 id="sc-intro-title">{copy.ideaTitle}</h2><p>{copy.ideaBody}</p></div>
          </section>
        </div>

        <RenderedObject copy={copy} />

        <section className="sc-architecture sc-shell" id="architecture" aria-labelledby="sc-architecture-title" data-section-reveal>
          <span className="sc-rail-label">{copy.architectureRail}</span>
          <div className="sc-architecture__body">
            <h2 id="sc-architecture-title">{copy.architectureTitle}</h2>
            <p className="sc-architecture__intro">{copy.architectureBody}</p>
            <div className="sc-parts">
              {paths.map((path) => (
                <details key={path.id}>
                  <summary><span>{path.title}</span><small>{path.part}</small><span className="sc-parts__plus" aria-hidden="true" /></summary>
                  <p>{path.body}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sc-measure sc-shell" id="measurements" aria-labelledby="sc-measure-title" data-section-reveal>
          <span className="sc-rail-label">{copy.measurementRail}</span>
          <div className="sc-measure__body">
            <div className="sc-measure__lead"><h2 id="sc-measure-title">{copy.measurementTitle}</h2><p>{copy.measurementBody}</p></div>
            <FrequencyResponseCards copy={copy} />
            <dl className="sc-spec-table">
              <div><dt>{copy.specSystemLabel}</dt><dd>{copy.specSystemValue}</dd></div>
              <div><dt>{copy.specConstructionLabel}</dt><dd>{copy.specConstructionValue}</dd></div>
              <div><dt>{copy.specSpacingLabel}</dt><dd>{copy.specSpacingValue}</dd></div>
              <div><dt>{copy.specLatencyLabel}</dt><dd>{copy.specLatencyValue}</dd></div>
              <div><dt>{copy.specMeasurementLabel}</dt><dd>{copy.specMeasurementValue}</dd></div>
              <div><dt>{copy.specDevelopmentLabel}</dt><dd>{copy.specDevelopmentValue}</dd></div>
            </dl>
            <a className="sc-text-link" href="../../../versions/signal/index.html#details">{copy.measurementLink} <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="sc-listening sc-shell" id="listening" aria-labelledby="sc-listening-title" data-section-reveal>
          <span className="sc-rail-label">{copy.listeningRail}</span>
          <div className="sc-listening__body">
            <div><h2 id="sc-listening-title">{copy.listeningTitle}</h2><p>{copy.listeningBody}</p><a className="sc-outline-link" href={previewHref("./event.html")}>{copy.listeningButton} <ArrowUpRight size={17} aria-hidden="true" /></a></div>
            <div className="sc-listening__facts"><dl><div><dt>{copy.venueLabel}</dt><dd>{copy.venueValue}</dd></div><div><dt>{copy.dateLabel}</dt><dd>{copy.dateValue}</dd></div><div><dt>{copy.ticketsLabel}</dt><dd>{copy.ticketsValue}</dd></div></dl><p>{copy.listeningNote}</p></div>
          </div>
        </section>

        <section className="sc-conversation sc-shell" id="conversation" aria-labelledby="sc-conversation-title">
          <span className="sc-rail-label">{copy.conversationRail}</span>
          <div><h2 id="sc-conversation-title">{copy.conversationTitle}</h2><p>{copy.conversationBody}</p><a className="sc-outline-link" href={previewHref("./contact.html#sc-contact-compose")}>{copy.conversationButton} <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </section>

        <section className="sc-philosophy sc-shell" id="philosophy" aria-labelledby="sc-philosophy-title">
          <span className="sc-rail-label">{copy.philosophyRail}</span>
          <div className="sc-philosophy__body">
            <h2 id="sc-philosophy-title">{copy.philosophyTitle}</h2>
            <p className="sc-philosophy__statement">{copy.philosophyStatement}</p>
            <p className="sc-philosophy__introduction">{copy.philosophyIntroduction}</p>
            {philosophyParagraphs.length > 0 && <div className="sc-philosophy__text">
              {philosophyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>}
          </div>
        </section>

        <section className="sc-gallery sc-shell" id="gallery" aria-labelledby="sc-gallery-title">
          <span className="sc-rail-label">{copy.galleryRail}</span>
          <div className="sc-gallery__body">
            <div className="sc-gallery__intro"><h2 id="sc-gallery-title">{copy.galleryTitle}</h2><p>{copy.galleryIntroduction}</p></div>
            <CoverflowCarousel slides={gallerySlides} label={copy.galleryLabel} paginationLabel={copy.galleryGoTo} closeLabel={copy.galleryClose} cardWidth="clamp(280px, 50vw, 720px)" wheelNavigation showPagination showCaption />
          </div>
        </section>
      </main>
      <SiteFooter copy={copy} />
      <SiteEditor settings={settings} onChange={setSettings} galleryFiles={galleryFiles} onGalleryFileChange={selectGalleryFile} />
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom study root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<App />);
