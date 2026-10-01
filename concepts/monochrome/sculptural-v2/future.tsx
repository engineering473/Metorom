import { createRoot, type Root } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Navbar1 } from "@/components/ui/navbar-1";
import "./styles.css";
import "./future.css";

const inquiries = [
  {
    field: "THE OBJECT",
    title: "Form can keep changing.",
    description: "How might the next arrangement make assembly, adjustment, and the three acoustic paths easier to understand?",
    figure: "form",
    figureLabel: "Possible configurations",
  },
  {
    field: "THE ROOM",
    title: "Sound belongs to a space.",
    description: "What can listening in different rooms reveal that a measurement alone cannot hold?",
    figure: "room",
    figureLabel: "Listening in space",
  },
  {
    field: "THE EXCHANGE",
    title: "Ideas travel between people.",
    description: "Which observations from listeners and collaborators deserve to shape a later study?",
    figure: "exchange",
    figureLabel: "An open conversation",
  },
] as const;

function StudyFigure({ kind, label }: { kind: (typeof inquiries)[number]["figure"]; label: string }) {
  return (
    <div className={`sc-future-figure sc-future-figure--${kind}`} aria-hidden="true">
      <svg viewBox="0 0 420 255" focusable="false">
        {kind === "form" && (
          <>
            <g className="sc-future-figure__fine">
              <rect x="92" y="31" width="144" height="184" rx="4" />
              <rect x="184" y="41" width="144" height="184" rx="4" />
              <path d="M92 31 184 41M236 31 328 41M236 215 328 225M92 215 184 225" />
              <circle cx="163" cy="91" r="22" /><circle cx="163" cy="160" r="35" />
              <circle cx="256" cy="101" r="22" /><circle cx="256" cy="170" r="35" />
            </g>
            <path className="sc-future-figure__signal" d="M30 127h43m276 0h41" />
          </>
        )}
        {kind === "room" && (
          <>
            <g className="sc-future-figure__fine">
              <path d="M20 228h380M52 194V34h316v160" />
              <path d="M210 74v82m-27-82h54m-54 82h54" />
              <path d="M136 125c25-40 120-40 146 0M104 125c37-74 175-74 212 0M68 125C115 12 305 12 352 125" />
              <path d="M136 125c25 40 120 40 146 0M104 125c37 74 175 74 212 0" />
            </g>
            <circle className="sc-future-figure__point" cx="210" cy="125" r="5" />
          </>
        )}
        {kind === "exchange" && (
          <>
            <g className="sc-future-figure__fine">
              <circle cx="95" cy="129" r="32" /><circle cx="210" cy="62" r="32" /><circle cx="325" cy="129" r="32" /><circle cx="210" cy="196" r="32" />
              <path d="m123 112 59-34m56 0 59 34m0 34-59 34m-56 0-59-34" />
              <path d="M127 129h166M210 94v70" />
            </g>
            <circle className="sc-future-figure__point" cx="210" cy="129" r="5" />
          </>
        )}
      </svg>
      <span>{label}</span>
    </div>
  );
}

function FutureWorks() {
  return (
    <>
      <Navbar1 contact />
      <main id="main" className="sc-future-page">
        <section className="sc-future-hero" id="top" aria-labelledby="sc-future-title">
          <div className="sc-future-hero__copy">
            <div className="sc-future-hero__meta"><span>METOROM / KYOTO, JAPAN</span><span>AN OPEN INDEX</span></div>
            <div className="sc-future-hero__statement">
              <h1 id="sc-future-title">Future<br />works.</h1>
              <p>The present object is one point in a longer conversation. These are questions for what could be explored next.</p>
              <a className="sc-outline-link" href="#studies">Browse the ideas <ArrowDownRight size={17} aria-hidden="true" /></a>
            </div>
            <p className="sc-future-hero__qualification">Speculative studies / no products or dates announced</p>
          </div>
          <div className="sc-future-hero__drawing" aria-hidden="true">
            <svg viewBox="0 0 660 740" preserveAspectRatio="xMidYMid slice" focusable="false">
              <path d="M-20 75C127 30 221 35 334 95S558 170 684 123" />
              <path d="M-20 124C127 79 221 84 334 144S558 219 684 172" />
              <path d="M-20 173C127 128 221 133 334 193S558 268 684 221" />
              <path d="M-20 222C127 177 221 182 334 242S558 317 684 270" />
              <path d="M-20 271C127 226 221 231 334 291S558 366 684 319" />
              <path d="M-20 320C127 275 221 280 334 340S558 415 684 368" />
              <path d="M-20 369C127 324 221 329 334 389S558 464 684 417" />
              <path d="M-20 418C127 373 221 378 334 438S558 513 684 466" />
              <path d="M-20 467C127 422 221 427 334 487S558 562 684 515" />
              <path d="M-20 516C127 471 221 476 334 536S558 611 684 564" />
              <path d="M-20 565C127 520 221 525 334 585S558 660 684 613" />
              <path d="M-20 614C127 569 221 574 334 634S558 709 684 662" />
              <path d="M-20 663C127 618 221 623 334 683S558 758 684 711" />
            </svg>
            <span>NOT A ROADMAP / A WORKING NOTEBOOK</span>
          </div>
        </section>

        <section className="sc-future-intro sc-shell" aria-labelledby="sc-future-intro-title">
          <span className="sc-rail-label">A NOTE ON WHAT FOLLOWS</span>
          <div>
            <h2 id="sc-future-intro-title">Nothing here is<br />finished yet.</h2>
            <p>This page holds illustrative directions for future work. They are open questions, not a release plan, specification, or promise. As real studies take shape, this index can become their home.</p>
          </div>
        </section>

        <section className="sc-future-studies sc-shell" id="studies" aria-labelledby="sc-future-studies-title">
          <span className="sc-rail-label">POSSIBLE DIRECTIONS</span>
          <div className="sc-future-studies__body">
            <div className="sc-future-studies__heading">
              <h2 id="sc-future-studies-title">Questions worth<br />returning to.</h2>
              <p>Three starting points for an evolving instrument. Each is a placeholder for work still to be defined.</p>
            </div>
            <div className="sc-future-studies__list">
              {inquiries.map((inquiry) => (
                <article className="sc-future-study" key={inquiry.field}>
                  <div className="sc-future-study__meta"><span>{inquiry.field}</span><span>OPEN QUESTION</span></div>
                  <div className="sc-future-study__copy"><h3>{inquiry.title}</h3><p>{inquiry.description}</p></div>
                  <StudyFigure kind={inquiry.figure} label={inquiry.figureLabel} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sc-future-close sc-shell" aria-labelledby="sc-future-close-title">
          <span className="sc-rail-label">THE CONVERSATION CONTINUES</span>
          <div>
            <h2 id="sc-future-close-title">What should we<br />explore next?</h2>
            <p>Questions, perspectives, and first-hand listening all have a place in the work.</p>
            <div className="sc-future-close__links">
              <a className="sc-outline-link" href="./contact.html#sc-contact-compose">Start a conversation <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a className="sc-future-close__secondary" href="./event.html">Explore the listening event <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
      </main>
      <footer className="sc-footer"><a href="./index.html" className="sc-footer__wordmark" aria-label="Back to Metorom study">METOROM</a><div><span>INDEPENDENT AUDIO DESIGN / KYOTO</span><a href="./index.html">BACK TO THE STUDY <ArrowUpRight size={15} aria-hidden="true" /></a></div></footer>
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom Future Works root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<FutureWorks />);
