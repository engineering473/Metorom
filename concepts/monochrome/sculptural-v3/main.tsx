import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import HalftoneFlow from "@/components/ui/halftone-flow";
import { Navbar1 } from "./navbar";
import FrequencyResponseCards from "./frequency-response-cards";
import SystemSpecifications from "./system-specifications";
import CloserLook from "./closer-look";
import PagePreloader from "./media-preloader";
import { HERO_IMAGE } from "./media-assets";
import ObjectDesign from "./object-design";
import RenderedObject from "./rendered-object";
import SectionIndex from "./section-index";
import { SiteEditor, useSitePreview } from "./site-editor";
import { previewHref, useLanguage } from "./language";
import SiteFooter from "./site-footer";
import { EditorSurfaceProvider } from "./editor-surface";
import "./styles.css";
import "./philosophy.css";
import "./gallery.css";
import "./site-editor.css";
import "./object-interactive.css";
import "./blue-theme.css";
import "./page-extension.css";

const RENDER = HERO_IMAGE;

function App() {
  const [settings, setSettings] = useSitePreview();
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});
  const [galleryPreviews, setGalleryPreviews] = useState<Record<number, string>>({});
  const galleryPreviewUrls = useRef<Record<number, string>>({});
  const [language] = useLanguage();
  const copy = language === "ja" ? settings.copyJa : settings.copy;
  const philosophyParagraphs = copy.philosophyBody.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const ideaParagraphs = copy.ideaBody.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const configuredGallerySlides = ([1, 2, 3, 4, 5] as const).map((slot) => ({
    src: galleryPreviews[slot] || copy[`galleryImage${slot}`],
    alt: copy[`galleryAlt${slot}`],
    title: copy[`galleryTitle${slot}`],
    subtitle: copy[`gallerySubtitle${slot}`],
    placeholder: copy.galleryPlaceholder,
  }));
  const customSlides = configuredGallerySlides.filter((slide) => slide.src);
  const gallerySlides = customSlides.length ? customSlides : [
    { src: RENDER, alt: copy.heroImageAlt, title: copy.objectTitle, subtitle: language === "ja" ? "スタジオレンダリング" : "Studio render", placeholder: copy.galleryPlaceholder },
    { src: `${import.meta.env.BASE_URL}images/concepts/speaker-interactive-front-v3.webp`, alt: copy.objectPosterAlt, title: `${copy.pathHighTitle} / ${copy.pathMidTitle}`, subtitle: language === "ja" ? "ドライバーを近くで" : "The drivers, up close", placeholder: copy.galleryPlaceholder },
    { src: `${import.meta.env.BASE_URL}images/concepts/speaker-wireframe-poster.png`, alt: language === "ja" ? "Metoromスピーカーのワイヤーフレーム" : "Wireframe view of the Metorom speaker", title: copy.objectTitle, subtitle: language === "ja" ? "ワイヤーフレーム" : "Wireframe study", placeholder: copy.galleryPlaceholder },
  ];
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
      <PagePreloader language={language} images={gallerySlides.map((slide) => slide.src).filter(Boolean)} onReady={() => { const id = decodeURIComponent(window.location.hash.slice(1)); if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" })); }} />
      <Navbar1 copy={copy} />
      <SectionIndex copy={copy} />
      <main id="main">
        <div className="sc-opening">
          <HalftoneFlow className="sc-opening__flow" mode="light" hue={232} saturation={0.58} brightness={1.02} waveDensity={1.75} dotDensity={3} />
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
          <div className="sc-intro__body">
            <h2 id="sc-intro-title">{copy.ideaTitle}</h2>
            <p className="sc-intro__statement">{copy.ideaStatement}</p>
            <div className="sc-intro__text">{ideaParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          </div>
          </section>
        </div>

        <RenderedObject copy={copy} />

        <section className="sc-architecture sc-shell" id="architecture" aria-labelledby="sc-architecture-title" data-section-reveal>
          <span className="sc-rail-label">{copy.architectureRail}</span>
          <div className="sc-architecture__body">
            <h2 id="sc-architecture-title">{copy.architectureTitle}</h2>
            {copy.architectureBody && <p className="sc-architecture__intro">{copy.architectureBody}</p>}
            <ObjectDesign copy={copy} />
          </div>
        </section>

        <section className="sc-measure sc-shell" id="measurements" aria-labelledby="sc-measure-title" data-section-reveal>
          <span className="sc-rail-label">{copy.measurementRail}</span>
          <div className="sc-measure__body">
            <div className="sc-measure__lead"><h2 id="sc-measure-title">{copy.measurementTitle}</h2><p>{copy.measurementBody}</p></div>
            <FrequencyResponseCards copy={copy} />
            <SystemSpecifications copy={copy} language={language} materials={[
              { label: copy.specMaterialsLabel, value: copy.specMaterialsValue },
              { label: copy.specFinishLabel, value: copy.specFinishValue },
            ]} />
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

        <CloserLook copy={copy} slides={gallerySlides} />
      </main>
      <div className="sc-gallery-end-footer"><SiteFooter copy={copy} /></div>
      {new URLSearchParams(window.location.search).get("editor") !== "design" && <SiteEditor settings={settings} onChange={setSettings} galleryFiles={galleryFiles} onGalleryFileChange={selectGalleryFile} />}
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom study root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<EditorSurfaceProvider><App /></EditorSurfaceProvider>);
