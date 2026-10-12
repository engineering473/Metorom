import { useEffect, useRef, useState, type FormEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import { Navbar1 } from "@/components/ui/navbar-1";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { previewHref } from "./language";
import { PageEditor, usePagePreview } from "./page-editor";
import { SHARED_PAGE_COPY_EN, SHARED_PAGE_COPY_JA } from "./page-copy";
import SiteFooter from "./site-footer";
import "./styles.css";
import "./contact.css";
import "./site-editor.css";

type Topic = "listening" | "collaboration" | "engineering" | "general";
type Status = "email" | "copied" | "copyError" | null;

export const CONTACT_COPY = {
  en: {
    ...SHARED_PAGE_COPY_EN,
    emailAddress: "engineering@metorom.com",
    pageTitle: "Conversation — Metorom",
    pageDescription: "Start a conversation with Metorom about listening, collaboration, or the engineering behind its three-way loudspeaker.",
    metaLocation: "METOROM / KYOTO, JAPAN",
    heroKicker: "AN OPEN CHANNEL",
    heroTitleLine1: "A conversation",
    heroTitleLine2: "starts here.",
    heroBody: "Have a room, a question, or an idea in mind? We would like to hear it.",
    heroButton: "Start your message",
    globeTop: "WHERE THE WORK BEGINS",
    globeCoordinates: "35° 00′ N / 135° 46′ E",
    globeLocation: "KYOTO, JAPAN",
    globeInstruction: "DRAG TO EXPLORE",
    globeGroupAria: "Interactive dotted globe centered on Kyoto, Japan",
    globeCanvasAria: "Dotted globe. Use arrow keys or drag to rotate. Kyoto, Japan is marked.",
    globeReset: "Locate Kyoto",
    globeCity: "KYOTO",
    globeCountry: "JAPAN",
    channelRail: "AN OPEN CHANNEL",
    channelTitleLine1: "Tell us what",
    channelTitleLine2: "you’re hearing.",
    channelBody: "Metorom develops through listening, measurement, and exchange. A message can start any of those conversations.",
    directEmail: "DIRECT EMAIL",
    waysAria: "Ways to get in touch",
    topic1Title: "Come listen",
    topic1Body: "Ask about a future listening session with the three-way monitor.",
    topic1Action: "Ask about listening",
    topic1Subject: "Metorom: Listening session",
    topic2Title: "Make something",
    topic2Body: "Tell us about a space, collaboration, or idea that could shape the project.",
    topic2Action: "Start a collaboration",
    topic2Subject: "Metorom: Collaboration",
    topic3Title: "Get technical",
    topic3Body: "Ask about acoustic design, measurements, components, or construction.",
    topic3Action: "Ask a technical question",
    topic3Subject: "Metorom: Engineering question",
    otherTopic: "Something else",
    otherSubject: "Metorom: General enquiry",
    formTitle: "Put it into words.",
    formIntro: "Your email app will prepare this message. You can review it before sending, or copy the draft to use elsewhere.",
    topicLabel: "What is it about?",
    nameLabel: "Your name",
    namePlaceholder: "",
    emailLabel: "Your email",
    emailPlaceholder: "",
    messageLabel: "Your message",
    messagePlaceholder: "",
    validationNameRequired: "Please enter your name.",
    validationEmailRequired: "Please enter your email address.",
    validationEmailInvalid: "Please enter a valid email address.",
    validationMessageRequired: "Please enter your message.",
    submitButton: "Open email app",
    copyButton: "Copy message",
    statusEmail: "Your email app should open with a draft. If it does not, use Copy message below.",
    statusCopied: "Message copied. Paste it into your email app to send it to {email}.",
    statusCopyError: "Copy is unavailable here. Select the email address above and write to us from your email app.",
    draftTo: "To:",
    draftSubject: "Subject:",
    draftReplyTo: "Reply to:",
    closeRail: "LISTENING SESSION",
    closeTitle: "Meet in a room.",
    closeBody: "A listening session is being planned. The venue and date will be shared when confirmed.",
    closeButton: "Explore the event",
    footerBackAria: "Back to Metorom study",
    footerTag: "INDEPENDENT AUDIO DESIGN / KYOTO",
    footerBack: "BACK TO THE STUDY",
  },
  ja: {
    ...SHARED_PAGE_COPY_JA,
    emailAddress: "engineering@metorom.com",
    pageTitle: "お問い合わせ — Metorom",
    pageDescription: "Metoromに、試聴やコラボレーション、3ウェイスピーカーの設計についてお問い合わせください。",
    metaLocation: "METOROM / 日本・京都",
    heroKicker: "開かれた窓口",
    heroTitleLine1: "ここから対話を",
    heroTitleLine2: "始めましょう。",
    heroBody: "部屋のこと、疑問、アイデア。どんなことでもお聞かせください。",
    heroButton: "メッセージを書く",
    globeTop: "活動の拠点",
    globeCoordinates: "北緯35°00′ / 東経135°46′",
    globeLocation: "日本・京都",
    globeInstruction: "ドラッグして見る",
    globeGroupAria: "京都を中心に表示した操作可能なドットの地球儀",
    globeCanvasAria: "ドットの地球儀。矢印キーまたはドラッグで回転できます。京都に印があります。",
    globeReset: "京都を表示",
    globeCity: "京都",
    globeCountry: "日本",
    channelRail: "開かれた窓口",
    channelTitleLine1: "聴こえたことを、",
    channelTitleLine2: "聞かせてください。",
    channelBody: "Metoromは、聴くこと、測ること、意見を交わすことを通して進化します。一通のメッセージから、その対話を始められます。",
    directEmail: "メールで直接連絡",
    waysAria: "お問い合わせの方法",
    topic1Title: "聴いてみたい",
    topic1Body: "3ウェイモニターの今後の試聴会について、お問い合わせください。",
    topic1Action: "試聴について問い合わせる",
    topic1Subject: "Metorom：試聴会について",
    topic2Title: "一緒につくりたい",
    topic2Body: "プロジェクトにつながる空間、協業、アイデアについてお聞かせください。",
    topic2Action: "協業について相談する",
    topic2Subject: "Metorom：コラボレーションについて",
    topic3Title: "技術について知りたい",
    topic3Body: "音響設計、測定、部品、構造についてのご質問をお寄せください。",
    topic3Action: "技術的な質問をする",
    topic3Subject: "Metorom：技術的な質問",
    otherTopic: "その他",
    otherSubject: "Metorom：一般的なお問い合わせ",
    formTitle: "言葉にしてみる。",
    formIntro: "メールアプリで下書きを作成します。送信前に内容を確認したり、コピーして別の方法で送ったりできます。",
    topicLabel: "お問い合わせの内容",
    nameLabel: "お名前",
    namePlaceholder: "",
    emailLabel: "メールアドレス",
    emailPlaceholder: "",
    messageLabel: "メッセージ",
    messagePlaceholder: "",
    validationNameRequired: "お名前を入力してください。",
    validationEmailRequired: "メールアドレスを入力してください。",
    validationEmailInvalid: "有効なメールアドレスを入力してください。",
    validationMessageRequired: "メッセージを入力してください。",
    submitButton: "メールアプリを開く",
    copyButton: "メッセージをコピー",
    statusEmail: "メールアプリで下書きが開きます。開かない場合は、下の「メッセージをコピー」をお使いください。",
    statusCopied: "メッセージをコピーしました。メールアプリに貼り付け、{email}宛てに送信してください。",
    statusCopyError: "ここではコピーできません。上のメールアドレスを選び、メールアプリからご連絡ください。",
    draftTo: "宛先：",
    draftSubject: "件名：",
    draftReplyTo: "返信先：",
    closeRail: "試聴会",
    closeTitle: "同じ部屋で聴く。",
    closeBody: "試聴会を準備しています。会場と日時が決まり次第、お知らせします。",
    closeButton: "試聴会について",
    footerBackAria: "Metoromのサイトに戻る",
    footerTag: "独立系オーディオデザイン / 京都",
    footerBack: "サイトに戻る",
  },
};

export const CONTACT_COPY_EN = CONTACT_COPY.en;
export const CONTACT_COPY_JA = CONTACT_COPY.ja;

function Contact() {
  const [copy, settings, setSettings] = usePagePreview("contact", CONTACT_COPY_EN, CONTACT_COPY_JA);
  const emailAddress = copy.emailAddress.trim();
  const conversations: { id: Topic; title: string; body: string; action: string }[] = [
    { id: "listening", title: copy.topic1Title, body: copy.topic1Body, action: copy.topic1Action },
    { id: "collaboration", title: copy.topic2Title, body: copy.topic2Body, action: copy.topic2Action },
    { id: "engineering", title: copy.topic3Title, body: copy.topic3Body, action: copy.topic3Action },
  ];
  const subjects: Record<Topic, string> = {
    listening: copy.topic1Subject,
    collaboration: copy.topic2Subject,
    engineering: copy.topic3Subject,
    general: copy.otherSubject,
  };
  const [topic, setTopic] = useState<Topic>("listening");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // The form is rendered by React after the browser's initial fragment scroll.
    if (window.location.hash !== "#sc-contact-compose") return;
    const frame = window.requestAnimationFrame(() => {
      const target = form.current;
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.pageDescription);
  }, [copy]);

  const subject = subjects[topic];
  const draftBody = [message.trim(), "", name.trim(), `${copy.draftReplyTo} ${replyTo.trim()}`].join("\n");
  const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draftBody)}`;
  const draft = [`${copy.draftTo} ${emailAddress}`, `${copy.draftSubject} ${subject}`, "", draftBody].join("\n");

  function validateField(field: HTMLInputElement | HTMLTextAreaElement, requiredMessage: string) {
    field.setCustomValidity("");
    if (field.validity.valueMissing) field.setCustomValidity(requiredMessage);
    else if (field instanceof HTMLInputElement && field.validity.typeMismatch) field.setCustomValidity(copy.validationEmailInvalid);
  }

  function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("email");
    window.location.href = mailto;
  }

  async function copyMessage() {
    if (!form.current?.reportValidity()) return;
    try {
      await navigator.clipboard.writeText(draft);
      setStatus("copied");
    } catch {
      setStatus("copyError");
    }
  }

  return (
    <>
      <Navbar1 contact copy={copy} />
      <main id="main" className="sc-contact-page">
        <section className="sc-contact-hero" id="top" aria-labelledby="sc-contact-title">
          <div className="sc-contact-hero__copy">
            <div className="sc-contact-hero__meta"><span>{copy.metaLocation}</span><span>{copy.heroKicker}</span></div>
            <h1 id="sc-contact-title">{copy.heroTitleLine1}<br />{copy.heroTitleLine2}</h1>
            <div className="sc-contact-hero__bottom"><p>{copy.heroBody}</p><a className="sc-outline-link" href="#sc-contact-compose">{copy.heroButton} <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
          <div className="sc-contact-hero__globe">
            <div className="sc-contact-hero__globe-top"><span>{copy.globeTop}</span><span>{copy.globeCoordinates}</span></div>
            <RotatingEarth className="sc-contact-hero__earth" groupLabel={copy.globeGroupAria} canvasLabel={copy.globeCanvasAria} resetLabel={copy.globeReset} cityLabel={copy.globeCity} countryLabel={copy.globeCountry} />
            <div className="sc-contact-hero__globe-bottom"><span>{copy.globeLocation}</span><span>{copy.globeInstruction}</span></div>
          </div>
        </section>

        <section className="sc-contact-main sc-shell" aria-labelledby="sc-channel-title">
          <span className="sc-rail-label">{copy.channelRail}</span>
          <div>
            <div className="sc-contact-main__heading"><h2 id="sc-channel-title">{copy.channelTitleLine1}<br />{copy.channelTitleLine2}</h2><p>{copy.channelBody}</p></div>
            <a className="sc-contact-main__email" href={`mailto:${emailAddress}`}><span>{copy.directEmail}</span><strong>{emailAddress}</strong><ArrowUpRight size={32} aria-hidden="true" /></a>
            <div className="sc-contact-main__list" aria-label={copy.waysAria}>
              {conversations.map((item) => (
                <a href="#sc-contact-compose" key={item.id} onClick={() => { setTopic(item.id); setStatus(null); }}>
                  <strong>{item.title}</strong><span>{item.body}</span><small>{item.action}<ArrowUpRight size={16} aria-hidden="true" /></small>
                </a>
              ))}
            </div>

            <form ref={form} className="sc-contact-form" id="sc-contact-compose" onSubmit={openEmail} aria-labelledby="sc-contact-form-title">
              <div className="sc-contact-form__intro">
                <h3 id="sc-contact-form-title">{copy.formTitle}</h3>
                <p>{copy.formIntro}</p>
              </div>
              <div className="sc-contact-form__fields">
                <label>{copy.topicLabel}
                  <select value={topic} onChange={(event) => setTopic(event.target.value as Topic)}>
                    {conversations.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                    <option value="general">{copy.otherTopic}</option>
                  </select>
                </label>
                <div className="sc-contact-form__row">
                  <label>{copy.nameLabel}<input type="text" autoComplete="name" placeholder={copy.namePlaceholder} value={name} onChange={(event) => { event.currentTarget.setCustomValidity(""); setName(event.target.value); }} onInvalid={(event) => validateField(event.currentTarget, copy.validationNameRequired)} required /></label>
                  <label>{copy.emailLabel}<input type="email" autoComplete="email" placeholder={copy.emailPlaceholder} value={replyTo} onChange={(event) => { event.currentTarget.setCustomValidity(""); setReplyTo(event.target.value); }} onInvalid={(event) => validateField(event.currentTarget, copy.validationEmailRequired)} required /></label>
                </div>
                <label>{copy.messageLabel}<textarea rows={6} placeholder={copy.messagePlaceholder} value={message} onChange={(event) => { event.currentTarget.setCustomValidity(""); setMessage(event.target.value); }} onInvalid={(event) => validateField(event.currentTarget, copy.validationMessageRequired)} required /></label>
              </div>
              <div className="sc-contact-form__actions">
                <button className="sc-contact-form__submit" type="submit">{copy.submitButton} <ArrowUpRight size={17} aria-hidden="true" /></button>
                <button className="sc-contact-form__copy" type="button" onClick={copyMessage}>{copy.copyButton}</button>
              </div>
              <p className="sc-contact-form__status" role="status" aria-live="polite">{status === "email" ? copy.statusEmail : status === "copied" ? copy.statusCopied.replaceAll("{email}", emailAddress) : status === "copyError" ? copy.statusCopyError : ""}</p>
            </form>
          </div>
        </section>

        <section className="sc-contact-close sc-shell"><span className="sc-rail-label">{copy.closeRail}</span><div><h2>{copy.closeTitle}</h2><p>{copy.closeBody}</p><a className="sc-outline-link" href={previewHref("./event.html")}>{copy.closeButton} <ArrowUpRight size={17} aria-hidden="true" /></a></div></section>
      </main>
      <SiteFooter copy={copy} backToStudy />
      <PageEditor page="contact" settings={settings} onChange={setSettings} english={CONTACT_COPY_EN} japanese={CONTACT_COPY_JA} />
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom conversation root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Contact />);
