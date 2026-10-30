import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "./language";
import { pageCopyGroup, publishedSharedCopy, readSharedPreviewCopy } from "./page-copy";
import { COPY_MAX_LENGTH, downloadPreviewJson } from "./site-editor";
import EditorPageSelect from "./editor-page-select";
import { loadPublishedPage, mergePublished, PublishControls } from "./published-copy";
import { EditorPortal } from "./editor-surface";

type TextCopy = Record<string, string>;
type PageSettings<T extends TextCopy> = { en: T; ja: T };

function merge<T extends TextCopy>(base: T, saved: Partial<T> | undefined): T {
  const result = { ...base };
  for (const key of Object.keys(base) as (keyof T)[]) {
    const value = saved?.[key];
    if (typeof value === "string") result[key] = value as T[keyof T];
  }
  return result;
}

export function usePagePreview<T extends TextCopy>(page: string, english: T, japanese: T) {
  const enabled = new URLSearchParams(window.location.search).get("edit") === "1";
  const [language] = useLanguage();
  const storageKey = `metorom-sculptural-v3-preview-${page}-v1`;
  const hadDraft = useRef((() => { try { return enabled && localStorage.getItem(storageKey) !== null; } catch { return false; } })());
  const [settings, setSettings] = useState<PageSettings<T>>(() => {
    if (!enabled) return { en: english, ja: japanese };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<PageSettings<T>> | null;
      const migrate = (copy: Partial<T> | undefined): Partial<T> | undefined => {
        if (page === "event" && typeof copy?.toBeAnnounced === "string" && typeof copy.whereValue !== "string") {
          return { ...copy, whereValue: copy.toBeAnnounced } as Partial<T>;
        }
        return copy;
      };
      return {
        en: merge(english, { ...readSharedPreviewCopy("en"), ...migrate(saved?.en) } as Partial<T>),
        ja: merge(japanese, { ...readSharedPreviewCopy("ja"), ...migrate(saved?.ja) } as Partial<T>),
      };
    } catch {
      return { en: english, ja: japanese };
    }
  });

  useEffect(() => {
    let active = true;
    void Promise.all([loadPublishedPage("home"), loadPublishedPage(page)]).then(([home, published]) => {
      if (!active || hadDraft.current) return;
      setSettings({
        en: mergePublished(mergePublished(english, publishedSharedCopy(home.en)), published.en),
        ja: mergePublished(mergePublished(japanese, publishedSharedCopy(home.ja)), published.ja),
      });
    }).catch(() => { /* Built-in text remains available offline. */ });
    return () => { active = false; };
  }, [page, english, japanese]);

  useEffect(() => {
    if (!enabled) return;
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); }
    catch { /* Editing still works for this visit. */ }
  }, [enabled, storageKey, settings]);

  return [language === "ja" ? settings.ja : settings.en, settings, setSettings] as const;
}

export function PageEditor<T extends TextCopy>({ page, settings, onChange, english, japanese }: {
  page: string;
  settings: PageSettings<T>;
  onChange: (settings: PageSettings<T>) => void;
  english: T;
  japanese: T;
}) {
  const enabled = new URLSearchParams(window.location.search).get("edit") === "1";
  const [language, setLanguage] = useLanguage();
  const [open, setOpen] = useState(enabled);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!enabled) return null;

  const copy = language === "ja" ? settings.ja : settings.en;
  const fieldLabel = (key: string) => {
    if (page === "event" && key === "toBeAnnounced") return "Date & time value";
    if (page === "event" && key === "detailsToFollow") return "Entry value";
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
  };
  const query = search.trim().toLowerCase();
  const groupedFields = new Map<string, string[]>();
  for (const key of Object.keys(english)) {
    const group = pageCopyGroup(key, page);
    if (key !== focusedKey && !`${group} ${key} ${fieldLabel(key)} ${copy[key]}`.toLowerCase().includes(query)) continue;
    groupedFields.set(group, [...(groupedFields.get(group) ?? []), key]);
  }
  const groups = [...groupedFields];
  const fieldCount = groups.reduce((count, [, keys]) => count + keys.length, 0);
  const update = (key: keyof T, value: string) => onChange(language === "ja"
    ? { ...settings, ja: { ...settings.ja, [key]: value } }
    : { ...settings, en: { ...settings.en, [key]: value } });
  const copySettings = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ page, ...settings }, null, 2));
      setMessage("Page text copied. Paste it into our chat when you want to publish changes.");
    } catch { setMessage("Clipboard access was blocked. Your preview is still saved in this browser."); }
  };

  return <EditorPortal><div className="sc-editor" data-site-editor onKeyDown={(event) => { if (open && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); } }}>
    <button className="sc-editor__toggle" type="button" aria-controls="sc-editor-panel" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close editor" : "Edit preview"}</button>
    {open && <aside id="sc-editor-panel" className="sc-editor__panel" aria-label={`${page} preview editor`}>
      <div className="sc-editor__heading"><span>METOROM / {page.toUpperCase()}</span><button type="button" onClick={() => setOpen(false)} aria-label="Close editor"><X size={18} aria-hidden="true" /></button></div>
      <h2>Edit this page</h2>
      <p className="sc-editor__help">Changes appear immediately. Publish this page’s text when you are ready; your draft stays in this browser until then.</p>
      <EditorPageSelect page={page} />
      <div className="sc-editor__languages" role="group" aria-label="Language to edit">
        <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
        <button type="button" aria-pressed={language === "ja"} onClick={() => setLanguage("ja")}>日本語</button>
      </div>
      <label className="sc-editor__search">Find text
        <input type="search" placeholder="Search sections, labels, or page text" value={search} onChange={(event) => setSearch(event.target.value)} />
      </label>
      <p className="sc-editor__count">{fieldCount} text fields · {language === "ja" ? "Japanese" : "English"}</p>
      <div className="sc-editor__copy">
        {groups.map(([group, keys], index) => <details key={group} open={Boolean(query) || index === 0}>
          <summary>{group}</summary>
          {keys.map((key) => <label key={key}>{fieldLabel(key)}
            {key === "statusCopied" && <small>Use {"{email}"} for the contact address.</small>}
            <textarea rows={key.toLowerCase().includes("title") ? 2 : 3} maxLength={COPY_MAX_LENGTH} value={copy[key]} onFocus={() => setFocusedKey(key)} onBlur={() => setFocusedKey(null)} onChange={(event) => update(key, event.target.value)} />
          </label>)}
        </details>)}
      </div>
      <div className="sc-editor__actions">
        <button type="button" onClick={() => void copySettings()}>Copy settings</button>
        <button type="button" onClick={() => { downloadPreviewJson(`metorom-${page}-preview.json`, { page, ...settings }); setMessage("Page text exported as JSON."); }}>Export JSON</button>
        <button type="button" onClick={() => { onChange({ en: english, ja: japanese }); setMessage("Preview reset to the published design."); }}>Reset</button>
      </div>
      <PublishControls page={page} settings={{ version: 1, ...settings }} onSuccess={() => localStorage.removeItem(`metorom-sculptural-v3-preview-${page}-v1`)} />
      <a className="sc-editor__exit" href={window.location.pathname + window.location.hash}>Exit preview and view the published design</a>
      {message && <p className="sc-editor__message" role="status">{message}</p>}
    </aside>}
  </div></EditorPortal>;
}
