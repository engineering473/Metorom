import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { SiteCopy } from "./site-copy";
import type { Language } from "./language";
import "./frequency-paths.css";

type FrequencyPathsProps = { copy: SiteCopy; language: Language };

function sinePath(cycles: number) {
  return Array.from({ length: 1281 }, (_, x) => {
    const y = 56 - Math.sin(x / 640 * Math.PI * 2 * cycles) * 32;
    return `${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`;
  }).join(" ");
}

const waves = { high: sinePath(12), mid: sinePath(5), low: sinePath(2) };

export default function FrequencyPaths({ copy, language }: FrequencyPathsProps) {
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
      sound: japanese ? "シンバルのきらめき、細かな音の輪郭。" : "Cymbal shimmer. Fine upper detail.",
      rhythm: japanese ? "同じ時間に、多くの振動" : "More vibrations in the same time",
    },
    {
      key: "mid" as const, title: copy.pathMidTitle, part: copy.pathMidPart, body: copy.pathMidBody,
      sound: japanese ? "人の声、楽器の響きの中心。" : "Voices. The body of an instrument.",
      rhythm: japanese ? "高域と低域の間の振動" : "Between the high and low ranges",
    },
    {
      key: "low" as const, title: copy.pathLowTitle, part: copy.pathLowPart, body: copy.pathLowBody,
      sound: japanese ? "ベースの音、キックドラムの重み。" : "Bass notes. The weight of a kick drum.",
      rhythm: japanese ? "同じ時間に、少ない振動" : "Fewer vibrations in the same time",
    },
  ];

  return <div ref={root} className={`sc-paths${inView && !reduceMotion ? " is-playing" : ""}`}>
    <div className="sc-paths__explanation">
      <p>{japanese
        ? "周波数は、1秒間の振動の数です。単位はヘルツ（Hz）。同じ時間に波が多いほど音は高く、少ないほど低くなります。3つの波を見比べてください。"
        : "Frequency is the number of vibrations each second, measured in hertz (Hz). More waves in the same time means a higher pitch; fewer means a lower pitch. Compare the three below."}</p>
    </div>
    {paths.map((path) => <article key={path.key} className={`sc-paths__row sc-paths__row--${path.key}`} aria-labelledby={`${id}-${path.key}`}>
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
        <figcaption><span>{path.rhythm}</span><span>{japanese ? "時間 →" : "Time →"}</span></figcaption>
      </figure>
    </article>)}
    <p className="sc-paths__note">{japanese ? "波は説明用の模式図です。同じ時間幅・振幅で比較しています。ドライバーの実測値や音量を示すものではありません。" : "Schematic waves, shown over the same time window and at equal amplitude. They illustrate pitch, not measured driver response or loudness."}</p>
  </div>;
}
