import { useId } from "react";
import type { SiteCopy } from "./site-copy";
import "./system-specifications.css";

type Props = { copy: SiteCopy; language: "en" | "ja" };
type Specification = { label: string; value: string; detail?: string };

function SpecificationList({ rows }: { rows: Specification[] }) {
  return <dl className="sc-system-specs__list">
    {rows.map(({ label, value, detail }) => <div key={label} className="sc-system-specs__row">
      <dt>{label}{detail && <span>{detail}</span>}</dt>
      <dd>{value}</dd>
    </div>)}
  </dl>;
}

export default function SystemSpecifications({ copy, language }: Props) {
  const id = useId();
  const ja = language === "ja";
  const system: Specification[] = [
    { label: copy.specSystemLabel, value: copy.specSystemValue },
    { label: copy.specConstructionLabel, value: copy.specConstructionValue },
    { label: ja ? "スピーカーの寸法" : "Speaker dimensions", detail: ja ? "幅 × 高さ × 奥行" : "Width × height × depth", value: "798 × 600 × 340 mm" },
    { label: copy.specSpacingLabel, value: copy.specSpacingValue },
    { label: copy.specLatencyLabel, value: copy.specLatencyValue },
    { label: copy.specMeasurementLabel, value: copy.specMeasurementValue },
    { label: copy.specDevelopmentLabel, value: copy.specDevelopmentValue },
  ];
  const audio: Specification[] = [
    { label: ja ? "出力 / 8 Ω" : "Power / 8 Ω", detail: "EIA · 1 kHz · 1% THD", value: "400 W + 400 W + 800 W" },
    { label: ja ? "出力 / 4 Ω" : "Power / 4 Ω", detail: "EIA · 1 kHz · 1% THD", value: "650 W + 650 W + 1,200 W" },
    { label: ja ? "標準歪率" : "Typical distortion", value: "0.05%" },
    { label: ja ? "周波数特性 / 8 Ω" : "Frequency response / 8 Ω", value: "26 Hz–20 kHz, ±0.2 dB" },
    { label: ja ? "ダンピングファクター / 8 Ω" : "Damping factor / 8 Ω", value: ">600" },
    { label: ja ? "ノイズ" : "Noise", detail: ja ? "20 Hz–20 kHz、ゲイン 32 dB" : "20 Hz–20 kHz · 32 dB gain", value: "<1 mV" },
    { label: ja ? "最大ゲイン" : "Maximum gain", detail: ja ? "1.2 V 設定" : "1.2 V setting", value: "32 dB" },
  ];
  const dsp: Specification[] = [
    { label: ja ? "アナログ入出力" : "Analog inputs / outputs", detail: ja ? "シングルエンド" : "Single ended", value: ja ? "2 入力 / 3 出力" : "2 in / 3 out" },
    { label: ja ? "入力から出力までの遅延" : "Input-to-output latency", value: "510 µs" },
    { label: ja ? "ゲイン" : "Gain", value: "36 dB" },
    { label: ja ? "ダイナミックレンジ" : "Dynamic range", detail: ja ? "ユニティゲイン" : "Unity gain", value: ja ? "標準 106 dB(A)" : "Typical 106 dB(A)" },
    { label: "THD", detail: ja ? "0 dBu · 1 kHz · ユニティゲイン" : "0 dBu · 1 kHz · unity gain", value: "<0.01%" },
    { label: ja ? "周波数特性" : "Frequency response", value: "20 Hz–20 kHz, ±0.5 dB" },
    { label: ja ? "サンプルレート" : "Sample rate", value: "96 kHz" },
    { label: ja ? "ディレイ" : "Delay", value: "100 ms" },
    { label: "PEQ", detail: ja ? "各入力・各出力" : "Each input and output", value: "7" },
    { label: ja ? "グルーピング EQ" : "Grouping EQ", detail: ja ? "各入力" : "Each input", value: "31" },
    { label: ja ? "入力クロスオーバー" : "Input crossover", detail: ja ? "各入力 · LPF / HPF" : "Each input · LPF / HPF", value: "Butterworth, Linkwitz, Bessel · 6–48 dB/oct" },
    { label: ja ? "出力クロスオーバー" : "Output crossover", detail: ja ? "各出力 · LPF / HPF" : "Each output · LPF / HPF", value: "Butterworth, Linkwitz, Bessel · 6–48 dB/oct" },
    { label: "S/N", value: "114 dB" },
    { label: ja ? "ノイズゲート" : "Noise gate", value: "−100–0 dB" },
    { label: "FIR", value: ja ? "1,024 タップ (4 × 256)" : "1,024 taps (4 × 256)" },
    { label: ja ? "電子回路モジュールの寸法" : "Electronics module dimensions", detail: ja ? "幅 × 奥行 × 高さ" : "Width × depth × height", value: "360 × 281 × 82 mm" },
  ];

  return <div className="sc-system-specs">
    <section className="sc-system-specs__group" aria-labelledby={`${id}-system`}>
      <h3 id={`${id}-system`}>{ja ? "システム仕様" : "System specifications"}</h3>
      <SpecificationList rows={system} />
    </section>
    <div className="sc-system-specs__electronics">
      <p className="sc-system-specs__context">{ja
        ? "以下はアンプと DSP の仕様です。スピーカー本体の寸法は上記をご覧ください。"
        : "The figures below describe the amplifier and DSP. Dimensions of the assembled speaker are listed above."}</p>
      <section className="sc-system-specs__group" aria-labelledby={`${id}-audio`}>
        <h3 id={`${id}-audio`}>{ja ? "オーディオ回路" : "Audio electronics"}</h3>
        <SpecificationList rows={audio} />
      </section>
      <section className="sc-system-specs__group" aria-labelledby={`${id}-dsp`}>
        <h3 id={`${id}-dsp`}>DSP</h3>
        <SpecificationList rows={dsp} />
      </section>
    </div>
  </div>;
}
