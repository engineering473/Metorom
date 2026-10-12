import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Navbar1 } from "@/components/ui/navbar-1";
import { PageEditor, usePagePreview } from "./page-editor";
import { SHARED_PAGE_COPY_EN, SHARED_PAGE_COPY_JA } from "./page-copy";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./philosophy.css";
import "./site-editor.css";

export const PHILOSOPHY_COPY = {
  en: {
    ...SHARED_PAGE_COPY_EN,
    pageTitle: "Philosophy — Metorom",
    pageDescription: "Metorom’s philosophy. The philosophy statement will be added here.",
    heroTitle: "Philosophy",
    openingStatement: "Our philosophy,\nin our own words.",
    openingBody: "The philosophy statement will be added here.",
    statementBody: "",
    footerTag: "INDEPENDENT AUDIO DESIGN / KYOTO",
    footerBack: "BACK TO THE STUDY",
    footerBackAria: "Back to the Metorom study",
  },
  ja: {
    ...SHARED_PAGE_COPY_JA,
    pageTitle: "設計思想 — Metorom",
    pageDescription: "Metoromの設計思想。文章は後日掲載します。",
    heroTitle: "設計思想",
    openingStatement: "私たちの考えを、\n私たちの言葉で。",
    openingBody: "設計思想の文章は、後日掲載します。",
    statementBody: "",
    footerTag: "独立系オーディオデザイン / 京都",
    footerBack: "サイトに戻る",
    footerBackAria: "Metoromのサイトに戻る",
  },
};

export const PHILOSOPHY_COPY_EN = PHILOSOPHY_COPY.en;
export const PHILOSOPHY_COPY_JA = PHILOSOPHY_COPY.ja;

function Philosophy() {
  const [copy, settings, setSettings] = usePagePreview("philosophy", PHILOSOPHY_COPY_EN, PHILOSOPHY_COPY_JA);

  useEffect(() => {
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.pageDescription);
  }, [copy]);

  const paragraphs = copy.statementBody.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return <>
    <Navbar1 contact copy={copy} />
    <main id="main" className="sc-philosophy-page">
      <section id="top" className="sc-philosophy-opening" aria-labelledby="sc-philosophy-title">
        <h1 id="sc-philosophy-title">{copy.heroTitle}</h1>
        <div className="sc-philosophy-opening__body">
          <p className="sc-philosophy-opening__statement">{copy.openingStatement}</p>
          <p className="sc-philosophy-opening__introduction">{copy.openingBody}</p>
          {paragraphs.length > 0 && <div className="sc-philosophy-statement">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>}
        </div>
      </section>
    </main>
    <SiteFooter copy={copy} backToStudy />
    <PageEditor page="philosophy" settings={settings} onChange={setSettings} english={PHILOSOPHY_COPY_EN} japanese={PHILOSOPHY_COPY_JA} />
  </>;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom philosophy root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Philosophy />);
