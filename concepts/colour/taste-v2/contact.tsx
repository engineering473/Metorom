import { createRoot, type Root } from "react-dom/client";
import SiteChrome from "@/components/ui/site-chrome";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import "./styles.css";
import "./contact.css";

const EMAIL = "engineering@metorom.com";

const conversations = [
  {
    number: "01",
    title: "Come listen",
    copy: "Interested in hearing the three-way monitor in a room? Ask about a future listening session.",
    action: "Ask about listening",
    subject: "Metorom: Listening session",
  },
  {
    number: "02",
    title: "Make something",
    copy: "For spaces, collaborators, and ideas that could shape the next stage of the project.",
    action: "Start a collaboration",
    subject: "Metorom: Collaboration",
  },
  {
    number: "03",
    title: "Get technical",
    copy: "Talk to us about the acoustic design, measurements, components, or construction.",
    action: "Ask an engineering question",
    subject: "Metorom: Engineering question",
  },
] as const;

function ContactApp() {
  return (
    <>
      <SiteChrome contact />
      <main id="main" className="contact-page">
        <section className="contact-hero page-shell" aria-labelledby="contact-title">
          <div className="contact-hero__meta"><span>05 / CONTACT</span><span>AN OPEN CHANNEL · KYOTO, JAPAN</span></div>
          <div className="contact-hero__grid">
            <div className="contact-hero__lead bento-tile">
              <span className="tile-eyebrow">METOROM / INDEPENDENT AUDIO DESIGN</span>
              <div className="contact-hero__statement">
                <p>A conversation starts with a sound.</p>
                <h1 id="contact-title"><span>LET’S</span><span>LISTEN<span className="contact-hero__period">.</span></span></h1>
              </div>
              <div className="contact-hero__lead-foot">
                <p>Have a room, a question, or an idea in mind? We’d like to hear it.</p>
                <a href={`mailto:${EMAIL}`} className="contact-hero__mail">Write to us <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="contact-hero__world bento-tile">
              <div className="contact-hero__world-top"><span>WHERE THE WORK BEGINS</span><span>35° 00′ N / 135° 46′ E</span></div>
              <RotatingEarth className="contact-hero__globe" />
              <p className="contact-hero__world-bottom">KYOTO, JAPAN <span>DRAG THE GLOBE TO EXPLORE</span></p>
            </div>
          </div>
          <div className="contact-hero__foot"><span>SCROLL TO FIND YOUR WAY IN</span><span>LISTEN / MEASURE / EXCHANGE</span></div>
        </section>

        <section className="contact-channel page-shell" aria-labelledby="channel-title">
          <div className="contact-channel__heading">
            <span className="section-index">AN OPEN CHANNEL</span>
            <h2 id="channel-title">Tell us what<br /><em>you’re hearing.</em></h2>
            <p>We’re building Metorom through listening, measurement, and exchange. A message can start any of those conversations.</p>
          </div>
          <a className="contact-channel__address" href={`mailto:${EMAIL}`}>
            <span>DIRECT EMAIL</span>
            <strong>{EMAIL}</strong>
            <span className="contact-channel__arrow" aria-hidden="true">↗</span>
          </a>
          <div className="contact-channel__list" aria-label="Ways to get in touch">
            {conversations.map((item) => (
              <a className="contact-channel__row" key={item.number} href={`mailto:${EMAIL}?subject=${encodeURIComponent(item.subject)}`}>
                <span className="contact-channel__number">{item.number}</span>
                <strong>{item.title}</strong>
                <span className="contact-channel__copy">{item.copy}</span>
                <span className="contact-channel__action">{item.action} <span aria-hidden="true">↗</span></span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer contact-footer">
        <div className="page-shell">
          <a className="site-footer__wordmark" href="./index.html" aria-label="Metorom home">METOROM</a>
          <div className="site-footer__bottom">
            <p>Independent audio design.<br />Kyoto, Japan.</p>
            <div><a href="./index.html">Back to the study ↗</a><a href={`mailto:${EMAIL}`}>Email us ↗</a></div>
          </div>
        </div>
      </footer>
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom contact root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<ContactApp />);
