import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "metorom-sculptural-preview-v1";

const copyGroups = [
  { label: "Opening", fields: [
    ["heroTitle", "Hero headline"], ["heroBody", "Hero introduction"], ["heroButton", "Hero button"],
    ["ideaTitle", "Idea headline"], ["ideaBody", "Idea text"],
  ] },
  { label: "Object and construction", fields: [
    ["objectTitle", "Object headline"], ["objectBody", "Object text"],
    ["architectureTitle", "Architecture headline"], ["architectureBody", "Architecture text"],
  ] },
  { label: "Listening and next steps", fields: [
    ["measurementTitle", "Measurement headline"], ["measurementBody", "Measurement text"],
    ["listeningTitle", "Listening headline"], ["listeningBody", "Listening text"], ["listeningButton", "Listening button"],
    ["futureTitle", "Future works headline"], ["futureBody", "Future works text"], ["futureButton", "Future works button"],
    ["conversationTitle", "Conversation headline"], ["conversationBody", "Conversation text"], ["conversationButton", "Conversation button"],
  ] },
] as const;

export const DEFAULT_COPY = {
  heroTitle: "Sound, given\na shape.",
  heroBody: "One loudspeaker. Three acoustic paths. Designed to be examined as closely as it is heard.",
  heroButton: "Explore the object",
  ideaTitle: "Every element\nhas a purpose.",
  ideaBody: "Metorom is a modular monitor. Its parts remain visible because the relationships between them matter: driver, cabinet, room, and listener.",
  objectTitle: "The object\nin the room.",
  objectBody: "The horn, midrange drivers, and lower cabinet make one clear system. Scroll to follow the speaker from front to back and over the top.",
  architectureTitle: "Open construction.",
  architectureBody: "Each acoustic path has a role. The modular structure leaves room for listening, measurement, and revision.",
  measurementTitle: "Measured.\nThen listened to.",
  measurementBody: "Frequency response and horizontal directivity show how a change behaves. Listening in a room tells us what that change means.",
  listeningTitle: "Come closer\nto the sound.",
  listeningBody: "A small listening session around the three-way monitor is being prepared. Hear the system in a room, see how it is built, and join the conversation.",
  listeningButton: "Explore the listening event",
  futureTitle: "Future works.",
  futureBody: "A notebook of possible directions for the object, the room, and the exchanges around them. These are open questions, not announced products.",
  futureButton: "Explore future works",
  conversationTitle: "Keep the\nconversation open.",
  conversationBody: "Questions about the build, a future listening session, or a possible collaboration? There is a place to start.",
  conversationButton: "Start a conversation",
};

export type CopyKey = keyof typeof DEFAULT_COPY;
export type SiteCopy = Record<CopyKey, string>;
type Font = "Manrope" | "DM Sans" | "Barlow Condensed" | "Newsreader";
export type PreviewSettings = {
  copy: SiteCopy;
  displayFont: Font;
  bodyFont: Font;
  accent: string;
  imageScale: number;
};

const fonts: Font[] = ["Manrope", "DM Sans", "Barlow Condensed", "Newsreader"];
const defaults: PreviewSettings = {
  copy: DEFAULT_COPY,
  displayFont: "Manrope",
  bodyFont: "Manrope",
  accent: "#2b604b",
  imageScale: 100,
};

function readSettings(): PreviewSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<PreviewSettings> | null;
    if (!saved || typeof saved !== "object") return defaults;
    const copy = { ...DEFAULT_COPY };
    for (const key of Object.keys(DEFAULT_COPY) as CopyKey[]) {
      const value = saved.copy?.[key];
      if (typeof value === "string") copy[key] = value.slice(0, 500);
    }
    return {
      copy,
      displayFont: fonts.includes(saved.displayFont as Font) ? saved.displayFont as Font : defaults.displayFont,
      bodyFont: fonts.includes(saved.bodyFont as Font) ? saved.bodyFont as Font : defaults.bodyFont,
      accent: typeof saved.accent === "string" && /^#[0-9a-f]{6}$/i.test(saved.accent) ? saved.accent : defaults.accent,
      imageScale: typeof saved.imageScale === "number" && Number.isFinite(saved.imageScale)
        ? Math.min(108, Math.max(80, saved.imageScale)) : defaults.imageScale,
    };
  } catch {
    return defaults;
  }
}

export function useSitePreview() {
  const enabled = new URLSearchParams(window.location.search).get("edit") === "1";
  const [settings, setSettings] = useState<PreviewSettings>(() => enabled ? readSettings() : defaults);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sc-display-font", `"${settings.displayFont}", sans-serif`);
    root.style.setProperty("--sc-body-font", `"${settings.bodyFont}", sans-serif`);
    root.style.setProperty("--sc-accent", settings.accent);
    root.style.setProperty("--sc-hero-scale", String(settings.imageScale / 100));
    if (enabled) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* The preview still works if storage is unavailable. */ }
    }
  }, [enabled, settings]);

  return [settings, setSettings] as const;
}

export function SiteEditor({ settings, onChange }: { settings: PreviewSettings; onChange: (value: PreviewSettings) => void }) {
  const enabled = new URLSearchParams(window.location.search).get("edit") === "1";
  const [open, setOpen] = useState(enabled);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!enabled) return null;

  const updateCopy = (key: CopyKey, value: string) => onChange({ ...settings, copy: { ...settings.copy, [key]: value } });
  const copySettings = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setMessage("Preview settings copied. Paste them into our chat when you want to publish changes.");
    } catch {
      setMessage("Clipboard access was blocked. Your preview is still saved in this browser.");
    }
  };

  return (
    <div className="sc-editor" data-site-editor>
      <button className="sc-editor__toggle" type="button" aria-controls="sc-editor-panel" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Close editor" : "Edit preview"}
      </button>
      {open && <aside id="sc-editor-panel" className="sc-editor__panel" aria-label="Site preview editor">
        <div className="sc-editor__heading"><span>METOROM / PREVIEW</span><button type="button" onClick={() => setOpen(false)} aria-label="Close editor"><X size={18} aria-hidden="true" /></button></div>
        <h2>Edit this page</h2>
        <p className="sc-editor__help">Changes appear immediately and stay on this browser. They do not publish to the public site.</p>
        <div className="sc-editor__controls">
          <label>Display font
            <select value={settings.displayFont} onChange={(event) => onChange({ ...settings, displayFont: event.target.value as Font })}>
              {fonts.map((font) => <option key={font} value={font}>{font}</option>)}
            </select>
          </label>
          <label>Body font
            <select value={settings.bodyFont} onChange={(event) => onChange({ ...settings, bodyFont: event.target.value as Font })}>
              {fonts.map((font) => <option key={font} value={font}>{font}</option>)}
            </select>
          </label>
          <label className="sc-editor__color">Accent color
            <input type="color" value={settings.accent} onChange={(event) => onChange({ ...settings, accent: event.target.value })} />
          </label>
          <label>Hero image size <output>{settings.imageScale}%</output>
            <input type="range" min="80" max="108" value={settings.imageScale} onChange={(event) => onChange({ ...settings, imageScale: Number(event.target.value) })} />
          </label>
        </div>
        <div className="sc-editor__copy">
          {copyGroups.map((group, groupIndex) => <details key={group.label} open={groupIndex === 0}>
            <summary>{group.label}</summary>
            {group.fields.map(([key, label]) => <label key={key}>{label}
              <textarea rows={key.endsWith("Title") ? 2 : 3} maxLength={500} value={settings.copy[key]} onChange={(event) => updateCopy(key, event.target.value)} />
            </label>)}
          </details>)}
        </div>
        <div className="sc-editor__actions">
          <button type="button" onClick={() => void copySettings()}>Copy settings</button>
          <button type="button" onClick={() => { onChange(defaults); setMessage("Preview reset to the published design."); }}>Reset</button>
        </div>
        <a className="sc-editor__exit" href={window.location.pathname + window.location.hash}>Exit preview and view the published design</a>
        {message && <p className="sc-editor__message" role="status">{message}</p>}
      </aside>}
    </div>
  );
}
