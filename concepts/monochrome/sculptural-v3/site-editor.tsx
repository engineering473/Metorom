import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "./language";
import { COPY_GROUPS, DEFAULT_COPY, DEFAULT_COPY_JA, type CopyKey, type SiteCopy } from "./site-copy";
import EditorPageSelect from "./editor-page-select";
import { loadPublishedPage, mergePublished, PublishControls, validateSpeakerImage } from "./published-copy";

const STORAGE_KEY = "metorom-sculptural-v3-preview-v1";
const LEGACY_PHILOSOPHY_KEY = "metorom-sculptural-preview-philosophy-v1";
export const COPY_MAX_LENGTH = 20000;

export function downloadPreviewJson(filename: string, settings: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Font = "Manrope" | "DM Sans" | "Barlow Condensed" | "Newsreader";
export type PreviewSettings = {
  copy: SiteCopy;
  copyJa: SiteCopy;
  displayFont: Font;
  bodyFont: Font;
  accent: string;
  imageScale: number;
};

const fonts: Font[] = ["Manrope", "DM Sans", "Barlow Condensed", "Newsreader"];
const defaults: PreviewSettings = {
  copy: DEFAULT_COPY,
  copyJa: DEFAULT_COPY_JA,
  displayFont: "Manrope",
  bodyFont: "Manrope",
  accent: "#101d8f",
  imageScale: 100,
};

function mergeCopy(base: SiteCopy, saved: Partial<SiteCopy> | undefined): SiteCopy {
  const copy = { ...base };
  for (const key of Object.keys(base) as CopyKey[]) {
    const value = saved?.[key];
    if (key === "indexRange" && (value === "01 — 04" || value === "01 — 05")) continue;
    if (typeof value === "string") copy[key] = value;
  }
  return copy;
}

function legacyPhilosophyCopy(value: unknown): Partial<SiteCopy> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const fields = {
    heroTitle: "philosophyTitle",
    openingStatement: "philosophyStatement",
    openingBody: "philosophyIntroduction",
    statementBody: "philosophyBody",
  } as const;
  const result: Partial<SiteCopy> = {};
  for (const [oldKey, newKey] of Object.entries(fields)) {
    if (typeof source[oldKey] === "string") result[newKey as CopyKey] = source[oldKey] as string;
  }
  return result;
}

function readLegacyPhilosophyDraft(): { en: Partial<SiteCopy>; ja: Partial<SiteCopy> } {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_PHILOSOPHY_KEY) ?? "null") as { en?: unknown; ja?: unknown } | null;
    return { en: legacyPhilosophyCopy(saved?.en), ja: legacyPhilosophyCopy(saved?.ja) };
  } catch { return { en: {}, ja: {} }; }
}

function readSettings(): PreviewSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<PreviewSettings> | null;
    const legacy = readLegacyPhilosophyDraft();
    return {
      // The original `copy` object remains English, preserving earlier preview edits.
      copy: mergeCopy(mergeCopy(DEFAULT_COPY, legacy.en), saved?.copy),
      copyJa: mergeCopy(mergeCopy(DEFAULT_COPY_JA, legacy.ja), saved?.copyJa),
      displayFont: fonts.includes(saved?.displayFont as Font) ? saved?.displayFont as Font : defaults.displayFont,
      bodyFont: fonts.includes(saved?.bodyFont as Font) ? saved?.bodyFont as Font : defaults.bodyFont,
      accent: typeof saved?.accent === "string" && /^#[0-9a-f]{6}$/i.test(saved.accent) ? saved.accent : defaults.accent,
      imageScale: typeof saved?.imageScale === "number" && Number.isFinite(saved.imageScale)
        ? Math.min(108, Math.max(80, saved.imageScale)) : defaults.imageScale,
    };
  } catch {
    return defaults;
  }
}

export function useSitePreview() {
  const enabled = new URLSearchParams(window.location.search).get("edit") === "1";
  const hadDraft = useRef((() => { try { return enabled && localStorage.getItem(STORAGE_KEY) !== null; } catch { return false; } })());
  const [settings, setSettings] = useState<PreviewSettings>(() => enabled ? readSettings() : defaults);

  useEffect(() => {
    let active = true;
    void Promise.all([loadPublishedPage("home"), loadPublishedPage("philosophy")]).then(([published, formerPhilosophy]) => {
      if (!active || hadDraft.current) return;
      const legacyDraft = enabled ? readLegacyPhilosophyDraft() : { en: {}, ja: {} };
      setSettings((current) => ({ ...current,
        copy: mergeCopy(mergeCopy(mergeCopy(DEFAULT_COPY, legacyPhilosophyCopy(formerPhilosophy.en)), published.en), legacyDraft.en),
        copyJa: mergeCopy(mergeCopy(mergeCopy(DEFAULT_COPY_JA, legacyPhilosophyCopy(formerPhilosophy.ja)), published.ja), legacyDraft.ja),
      }));
    }).catch(() => { /* Built-in text remains available offline. */ });
    return () => { active = false; };
  }, [enabled]);

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

export function SiteEditor({ settings, onChange, galleryFiles, onGalleryFileChange }: { settings: PreviewSettings; onChange: (value: PreviewSettings) => void; galleryFiles: Record<number, File>; onGalleryFileChange: (slot: number, file: File) => void }) {
  const enabled = new URLSearchParams(window.location.search).get("edit") === "1";
  const [language, setLanguage] = useLanguage();
  const [open, setOpen] = useState(enabled);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [focusedKey, setFocusedKey] = useState<CopyKey | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!enabled) return null;

  const activeCopy = language === "ja" ? settings.copyJa : settings.copy;
  const query = search.trim().toLowerCase();
  const groups = COPY_GROUPS.map((group) => ({ ...group, fields: group.fields.filter(([key, label]) =>
    key === focusedKey || `${group.label} ${key} ${label} ${activeCopy[key]}`.toLowerCase().includes(query)) })).filter((group) => group.fields.length > 0);
  const fieldCount = groups.reduce((count, group) => count + group.fields.length, 0);
  const galleryUploads = Object.entries(galleryFiles).map(([slot, file]) => ({ slot: Number(slot), file }));
  const updateCopy = (key: CopyKey, value: string) => onChange(language === "ja"
    ? { ...settings, copyJa: { ...settings.copyJa, [key]: value } }
    : { ...settings, copy: { ...settings.copy, [key]: value } });
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
        <p className="sc-editor__help">Changes appear immediately. Publish this page’s text when you are ready; your draft stays in this browser until then.</p>
        <EditorPageSelect page="home" />
        <div className="sc-editor__languages" role="group" aria-label="Language to edit">
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
          <button type="button" aria-pressed={language === "ja"} onClick={() => setLanguage("ja")}>日本語</button>
        </div>
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
        <label className="sc-editor__search">Find text
          <input type="search" placeholder="Search sections, labels, or page text" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <p className="sc-editor__count">{fieldCount} text fields · {language === "ja" ? "Japanese" : "English"}</p>
        <div className="sc-editor__copy">
          {groups.map((group, groupIndex) => <details key={group.label} open={Boolean(query) || groupIndex === 0}>
            <summary>{group.label}</summary>
            {group.fields.map(([key, label]) => <label key={key}>{label}
              <textarea rows={key === "philosophyBody" ? 10 : key.endsWith("Title") ? 2 : 3} maxLength={COPY_MAX_LENGTH} value={activeCopy[key]} onFocus={() => setFocusedKey(key)} onBlur={() => setFocusedKey(null)} onChange={(event) => updateCopy(key, event.target.value)} />
            </label>)}
          </details>)}
        </div>
        <div className="sc-editor__gallery">
          <h3>Speaker photos</h3>
          <p>Choose an image for each gallery position. Your selection previews here and stays in this tab until you publish with your GitHub token. JPG, PNG, WebP, or AVIF, up to 8 MB each.</p>
          {([1, 2, 3, 4, 5] as const).map((slot) => <label key={slot}>Speaker image {slot}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const error = validateSpeakerImage(file);
              if (error) { setMessage(`Image ${slot}: ${error}`); event.target.value = ""; return; }
              onGalleryFileChange(slot, file);
              setMessage(`Image ${slot} is ready to publish.`);
            }} />
            {galleryFiles[slot] && <span>{galleryFiles[slot].name}</span>}
          </label>)}
        </div>
        <div className="sc-editor__actions">
          <button type="button" onClick={() => void copySettings()}>Copy settings</button>
          <button type="button" onClick={() => { downloadPreviewJson("metorom-home-preview.json", settings); setMessage("Preview settings exported as JSON."); }}>Export JSON</button>
          <button type="button" onClick={() => { onChange(defaults); setMessage("Preview reset to the published design."); }}>Reset</button>
        </div>
        <PublishControls page="home" settings={{ version: 1, en: settings.copy, ja: settings.copyJa }} uploads={galleryUploads} onSuccess={() => localStorage.removeItem(STORAGE_KEY)} />
        <a className="sc-editor__exit" href={window.location.pathname + window.location.hash}>Exit preview and view the published design</a>
        {message && <p className="sc-editor__message" role="status">{message}</p>}
      </aside>}
    </div>
  );
}
