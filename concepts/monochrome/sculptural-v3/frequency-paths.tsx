import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { SiteCopy } from "./site-copy";
import type { Language } from "./language";
import "./frequency-paths.css";

export type FrequencyRange = "high" | "mid" | "low";
type FrequencyPathsProps = { copy: SiteCopy; language: Language; range?: FrequencyRange };

function sinePath(cycles: number) {
  return Array.from({ length: 1281 }, (_, x) => {
    const y = 56 - Math.sin(x / 640 * Math.PI * 2 * cycles) * 32;
    return `${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`;
  }).join(" ");
}

const waves = { high: sinePath(12), mid: sinePath(5), low: sinePath(2) };

export default function FrequencyPaths({ copy, language, range }: FrequencyPathsProps) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const japanese = language === "ja";

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const paths = [
    {
      key: "high" as const, title: copy.pathHighTitle, part: copy.pathHighPart, body: copy.pathHighBody,
      sound: copy.pathHighSound,
      rhythm: copy.pathHighRhythm,
    },
    {
      key: "mid" as const, title: copy.pathMidTitle, part: copy.pathMidPart, body: copy.pathMidBody,
      sound: copy.pathMidSound,
      rhythm: copy.pathMidRhythm,
    },
    {
      key: "low" as const, title: copy.pathLowTitle, part: copy.pathLowPart, body: copy.pathLowBody,
      sound: copy.pathLowSound,
      rhythm: copy.pathLowRhythm,
    },
  ];

  const visiblePaths = range ? paths.filter((path) => path.key === range) : paths;

  return <div ref={root} className={`sc-paths${range ? " sc-paths--single" : ""}${inView && !reduceMotion ? " is-playing" : ""}`}>
    {visiblePaths.map((path) => <article key={path.key} className={`sc-paths__row sc-paths__row--${path.key}`} aria-labelledby={`${id}-${path.key}`}>
      <div className="sc-paths__copy">
        <h3 id={`${id}-${path.key}`}>{path.title}</h3>
        <p className="sc-paths__part">{path.part}</p>
        <p className="sc-paths__sound">{path.sound}</p>
        <p className="sc-paths__body">{path.body}</p>
      </div>
      <figure className="sc-paths__figure">
        <svg viewBox="0 0 640 112" role="img" aria-labelledby={`${id}-${path.key}-title ${id}-${path.key}-description`}>
          <title id={`${id}-${path.key}-title`}>{path.title}</title>
          <desc id={`${id}-${path.key}-description`}>{path.rhythm}. {japanese ? "他の波と同じ振幅と時間幅で描いた模式図です。実測値や録音ではありません。" : "A schematic sine wave with the same amplitude and time window as the other two waves. This is not measured data or an audio recording."}</desc>
          <g className="sc-paths__wave"><path d={waves[path.key]} /></g>
        </svg>
        <figcaption><span>{path.rhythm}</span><span>{copy.pathTimeLabel}</span></figcaption>
      </figure>
    </article>)}
    <p className="sc-paths__note">{range ? copy.pathSingleNote : copy.pathComparisonNote}</p>
  </div>;
}
