import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Navbar1 } from "./navbar";
import { previewHref } from "./language";
import { PageEditor, usePagePreview } from "./page-editor";
import { SHARED_PAGE_COPY_EN, SHARED_PAGE_COPY_JA } from "./page-copy";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./event.css";
import "./site-editor.css";
import "./blue-theme.css";


export const EVENT_COPY = {
  en: {
    ...SHARED_PAGE_COPY_EN,
    emailAddress: "engineering@metorom.com",
    pageTitle: "Listening session — Metorom",
    pageDescription: "A Metorom listening session is being planned. Learn what the gathering is for and ask about hearing the modular three-way loudspeaker in a room.",
    emailSubject: "Metorom: Listening session",
    metaLocation: "METOROM / KYOTO, JAPAN",
    heroKicker: "LISTENING SESSION",
    heroTitleLine1: "Hear what",
    heroTitleLine2: "takes shape.",
    heroBody: "A small listening session around Metorom’s three-way monitor is being prepared. Come closer to the sound, the object, and the people shaping it.",
    heroButton: "Explore the session",
    heroFootLeft: "IN PLANNING",
    heroFootRight: "DETAILS TO FOLLOW",
    fieldLabel: "SOUND IS SPATIAL",
    fieldCaption: "ONE OBJECT / A ROOM OF LISTENERS",
    premiseRail: "THE GATHERING",
    premiseTitleLine1: "An instrument",
    premiseTitleLine2: "in a room.",
    premiseBody: "Measurements describe the loudspeaker. Listening together adds the room, the music, and the questions that follow. This gathering is being shaped around those exchanges.",
    momentsAria: "What the gathering is being planned around",
    moment1Title: "Hear the whole system",
    moment1Body: "Spend time with the modular three-way monitor in the room it is playing into.",
    moment2Title: "Look more closely",
    moment2Body: "See how the horn, dedicated midrange, and lower cabinet form one instrument.",
    moment3Title: "Continue the exchange",
    moment3Body: "Bring a question or an observation into the conversation around the work.",
    detailsRail: "THE DETAILS",
    detailsTitleLine1: "Still taking",
    detailsTitleLine2: "shape.",
    detailsBody: "The session is being planned. Confirmed information will appear here when it is ready.",
    whenLabel: "When",
    whereLabel: "Where",
    whereValue: "To be announced",
    entryLabel: "Entry",
    toBeAnnounced: "To be announced",
    detailsToFollow: "Details to follow",
    closeRail: "OPEN CHANNEL / KYOTO",
    closeTitleLine1: "Curious about",
    closeTitleLine2: "the session?",
    closeBody: "Ask us about listening to Metorom, or start a wider conversation about the project.",
    askButton: "Ask about listening",
    otherWays: "Other ways to connect",
    footerBackAria: "Back to Metorom study",
    footerTag: "INDEPENDENT AUDIO DESIGN / KYOTO",
    footerBack: "BACK TO THE STUDY",
  },
  ja: {
    ...SHARED_PAGE_COPY_JA,
    emailAddress: "engineering@metorom.com",
    pageTitle: "試聴会 — Metorom",
    pageDescription: "Metoromの試聴会を準備しています。モジュール式の3ウェイスピーカーを室内で聴く機会についてご覧ください。",
    emailSubject: "Metorom：試聴会について",
    metaLocation: "METOROM / 日本・京都",
    heroKicker: "試聴会",
    heroTitleLine1: "音が形になる",
    heroTitleLine2: "その瞬間を聴く。",
    heroBody: "Metoromの3ウェイモニターを囲む、小さな試聴会を準備しています。音に、オブジェクトに、そしてそれをつくる人たちに、近づいてみてください。",
    heroButton: "試聴会について",
    heroFootLeft: "準備中",
    heroFootRight: "詳細は後日発表",
    fieldLabel: "音は空間に広がる",
    fieldCaption: "ひとつのオブジェクト / 聴き手のいる部屋",
    premiseRail: "集うこと",
    premiseTitleLine1: "部屋に置かれた",
    premiseTitleLine2: "ひとつの楽器。",
    premiseBody: "測定はスピーカーの特性を示します。ともに聴くことで、部屋や音楽、そこから生まれる問いが加わります。この集まりは、そんなやり取りを中心に形づくられています。",
    momentsAria: "試聴会で予定していること",
    moment1Title: "システム全体を聴く",
    moment1Body: "モジュール式の3ウェイモニターを、実際に音が響く部屋で聴いてください。",
    moment2Title: "細部を見る",
    moment2Body: "ホーン、独立したミッドレンジ、低音用キャビネットが、ひとつの楽器を形づくる様子をご覧ください。",
    moment3Title: "対話を続ける",
    moment3Body: "作品についての疑問や気づきを、会話に持ち寄ってください。",
    detailsRail: "詳細",
    detailsTitleLine1: "いま、準備を",
    detailsTitleLine2: "進めています。",
    detailsBody: "試聴会は現在計画中です。決まり次第、こちらでお知らせします。",
    whenLabel: "日時",
    whereLabel: "会場",
    whereValue: "後日発表",
    entryLabel: "参加方法",
    toBeAnnounced: "後日発表",
    detailsToFollow: "詳細は後日ご案内",
    closeRail: "お問い合わせ / 京都",
    closeTitleLine1: "試聴会に",
    closeTitleLine2: "興味がありますか？",
    closeBody: "Metoromの試聴についてのご質問も、プロジェクトに関する幅広いお話も、お待ちしています。",
    askButton: "試聴について問い合わせる",
    otherWays: "その他のお問い合わせ",
    footerBackAria: "Metoromのサイトに戻る",
    footerTag: "独立系オーディオデザイン / 京都",
    footerBack: "サイトに戻る",
  },
};

export const EVENT_COPY_EN = EVENT_COPY.en;
export const EVENT_COPY_JA = EVENT_COPY.ja;

function ListeningEvent() {
  const [copy, settings, setSettings] = usePagePreview("event", EVENT_COPY_EN, EVENT_COPY_JA);
  const moments = [
    { title: copy.moment1Title, body: copy.moment1Body },
    { title: copy.moment2Title, body: copy.moment2Body },
    { title: copy.moment3Title, body: copy.moment3Body },
  ];

  useEffect(() => {
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.pageDescription);
  }, [copy]);

  return (
    <>
      <Navbar1 contact copy={copy} />
      <main id="main" className="sc-event-page">
        <section className="sc-event-hero" id="top" aria-labelledby="sc-event-title">
          <div className="sc-event-hero__copy">
            <div className="sc-event-hero__meta"><span>{copy.metaLocation}</span><span>{copy.heroKicker}</span></div>
            <div className="sc-event-hero__statement">
              <h1 id="sc-event-title">{copy.heroTitleLine1}<br />{copy.heroTitleLine2}</h1>
              <p>{copy.heroBody}</p>
              <a className="sc-outline-link" href="#details">{copy.heroButton} <ArrowDownRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="sc-event-hero__foot"><span>{copy.heroFootLeft}</span><span>{copy.heroFootRight}</span></div>
          </div>
          <div className="sc-event-field" aria-hidden="true">
            <svg viewBox="0 0 760 850" preserveAspectRatio="xMidYMid slice" focusable="false">
              <g className="sc-event-field__rings" fill="none" stroke="currentColor">
                {[90, 155, 225, 300, 380, 465, 555, 650].map((radius) => <circle key={radius} cx="445" cy="420" r={radius} />)}
              </g>
              <circle className="sc-event-field__core" cx="445" cy="420" r="10" />
            </svg>
            <span className="sc-event-field__label">{copy.fieldLabel}</span>
            <span className="sc-event-field__caption">{copy.fieldCaption}</span>
          </div>
        </section>

        <section className="sc-event-premise sc-shell" aria-labelledby="sc-event-premise-title">
          <span className="sc-rail-label">{copy.premiseRail}</span>
          <div className="sc-event-premise__body">
            <div className="sc-event-premise__lead">
              <h2 id="sc-event-premise-title">{copy.premiseTitleLine1}<br />{copy.premiseTitleLine2}</h2>
              <p>{copy.premiseBody}</p>
            </div>
            <div className="sc-event-moments" aria-label={copy.momentsAria}>
              {moments.map((moment) => (
                <div key={moment.title}>
                  <h3>{moment.title}</h3>
                  <p>{moment.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sc-event-details sc-shell" id="details" aria-labelledby="sc-event-details-title">
          <span className="sc-rail-label">{copy.detailsRail}</span>
          <div className="sc-event-details__body">
            <div className="sc-event-details__heading">
              <h2 id="sc-event-details-title">{copy.detailsTitleLine1}<br />{copy.detailsTitleLine2}</h2>
              <p>{copy.detailsBody}</p>
            </div>
            <dl className="sc-event-details__list">
              <div><dt>{copy.whenLabel}</dt><dd>{copy.toBeAnnounced}</dd></div>
              <div><dt>{copy.whereLabel}</dt><dd>{copy.whereValue}</dd></div>
              <div><dt>{copy.entryLabel}</dt><dd>{copy.detailsToFollow}</dd></div>
            </dl>
          </div>
        </section>

        <section className="sc-event-close sc-shell" aria-labelledby="sc-event-close-title">
          <span className="sc-rail-label">{copy.closeRail}</span>
          <div>
            <h2 id="sc-event-close-title">{copy.closeTitleLine1}<br />{copy.closeTitleLine2}</h2>
            <p>{copy.closeBody}</p>
            <div className="sc-event-close__links">
              <a className="sc-outline-link" href={`mailto:${copy.emailAddress.trim()}?subject=${encodeURIComponent(copy.emailSubject)}`}>{copy.askButton} <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a className="sc-event-close__secondary" href={previewHref("./contact.html")}>{copy.otherWays} <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter copy={copy} backToStudy />
      <PageEditor page="event" settings={settings} onChange={setSettings} english={EVENT_COPY_EN} japanese={EVENT_COPY_JA} />
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom listening event root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<ListeningEvent />);
