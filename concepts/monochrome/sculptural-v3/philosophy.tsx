import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import { Navbar1 } from "./navbar";
import { previewHref } from "./language";
import { PageEditor, usePagePreview } from "./page-editor";
import { SHARED_PAGE_COPY_EN, SHARED_PAGE_COPY_JA } from "./page-copy";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./philosophy.css";
import "./site-editor.css";
import "./blue-theme.css";

export const PHILOSOPHY_COPY = {
  en: {
    ...SHARED_PAGE_COPY_EN,
    pageTitle: "Philosophy — Metorom",
    pageDescription: "Metorom explores how people gather, how objects work, and how sound can bring us to the same level.",
    heroTitle: "Philosophy",
    openingStatement: "How we live shapes\nhow we listen.",
    openingBody: "We are a collective driven by curiosity: about the way things work, the cultures we encounter, and the ways people live together. Building a speaker is one expression of that curiosity.",
    statementBody: "We take things apart to understand them, develop ideas by making, and return to listening to see what those ideas mean in practice.",
    inquiryTitle: "Start with observation.",
    inquiryBody: "We pay attention to how people move, rest, and gather, in everyday spaces and in nature. Exploring cultures invites us to question familiar habits, including the positions we assume when we listen.\n\nThat observation gives the design a starting point. How might a speaker support the way people want to spend time together?",
    leveledTitle: "Listen on the same level.",
    leveledBody: "Leveled listening is sound designed for gathering on the floor. Inspired by floor-sitting cultures, it brings people together at the same height, encouraging a sense of equality and inviting everyone to relax, connect, and listen together.\n\nThe speaker is designed around this shared position. Its proportions begin with the people gathered around it, making floor listening central to the object itself.",
    driversTitle: "Give each driver its own space.",
    driversBody: "The form follows the individual drivers and their roles. Separate enclosures give the low, mid, and high frequencies a distinct physical place in the system.\n\nThis modular arrangement is intended to limit shared cabinet resonance and unwanted mechanical interaction. It also opens up a different shape for the speaker: an assembly whose parts remain visible and understandable.",
    roomTitle: "Tune for the place you listen.",
    roomBody: "A speaker is always heard in a room. Its surroundings, placement, and the listener’s position all become part of the experience.\n\nDSP and integrated amplification allow the sound to be adjusted for the space and the listener. Listening, measurement, and revision guide those adjustments as the system develops.",
    nextTitle: "Explore the object.",
    designLink: "Design details",
    specificationsLink: "Speaker specifications",
    footerTag: "INDEPENDENT AUDIO DESIGN / KYOTO",
    footerBack: "BACK TO THE STUDY",
    footerBackAria: "Back to the Metorom study",
  },
  ja: {
    ...SHARED_PAGE_COPY_JA,
    pageTitle: "設計思想 — Metorom",
    pageDescription: "人の集い方、ものの仕組み、同じ目線で音を聴くことから生まれるMetoromの設計思想。",
    heroTitle: "設計思想",
    openingStatement: "暮らし方が、\n聴き方をつくる。",
    openingBody: "私たちは、ものの仕組み、出会う文化、人と人が共に過ごす姿に好奇心を持つ集団です。スピーカーづくりは、その探究をかたちにする一つの方法です。",
    statementBody: "分解して仕組みを知り、つくることで考えを深める。そして再び音を聴き、アイデアが実際の体験にどうつながるかを確かめます。",
    inquiryTitle: "観察から始める。",
    inquiryBody: "日々の空間や自然の中で、人がどう動き、休み、集まるのかに目を向けています。さまざまな文化を知ることは、聴くときの姿勢を含め、慣れ親しんだ習慣を問い直すきっかけになります。\n\n人が一緒に過ごしたいと思う時間を、スピーカーはどう支えられるだろう。その問いが、設計の出発点です。",
    leveledTitle: "同じ目線で聴く。",
    leveledBody: "Leveled listeningは、床に座って集まるための音づくりです。床座の文化に着想を得て、同じ高さで過ごすことが対等な関係を育み、くつろぎ、つながり、共に聴く時間へと誘います。\n\nスピーカーのプロポーションも、その場に集う人の姿勢から考えています。床で聴くという体験を、もののかたちそのものの中心に置いています。",
    driversTitle: "ドライバーに、それぞれの場所を。",
    driversBody: "かたちは、一つひとつのドライバーとその役割から生まれます。低域・中域・高域をそれぞれ独立したエンクロージャーに収め、システムの中で明確な場所を与えています。\n\nこのモジュール構造は、共通のキャビネットを介した共振や、不要な機械的干渉を抑えることを意図しています。同時に、各部の関係が見え、仕組みを理解できる、新しいスピーカーの姿にもつながっています。",
    roomTitle: "聴く場所に合わせて調整する。",
    roomBody: "スピーカーの音は、部屋の中で聴かれます。周囲の環境、設置場所、聴く人の位置も、その体験の一部です。\n\nDSPと内蔵アンプにより、空間と聴く人に合わせて音を調整できます。試聴、測定、改良を重ねながら、システムを育てていきます。",
    nextTitle: "スピーカーを詳しく見る。",
    designLink: "デザインの詳細",
    specificationsLink: "スピーカーの仕様",
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
  const sections = [
    { id: "observation", title: copy.inquiryTitle, body: copy.inquiryBody },
    { id: "leveled-listening", title: copy.leveledTitle, body: copy.leveledBody },
    { id: "individual-drivers", title: copy.driversTitle, body: copy.driversBody },
    { id: "room-tuning", title: copy.roomTitle, body: copy.roomBody },
  ];

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
      <div className="sc-philosophy-essays">
        {sections.map((section) => <section key={section.id} id={section.id} className="sc-philosophy-essay" aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          <div>{section.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        </section>)}
      </div>
      <section className="sc-philosophy-next" aria-labelledby="sc-philosophy-next-title">
        <h2 id="sc-philosophy-next-title">{copy.nextTitle}</h2>
        <div>
          <a className="sc-outline-link" href={previewHref("./design.html")}>{copy.designLink} <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className="sc-outline-link" href={previewHref("./specifications.html")}>{copy.specificationsLink} <ArrowUpRight size={17} aria-hidden="true" /></a>
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
