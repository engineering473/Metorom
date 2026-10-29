import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import GlassFolder from "@/components/ui/glass-folder-cards";
import { Navbar1 } from "./navbar";
import { PageEditor, usePagePreview } from "./page-editor";
import { SHARED_PAGE_COPY_EN, SHARED_PAGE_COPY_JA } from "./page-copy";
import { previewHref, useLanguage } from "./language";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./site-editor.css";
import "./blue-theme.css";
import "./design.css";

export const DESIGN_COPY_EN = {
  ...SHARED_PAGE_COPY_EN,
  pageTitle: "Design details — Metorom",
  pageDescription: "A closer look at Metorom’s horn, paired midrange drivers, and bass cabinet through renders and assembly studies.",
  heroTitle: "Details of design",
  openingBody: "A form shaped around each driver. Explore the parts, their purpose, and the assembly behind them.",
  contentsLabel: "Explore the design",
  folderMeta: "Function · Design · Materials",
  openFolder: "Open design folder:",
  closeFolder: "Close design folder:",
  folderContents: "Design notes for",
  functionLabel: "Function",
  detailLabel: "Design details",
  materialsLabel: "Materials & finish",
  materialLabel: "Material",
  materialsBody: "The main and midrange structures use MDF. The horn is made from locally sourced Japanese wood. Each is sealed, primed, painted, and clear-coated.",
  renderLabel: "Front render",
  drawingLabel: "Exploded assembly study",
  renderAlt: "Front render of the Metorom loudspeaker with two circular midrange enclosures, a central horn, and the bass cabinet below.",
  drawingAlt: "Supplied exploded mechanical study of the Metorom loudspeaker assembly.",
  drawingNote: "Assembly studies show the design intent; they are not final fabrication drawings.",
  hornTitle: "The horn",
  hornPart: "BMS 4540ND + horn",
  hornFunction: "The compression driver and horn handle the high frequencies, guiding their sound into the listening space.",
  hornDetail: "The horn sits between the two midrange enclosures. Its flared opening gives the high-frequency section its own distinct form within the system.",
  hornMaterial: "Locally sourced Japanese wood, sealed, primed, painted, and clear-coated.",
  hornDrawing: "Horn assembly study",
  hornDrawingAlt: "Line drawing from the supplied horn design proposal, showing the horn, support, bolts, and inserts in an exploded assembly.",
  hornDownload: "View horn design proposal",
  midTitle: "The midrange pair",
  midPart: "2 × Alpha 6A · parallel",
  midFunction: "Two Alpha 6A drivers carry the midrange, where voices and many instruments sit. The pair is wired in parallel.",
  midDetail: "Each driver has its own enclosure. The separate forms make their role visible and are intended to limit the mechanical interaction associated with a shared cabinet.",
  midMaterial: "MDF structure, sealed, primed, painted, and clear-coated.",
  bassTitle: "The bass cabinet",
  bassPart: "1 × LAB 12",
  bassFunction: "The LAB 12 handles the low frequencies from its dedicated cabinet beneath the horn and midrange pair.",
  bassDetail: "The lower cabinet anchors the assembly. Keeping the bass section separate allows its enclosure to be considered independently of the midrange and horn.",
  bassMaterial: "MDF main structure, sealed, primed, painted, and clear-coated.",
  tuningTitle: "A system you can tune",
  tuningBody: "Integrated amplification and DSP bring the parts together. Crossover, equalization, and delay can be adjusted to suit the setup, the room, and how you listen.",
  specificationLink: "Specifications & measurements",
  philosophyLink: "Read our philosophy",
  footerTag: "INDEPENDENT AUDIO DESIGN / KYOTO",
  footerBack: "BACK TO THE STUDY",
  footerBackAria: "Back to the Metorom study",
};

export const DESIGN_COPY_JA: typeof DESIGN_COPY_EN = {
  ...SHARED_PAGE_COPY_JA,
  pageTitle: "デザインの詳細 — Metorom",
  pageDescription: "レンダリングと組立検討図から、Metoromのホーン、2基の中域ドライバー、低域キャビネットを詳しく見ていきます。",
  heroTitle: "デザインの詳細",
  openingBody: "一つひとつのドライバーから考えたかたち。各部の役割と、その構成を見ていきます。",
  contentsLabel: "デザインを見る",
  folderMeta: "機能・デザイン・素材",
  openFolder: "設計フォルダーを開く：",
  closeFolder: "設計フォルダーを閉じる：",
  folderContents: "設計ノート：",
  functionLabel: "機能",
  detailLabel: "デザインの詳細",
  materialsLabel: "素材と仕上げ",
  materialLabel: "素材",
  materialsBody: "本体と中域の構造にはMDFを使用し、ホーンには日本で地元調達した木材を使用しています。いずれもシーラー処理、下塗り、塗装、クリアコートで仕上げます。",
  renderLabel: "正面レンダリング",
  drawingLabel: "分解組立検討図",
  renderAlt: "2基の円形中域エンクロージャー、中央のホーン、下部の低域キャビネットからなるMetoromスピーカーの正面レンダリング。",
  drawingAlt: "Metoromスピーカーの構成を示す、提供された分解組立検討図。",
  drawingNote: "組立検討図は設計の考え方を示すもので、最終的な製作用図面ではありません。",
  hornTitle: "ホーン",
  hornPart: "BMS 4540ND ＋ ホーン",
  hornFunction: "コンプレッションドライバーとホーンが高域を担い、その音をリスニング空間へ導きます。",
  hornDetail: "ホーンは2基の中域エンクロージャーの間に配置されています。広がりを持つ開口部が、高域セクション独自のかたちをつくります。",
  hornMaterial: "日本で地元調達した木材。シーラー処理、下塗り、塗装、クリアコートで仕上げます。",
  hornDrawing: "ホーンの組立検討図",
  hornDrawingAlt: "提供されたホーン設計提案の線画。ホーン、支持部、ボルト、インサートを分解した構成を示しています。",
  hornDownload: "ホーン設計提案を見る",
  midTitle: "2基の中域ドライバー",
  midPart: "Alpha 6A × 2・並列接続",
  midFunction: "2基のAlpha 6Aが、声や多くの楽器が含まれる中域を担います。2基は並列に接続されています。",
  midDetail: "各ドライバーは独立したエンクロージャーに収められています。役割をかたちに表すとともに、共通キャビネットを介した機械的な相互作用を抑えることを意図しています。",
  midMaterial: "MDFの構造。シーラー処理、下塗り、塗装、クリアコートで仕上げます。",
  bassTitle: "低域キャビネット",
  bassPart: "LAB 12 × 1",
  bassFunction: "LAB 12が、ホーンと中域ドライバーの下にある専用キャビネットから低域を担います。",
  bassDetail: "下部キャビネットが全体の構成を支えます。低域を分けることで、中域やホーンとは独立してエンクロージャーを検討できます。",
  bassMaterial: "本体の構造にはMDFを使用。シーラー処理、下塗り、塗装、クリアコートで仕上げます。",
  tuningTitle: "音を調整できるシステム",
  tuningBody: "一体型アンプとDSPが各部を一つのシステムにまとめます。クロスオーバー、イコライザー、ディレイを調整し、設置環境や部屋、聴き方に合わせて音を整えられます。",
  specificationLink: "仕様と測定",
  philosophyLink: "私たちの設計思想",
  footerTag: "独立系オーディオデザイン / 京都",
  footerBack: "サイトに戻る",
  footerBackAria: "Metoromのサイトに戻る",
};

const assets = {
  render: `${import.meta.env.BASE_URL}images/concepts/speaker-interactive-front-v3.webp`,
  assembly: `${import.meta.env.BASE_URL}images/concepts/speaker-exploded-study-v3.webp`,
  horn: `${import.meta.env.BASE_URL}images/concepts/horn-assembly-study-v3.webp`,
  proposal: `${import.meta.env.BASE_URL}drawings/horn-design-proposal.pdf`,
};

function DesignDetails() {
  const [copy, settings, setSettings] = usePagePreview("design", DESIGN_COPY_EN, DESIGN_COPY_JA);
  const [language] = useLanguage();
  useEffect(() => {
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.pageDescription);
  }, [copy.pageTitle, copy.pageDescription]);

  const parts = [
    { id: "horn", title: copy.hornTitle, part: copy.hornPart, body: copy.hornFunction, detail: copy.hornDetail, material: copy.hornMaterial, drawing: assets.horn, drawingAlt: copy.hornDrawingAlt, caption: copy.hornDrawing },
    { id: "midrange", title: copy.midTitle, part: copy.midPart, body: copy.midFunction, detail: copy.midDetail, material: copy.midMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
    { id: "bass", title: copy.bassTitle, part: copy.bassPart, body: copy.bassFunction, detail: copy.bassDetail, material: copy.bassMaterial, drawing: assets.assembly, drawingAlt: copy.drawingAlt, caption: copy.drawingLabel },
  ];

  return <>
    <Navbar1 contact copy={copy} />
    <main id="main" className="sc-design">
      <section id="top" className="sc-design-opening" aria-labelledby="sc-design-title">
        <h1 id="sc-design-title">{copy.heroTitle}</h1>
        <p>{copy.openingBody}</p>
        <nav className="sc-design-contents" aria-label={copy.contentsLabel}>
          {parts.map(part => <a key={part.id} href={`#${part.id}`}>{part.title}<ArrowDown size={15} aria-hidden="true" /></a>)}
          <a href="#materials">{copy.materialsLabel}<ArrowDown size={15} aria-hidden="true" /></a>
        </nav>
        <div className="sc-design-folders">
          {parts.map(part => <div className="sc-design-folder" key={`${language}-${part.id}`}>
            <GlassFolder label={part.title} meta={copy.folderMeta} width={280} tone="dark" art="none" image={assets.render} action="none" appear={false} openHeadroom={130}
              openLabel={`${copy.openFolder} ${part.title}`} closeLabel={`${copy.closeFolder} ${part.title}`} contentsLabel={`${copy.folderContents} ${part.title}`}
              files={[
                { name: copy.functionLabel, image: assets.render, href: `#${part.id}-function` },
                { name: copy.detailLabel, image: part.drawing, href: `#${part.id}-design` },
                { name: copy.materialLabel, image: assets.assembly, href: `#${part.id}-materials` },
              ]} />
          </div>)}
        </div>
      </section>

      {parts.map(part => <section className={`sc-design-part sc-design-part--${part.id}`} id={part.id} key={part.id} aria-labelledby={`${part.id}-title`}>
        <div className="sc-design-part__copy">
          <h2 id={`${part.id}-title`}>{part.title}</h2>
          <p className="sc-design-part__model">{part.part}</p>
          <div id={`${part.id}-function`} className="sc-design-note"><h3>{copy.functionLabel}</h3><p>{part.body}</p></div>
          <div id={`${part.id}-design`} className="sc-design-note"><h3>{copy.detailLabel}</h3><p>{part.detail}</p></div>
          <div id={`${part.id}-materials`} className="sc-design-note"><h3>{copy.materialLabel}</h3><p>{part.material}</p></div>
          {part.id === "horn" && <a className="sc-design-download" href={assets.proposal} target="_blank" rel="noreferrer">{copy.hornDownload}<Download size={17} aria-hidden="true" /><span>PDF</span></a>}
        </div>
        <div className="sc-design-part__views">
          <figure className={`sc-design-render sc-design-render--${part.id}`}><div><img src={assets.render} alt={copy.renderAlt} loading="lazy" width="1600" height="1600" /></div><figcaption>{copy.renderLabel}</figcaption></figure>
          <figure className="sc-design-drawing"><img src={part.drawing} alt={part.drawingAlt} loading="lazy" width="710" height="1000" /><figcaption>{part.caption}</figcaption></figure>
        </div>
      </section>)}

      <section className="sc-design-closing" aria-labelledby="sc-design-tuning">
        <div><h2 id="sc-design-tuning">{copy.tuningTitle}</h2><p>{copy.tuningBody}</p></div>
        <div id="materials"><h2>{copy.materialsLabel}</h2><p>{copy.materialsBody}</p><p className="sc-design-study-note">{copy.drawingNote}</p></div>
        <nav aria-label={copy.contentsLabel} className="sc-design-next">
          <a className="sc-outline-link" href={previewHref("./specifications.html")}>{copy.specificationLink}<ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className="sc-design-text-link" href={previewHref("./philosophy.html")}>{copy.philosophyLink}<ArrowUpRight size={17} aria-hidden="true" /></a>
        </nav>
      </section>
    </main>
    <SiteFooter copy={copy} backToStudy />
    <PageEditor page="design" settings={settings} onChange={setSettings} english={DESIGN_COPY_EN} japanese={DESIGN_COPY_JA} />
  </>;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom design root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<DesignDetails />);
