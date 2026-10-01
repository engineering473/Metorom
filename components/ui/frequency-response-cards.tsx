import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import "./frequency-response-cards.css";

type ResponsePoint = { hz: number; db: number };
type ResponseSeries = { name: string; shortName: string; color: string; data: ResponsePoint[] };

const FREQUENCIES = Array.from({ length: 73 }, (_, index) => 20 * 1000 ** (index / 72));

const DRIVER_PROFILES = [
  { name: "LAB 12", shortName: "LOW", color: "#4b685b", anchors: [[20, 57], [30, 70], [40, 77], [60, 81], [100, 82], [150, 81], [250, 75], [400, 60], [800, 43], [20000, 36]] },
  { name: "Alpha 6A", shortName: "MID", color: "#5576a1", anchors: [[20, 35], [100, 43], [150, 57], [250, 75], [350, 80], [500, 82], [1000, 81], [2000, 81], [3000, 78], [4000, 71], [6000, 56], [10000, 40], [20000, 35]] },
  { name: "BMS 4540ND", shortName: "HIGH", color: "#a16c49", anchors: [[20, 35], [200, 36], [500, 43], [800, 56], [1200, 70], [1800, 79], [2500, 82], [5000, 81], [10000, 80], [16000, 77], [20000, 73]] },
] as const;

const SYSTEM_ANCHORS = [[20, 65], [30, 73], [40, 77.8], [60, 79.9], [100, 81.2], [150, 81], [250, 80.2], [500, 81.3], [1000, 80.7], [2000, 80.4], [5000, 81.1], [10000, 80], [16000, 78.5], [20000, 75.2]] as const;

function interpolateProfile(hz: number, anchors: readonly (readonly [number, number])[]) {
  const target = Math.log10(hz);
  for (let index = 1; index < anchors.length; index += 1) {
    const [rightHz, rightDb] = anchors[index];
    const [leftHz, leftDb] = anchors[index - 1];
    if (hz <= rightHz) {
      const progress = (target - Math.log10(leftHz)) / (Math.log10(rightHz) - Math.log10(leftHz));
      return leftDb + (rightDb - leftDb) * progress;
    }
  }
  return anchors[anchors.length - 1][1];
}

function makePoints(anchors: readonly (readonly [number, number])[], phase: number, ripple: number): ResponsePoint[] {
  return FREQUENCIES.map((hz) => {
    const position = Math.log10(hz / 20);
    const texture = Math.sin(position * 16 + phase) * ripple + Math.sin(position * 35 + phase * 1.7) * ripple * 0.35;
    return { hz, db: interpolateProfile(hz, anchors) + texture };
  });
}

const DRIVER_SERIES: ResponseSeries[] = DRIVER_PROFILES.map((profile, index) => ({
  name: profile.name,
  shortName: profile.shortName,
  color: profile.color,
  data: makePoints(profile.anchors, index * 1.8 + 0.6, 0.57),
}));

const SYSTEM_SERIES: ResponseSeries[] = [{
  name: "Complete speaker",
  shortName: "SYSTEM",
  color: "#3d6557",
  data: makePoints(SYSTEM_ANCHORS, 0.8, 0.47),
}];

function maximumBandDeviation(data: ResponsePoint[], minimumHz: number, maximumHz: number) {
  const values = data.filter((point) => point.hz >= minimumHz && point.hz <= maximumHz).map((point) => point.db);
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.max(...values.map((value) => Math.abs(value - mean)));
}

const DRIVER_VARIANCE = Math.max(
  maximumBandDeviation(DRIVER_SERIES[0].data, 60, 150),
  maximumBandDeviation(DRIVER_SERIES[1].data, 350, 2500),
  maximumBandDeviation(DRIVER_SERIES[2].data, 2500, 15000),
);
const SYSTEM_VARIANCE = maximumBandDeviation(SYSTEM_SERIES[0].data, 40, 16000);

const PLOT = { left: 26, right: 574, top: 30, bottom: 264, width: 600, height: 300 };

function logX(hz: number) {
  return PLOT.left + (Math.log10(hz / 20) / 3) * (PLOT.right - PLOT.left);
}

function yFor(db: number, minimum: number, maximum: number) {
  return PLOT.bottom - ((db - minimum) / (maximum - minimum)) * (PLOT.bottom - PLOT.top);
}

function pathFor(points: ResponsePoint[], minimum: number, maximum: number) {
  return points.map(({ hz, db }, index) => `${index ? "L" : "M"}${logX(hz).toFixed(1)},${yFor(db, minimum, maximum).toFixed(1)}`).join(" ");
}

function formatFrequency(hz: number) {
  if (hz >= 1000) return `${Number((hz / 1000).toFixed(hz >= 10000 ? 0 : 1))} kHz`;
  return `${Math.round(hz)} Hz`;
}

type ResponsePlotProps = {
  series: ResponseSeries[];
  yMin: number;
  yMax: number;
  yTicks: number[];
  label: string;
  filled?: boolean;
};

function ResponsePlot({ series, yMin, yMax, yTicks, label, filled = false }: ResponsePlotProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rawId = useId().replace(/:/g, "");
  const gridId = `frc-grid-${rawId}`;
  const fillId = `frc-fill-${rawId}`;
  const clipId = `frc-clip-${rawId}`;
  const plottedIndex = activeIndex ?? Math.round(FREQUENCIES.length * 0.54);
  const activeHz = FREQUENCIES[plottedIndex];
  const setIndexFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * PLOT.width;
    const proportion = Math.max(0, Math.min(1, (x - PLOT.left) / (PLOT.right - PLOT.left)));
    setActiveIndex(Math.round(proportion * (FREQUENCIES.length - 1)));
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, Math.min(FREQUENCIES.length - 1, (current ?? plottedIndex) + (event.key === "ArrowRight" ? 1 : -1))));
    }
  };

  return (
    <div className="frc-plot" role="img" tabIndex={0} aria-label={`${label}. Illustrative frequency response from 20 hertz to 20 kilohertz. Focus and use left or right arrow keys to inspect values.`} onPointerMove={setIndexFromPointer} onPointerLeave={() => setActiveIndex(null)} onFocus={() => setActiveIndex(plottedIndex)} onBlur={() => setActiveIndex(null)} onKeyDown={handleKeyDown}>
      <svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id={gridId} width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#8c9c91" opacity=".35" /></pattern>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#789a87" stopOpacity=".25" /><stop offset="100%" stopColor="#789a87" stopOpacity="0" /></linearGradient>
          <clipPath id={clipId}><rect x={PLOT.left} y={PLOT.top} width={PLOT.right - PLOT.left} height={PLOT.bottom - PLOT.top} /></clipPath>
        </defs>
        <rect width="600" height="300" fill={`url(#${gridId})`} opacity=".68" />
        {[20, 100, 1000, 10000, 20000].map((hz) => <line key={hz} x1={logX(hz)} x2={logX(hz)} y1={PLOT.top} y2={PLOT.bottom} className="frc-plot__grid-line" />)}
        {yTicks.map((db) => <line key={db} x1={PLOT.left} x2={PLOT.right} y1={yFor(db, yMin, yMax)} y2={yFor(db, yMin, yMax)} className="frc-plot__grid-line" />)}
        {filled && <path d={`${pathFor(series[0].data, yMin, yMax)} L${PLOT.right},${PLOT.bottom} L${PLOT.left},${PLOT.bottom} Z`} fill={`url(#${fillId})`} clipPath={`url(#${clipId})`} />}
        {series.map((item) => <path key={item.name} d={pathFor(item.data, yMin, yMax)} className="frc-plot__series" pathLength={1} stroke={item.color} strokeWidth={item.name === "Complete speaker" ? 3.1 : 2.5} clipPath={`url(#${clipId})`} />)}
        {activeIndex !== null && <g className="frc-plot__cursor"><line x1={logX(activeHz)} x2={logX(activeHz)} y1={PLOT.top} y2={PLOT.bottom} /><circle cx={logX(activeHz)} cy={yFor(series[0].data[activeIndex].db, yMin, yMax)} r="4.5" fill={series[0].color} /></g>}
        <text x="27" y="18" className="frc-plot__unit">SPL / dB</text>
        {yTicks.map((db) => <text key={db} x="2" y={yFor(db, yMin, yMax) + 3} className="frc-plot__tick">{db}</text>)}
        {[[20, "20"], [100, "100"], [1000, "1k"], [10000, "10k"], [20000, "20k"]].map(([hz, text]) => <text key={hz} x={logX(Number(hz))} y="287" textAnchor={Number(hz) === 20 ? "start" : Number(hz) === 20000 ? "end" : "middle"} className="frc-plot__tick">{text}</text>)}
      </svg>
      {activeIndex !== null && <div className="frc-plot__tooltip" style={{ left: `${Math.max(13, Math.min(74, (logX(activeHz) / PLOT.width) * 100))}%` }}><strong>{formatFrequency(activeHz)}</strong>{series.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.data[activeIndex].db.toFixed(1)} dB</b></span>)}</div>}
    </div>
  );
}

type ResponseCardProps = {
  kind: "drivers" | "system";
};

function ResponseCard({ kind }: ResponseCardProps) {
  const drivers = kind === "drivers";
  const series = drivers ? DRIVER_SERIES : SYSTEM_SERIES;
  return (
    <article className={`frc-card frc-card--${kind}`} data-motion-card>
      <div className="frc-card__main">
        <header className="frc-card__header"><h3>{drivers ? "Individual driver response" : "Complete system response"}</h3><span>20 Hz — 20 kHz</span></header>
        {drivers ? <div className="frc-card__legend">{series.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}</span>)}</div> : <div className="frc-card__legend"><span><i style={{ background: series[0].color }} />One combined response</span></div>}
        <div className="frc-card__metric"><strong>{drivers ? "03" : "01"}</strong><span>{drivers ? "acoustic paths" : "loudspeaker"}</span></div>
      </div>
      <div className="frc-card__chart"><ResponsePlot series={series} yMin={drivers ? 38 : 72} yMax={drivers ? 92 : 88} yTicks={drivers ? [40, 60, 80] : [74, 80, 86]} label={drivers ? "LAB 12 low frequency, Alpha 6A midrange, and BMS 4540ND high frequency response" : "Full speaker frequency response"} filled={!drivers} /></div>
      <footer className="frc-card__footer"><span>ILLUSTRATIVE DATA / NOT MEASURED</span><span className="frc-card__variance" title={drivers ? "Maximum deviation from each modeled passband mean: LAB 12, 60–150 Hz; Alpha 6A, 350 Hz–2.5 kHz; BMS 4540ND, 2.5–15 kHz." : "Maximum deviation from the modeled 40 Hz–16 kHz response mean."}>Response variance <strong>± {(drivers ? DRIVER_VARIANCE : SYSTEM_VARIANCE).toFixed(1)} dB <small>{drivers ? "in band" : "40 Hz–16 kHz"}</small></strong></span></footer>
    </article>
  );
}

export default function FrequencyResponseCards() {
  return <div className="frc-grid" aria-label="Illustrative frequency response charts"><ResponseCard kind="drivers" /><ResponseCard kind="system" /></div>;
}
