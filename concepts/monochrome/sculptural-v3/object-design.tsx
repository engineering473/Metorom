import { useCallback, useEffect, useRef, useState } from "react";
import GlassFolder from "@/components/ui/glass-folder-cards";
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
  const [browsing, setBrowsing] = useState<PartId | null>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const initialDeepLink = useRef(selected !== null);
  const openerPart = useRef<PartId>(selected ?? "horn");
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
    const folder = folderRef.current;
    if (!folder || selected) return;
    const mobile = window.matchMedia("(max-width: 760px)");
    const items = [...folder.querySelectorAll<HTMLElement>("[data-part]")];
    let visible = !("IntersectionObserver" in window);
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!mobile.matches || !visible) { setBrowsing(null); return; }
      const readingLine = window.innerHeight * .62;
      // Stationary wrappers keep the lifted artwork from changing its own target.
      const candidates = items.map((item) => {
        const bounds = item.getBoundingClientRect();
        return { id: item.dataset.part as PartId, distance: Math.abs(bounds.top + bounds.height * .84 - readingLine) };
      });
      const nearest = candidates.reduce((best, entry) => entry.distance < best.distance ? entry : best);
      setBrowsing((previous) => {
        const current = candidates.find((entry) => entry.id === previous);
        return current && current.distance < nearest.distance + 18 ? previous : nearest.id;
      });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const onScroll = () => { if (visible && mobile.matches) schedule(); };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }) : null;
    observer?.observe(folder);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    mobile.addEventListener("change", schedule);
    schedule();
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      mobile.removeEventListener("change", schedule);
    };
  }, [selected, language]);

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

  const restoreFolderFocus = useCallback(() => {
    const opener = folderRef.current?.querySelector<HTMLButtonElement>(`[data-part="${openerPart.current}"] .gf-hit`);
    // A fresh deep link has no previous page position to return to.
    if (initialDeepLink.current) {
      initialDeepLink.current = false;
      opener?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    opener?.focus({ preventScroll: true });
  }, []);

  return <>
    <div className="sc-object-design-folder" id="listening-design" ref={folderRef} role="group" aria-label={copy.contentsLabel}>
      {parts.map((entry) => {
        const frequency = entry.id === "horn" ? siteCopy.pathHighTitle : entry.id === "midrange" ? siteCopy.pathMidTitle : siteCopy.pathLowTitle;
        return <div className="sc-object-design-folder__item" data-part={entry.id} data-browsing={browsing === entry.id || undefined} key={`${language}-${entry.id}`}>
          <GlassFolder label={entry.title} meta={frequency} width={280} tone="dark" art="none" image={assets.render} action="none" appear={false}
            open={selected === entry.id}
            onOpenChange={(open) => {
              if (open) { openerPart.current = entry.id; revealPart(entry.id); }
              else closeDetails();
            }}
            openLabel={`${copy.openFolder} ${entry.title}`} closeLabel={`${copy.closeFolder} ${entry.title}`} contentsLabel={`${copy.folderContents} ${entry.title}`}
            files={[{ name: frequency, image: entry.drawing }]}
            onFileSelect={() => revealPart(entry.id)} />
        </div>;
      })}
    </div>
    <ObjectDesignDialog part={parts.find((entry) => entry.id === selected) ?? null} parts={parts} copy={copy} siteCopy={siteCopy} language={language} render={assets.render} proposal={assets.proposal} onSelect={revealPart} onClose={closeDetails} onRestoreFocus={restoreFolderFocus} />
    {new URLSearchParams(window.location.search).get("editor") === "design" && <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />}
  </>;
}
