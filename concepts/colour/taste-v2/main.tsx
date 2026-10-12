import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import HalftoneFlow from "@/components/ui/halftone-flow";
import SiteChrome from "@/components/ui/site-chrome";
import SpeakerViewer from "@/components/ui/speaker-viewer";
import StatsBento from "@/components/ui/stats-bento";
import "./styles.css";

const EVENT_URL = "../../../versions/atelier/event.html";
const ROOM_IMAGE = `${import.meta.env.BASE_URL}images/taste-v2/benihibata-room.webp`;
const EARTH_IMAGE = `${import.meta.env.BASE_URL}images/taste-v2/rikyucha-room.webp`;
const LISTENER_IMAGE = `${import.meta.env.BASE_URL}images/taste-v2/listener-speaker.webp`;

const drivers = [
  {
    number: "01",
    name: "The voice",
    designation: "Alpha 6A / midrange",
    description: "A dedicated acoustic path for the part of music we hear most directly.",
    detail: "The current design places 608 mm between the midrange units. Their position is listened to and measured as part of the complete system.",
    tone: "warm",
    image: EARTH_IMAGE,
    visualLabel: "MIDRANGE / IN CONTEXT",
  },
  {
    number: "02",
    name: "The reach",
    designation: "BMS 4540ND / horn",
    description: "A compression driver and horn shape how high frequencies travel into the room.",
    detail: "Horizontal directivity measurements help us understand the system beyond a single listening position.",
    tone: "rust",
    image: ROOM_IMAGE,
    visualLabel: "HORN / IN CONTEXT",
  },
  {
    number: "03",
    name: "The weight",
    designation: "LAB 12 / low frequency",
    description: "A low-frequency foundation considered with the cabinet and the room around it.",
    detail: "Its role is tuned alongside the other paths. The system is designed as a whole, rather than as a collection of separate drivers.",
    tone: "ink",
    image: LISTENER_IMAGE,
    visualLabel: "LOW END / LISTENING SCALE",
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

function App() {
  const [motionEnabled, setMotionEnabled] = useState(() =>
    typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SiteChrome />

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

        <div className="hero-bridge page-shell" data-reveal aria-hidden="true">
          <span>FROM SOUND TO OBJECT</span><span className="hero-bridge__rule" /><span>↓</span>
        </div>

        <section className="system page-shell" id="system" aria-labelledby="system-label">
          <div className="section-heading section-heading--compact" data-reveal>
            <span className="section-index" id="system-label">01 / SYSTEM AT A GLANCE</span>
            <p>One object, several conversations between driver, cabinet, room, and listener.</p>
          </div>
          <div data-reveal><StatsBento /></div>
          <figure className="system-scene bento-tile" data-reveal>
            <img src={ROOM_IMAGE} alt="Rust-coloured Metorom speaker set among dense green foliage" width="1600" height="900" loading="lazy" decoding="async" />
            <figcaption><span>01 / A SYSTEM IN SPACE</span><span>FORM FOLLOWS THE WAY WE LISTEN</span></figcaption>
          </figure>
        </section>

        <SpeakerViewer />

        <section className="components page-shell" id="components" aria-labelledby="components-title">
          <div className="section-heading" data-reveal>
            <span className="section-index">02 / COMPONENTS</span>
            <h2 id="components-title">Built from<br /><em>clear parts.</em></h2>
            <p>Each path has a purpose. The interest lies in how they meet.</p>
          </div>
          <div className="component-grid" data-reveal>
            {drivers.map((driver) => (
              <article className={`component-card component-card--${driver.tone} bento-tile`} key={driver.number}>
                <div className="component-card__visual" aria-hidden="true">
                  <img src={driver.image} alt="" loading="lazy" decoding="async" />
                  <span className="component-card__visual-index">{driver.number}</span>
                  <span className="component-card__visual-label">{driver.visualLabel}</span>
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
          <div className="section-heading section-heading--method" data-reveal>
            <span className="section-index">03 / METHOD</span>
            <h2 id="method-title">A route,<br /><em>not a formula.</em></h2>
            <p>The Silk Road is a metaphor for exchange. Different disciplines bring useful ideas into the same room.</p>
          </div>
          <div className="method-grid" data-reveal>
            {method.map((step) => (
              <article className="method-card bento-tile" key={step.number}>
                <span className="method-card__number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
            <div className="method-image bento-tile">
              <img src={EARTH_IMAGE} alt="Earth-toned Metorom monitor among tropical foliage" width="1200" height="675" loading="lazy" decoding="async" />
              <span>AN OBJECT IN CONTEXT / 001</span>
            </div>
            <div className="method-inset bento-tile">
              <span>TATAMI STUDY / 04</span>
              <p>Each part finds its place in relation to the others.</p>
              <div className="method-inset__pattern" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            </div>
          </div>
          <p className="method__note">Listening gives the measurements meaning. The next revision keeps the conversation open.</p>
        </section>

        <section className="event page-shell" id="event" aria-labelledby="event-title">
          <div className="section-heading section-heading--event" data-reveal>
            <span className="section-index">04 / LISTENING SESSION</span>
            <h2 id="event-title">Hear it<br /><em>in a room.</em></h2>
            <p>A small session around the three-way monitor is being planned. Hear the system, inspect its design, and join the conversation.</p>
          </div>
          <div className="event-grid" data-reveal>
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

        <section className="contact-teaser page-shell" aria-labelledby="contact-teaser-title" data-reveal>
          <div className="contact-teaser__panel bento-tile">
            <span className="section-index">05 / CONTACT · KYOTO, JAPAN</span>
            <h2 id="contact-teaser-title">KEEP THE<br /><em>CONVERSATION.</em></h2>
            <a href="./contact.html">Contact Metorom <span aria-hidden="true">↗</span></a>
          </div>
          <div className="contact-teaser__visual bento-tile">
            <img src={LISTENER_IMAGE} alt="Illustration of a listener facing a Metorom speaker" width="1400" height="800" loading="lazy" decoding="async" />
            <span>LISTENING BEGINS WITH A PERSON</span>
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
