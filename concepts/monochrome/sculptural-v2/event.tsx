import { createRoot, type Root } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Navbar1 } from "@/components/ui/navbar-1";
import "./styles.css";
import "./event.css";

const EMAIL = "engineering@metorom.com";
const EVENT_SUBJECT = encodeURIComponent("Metorom: Listening session");

const moments = [
  {
    title: "Hear the whole system",
    copy: "Spend time with the modular three-way monitor in the room it is playing into.",
  },
  {
    title: "Look more closely",
    copy: "See how the horn, dedicated midrange, and lower cabinet form one instrument.",
  },
  {
    title: "Continue the exchange",
    copy: "Bring a question or an observation into the conversation around the work.",
  },
] as const;

function ListeningEvent() {
  return (
    <>
      <Navbar1 contact />
      <main id="main" className="sc-event-page">
        <section className="sc-event-hero" id="top" aria-labelledby="sc-event-title">
          <div className="sc-event-hero__copy">
            <div className="sc-event-hero__meta"><span>METOROM / KYOTO, JAPAN</span><span>LISTENING SESSION</span></div>
            <div className="sc-event-hero__statement">
              <h1 id="sc-event-title">Hear what<br />takes shape.</h1>
              <p>A small listening session around Metorom’s three-way monitor is being prepared. Come closer to the sound, the object, and the people shaping it.</p>
              <a className="sc-outline-link" href="#details">Explore the session <ArrowDownRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="sc-event-hero__foot"><span>IN PLANNING</span><span>DETAILS TO FOLLOW</span></div>
          </div>
          <div className="sc-event-field" aria-hidden="true">
            <svg viewBox="0 0 760 850" preserveAspectRatio="xMidYMid slice" focusable="false">
              <g className="sc-event-field__rings" fill="none" stroke="currentColor">
                {[90, 155, 225, 300, 380, 465, 555, 650].map((radius) => <circle key={radius} cx="445" cy="420" r={radius} />)}
              </g>
              <circle className="sc-event-field__core" cx="445" cy="420" r="10" />
            </svg>
            <span className="sc-event-field__label">SOUND IS SPATIAL</span>
            <span className="sc-event-field__caption">ONE OBJECT / A ROOM OF LISTENERS</span>
          </div>
        </section>

        <section className="sc-event-premise sc-shell" aria-labelledby="sc-event-premise-title">
          <span className="sc-rail-label">THE GATHERING</span>
          <div className="sc-event-premise__body">
            <div className="sc-event-premise__lead">
              <h2 id="sc-event-premise-title">An instrument<br />in a room.</h2>
              <p>Measurements describe the loudspeaker. Listening together adds the room, the music, and the questions that follow. This gathering is being shaped around those exchanges.</p>
            </div>
            <div className="sc-event-moments" aria-label="What the gathering is being planned around">
              {moments.map((moment) => (
                <div key={moment.title}>
                  <h3>{moment.title}</h3>
                  <p>{moment.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sc-event-details sc-shell" id="details" aria-labelledby="sc-event-details-title">
          <span className="sc-rail-label">THE DETAILS</span>
          <div className="sc-event-details__body">
            <div className="sc-event-details__heading">
              <h2 id="sc-event-details-title">Still taking<br />shape.</h2>
              <p>The session is being planned. Confirmed information will appear here when it is ready.</p>
            </div>
            <dl className="sc-event-details__list">
              <div><dt>When</dt><dd>To be announced</dd></div>
              <div><dt>Where</dt><dd>To be announced</dd></div>
              <div><dt>Entry</dt><dd>Details to follow</dd></div>
            </dl>
          </div>
        </section>

        <section className="sc-event-close sc-shell" aria-labelledby="sc-event-close-title">
          <span className="sc-rail-label">OPEN CHANNEL / KYOTO</span>
          <div>
            <h2 id="sc-event-close-title">Curious about<br />the session?</h2>
            <p>Ask us about listening to Metorom, or start a wider conversation about the project.</p>
            <div className="sc-event-close__links">
              <a className="sc-outline-link" href={`mailto:${EMAIL}?subject=${EVENT_SUBJECT}`}>Ask about listening <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a className="sc-event-close__secondary" href="./contact.html">Other ways to connect <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
      </main>
      <footer className="sc-footer"><a href="./index.html" className="sc-footer__wordmark" aria-label="Back to Metorom study">METOROM</a><div><span>INDEPENDENT AUDIO DESIGN / KYOTO</span><a href="./index.html">BACK TO THE STUDY <ArrowUpRight size={15} aria-hidden="true" /></a></div></footer>
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom listening event root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<ListeningEvent />);
