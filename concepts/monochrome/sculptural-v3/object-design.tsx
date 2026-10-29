import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import GlassFolder from "@/components/ui/glass-folder-cards";
import RenderedObject from "./rendered-object";
import { DESIGN_COPY_EN, DESIGN_COPY_JA } from "./design-copy";
import { PageEditor, usePagePreview } from "./page-editor";
import { useLanguage } from "./language";
import type { SiteCopy } from "./site-copy";
import "./object-design.css";

type PartId = "horn" | "midrange" | "bass";
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
  const [folderOpen, setFolderOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const revealFrame = useRef<number | null>(null);
  const parts = [
    { id: "horn" as const, title: copy.hornTitle, part: copy.hornPart, body: copy.hornFunction, detail: copy.hornDetail, material: copy.hornMaterial, drawing: assets.horn, drawingAlt: copy.hornDrawingAlt, caption: copy.hornDrawing },
    { id: "midrange" as const, title: copy.midTitle, part: copy.midPart, body: copy.midFunction, detail: copy.midDetail, material: copy.midMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
    { id: "bass" as const, title: copy.bassTitle, part: copy.bassPart, body: copy.bassFunction, detail: copy.bassDetail, material: copy.bassMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
  ];
  const part = parts.find((entry) => entry.id === selected);
  const closeLabel = language === "ja" ? "デザインの詳細を閉じる" : "Close design details";

  useEffect(() => {
    const syncHash = () => {
      const next = selectedFromHash();
      if (next) setSelected(next);
    };
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => () => {
    if (revealFrame.current !== null) cancelAnimationFrame(revealFrame.current);
  }, []);

  const revealPart = (id: PartId) => {
    setSelected(id);
    setFolderOpen(false);
    if (revealFrame.current !== null) cancelAnimationFrame(revealFrame.current);
    revealFrame.current = requestAnimationFrame(() => {
      revealFrame.current = null;
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.closest<HTMLElement>(".sc-object-design")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    });
  };

  const closeDetails = () => {
    setSelected(null);
    if (window.location.hash.startsWith("#object-design-")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#object`);
    }
    requestAnimationFrame(() => folderRef.current?.querySelector<HTMLButtonElement>(".gf-hit")?.focus());
  };

  return <>
    <RenderedObject copy={siteCopy}
      design={<div className="sc-object-design-folder" ref={folderRef}>
        <GlassFolder key={language} label={copy.detailLabel} meta={copy.folderMeta} width={280} tone="dark" art="none" image={assets.render} action="none" appear={false} openHeadroom={130}
          open={folderOpen} onOpenChange={setFolderOpen}
          openLabel={`${copy.openFolder} ${copy.detailLabel}`} closeLabel={`${copy.closeFolder} ${copy.detailLabel}`} contentsLabel={`${copy.folderContents} ${copy.detailLabel}`}
          files={parts.map((entry) => ({ name: entry.title, image: entry.drawing, href: `#object-design-${entry.id}` }))}
          onFileSelect={(_, index) => revealPart(parts[index].id)} />
      </div>}
      details={part && <section className={`sc-object-design sc-object-design--${part.id}`} id={`object-design-${part.id}`} aria-labelledby="sc-object-design-heading">
        <div className="sc-object-design__inner">
          <div className="sc-object-design__copy">
            <h3 ref={headingRef} tabIndex={-1} id="sc-object-design-heading">{part.title}</h3>
            <p className="sc-object-design__model">{part.part}</p>
            <div className="sc-object-design__note"><h4>{copy.functionLabel}</h4><p>{part.body}</p></div>
            <div className="sc-object-design__note"><h4>{copy.detailLabel}</h4><p>{part.detail}</p></div>
            <div className="sc-object-design__note"><h4>{copy.materialsLabel}</h4><p>{part.material}</p></div>
            {part.id === "horn" && <a className="sc-object-design__download" href={assets.proposal} target="_blank" rel="noreferrer">{copy.hornDownload}<Download size={17} aria-hidden="true" /><span>PDF</span></a>}
          </div>
          <div className="sc-object-design__views">
            <figure className={`sc-object-design__render sc-object-design__render--${part.id}`}><div><img src={assets.render} alt={`${part.title} / ${copy.renderLabel}`} width="1600" height="1600" /></div><figcaption>{copy.renderLabel}</figcaption></figure>
            <figure className="sc-object-design__drawing"><a href={part.drawing} target="_blank" rel="noreferrer"><img src={part.drawing} alt={part.drawingAlt} width="849" height="1200" /></a><figcaption>{part.caption}</figcaption></figure>
            <p className="sc-object-design__study-note">{copy.drawingNote}</p>
          </div>
          <button type="button" className="sc-object-design__close" onClick={closeDetails} aria-label={closeLabel}><X size={20} aria-hidden="true" /></button>
        </div>
      </section>} />
    {new URLSearchParams(window.location.search).get("editor") === "design" && <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />}
  </>;
}
