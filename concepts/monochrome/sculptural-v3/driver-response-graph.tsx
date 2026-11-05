import { useId } from "react";
import { driverResponseSeries, ResponsePlot, type ResponseDriver } from "./frequency-response-cards";
import { useLanguage } from "./language";
import type { SiteCopy } from "./site-copy";
import "./driver-response-graph.css";

type DriverResponseGraphProps = {
  driver: ResponseDriver;
  copy: SiteCopy;
  className?: string;
  compact?: boolean;
};

/** Recorded Alpha 6A response; the other drivers retain their illustrative curves. */
export default function DriverResponseGraph({ driver, copy, className = "", compact = false }: DriverResponseGraphProps) {
  const [language] = useLanguage();
  const headingId = useId();
  const noteId = useId();
  const source = driverResponseSeries(driver, copy);
  const measured = source.measured === true;
  const japanese = language === "ja";
  const minimumHz = source.data[0].hz;
  const maximumHz = source.data[source.data.length - 1].hz;
  const range = measured ? `200 ${copy.chartHertzUnit} – 5 ${copy.chartKilohertzUnit}` : copy.chartRange;
  const note = measured
    ? japanese ? "右ドライバー実測・左右で共用" : "MEASURED RIGHT DRIVER · SHARED L/R"
    : copy.chartDataNote;
  const description = measured
    ? japanese
      ? "右の Alpha 6A を1 m・0°で測定した同じデータを、左右に表示しています。元の測定値を平滑化・レベル補正せずに使用しています。"
      : "One right Alpha 6A measurement at 1 metre and 0 degrees, shown for both left and right drivers. Source levels are unchanged, with no smoothing."
    : undefined;
  const driverLabel = {
    sub: copy.objectSubLabel,
    mid: copy.objectMidLeftLabel,
    right: copy.objectMidRightLabel,
    tweeter: copy.objectTweeterLabel,
  }[driver];
  const series = [{ ...source, color: "var(--sc-driver-response-line)" }];

  return (
    <figure className={`sc-driver-response${compact ? " sc-driver-response--compact" : ""} ${className}`.trim()} aria-labelledby={headingId} aria-describedby={noteId}>
      <header className="sc-driver-response__header">
        <div>
          <h3 id={headingId}>{driverLabel}</h3>
          <p>{source.name}{measured ? " · 1 m · 0°" : ""}</p>
        </div>
        <span>{range}</span>
      </header>
      <div className="sc-driver-response__plot">
        <ResponsePlot
          key={driver}
          series={series}
          yMin={measured ? 45 : 38}
          yMax={measured ? 65 : 92}
          yTicks={measured ? compact ? [45, 55, 65] : [45, 50, 55, 60, 65] : [40, 60, 80]}
          xMin={measured ? minimumHz : undefined}
          xMax={measured ? maximumHz : undefined}
          label={`${driverLabel} / ${source.name}`}
          copy={copy}
          compact={compact}
        />
      </div>
      <figcaption id={noteId} className="sc-driver-response__note" title={description}>{note}</figcaption>
    </figure>
  );
}
