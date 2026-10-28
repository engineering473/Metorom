import { useId } from "react";
import type { SiteCopy } from "./site-copy";
import "./system-specifications.css";

type Props = { copy: SiteCopy; language: "en" | "ja" };

export default function SystemSpecifications({ copy, language }: Props) {
  const id = useId();
  const ja = language === "ja";
  const rows = [
    { label: copy.specSystemLabel, value: copy.specSystemValue },
    { label: copy.pathLowTitle, value: "1 × LAB 12" },
    { label: copy.pathMidTitle, value: ja ? "Alpha 6A × 2（並列接続）" : "2 × Alpha 6A (parallel)" },
    { label: copy.pathHighTitle, value: ja ? "BMS 4540ND × 1 + ホーン" : "1 × BMS 4540ND + horn" },
    { label: "DSP", value: ja ? "96 kHz · FIR + パラメトリック EQ" : "96 kHz · FIR + parametric EQ" },
    { label: ja ? "寸法（幅 × 高さ × 奥行）" : "Dimensions (W × H × D)", value: "798 × 600 × 340 mm" },
  ];
  return <section className="sc-system-specs" aria-labelledby={id}>
    <h3 id={id}>{ja ? "仕様" : "Specifications"}</h3>
    <dl className="sc-system-specs__list">
      {rows.map(({ label, value }) => <div key={label} className="sc-system-specs__row"><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  </section>;
}
