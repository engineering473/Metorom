import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import HalftoneFlow from "@/components/ui/halftone-flow";
import { Navbar1 } from "@/components/ui/navbar-1";
import FrequencyResponseCards from "@/components/ui/frequency-response-cards";
import RenderedObject from "./rendered-object";
import SectionIndex from "./section-index";
import "./styles.css";

const RENDER = `${import.meta.env.BASE_URL}images/concepts/speaker-render.png`;

const paths = [
  { title: "High frequency", part: "BMS 4540ND / horn", copy: "A compression driver and horn give the upper range a defined path into the room." },
  { title: "Midrange", part: "Alpha 6A / dedicated drivers", copy: "The midrange drivers carry voices and instruments with 608 mm between their centres." },
  { title: "Low frequency", part: "LAB 12 / lower cabinet", copy: "A separate low-frequency foundation supports the system while keeping the structure legible." },
] as const;

function App() {
  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>("[data-motion-card], [data-section-reveal]")];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar1 />
      <SectionIndex />
      <main id="main">
        <div className="sc-opening">
          <HalftoneFlow className="sc-opening__flow" mode="light" hue={168} saturation={0.58} brightness={1.02} waveDensity={1.75} />
          <section className="sc-hero" id="top" aria-labelledby="sc-hero-title">
          <div className="sc-hero__content">
            <div className="sc-hero__meta"><span>METOROM / THREE-WAY MONITOR</span><span>KYOTO, JAPAN</span></div>
            <div className="sc-hero__statement">
              <h1 id="sc-hero-title">Sound, given<br />a shape.</h1>
              <p>One loudspeaker. Three acoustic paths. Designed to be examined as closely as it is heard.</p>
              <a className="sc-outline-link" href="#object">Explore the object <ArrowDownRight size={17} aria-hidden="true" /></a>
            </div>
          </div>
          <figure className="sc-hero__render">
            <img src={RENDER} alt="User-supplied render of the dark green Metorom loudspeaker with horn, midrange drivers, and lower cabinet" width="2400" height="2128" fetchPriority="high" />
            <figcaption><span>OBJECT / 001</span><span>STUDIO RENDER</span></figcaption>
          </figure>
          </section>

          <section className="sc-intro sc-shell" aria-labelledby="sc-intro-title">
          <span className="sc-rail-label">THE IDEA</span>
          <div className="sc-intro__body"><h2 id="sc-intro-title">Every element<br />has a purpose.</h2><p>Metorom is a modular monitor. Its parts remain visible because the relationships between them matter: driver, cabinet, room, and listener.</p></div>
          </section>
        </div>

        <RenderedObject />

        <section className="sc-architecture sc-shell" id="architecture" aria-labelledby="sc-architecture-title" data-section-reveal>
          <span className="sc-rail-label">ARCHITECTURE</span>
          <div className="sc-architecture__body">
            <h2 id="sc-architecture-title">Open construction.</h2>
            <p className="sc-architecture__intro">Each acoustic path has a role. The modular structure leaves room for listening, measurement, and revision.</p>
            <div className="sc-parts">
              {paths.map((path) => (
                <details key={path.title}>
                  <summary><span>{path.title}</span><small>{path.part}</small><span className="sc-parts__plus" aria-hidden="true" /></summary>
                  <p>{path.copy}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sc-measure sc-shell" id="measurements" aria-labelledby="sc-measure-title" data-section-reveal>
          <span className="sc-rail-label">MEASURE / LISTEN</span>
          <div className="sc-measure__body">
            <div className="sc-measure__lead"><h2 id="sc-measure-title">Measured.<br />Then listened to.</h2><p>Frequency response and horizontal directivity show how a change behaves. Listening in a room tells us what that change means.</p></div>
            <FrequencyResponseCards />
            <dl className="sc-spec-table">
              <div><dt>System</dt><dd>Three-way monitor</dd></div>
              <div><dt>Construction</dt><dd>Modular</dd></div>
              <div><dt>Midrange spacing</dt><dd>608 mm between dedicated drivers</dd></div>
              <div><dt>DSP latency</dt><dd>510 µs</dd></div>
              <div><dt>Measurement</dt><dd>Frequency response / horizontal directivity</dd></div>
              <div><dt>Development</dt><dd>Kyoto, Japan</dd></div>
            </dl>
            <a className="sc-text-link" href="../../../versions/signal/index.html#details">See the measurement plots <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="sc-listening sc-shell" id="listening" aria-labelledby="sc-listening-title" data-section-reveal>
          <span className="sc-rail-label">A GATHERING</span>
          <div className="sc-listening__body">
            <div><h2 id="sc-listening-title">Come closer<br />to the sound.</h2><p>A small listening session around the three-way monitor is being prepared. Hear the system in a room, see how it is built, and join the conversation.</p><a className="sc-outline-link" href="./event.html">Explore the listening event <ArrowUpRight size={17} aria-hidden="true" /></a></div>
            <div className="sc-listening__facts"><dl><div><dt>Venue</dt><dd>To be announced</dd></div><div><dt>Date & time</dt><dd>To be announced</dd></div><div><dt>Tickets</dt><dd>Details to follow</dd></div></dl><p>Event details will be added when confirmed.</p></div>
          </div>
        </section>

        <section className="sc-future-teaser sc-shell" aria-labelledby="sc-future-teaser-title">
          <div>
            <span className="sc-rail-label">WHAT COULD FOLLOW</span>
            <h2 id="sc-future-teaser-title">Future works.</h2>
            <p>A notebook of possible directions for the object, the room, and the exchanges around them. These are open questions, not announced products.</p>
            <a className="sc-outline-link" href="./future.html">Explore future works <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="sc-conversation sc-shell" id="conversation" aria-labelledby="sc-conversation-title">
          <span className="sc-rail-label">OPEN CHANNEL / KYOTO</span>
          <div><h2 id="sc-conversation-title">Keep the<br />conversation open.</h2><p>Questions about the build, a future listening session, or a possible collaboration? There is a place to start.</p><a className="sc-outline-link" href="./contact.html#sc-contact-compose">Start a conversation <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </section>
      </main>
      <footer className="sc-footer"><a href="#top" className="sc-footer__wordmark" aria-label="Metorom, back to top">METOROM</a><div><span>INDEPENDENT AUDIO DESIGN / KYOTO</span><a href="../../index.html">ALL STUDIES <ArrowUpRight size={15} aria-hidden="true" /></a></div></footer>
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom study root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<App />);
