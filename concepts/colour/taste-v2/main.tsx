import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import HalftoneFlow from "@/components/ui/halftone-flow";
import StatsBento from "@/components/ui/stats-bento";
import "./styles.css";

const EVENT_URL = "../../../versions/atelier/event.html";

const drivers = [
  {
    number: "01",
    name: "The voice",
    designation: "Alpha 6A / midrange",
    description: "A dedicated acoustic path for the part of music we hear most directly.",
    detail: "The current design places 608 mm between the midrange units. Their position is listened to and measured as part of the complete system.",
    tone: "warm",
  },
  {
    number: "02",
    name: "The reach",
    designation: "BMS 4540ND / horn",
    description: "A compression driver and horn shape how high frequencies travel into the room.",
    detail: "Horizontal directivity measurements help us understand the system beyond a single listening position.",
    tone: "rust",
  },
  {
    number: "03",
    name: "The weight",
    designation: "LAB 12 / low frequency",
    description: "A low-frequency foundation considered with the cabinet and the room around it.",
    detail: "Its role is tuned alongside the other paths. The system is designed as a whole, rather than as a collection of separate drivers.",
    tone: "ink",
  },
] as const;

const method = [
  {
    number: "01",
    title: "Listen",
    copy: "Begin with a person, a room, and a moment of attention.",
  },
  {
    number: "02",
    title: "Measure",
    copy: "Use response and directivity data to reveal patterns that ears alone may miss.",
  },
  {
    number: "03",
    title: "Adjust",
    copy: "Move between listening and measurement as the modular system evolves.",
  },
  {
    number: "04",
    title: "Exchange",
    copy: "Let ideas travel between engineering, craft, music, and everyday life.",
  },
] as const;

function makeWavePath() {
  const parts: string[] = [];
  for (let x = 0; x <= 1200; x += 5) {
    const swell = 1.8 + 4.8 * Math.pow(Math.sin((x / 1200) * Math.PI * 7), 2);
    const y = 9 + Math.sin(x * 0.12) * swell * 0.68 + Math.sin(x * 0.31) * swell * 0.2;
    parts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`);
  }
  return parts.join(" ");
}

const WAVE_PATH = makeWavePath();

function usePageProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(range > 0 ? Math.min(100, Math.max(0, (window.scrollY / range) * 100)) : 100);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

function PageProgress() {
  const progress = usePageProgress();
  return (
    <div className="page-progress" role="progressbar" aria-label="Page progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <svg className="page-progress__track" viewBox="0 0 1200 18" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} />
      </svg>
      <svg className="page-progress__value" viewBox="0 0 1200 18" preserveAspectRatio="none" aria-hidden="true" style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}>
        <path d={WAVE_PATH} />
      </svg>
    </div>
  );
}

function App() {
  const [motionEnabled, setMotionEnabled] = useState(() =>
    typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <PageProgress />
      <header className="site-header" id="top">
        <a href="#top" className="site-header__brand" aria-label="Metorom, back to top">METOROM<span className="site-header__brand-dot">.</span></a>
        <nav className="site-header__nav" aria-label="Main navigation">
          <a href="#system">System</a>
          <a href="#components">Components</a>
          <a href="#method">Method</a>
          <a href="#event">Event</a>
        </nav>
        <a className="site-header__original" href="../taste/index.html">Original study <span aria-hidden="true">↗</span></a>
      </header>

      <main id="main">
        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero__meta">
            <span>INDEPENDENT AUDIO DESIGN / KYOTO</span>
            <span>THREE-WAY LOUDSPEAKER STUDY</span>
          </div>
          <div className="hero__grid">
            <div className="hero__lead bento-tile">
              <span className="tile-eyebrow">METOROM / 001</span>
              <div className="hero__statement">
                <p className="hero__pretitle">An object for listening</p>
                <h1 id="hero-title"><span>LISTEN</span><span>CLOSER<span className="hero__period">.</span></span></h1>
              </div>
              <div className="hero__lead-bottom">
                <p>An evolving three-way monitor made to be heard, measured, and changed.</p>
                <a href="#system" className="text-link text-link--light">Explore the system <span aria-hidden="true">↘</span></a>
              </div>
            </div>
            <div className="hero__flow bento-tile">
              <HalftoneFlow className="hero__canvas" playing={motionEnabled} mode="dark" hue={0} saturation={1} brightness={1} />
              <div className="hero__flow-top"><span>FORM / FREQUENCY / FLOW</span><span>01—04</span></div>
              <div className="hero__flow-bottom">
                <p>A moving study in how sound occupies space.</p>
                <button type="button" className="motion-control" onClick={() => setMotionEnabled((value) => !value)}>
                  {motionEnabled ? "Pause motion" : "Play motion"} <span aria-hidden="true">{motionEnabled ? "Ⅱ" : "▷"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hero__foot"><span>SCROLL TO EXPLORE THE SYSTEM</span><span>LISTEN / MEASURE / REVISE</span></div>
        </section>

        <section className="system page-shell" id="system" aria-labelledby="system-label">
          <div className="section-heading section-heading--compact">
            <span className="section-index" id="system-label">01 / SYSTEM AT A GLANCE</span>
            <p>One object, several conversations between driver, cabinet, room, and listener.</p>
          </div>
          <StatsBento />
        </section>

        <section className="components page-shell" id="components" aria-labelledby="components-title">
          <div className="section-heading">
            <span className="section-index">02 / COMPONENTS</span>
            <h2 id="components-title">Built from<br /><em>clear parts.</em></h2>
            <p>Each path has a purpose. The interest lies in how they meet.</p>
          </div>
          <div className="component-grid">
            {drivers.map((driver) => (
              <article className={`component-card component-card--${driver.tone} bento-tile`} key={driver.number}>
                <div className="component-card__visual" aria-hidden="true">
                  <span className="component-card__visual-index">{driver.number}</span>
                  <span className="component-card__placeholder">PRODUCT IMAGE RESERVED</span>
                </div>
                <div className="component-card__content">
                  <span className="tile-eyebrow">{driver.designation}</span>
                  <h3>{driver.name}</h3>
                  <p>{driver.description}</p>
                  <details>
                    <summary>Read the detail <span aria-hidden="true">+</span></summary>
                    <p>{driver.detail}</p>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="method page-shell" id="method" aria-labelledby="method-title">
          <div className="section-heading section-heading--method">
            <span className="section-index">03 / METHOD</span>
            <h2 id="method-title">A route,<br /><em>not a formula.</em></h2>
            <p>The Silk Road is a metaphor for exchange. Different disciplines bring useful ideas into the same room.</p>
          </div>
          <div className="method-grid">
            {method.map((step) => (
              <article className="method-card bento-tile" key={step.number}>
                <span className="method-card__number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="method__note">Listening gives the measurements meaning. The next revision keeps the conversation open.</p>
        </section>

        <section className="event page-shell" id="event" aria-labelledby="event-title">
          <div className="section-heading section-heading--event">
            <span className="section-index">04 / LISTENING SESSION</span>
            <h2 id="event-title">Hear it<br /><em>in a room.</em></h2>
            <p>A small session around the three-way monitor is being planned. Hear the system, inspect its design, and join the conversation.</p>
          </div>
          <div className="event-grid">
            <a href={EVENT_URL} className="event-action bento-tile" aria-label="Explore the planned Metorom listening session">
              <span className="tile-eyebrow">AN INVITATION IN THE MAKING</span>
              <strong>COME<br />LISTEN<span>.</span></strong>
              <span className="event-action__foot">Explore the event <span aria-hidden="true">↗</span></span>
            </a>
            <div className="event-facts bento-tile">
              <h3>The details</h3>
              <dl>
                <div><dt>Date</dt><dd>To be announced</dd></div>
                <div><dt>Venue</dt><dd>To be announced</dd></div>
                <div><dt>Tickets</dt><dd>Details to follow</dd></div>
              </dl>
              <p>Planning is underway. The event page will carry confirmed details when they are ready.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-shell">
          <a className="site-footer__wordmark" href="#top" aria-label="Metorom, back to top">METOROM</a>
          <div className="site-footer__bottom">
            <p>Independent audio design.<br />Kyoto, Japan.</p>
            <div><a href="../taste/index.html">Original Taste study ↗</a><a href="../../index.html">All directions ↗</a></div>
          </div>
        </div>
      </footer>
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom root element is missing");
// Vite updates this entry module during design work; keep one React root.
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<App />);
