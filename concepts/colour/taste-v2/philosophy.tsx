import { createRoot, type Root } from "react-dom/client";
import SiteChrome from "@/components/ui/site-chrome";
import LiveCopyEditor, { editHref } from "./live-copy";
import "./styles.css";
import "./philosophy.css";

function PhilosophyApp() {
  return <>
    <SiteChrome philosophy />
    <main id="main" className="philosophy-page">
      <section className="philosophy-hero page-shell" aria-labelledby="philosophy-title">
        <div className="philosophy-hero__meta"><span>METOROM / PHILOSOPHY</span><span>INDEPENDENT AUDIO DESIGN · KYOTO</span></div>
        <div className="philosophy-hero__grid">
          <div className="philosophy-hero__title bento-tile">
            <span className="tile-eyebrow">THE THINKING BEHIND THE OBJECT</span>
            <h1 id="philosophy-title">PHILO<br />SOPHY<span>.</span></h1>
            <p>Listen. Measure. Revise. Exchange.</p>
          </div>
          <div className="philosophy-hero__introduction bento-tile">
            <span className="section-index">A NOTE FROM METOROM</span>
            <p>We begin with a person, a room, and a moment of attention.</p>
            <span className="philosophy-hero__rule" aria-hidden="true" />
            <p>The object is part of a larger conversation between sound, space, and the listener.</p>
          </div>
        </div>
      </section>

      <section className="philosophy-statement page-shell" aria-labelledby="philosophy-statement-title">
        <div className="philosophy-statement__heading"><span className="section-index">OUR APPROACH</span><h2 id="philosophy-statement-title">A route,<br /><em>not a formula.</em></h2></div>
        <div className="philosophy-statement__body">
          <p>Listening gives the measurements meaning. Response and directivity data can reveal patterns, while time in a room tells us what those patterns mean to a listener.</p>
          <p>The three-way system is built to be examined and changed. Modular construction and adjustable DSP leave room for the next revision.</p>
          <p>Ideas move between engineering, craft, music, and daily life. We keep that exchange open as the work develops.</p>
        </div>
      </section>
      <section className="philosophy-next page-shell" aria-label="Continue exploring Metorom">
        <a href={editHref("./index.html#system")}>Explore the system <span aria-hidden="true">↗</span></a>
        <a href={editHref("./contact.html")}>Start a conversation <span aria-hidden="true">↗</span></a>
      </section>
    </main>
    <footer className="site-footer philosophy-footer">
      <div className="page-shell">
        <a className="site-footer__wordmark" href={editHref("./index.html")} aria-label="Metorom home">METOROM</a>
        <div className="site-footer__bottom">
          <p>Independent audio design.<br />Kyoto, Japan.</p>
          <div><a href={editHref("./index.html")}>Back to the study ↗</a><a href={editHref("./contact.html")}>Contact ↗</a><a href="?edit=1">Edit text ↗</a></div>
        </div>
      </div>
    </footer>
    <LiveCopyEditor />
  </>;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom philosophy root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<PhilosophyApp />);
