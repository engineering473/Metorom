import { useEffect, useRef, useState, type FormEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import { Navbar1 } from "@/components/ui/navbar-1";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import "./styles.css";
import "./contact.css";

const EMAIL = "engineering@metorom.com";
const conversations = [
  { title: "Come listen", copy: "Ask about a future listening session with the three-way monitor.", action: "Ask about listening", subject: "Metorom: Listening session" },
  { title: "Make something", copy: "Tell us about a space, collaboration, or idea that could shape the project.", action: "Start a collaboration", subject: "Metorom: Collaboration" },
  { title: "Get technical", copy: "Ask about acoustic design, measurements, components, or construction.", action: "Ask a technical question", subject: "Metorom: Engineering question" },
] as const;

function Contact() {
  const [topic, setTopic] = useState<string>(conversations[0].subject);
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
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

  const draftBody = [message.trim(), "", name.trim(), `Reply to: ${replyTo.trim()}`].join("\n");
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(draftBody)}`;
  const draft = [`To: ${EMAIL}`, `Subject: ${topic}`, "", draftBody].join("\n");

  function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Your email app should open with a draft. If it does not, use Copy message below.");
    window.location.href = mailto;
  }

  async function copyMessage() {
    if (!form.current?.reportValidity()) return;
    try {
      await navigator.clipboard.writeText(draft);
      setStatus("Message copied. Paste it into your email app to send it to engineering@metorom.com.");
    } catch {
      setStatus("Copy is unavailable here. Select the email address above and write to us from your email app.");
    }
  }

  return (
    <>
      <Navbar1 contact />
      <main id="main" className="sc-contact-page">
        <section className="sc-contact-hero" id="top" aria-labelledby="sc-contact-title">
          <div className="sc-contact-hero__copy">
            <div className="sc-contact-hero__meta"><span>METOROM / KYOTO, JAPAN</span><span>AN OPEN CHANNEL</span></div>
            <h1 id="sc-contact-title">A conversation<br />starts here.</h1>
            <div className="sc-contact-hero__bottom"><p>Have a room, a question, or an idea in mind? We would like to hear it.</p><a className="sc-outline-link" href="#sc-contact-compose">Start your message <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
          <div className="sc-contact-hero__globe">
            <div className="sc-contact-hero__globe-top"><span>WHERE THE WORK BEGINS</span><span>35° 00′ N / 135° 46′ E</span></div>
            <RotatingEarth className="sc-contact-hero__earth" />
            <div className="sc-contact-hero__globe-bottom"><span>KYOTO, JAPAN</span><span>DRAG TO EXPLORE</span></div>
          </div>
        </section>

        <section className="sc-contact-main sc-shell" aria-labelledby="sc-channel-title">
          <span className="sc-rail-label">AN OPEN CHANNEL</span>
          <div>
            <div className="sc-contact-main__heading"><h2 id="sc-channel-title">Tell us what<br />you’re hearing.</h2><p>Metorom develops through listening, measurement, and exchange. A message can start any of those conversations.</p></div>
            <a className="sc-contact-main__email" href={`mailto:${EMAIL}`}><span>DIRECT EMAIL</span><strong>{EMAIL}</strong><ArrowUpRight size={32} aria-hidden="true" /></a>
            <div className="sc-contact-main__list" aria-label="Ways to get in touch">
              {conversations.map((item) => (
                <a href="#sc-contact-compose" key={item.title} onClick={() => { setTopic(item.subject); setStatus(""); }}>
                  <strong>{item.title}</strong><span>{item.copy}</span><small>{item.action}<ArrowUpRight size={16} aria-hidden="true" /></small>
                </a>
              ))}
            </div>

            <form ref={form} className="sc-contact-form" id="sc-contact-compose" onSubmit={openEmail} aria-labelledby="sc-contact-form-title">
              <div className="sc-contact-form__intro">
                <h3 id="sc-contact-form-title">Put it into words.</h3>
                <p>Your email app will prepare this message. You can review it before sending, or copy the draft to use elsewhere.</p>
              </div>
              <div className="sc-contact-form__fields">
                <label>What is it about?
                  <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                    {conversations.map((item) => <option value={item.subject} key={item.subject}>{item.title}</option>)}
                    <option value="Metorom: General enquiry">Something else</option>
                  </select>
                </label>
                <div className="sc-contact-form__row">
                  <label>Your name<input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
                  <label>Your email<input type="email" autoComplete="email" value={replyTo} onChange={(event) => setReplyTo(event.target.value)} required /></label>
                </div>
                <label>Your message<textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
              </div>
              <div className="sc-contact-form__actions">
                <button className="sc-contact-form__submit" type="submit">Open email app <ArrowUpRight size={17} aria-hidden="true" /></button>
                <button className="sc-contact-form__copy" type="button" onClick={copyMessage}>Copy message</button>
              </div>
              <p className="sc-contact-form__status" role="status" aria-live="polite">{status}</p>
            </form>
          </div>
        </section>

        <section className="sc-contact-close sc-shell"><span className="sc-rail-label">LISTENING SESSION</span><div><h2>Meet in a room.</h2><p>A listening session is being planned. The venue and date will be shared when confirmed.</p><a className="sc-outline-link" href="./event.html">Explore the event <ArrowUpRight size={17} aria-hidden="true" /></a></div></section>
      </main>
      <footer className="sc-footer"><a href="./index.html" className="sc-footer__wordmark" aria-label="Back to Metorom study">METOROM</a><div><span>INDEPENDENT AUDIO DESIGN / KYOTO</span><a href="./index.html">BACK TO THE STUDY <ArrowUpRight size={15} aria-hidden="true" /></a></div></footer>
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Metorom conversation root element is missing");
const root: Root = (import.meta.hot?.data.root as Root | undefined) ?? createRoot(rootElement);
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<Contact />);
