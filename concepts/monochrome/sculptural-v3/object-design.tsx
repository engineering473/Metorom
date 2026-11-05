import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ObjectDesignDialog, { type DesignPart, type PartId } from "./object-design-dialog";
import { DESIGN_COPY_EN, DESIGN_COPY_JA } from "./design-copy";
import { PageEditor, usePagePreview } from "./page-editor";
import { useLanguage } from "./language";
import { speakerPhotos } from "./speaker-photos";
import type { SiteCopy } from "./site-copy";
import "./object-design.css";

const LiquidGlassCarousel = lazy(() => import("@/components/ui/liquid-glass-carousel"));
const assets = {
  render: `${import.meta.env.BASE_URL}images/concepts/speaker-interactive-front-v3.webp`,
  assembly: `${import.meta.env.BASE_URL}images/concepts/speaker-exploded-study-v3.webp`,
  horn: `${import.meta.env.BASE_URL}images/concepts/horn-assembly-study-v3.webp`,
  proposal: `${import.meta.env.BASE_URL}drawings/horn-design-proposal.pdf`,
};

function selectedFromHash(): PartId | null {
  const match = /^#object-design-(horn|midrange|bass)$/.exec(window.location.hash);
  return match ? match[1] as PartId : null;
}

export default function ObjectDesign({ copy: siteCopy }: { copy: SiteCopy }) {
  const [copy, settings, setSettings] = usePagePreview("design", DESIGN_COPY_EN, DESIGN_COPY_JA);
  const [language] = useLanguage();
  const [selected, setSelected] = useState<PartId | null>(selectedFromHash);
  const [ready, setReady] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const initialDeepLink = useRef(selected !== null);
  const items = useMemo(() => speakerPhotos(language), [language]);
  const ja = language === "ja";
  const parts: DesignPart[] = [
    { id: "horn", title: copy.hornTitle, part: copy.hornPart, body: copy.hornFunction, detail: copy.hornDetail, material: copy.hornMaterial, drawing: assets.horn, drawingAlt: copy.hornDrawingAlt, caption: copy.hornDrawing },
    { id: "midrange", title: copy.midTitle, part: copy.midPart, body: copy.midFunction, detail: copy.midDetail, material: copy.midMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
    { id: "bass", title: copy.bassTitle, part: copy.bassPart, body: copy.bassFunction, detail: copy.bassDetail, material: copy.bassMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
  ];

  useEffect(() => {
    const syncHash = () => setSelected(selectedFromHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !("IntersectionObserver" in window)) { setReady(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const revealPart = useCallback((id: PartId) => {
    setSelected(id);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#object-design-${id}`);
  }, []);
  const closeDetails = useCallback(() => {
    setSelected(null);
    if (window.location.hash.startsWith("#object-design-")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#architecture`);
    }
  }, []);
  const restoreFocus = useCallback(() => {
    const opener = openerRef.current ?? sectionRef.current?.querySelector<HTMLButtonElement>("[data-part]");
    if (initialDeepLink.current) {
      initialDeepLink.current = false;
      opener?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    opener?.focus({ preventScroll: true });
  }, []);

  const placeholder = <div className="sc-speaker-gallery__placeholder" aria-hidden="true">
    <img src={items[0].src} alt="" style={{ objectPosition: `${(items[0].focalPoint?.[0] ?? .5) * 100}% ${(items[0].focalPoint?.[1] ?? .5) * 100}%` }} width="1800" height="1200" loading="lazy" />
  </div>;

  return <>
    <div className="sc-speaker-gallery" id="listening-design" ref={sectionRef}>
      <div className="sc-speaker-gallery__stage">
        {ready ? <Suspense fallback={placeholder}>
          <LiquidGlassCarousel items={items} panelHeight={480} gap={24} background="#ffffff" entry
            className="sc-speaker-gallery__carousel" style={{ color: "#101d8f" }}
            ariaLabel={ja ? "Metorom スピーカーの写真" : "Metorom speaker photographs"}
            labels={ja ? { previous: "前の写真", next: "次の写真", view: "写真を拡大", close: "写真を閉じる", help: "ドラッグで移動・タップで拡大", loading: "写真を読み込み中…", error: "写真を読み込めませんでした。前後の写真をお試しください。" } : { previous: "Previous photograph", next: "Next photograph", view: "View photograph", close: "Close photograph", help: "Drag to explore · tap to view", loading: "Loading photograph…", error: "This photograph could not load. Try the previous or next photograph." }} />
        </Suspense> : placeholder}
      </div>
      <nav className="sc-speaker-gallery__details" aria-label={copy.contentsLabel}>
        {parts.map((part) => <button type="button" data-part={part.id} key={part.id} onClick={(event) => {
          openerRef.current = event.currentTarget;
          revealPart(part.id);
        }}>{part.title}<ArrowUpRight size={15} aria-hidden="true" /></button>)}
      </nav>
    </div>
    <ObjectDesignDialog part={parts.find((part) => part.id === selected) ?? null} parts={parts} copy={copy} siteCopy={siteCopy} language={language} render={assets.render} proposal={assets.proposal} onSelect={revealPart} onClose={closeDetails} onRestoreFocus={restoreFocus} />
    {new URLSearchParams(window.location.search).get("editor") === "design" && <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />}
  </>;
}
