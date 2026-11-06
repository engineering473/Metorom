import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ALPHA_6A_MEASUREMENT, ALPHA_6A_MEASUREMENT_POINTS } from "@/data/measurements/alpha-6a-1m-0deg";
import type { SiteCopy } from "./site-copy";
import { useLanguage } from "./language";
import "@/components/ui/frequency-response-cards.css";

type ResponsePoint = { hz: number; db: number };
export type ResponseSeries = { name: string; shortName: string; color: string; data: ResponsePoint[]; measured?: boolean };
export type ResponseDriver = "sub" | "mid" | "right" | "tweeter";
export type ResponseSpread = {
  minimumHz: number; maximumHz: number;
  minimumDb: number; maximumDb: number;
  midpointDb: number; deviationDb: number; peakToPeakDb: number;
};

const FREQUENCIES = Array.from({ length: 73 }, (_, index) => 20 * 1000 ** (index / 72));
const DRIVER_PROFILES = [
  { name: "LAB 12", shortName: "LOW", color: "#537db6", anchors: [[20, 57], [30, 70], [40, 77], [60, 81], [100, 82], [150, 81], [250, 75], [400, 60], [800, 43], [20000, 36]] },
  { name: "BMS 4540ND", shortName: "HIGH", color: "#101d8f", anchors: [[20, 35], [200, 36], [500, 43], [800, 56], [1200, 70], [1800, 79], [2500, 82], [5000, 81], [10000, 80], [16000, 77], [20000, 73]] },
] as const;
const SYSTEM_ANCHORS = [[20, 65], [30, 73], [40, 77.8], [60, 79.9], [100, 81.2], [150, 81], [250, 80.2], [500, 81.3], [1000, 80.7], [2000, 80.4], [5000, 81.1], [10000, 80], [16000, 78.5], [20000, 75.2]] as const;

function interpolateProfile(hz: number, anchors: readonly (readonly [number, number])[]) {
  for (let index = 1; index < anchors.length; index++) {
    const [rightHz, rightDb] = anchors[index];
    const [leftHz, leftDb] = anchors[index - 1];
    if (hz <= rightHz) return leftDb + (rightDb - leftDb) * Math.log(hz / leftHz) / Math.log(rightHz / leftHz);
  }
  return anchors[anchors.length - 1][1];
}
function makePoints(anchors: readonly (readonly [number, number])[], phase: number, ripple: number): ResponsePoint[] {
  return FREQUENCIES.map(hz => {
    const position = Math.log10(hz / 20);
    return { hz, db: interpolateProfile(hz, anchors) + Math.sin(position * 16 + phase) * ripple + Math.sin(position * 35 + phase * 1.7) * ripple * .35 };
  });
}
function illustration(index: 0 | 1, phase: number): ResponseSeries {
  const profile = DRIVER_PROFILES[index];
  return { name: profile.name, shortName: profile.shortName, color: profile.color, data: makePoints(profile.anchors, phase, .57) };
}
const DRIVER_SERIES: ResponseSeries[] = [
  illustration(0, .6),
  { name: "Alpha 6A", shortName: "MID", color: "#264d91", data: ALPHA_6A_MEASUREMENT_POINTS, measured: true },
  illustration(1, 4.2),
];

/** One supplied right-driver recording is shared between the two Alpha 6A views. */
export function driverResponseSeries(driver: ResponseDriver, copy: SiteCopy): ResponseSeries {
  const index = driver === "sub" ? 0 : driver === "tweeter" ? 2 : 1;
  return { ...DRIVER_SERIES[index], name: [copy.chartDriverLowName, copy.chartDriverMidName, copy.chartDriverHighName][index] };
}
const SYSTEM_SERIES: ResponseSeries[] = [{ name: "Complete speaker", shortName: "SYSTEM", color: "#101d8f", data: makePoints(SYSTEM_ANCHORS, .8, .47) }];

/** Interpolate on the drawn log-frequency line, without extending the measured band. */
export function responseValueAt(points: ResponsePoint[], hz: number): number | null {
  if (!points.length || hz < points[0].hz || hz > points[points.length - 1].hz) return null;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (points[middle].hz < hz) low = middle + 1;
    else high = middle;
  }
  const right = points[low];
  if (right.hz === hz || low === 0) return right.db;
  const left = points[low - 1];
  return left.db + (right.db - left.db) * Math.log(hz / left.hz) / Math.log(right.hz / left.hz);
}

/** The drawn response's min/max envelope, not statistical variance or uncertainty.
 * Include interpolated band edges for models; native measured samples stay exact.
 */
export function responseSpread(data: ResponsePoint[], minimumHz: number, maximumHz: number): ResponseSpread | null {
  if (!data.length || !Number.isFinite(minimumHz) || !Number.isFinite(maximumHz)) return null;
  const lower = Math.max(minimumHz, data[0].hz);
  const upper = Math.min(maximumHz, data[data.length - 1].hz);
  if (lower > upper) return null;
  const first = responseValueAt(data, lower);
  const last = responseValueAt(data, upper);
  if (first === null || last === null) return null;
  let minimumDb = Math.min(first, last);
  let maximumDb = Math.max(first, last);
  for (const point of data) {
    if (point.hz < lower || point.hz > upper) continue;
    minimumDb = Math.min(minimumDb, point.db);
    maximumDb = Math.max(maximumDb, point.db);
  }
  return {
    minimumHz: lower, maximumHz: upper, minimumDb, maximumDb,
    midpointDb: (minimumDb + maximumDb) / 2,
    deviationDb: (maximumDb - minimumDb) / 2,
    peakToPeakDb: maximumDb - minimumDb,
  };
}

export function driverResponseSpread(driver: ResponseDriver, series: ResponseSeries): ResponseSpread | null {
  const band = series.measured
    ? [ALPHA_6A_MEASUREMENT.minimumHz, ALPHA_6A_MEASUREMENT.maximumHz]
    : driver === "sub" ? [60, 150] : [2500, 15000];
  return responseSpread(series.data, band[0], band[1]);
}

export function responseSpreadDescription(spread: ResponseSpread, measured: boolean, japanese: boolean): string {
  const limits = `${spread.minimumDb.toFixed(3)}–${spread.maximumDb.toFixed(3)} dB`;
  return japanese
    ? `${measured ? "実測" : "説明用モデル"}の最大値と最小値の幅：${limits}。中間値${spread.midpointDb.toFixed(4)} dBに対して±${spread.deviationDb.toFixed(4)} dB、ピーク間${spread.peakToPeakDb.toFixed(3)} dB。${spread.minimumHz.toFixed(3)}–${spread.maximumHz.toFixed(3)} Hz。統計的分散や測定誤差ではありません。`
    : `${measured ? "Measured" : "Illustrative model"} min/max spread: ${limits}; ±${spread.deviationDb.toFixed(4)} dB about the ${spread.midpointDb.toFixed(4)} dB midpoint, ${spread.peakToPeakDb.toFixed(3)} dB peak-to-peak, over ${spread.minimumHz.toFixed(3)}–${spread.maximumHz.toFixed(3)} Hz. This is not statistical variance or measurement uncertainty.`;
}

function formatFrequency(hz: number, copy: SiteCopy) {
  return hz >= 1000 ? Number((hz / 1000).toFixed(hz >= 10000 ? 0 : 2)) + " " + copy.chartKilohertzUnit : Math.round(hz) + " " + copy.chartHertzUnit;
}

type ResponsePlotProps = {
  series: ResponseSeries[];
  yMin: number;
  yMax: number;
  yTicks: number[];
  label: string;
  copy: SiteCopy;
  filled?: boolean;
  compact?: boolean;
  xMin?: number;
  xMax?: number;
  spread?: ResponseSpread | null;
};

export function ResponsePlot({ series, yMin, yMax, yTicks, label, copy, filled = false, compact = false, xMin = 20, xMax = 20000, spread }: ResponsePlotProps) {
  const [language] = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: compact ? 100 : 240 });
  const [activeHz, setActiveHz] = useState<number | null>(null);
  const rawId = useId().replace(/:/g, "");
  const fillId = "frc-fill-" + rawId;
  const clipId = "frc-clip-" + rawId;

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setSize(previous => Math.abs(previous.width - width) < .25 && Math.abs(previous.height - height) < .25 ? previous : { width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The SVG uses actual CSS-pixel dimensions: labels keep their natural proportions.
  const plot = { left: 32, right: Math.max(52, size.width - 12), top: compact ? 17 : 23, bottom: Math.max(35, size.height - 22) };
  const logX = (hz: number) => plot.left + Math.log(hz / xMin) / Math.log(xMax / xMin) * (plot.right - plot.left);
  const yFor = (db: number) => plot.bottom - (db - yMin) / (yMax - yMin) * (plot.bottom - plot.top);
  const paths = useMemo(() => series.map(item => ({
    ...item,
    path: item.data.map(({ hz, db }, index) => (index ? "L" : "M") + logX(hz).toFixed(2) + "," + yFor(db).toFixed(2)).join(" "),
  })), [series, size.width, size.height, compact, xMin, xMax, yMin, yMax]);

  const candidates = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].filter(hz => hz >= xMin * .999 && hz <= xMax * 1.001);
  const xTicks: number[] = [];
  for (const [index, hz] of candidates.entries()) {
    if (!xTicks.length || index === candidates.length - 1) xTicks.push(hz);
    else if (logX(hz) - logX(xTicks[xTicks.length - 1]) >= 44 && logX(candidates[candidates.length - 1]) - logX(hz) >= 44) xTicks.push(hz);
  }
  const inspectPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const proportion = Math.max(0, Math.min(1, (event.clientX - bounds.left - plot.left) / (plot.right - plot.left)));
    setActiveHz(xMin * (xMax / xMin) ** proportion);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") setActiveHz(xMin);
    else if (event.key === "End") setActiveHz(xMax);
    else setActiveHz(current => Math.max(xMin, Math.min(xMax, (current ?? Math.sqrt(xMin * xMax)) * 2 ** (event.key === "ArrowRight" ? 1 / 24 : -1 / 24))));
  };
  const textStyle = { fontSize: compact ? 10 : 11, fontWeight: 500, letterSpacing: 0 };
  const values = activeHz === null ? [] : series.map(item => ({ item, db: responseValueAt(item.data, activeHz) }));
  const instructions = series.some(item => item.measured)
    ? language === "ja" ? "約200 Hzから5 kHzまでの実測値です。左右の矢印キーで値を確認できます。" : "Measured response from approximately 200 hertz to 5 kilohertz. Focus and use left or right arrow keys to inspect values."
    : copy.chartPlotInstructions;
  const spreadDescription = spread ? responseSpreadDescription(spread, series.some(item => item.measured), language === "ja") : "";

  return (
    <div ref={root} className={"frc-plot" + (compact ? " frc-plot--compact" : "")} role="img" tabIndex={0}
      aria-label={label + ". " + instructions + (spreadDescription ? " " + spreadDescription : "")}
      onPointerMove={inspectPointer} onPointerLeave={() => setActiveHz(null)}
      onFocus={() => setActiveHz(Math.sqrt(xMin * xMax))} onBlur={() => setActiveHz(null)} onKeyDown={handleKeyDown}>
      <svg viewBox={"0 0 " + size.width + " " + size.height} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6b8fd4" stopOpacity=".12" /><stop offset="100%" stopColor="#6b8fd4" stopOpacity="0" /></linearGradient>
          <clipPath id={clipId}><rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} /></clipPath>
        </defs>
        {yTicks.map(db => <line key={"y" + db} x1={plot.left} x2={plot.right} y1={yFor(db)} y2={yFor(db)} className="frc-plot__grid-line" style={{ opacity: .18, strokeDasharray: "none", strokeWidth: 1 }} />)}
        {xTicks.map(hz => <line key={"x" + hz} x1={logX(hz)} x2={logX(hz)} y1={plot.top} y2={plot.bottom} className="frc-plot__grid-line" style={{ opacity: .09, strokeDasharray: "none", strokeWidth: 1 }} />)}
        {spread && <g className="frc-plot__spread" clipPath={"url(#" + clipId + ")"}>
          <rect x={logX(spread.minimumHz)} y={yFor(spread.maximumDb)} width={logX(spread.maximumHz) - logX(spread.minimumHz)} height={yFor(spread.minimumDb) - yFor(spread.maximumDb)} fill={series[0]?.color} fillOpacity=".055" />
          <line x1={logX(spread.minimumHz)} x2={logX(spread.maximumHz)} y1={yFor(spread.midpointDb)} y2={yFor(spread.midpointDb)} stroke={series[0]?.color} strokeOpacity=".42" strokeWidth="1" strokeDasharray="4 4" />
        </g>}
        {filled && paths[0] && <path d={paths[0].path + " L" + plot.right + "," + plot.bottom + " L" + plot.left + "," + plot.bottom + " Z"} fill={"url(#" + fillId + ")"} clipPath={"url(#" + clipId + ")"} />}
        {paths.map(item => <path key={item.shortName} d={item.path} className="frc-plot__series" pathLength={1} stroke={item.color} style={{ strokeWidth: compact ? 1.5 : 1.8, filter: "none" }} clipPath={"url(#" + clipId + ")"} />)}
        {activeHz !== null && <g className="frc-plot__cursor">
          <line x1={logX(activeHz)} x2={logX(activeHz)} y1={plot.top} y2={plot.bottom} />
          {values.map(({ item, db }) => db === null ? null : <circle key={item.shortName} cx={logX(activeHz)} cy={yFor(db)} r="3" fill={item.color} />)}
        </g>}
        <text x={plot.left} y={compact ? 9 : 12} className="frc-plot__unit" style={{ ...textStyle, fontSize: compact ? 9 : 10 }}>{copy.chartUnit}</text>
        {yTicks.map(db => <text key={db} x={plot.left - 7} y={yFor(db) + 3} textAnchor="end" className="frc-plot__tick" style={textStyle}>{db}</text>)}
        {xTicks.map((hz, index) => <text key={hz} x={Math.max(plot.left, Math.min(plot.right, logX(hz)))} y={size.height - 6}
          textAnchor={index === 0 ? "start" : index === xTicks.length - 1 ? "end" : "middle"} className="frc-plot__tick" style={textStyle}>{hz >= 1000 ? hz / 1000 + "k" : hz}</text>)}
      </svg>
      {activeHz !== null && <div className="frc-plot__tooltip" style={{ left: Math.max(80, Math.min(size.width - 80, logX(activeHz))) }}>
        <strong>{formatFrequency(activeHz, copy)}</strong>
        {values.map(({ item, db }) => <span key={item.shortName}><i style={{ background: item.color }} />{item.name}<b>{db === null ? "—" : db.toFixed(1) + " " + copy.chartDecibelUnit}</b></span>)}
      </div>}
    </div>
  );
}

function ResponseCard({ kind, copy }: { kind: "drivers" | "system"; copy: SiteCopy }) {
  const [language] = useLanguage();
  const measured = kind === "drivers";
  const ja = language === "ja";
  const series = measured
    ? [driverResponseSeries("mid", copy)]
    : SYSTEM_SERIES.map(item => ({ ...item, name: copy.chartSystemSeriesName }));
  const range = measured ? "200 Hz — 5 kHz" : copy.chartRange;
  const spread = measured
    ? driverResponseSpread("mid", series[0])
    : responseSpread(series[0].data, 40, 16000);
  const spreadDescription = spread ? responseSpreadDescription(spread, measured, ja) : "";
  const label = measured
    ? ja ? "Alpha 6Aの実測応答。距離1 m、0度。右の記録を左右で共用。" : "Alpha 6A measured response at 1 metre, 0 degrees. One right-driver capture shared by both sides."
    : copy.chartSystemAria;
  return (
    <article className={"frc-card frc-card--" + kind} data-motion-card>
      <div className="frc-card__main">
        <header className="frc-card__header"><h3>{measured ? copy.chartDriversTitle : copy.chartSystemTitle}</h3><span>{range}</span></header>
        <div className="frc-card__legend"><span><i style={{ background: series[0].color }} />{measured ? series[0].name + " · 1 m · 0°" : copy.chartCombinedLegend}</span></div>
      </div>
      <div className="frc-card__chart"><ResponsePlot series={series}
        xMin={measured ? ALPHA_6A_MEASUREMENT.minimumHz : undefined} xMax={measured ? ALPHA_6A_MEASUREMENT.maximumHz : undefined}
        yMin={measured ? 45 : 72} yMax={measured ? 65 : 88} yTicks={measured ? [45, 50, 55, 60, 65] : [74, 80, 86]}
        label={label} copy={copy} filled={!measured} spread={spread} /></div>
      <footer className="frc-card__footer">
        <span>{measured ? ja ? "右ドライバーの実測 · 左右に共用" : "MEASURED RIGHT DRIVER · SHARED L/R" : copy.chartDataNote}</span>
        {spread && <span className="frc-card__variance" title={spreadDescription} aria-label={spreadDescription}>
          {measured ? ja ? "実測の変動幅" : "Measured spread" : ja ? "モデルの変動幅" : "Modeled spread"}
          <strong>± {spread.deviationDb.toFixed(1)} {copy.chartDecibelUnit} <small>{measured ? "200 Hz–5 kHz" : copy.chartSystemBand}</small></strong>
          <small>{ja ? "中間値 " : "Midpoint "}{spread.midpointDb.toFixed(1)} {copy.chartDecibelUnit} · {ja ? "ピーク間 " : "p-p "}{spread.peakToPeakDb.toFixed(1)} {copy.chartDecibelUnit}</small>
        </span>}
      </footer>
    </article>
  );
}
export default function FrequencyResponseCards({ copy }: { copy: SiteCopy }) {
  const [language] = useLanguage();
  return <div className="frc-grid" aria-label={language === "ja" ? "Alpha 6Aの実測応答とシステムの説明用グラフ" : "Measured Alpha 6A response and illustrative system response"}><ResponseCard kind="drivers" copy={copy} /><ResponseCard kind="system" copy={copy} /></div>;
}
