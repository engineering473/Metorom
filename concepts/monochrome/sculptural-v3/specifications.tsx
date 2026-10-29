import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import { Navbar1 } from "./navbar";
import SiteFooter from "./site-footer";
import SystemSpecifications from "./system-specifications";
import FrequencyResponseCards from "./frequency-response-cards";
import { PageEditor, usePagePreview } from "./page-editor";
import { SHARED_PAGE_COPY_EN, SHARED_PAGE_COPY_JA } from "./page-copy";
import { DEFAULT_COPY, DEFAULT_COPY_JA } from "./site-copy";
import { previewHref, useLanguage } from "./language";
import { HERO_IMAGE } from "./media-assets";
import "./styles.css";
import "./site-editor.css";
import "./blue-theme.css";
import "./specifications.css";

const SPECIFICATIONS_COPY_EN = {
  ...SHARED_PAGE_COPY_EN,
  pageTitle: "Speaker specifications — Metorom",
  pageDescription: "Ground Sound I: driver configuration, dimensions, materials, finish, and illustrative response curves.",
  heroTitle: "Speaker specifications",
  heroBody: "The system at a glance: drivers, dimensions, materials, and sound shaping.",
  imageAlt: "Front render of the Metorom speaker, showing the horn, paired midrange enclosures, and bass cabinet",
  materialsLabel: "Materials",
  materialsValue: "MDF main and midrange structures · locally sourced Japanese wood horn",
  finishLabel: "Finish",
  finishValue: "Sealed, primed, painted, and clear-coated",
  measurementTitle: "Response curves",
  measurementBody: "These illustrative curves explain the roles of the drivers and how their responses combine. They are not physical measurements or a verified performance specification.",
  designLink: "Explore the design details",
  footerTag: "INDEPENDENT AUDIO DESIGN / KYOTO",
  footerBack: "BACK TO THE SPEAKER",
  footerBackAria: "Back to the Metorom speaker",
};
const SPECIFICATIONS_COPY_JA: typeof SPECIFICATIONS_COPY_EN = {
  ...SHARED_PAGE_COPY_JA,
  pageTitle: "スピーカーの仕様 — Metorom",
  pageDescription: "Ground Sound Iのドライバー構成、寸法、素材、仕上げと、説明用の周波数特性。",
  heroTitle: "スピーカーの仕様",
  heroBody: "ドライバー、寸法、素材、音の調整。一つのシステムを、簡潔に。",
  imageAlt: "ホーン、中域用の独立したキャビネット、低域キャビネットを備えたMetoromスピーカーの正面レンダリング",
  materialsLabel: "素材",
  materialsValue: "主構造と中域の構造：MDF · ホーン：日本で地元調達した木材",
  finishLabel: "仕上げ",
  finishValue: "シーラー処理、下塗り、塗装、クリアコート",
  measurementTitle: "周波数特性",
  measurementBody: "各ドライバーの役割と、特性がどのように組み合わさるかを示す説明用のグラフです。実測値や、検証済みの性能仕様ではありません。",
  designLink: "デザインの詳細を見る",
  footerTag: "独立系オーディオデザイン / 京都",
  footerBack: "スピーカーに戻る",
  footerBackAria: "Metoromスピーカーのページに戻る",
};

function Specifications() {
  const [language] = useLanguage();
  const [copy, settings, setSettings] = usePagePreview("specifications", SPECIFICATIONS_COPY_EN, SPECIFICATIONS_COPY_JA);
  const systemCopy = { ...(language === "ja" ? DEFAULT_COPY_JA : DEFAULT_COPY), ...copy };
  useEffect(() => {
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.pageDescription);
  }, [copy.pageTitle, copy.pageDescription]);
  return <>
    <Navbar1 contact copy={copy} />
    <main id="main" className="sc-specifications-page">
      <header className="sc-specifications-opening" id="top">
        <h1>{copy.heroTitle}</h1>
        <p>{copy.heroBody}</p>
      </header>
      <div className="sc-specifications-overview">
        <figure><img src={HERO_IMAGE} width="1200" height="1600" alt={copy.imageAlt} fetchPriority="high" /></figure>
        <div>
          <SystemSpecifications copy={systemCopy} language={language} headingLevel={2} materials={[
            { label: copy.materialsLabel, value: copy.materialsValue },
            { label: copy.finishLabel, value: copy.finishValue },
          ]} />
          <a className="sc-outline-link" href={previewHref("./design.html")}>{copy.designLink}<ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </div>
      <section className="sc-specifications-response" aria-labelledby="sc-specifications-response-title">
        <div className="sc-specifications-response__inner">
          <h2 id="sc-specifications-response-title">{copy.measurementTitle}</h2>
          <p>{copy.measurementBody}</p>
          <FrequencyResponseCards copy={systemCopy} />
        </div>
      </section>
    </main>
    <SiteFooter copy={copy} backToStudy />
    <PageEditor page="specifications" settings={settings} onChange={setSettings} english={SPECIFICATIONS_COPY_EN} japanese={SPECIFICATIONS_COPY_JA} />
  </>;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom specifications root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Specifications />);
