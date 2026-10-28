import { useEffect, useRef, useState } from "react";
import type { SiteCopy } from "./site-copy";
import "./section-index.css";

const chapterIds = ["architecture", "measurements", "listening", "conversation", "philosophy", "gallery"] as const;

type IndexState = {
  visible: boolean;
  active: string;
  dark: boolean;
  gallery: boolean;
};

export default function SectionIndex({ copy }: { copy: SiteCopy }) {
  const chapters = [
    { id: "architecture", label: copy.indexOpen },
    { id: "measurements", label: copy.indexMeasurements },
    { id: "listening", label: copy.indexListening },
    { id: "conversation", label: copy.indexConversation },
    { id: "philosophy", label: copy.indexPhilosophy },
    { id: "gallery", label: copy.indexGallery },
  ] as const;
  const [state, setState] = useState<IndexState>({ visible: false, active: "architecture", dark: false, gallery: false });
  const indexRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const first = document.getElementById(chapterIds[0]);
      const last = document.getElementById(chapterIds[chapterIds.length - 1]);
      const conversation = document.getElementById("conversation");
      if (!first || !last || !conversation) return;
      const threshold = Math.min(125, window.innerHeight * 0.16);
      const indexBounds = indexRef.current?.getBoundingClientRect();
      const indexTop = indexBounds?.top ?? threshold;
      const indexBottom = indexBounds?.bottom ?? threshold;
      const indexCenter = (indexTop + indexBottom) / 2;
      const conversationBounds = conversation.getBoundingClientRect();
      const galleryBounds = last.getBoundingClientRect();
      const gallery = galleryBounds.top <= threshold && galleryBounds.bottom > window.innerHeight - 12;
      const visible = first.getBoundingClientRect().top <= threshold
        && (gallery || galleryBounds.bottom > window.innerHeight * .7);
      let active: string = chapters[0].id;
      for (const id of chapterIds) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold) active = id;
      }
      const dark = conversationBounds.top <= indexCenter && conversationBounds.bottom > indexCenter;
      setState((previous) => previous.visible === visible && previous.active === active && previous.dark === dark && previous.gallery === gallery
        ? previous : { visible, active, dark, gallery });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav ref={indexRef} className={`sc-section-index${state.visible ? " is-visible" : ""}${state.dark ? " is-dark" : ""}${state.gallery ? " is-gallery" : ""}`} aria-label={copy.indexLabel} aria-hidden={!state.visible}>
      <p>{copy.indexLabel} <span>{copy.indexRange}</span></p>
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id} className={state.active === chapter.id ? "is-active" : ""}>
            <a href={`#${chapter.id}`} tabIndex={state.visible ? 0 : -1} aria-current={state.active === chapter.id ? "location" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>{chapter.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
