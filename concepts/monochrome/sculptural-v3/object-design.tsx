import { useCallback, useEffect, useRef, useState } from "react";
import GlassFolder from "@/components/ui/glass-folder-cards";
import RenderedObject from "./rendered-object";
import ObjectDesignDialog, { type DesignPart, type PartId } from "./object-design-dialog";
import { DESIGN_COPY_EN, DESIGN_COPY_JA } from "./design-copy";
import { PageEditor, usePagePreview } from "./page-editor";
import { useLanguage } from "./language";
import type { SiteCopy } from "./site-copy";
import "./object-design.css";

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
  const initialDeepLink = useRef(selected !== null);
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

  const revealPart = useCallback((id: PartId) => {
    setSelected(id);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#object-design-${id}`);
  }, []);

  const closeDetails = useCallback(() => {
    setSelected(null);
    if (window.location.hash.startsWith("#object-design-")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#object`);
    }
  }, []);

  const restoreFolderFocus = useCallback(() => {
    const opener = folderRef.current?.querySelector<HTMLButtonElement>(".gf-hit");
    // A fresh deep link has no previous page position to return to.
    if (initialDeepLink.current) {
      initialDeepLink.current = false;
      opener?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    opener?.focus({ preventScroll: true });
  }, []);

  return <>
    <RenderedObject copy={siteCopy} design={<div className="sc-object-design-folder" ref={folderRef}>
      <GlassFolder key={language} label={copy.detailLabel} meta={copy.folderMeta} width={280} tone="dark" art="none" image={assets.render} action="none" appear={false} openHeadroom={130}
        open={folderOpen} onOpenChange={setFolderOpen}
        openLabel={`${copy.openFolder} ${copy.detailLabel}`} closeLabel={`${copy.closeFolder} ${copy.detailLabel}`} contentsLabel={`${copy.folderContents} ${copy.detailLabel}`}
        files={parts.map((entry) => ({ name: entry.title, image: entry.drawing }))}
        onFileSelect={(_, index) => revealPart(parts[index].id)} />
    </div>} />
    <ObjectDesignDialog part={parts.find((entry) => entry.id === selected) ?? null} parts={parts} copy={copy} language={language} render={assets.render} proposal={assets.proposal} onSelect={revealPart} onClose={closeDetails} onRestoreFocus={restoreFolderFocus} />
    {new URLSearchParams(window.location.search).get("editor") === "design" && <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />}
  </>;
}
