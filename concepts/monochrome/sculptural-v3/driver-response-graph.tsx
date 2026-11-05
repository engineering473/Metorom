import { useId } from "react";
import { driverResponseSeries, ResponsePlot, type ResponseDriver } from "./frequency-response-cards";
import type { SiteCopy } from "./site-copy";
import "./driver-response-graph.css";

type DriverResponseGraphProps = {
  driver: ResponseDriver;
  copy: SiteCopy;
  className?: string;
};

/** One selected driver's existing illustrative response, shared with Measurements. */
export default function DriverResponseGraph({ driver, copy, className = "" }: DriverResponseGraphProps) {
  const headingId = useId();
  const noteId = useId();
  const source = driverResponseSeries(driver, copy);
  const driverLabel = {
    sub: copy.objectSubLabel,
    mid: copy.objectMidLeftLabel,
    right: copy.objectMidRightLabel,
    tweeter: copy.objectTweeterLabel,
  }[driver];
  const series = [{ ...source, color: "var(--sc-driver-response-line)" }];

  return (
    <figure className={`sc-driver-response ${className}`.trim()} aria-labelledby={headingId} aria-describedby={noteId}>
      <header className="sc-driver-response__header">
        <div>
          <h3 id={headingId}>{driverLabel}</h3>
          <p>{source.name}</p>
        </div>
        <span>{copy.chartRange}</span>
      </header>
      <div className="sc-driver-response__plot">
        <ResponsePlot
          key={driver}
          series={series}
          yMin={38}
          yMax={92}
          yTicks={[40, 60, 80]}
          label={`${driverLabel} / ${source.name}`}
          copy={copy}
        />
      </div>
      <figcaption id={noteId} className="sc-driver-response__note">{copy.chartDataNote}</figcaption>
    </figure>
  );
}
