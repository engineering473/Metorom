import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import GlassFolder from "@/components/ui/glass-folder-cards";
import { Navbar1 } from "./navbar";
import { PageEditor, usePagePreview } from "./page-editor";
import { DESIGN_COPY_EN, DESIGN_COPY_JA } from "./design-copy";
import { previewHref, useLanguage } from "./language";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./site-editor.css";
import "./blue-theme.css";
import "./design.css";

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
