import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
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
  const [deckMode, setDeckMode] = useState(() => window.matchMedia("(max-width: 760px) and (prefers-reduced-motion: no-preference)").matches);
  const folderRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stage = folder.querySelector<HTMLElement>(".sc-object-design-folder__sticky");
    const items = [...folder.querySelectorAll<HTMLElement>(".sc-object-design-folder__item")];
    const motion = items.map((element) => ({ element, value: Number(element.style.getPropertyValue("--sc-folder-fold")) || 0, target: 0 }));
    let visible = !("IntersectionObserver" in window);
    let frame = 0;
    let needsMeasure = true;
    let previousTime = 0;
    const update = (time: number) => {
      frame = 0;
      if (needsMeasure) {
        needsMeasure = false;
        const enabled = mobile.matches && !reduced.matches;
        setDeckMode(enabled);
        if (!enabled || !stage) {
          motion.forEach((entry) => { entry.target = 0; });
          setBrowsing(null);
        } else {
          // The fixed runway supplies progress independently of the folded art.
          const top = Number.parseFloat(window.getComputedStyle(stage).top) || 0;
          const travel = Math.max(1, folder.offsetHeight - stage.offsetHeight);
          const progress = Math.min(1, Math.max(0, (top - folder.getBoundingClientRect().top) / travel));
          const position = progress * motion.length;
          motion.forEach((entry, index) => {
            const turn = Math.min(1, Math.max(0, (position - index - .24) / .76));
            entry.target = turn * turn * (3 - 2 * turn);
          });
          const active = Math.min(motion.length - 1, Math.floor(position + .12));
          setBrowsing(items[active].dataset.part as PartId);
        }
      }
      const blend = 1 - Math.exp(-Math.min(previousTime ? time - previousTime : 16.7, 48) / 105);
      let settling = false;
      motion.forEach((entry) => {
        entry.value = reduced.matches || !visible || !mobile.matches ? entry.target : entry.value + (entry.target - entry.value) * blend;
        if (Math.abs(entry.target - entry.value) < .001) entry.value = entry.target;
        else settling = true;
        entry.element.style.setProperty("--sc-folder-fold", entry.value.toFixed(4));
      });
      previousTime = settling ? time : 0;
      if (settling) frame = window.requestAnimationFrame(update);
    };
    const schedule = () => { needsMeasure = true; if (!frame) frame = window.requestAnimationFrame(update); };
    const onScroll = () => { if (visible && mobile.matches) schedule(); };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }) : null;
    observer?.observe(folder);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    mobile.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      mobile.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
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
    const direct = openerRef.current;
    const choice = folderRef.current?.querySelector<HTMLButtonElement>(`[data-folder-choice="${openerPart.current}"]`);
    const fallback = choice?.getClientRects().length ? choice : folderRef.current?.querySelector<HTMLButtonElement>(`[data-part="${openerPart.current}"] .gf-hit`);
    const opener = direct?.isConnected && !direct.closest("[inert]") ? direct : fallback;
    // A fresh deep link has no previous page position to return to.
    if (initialDeepLink.current) {
      initialDeepLink.current = false;
      opener?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    opener?.focus({ preventScroll: true });
  }, []);

  return <>
    <div className="sc-object-design-folder" id="listening-design" ref={folderRef} role="group" aria-label={copy.contentsLabel}>
      <div className="sc-object-design-folder__sticky">
      <div className="sc-object-design-folder__deck">
      {parts.map((entry) => {
        const frequency = entry.id === "horn" ? siteCopy.pathHighTitle : entry.id === "midrange" ? siteCopy.pathMidTitle : siteCopy.pathLowTitle;
        return <div className="sc-object-design-folder__item" data-part={entry.id} data-browsing={(browsing ?? "horn") === entry.id || undefined} inert={deckMode && (browsing ?? "horn") !== entry.id} aria-hidden={deckMode && (browsing ?? "horn") !== entry.id || undefined} key={`${language}-${entry.id}`}>
          <GlassFolder label={entry.title} meta={frequency} width={280} tone="dark" art="none" image={assets.render} action="none" appear={false}
            affordance={<>{copy.folderAction}<ArrowUpRight size={16} aria-hidden="true" /></>}
            open={selected === entry.id}
            onOpenChange={(open) => {
              if (open) {
                openerPart.current = entry.id;
                openerRef.current = folderRef.current?.querySelector<HTMLButtonElement>(`[data-part="${entry.id}"] .gf-hit`) ?? null;
                revealPart(entry.id);
              }
              else closeDetails();
            }}
            openLabel={`${copy.openFolder} ${entry.title}`} closeLabel={`${copy.closeFolder} ${entry.title}`} contentsLabel={`${copy.folderContents} ${entry.title}`}
            files={[{ name: frequency, image: entry.drawing }]}
            onFileSelect={() => revealPart(entry.id)} />
        </div>;
      })}
      </div>
      <p className="sc-object-design-folder__hint sc-object-design-folder__hint--scroll">{copy.folderScrollHint}</p>
      <p className="sc-object-design-folder__hint sc-object-design-folder__hint--choose">{copy.folderChooseHint}</p>
      <nav className="sc-object-design-folder__choices" aria-label={copy.contentsLabel}>
        {parts.map((entry) => <button type="button" key={entry.id} data-folder-choice={entry.id} aria-pressed={(browsing ?? "horn") === entry.id} onClick={(event) => {
          openerPart.current = entry.id;
          openerRef.current = event.currentTarget;
          revealPart(entry.id);
        }}>{entry.title}</button>)}
      </nav>
      </div>
    </div>
    <ObjectDesignDialog part={parts.find((entry) => entry.id === selected) ?? null} parts={parts} copy={copy} siteCopy={siteCopy} language={language} render={assets.render} proposal={assets.proposal} onSelect={revealPart} onClose={closeDetails} onRestoreFocus={restoreFolderFocus} />
    {new URLSearchParams(window.location.search).get("editor") === "design" && <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />}
  </>;
}
