import { useEffect, useRef, useState } from "react";
import type { SiteCopy } from "./site-copy";
import "./section-index.css";

const chapterIds = ["architecture", "measurements", "listening", "conversation"] as const;

type IndexState = {
  visible: boolean;
  active: string;
  dark: boolean;
};

export default function SectionIndex({ copy }: { copy: SiteCopy }) {
  const chapters = [
    { id: "architecture", label: copy.indexOpen },
    { id: "measurements", label: copy.indexMeasurements },
    { id: "listening", label: copy.indexListening },
    { id: "conversation", label: copy.indexConversation },
  ] as const;
  const [state, setState] = useState<IndexState>({ visible: false, active: "architecture", dark: false });
  const indexRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const first = document.getElementById(chapterIds[0]);
      const last = document.getElementById(chapterIds[chapterIds.length - 1]);
      if (!first || !last) return;
      const threshold = Math.min(125, window.innerHeight * 0.16);
      const indexBounds = indexRef.current?.getBoundingClientRect();
      const indexTop = indexBounds?.top ?? threshold;
      const indexBottom = indexBounds?.bottom ?? threshold;
      const conversationBounds = last.getBoundingClientRect();
      const philosophyTop = document.getElementById("philosophy")?.getBoundingClientRect().top ?? conversationBounds.bottom;
      const visible = first.getBoundingClientRect().top <= threshold
        && philosophyTop > indexBottom + 80;
      let active: string = chapters[0].id;
      for (const id of chapterIds) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold) active = id;
      }
      const dark = conversationBounds.top <= (indexTop + indexBottom) / 2;
      setState((previous) => previous.visible === visible && previous.active === active && previous.dark === dark
        ? previous : { visible, active, dark });
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
    <nav ref={indexRef} className={`sc-section-index${state.visible ? " is-visible" : ""}${state.dark ? " is-dark" : ""}`} aria-label={copy.indexLabel} aria-hidden={!state.visible}>
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
