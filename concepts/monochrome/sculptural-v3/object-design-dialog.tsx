import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import type { DESIGN_COPY_EN } from "./design-copy";
import "./object-design-dialog.css";

export type PartId = "horn" | "midrange" | "bass";
export type DesignPart = { id: PartId; title: string; part: string; body: string; detail: string; material: string; drawing: string; drawingAlt: string; caption: string };
type Props = {
  part: DesignPart | null;
  parts: DesignPart[];
  copy: typeof DESIGN_COPY_EN;
  language: "en" | "ja";
  render: string;
  proposal: string;
  onSelect: (id: PartId) => void;
  onClose: () => void;
  onRestoreFocus: () => void;
};

export default function ObjectDesignDialog({ part, parts, copy, language, render, proposal, onSelect, onClose, onRestoreFocus }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"render" | "drawing">("render");
  const titleId = useId();
  const open = part !== null;
  const ja = language === "ja";
  const labels = ja ? { close: "デザインの詳細を閉じる", parts: "スピーカーの各部", views: "表示する画像", horn: "ホーン", midrange: "中域", bass: "低域" } : { close: "Close design details", parts: "Speaker parts", views: "Image view", horn: "Horn", midrange: "Midrange", bass: "Bass" };

  useEffect(() => {
    setView("render");
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [part?.id]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.getElementById("root");
    let release: (() => void) | undefined;
    let observer: MutationObserver | undefined;
    const show = () => {
      // The loading gate owns focus and overflow until it releases the page.
      if (root?.inert || dialog.open || !dialog.isConnected) return;
      observer?.disconnect();
      const bodyOverflow = document.body.style.overflow;
      const documentOverflow = document.documentElement.style.overflow;
      const scrollbarGutter = document.documentElement.style.scrollbarGutter;
      document.documentElement.style.scrollbarGutter = "stable";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
      release = () => {
        if (dialog.open) dialog.close();
        document.body.style.overflow = bodyOverflow;
        document.documentElement.style.overflow = documentOverflow;
        document.documentElement.style.scrollbarGutter = scrollbarGutter;
        onRestoreFocus();
      };
    };
    if (root?.inert) {
      observer = new MutationObserver(show);
      observer.observe(root, { attributes: true, attributeFilter: ["inert"] });
    }
    show();
    return () => { observer?.disconnect(); release?.(); };
  }, [open, onRestoreFocus]);

  return createPortal(<dialog ref={dialogRef} className="sc-design-lightbox" aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onPointerDown={(event) => { event.stopPropagation(); }}
    onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key !== "Tab") return;
      const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const outside = !event.currentTarget.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    {part && <>
      <header className="sc-design-lightbox__header">
        <div className="sc-design-lightbox__title"><h2 id={titleId}>{part.title}</h2><button ref={closeRef} className="sc-design-lightbox__close" type="button" aria-label={labels.close} onClick={onClose}><X size={20} aria-hidden="true" /></button></div>
        <nav className="sc-design-lightbox__parts" aria-label={labels.parts}>{parts.map((entry) => <button key={entry.id} type="button" aria-pressed={entry.id === part.id} onClick={() => onSelect(entry.id)}>{labels[entry.id]}</button>)}</nav>
      </header>
      <div className="sc-design-lightbox__body" ref={contentRef}>
        <div className="sc-design-lightbox__visual">
          <figure>
            <div className={`sc-design-lightbox__image sc-design-lightbox__image--${view} sc-design-lightbox__image--${part.id}`}>
              <img src={view === "render" ? render : part.drawing} alt={view === "render" ? `${part.title} / ${copy.renderLabel}` : part.drawingAlt} width={view === "render" ? 1600 : 849} height={view === "render" ? 1600 : 1200} />
            </div>
            <figcaption>{view === "render" ? copy.renderLabel : part.caption}</figcaption>
          </figure>
          <div className="sc-design-lightbox__views" role="group" aria-label={labels.views}>
            <button type="button" aria-pressed={view === "render"} onClick={() => setView("render")}>{copy.renderLabel}</button>
            <button type="button" aria-pressed={view === "drawing"} onClick={() => setView("drawing")}>{part.caption}</button>
          </div>
          {view === "drawing" && <p className="sc-design-lightbox__study-note">{copy.drawingNote}</p>}
        </div>
        <div className="sc-design-lightbox__copy">
          <p className="sc-design-lightbox__model">{part.part}</p>
          <div><h3>{copy.functionLabel}</h3><p>{part.body}</p></div>
          <div><h3>{copy.detailLabel}</h3><p>{part.detail}</p></div>
          <div><h3>{copy.materialsLabel}</h3><p>{part.material}</p></div>
          {part.id === "horn" && <a className="sc-design-lightbox__download" href={proposal} target="_blank" rel="noreferrer">{copy.hornDownload}<Download size={17} aria-hidden="true" /><span>PDF</span></a>}
        </div>
      </div>
    </>}
  </dialog>, document.body);
}
