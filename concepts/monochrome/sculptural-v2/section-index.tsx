import { useEffect, useState } from "react";
import "./section-index.css";

const chapters = [
  { id: "architecture", label: "Open construction" },
  { id: "measurements", label: "Measurements" },
  { id: "listening", label: "Listening" },
  { id: "conversation", label: "Conversation" },
] as const;

type IndexState = {
  visible: boolean;
  active: string;
  dark: boolean;
};

export default function SectionIndex() {
  const [state, setState] = useState<IndexState>({ visible: false, active: "architecture", dark: false });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const first = document.getElementById(chapters[0].id);
      const last = document.getElementById(chapters[chapters.length - 1].id);
      if (!first || !last) return;
      const threshold = Math.min(125, window.innerHeight * 0.16);
      const visible = first.getBoundingClientRect().top <= threshold
        && last.getBoundingClientRect().bottom > threshold;
      let active: string = chapters[0].id;
      for (const chapter of chapters) {
        if ((document.getElementById(chapter.id)?.getBoundingClientRect().top ?? Infinity) <= threshold) active = chapter.id;
      }
      const dark = (document.getElementById("conversation")?.getBoundingClientRect().top ?? Infinity) <= threshold;
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
    <nav className={`sc-section-index${state.visible ? " is-visible" : ""}${state.dark ? " is-dark" : ""}`} aria-label="Study index" aria-hidden={!state.visible}>
      <p>INDEX <span>01 — 04</span></p>
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
