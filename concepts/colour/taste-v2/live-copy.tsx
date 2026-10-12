import { useEffect, useRef, useState } from "react";
import "./live-copy.css";

type CopyFile = { version: 1; fields: Record<string, string> };
type Field = { key: string; label: string; group: string; original: string; apply: (value: string) => void };

const REPOSITORY = "engineering473/Metorom";
const DRAFT_KEY = "metorom-listen-closer-copy-draft-v1";
const CONTENT_URL = `${import.meta.env.BASE_URL}content/taste-v2.json`;
const API = `https://api.github.com/repos/${REPOSITORY}/contents/`;
const isEditing = new URLSearchParams(window.location.search).get("edit") === "1";
const page = location.pathname.endsWith("/contact.html") ? "contact"
  : location.pathname.endsWith("/philosophy.html") ? "philosophy" : "home";

function pathFor(element: Element, root: Element): string {
  const parts: string[] = [];
  for (let current: Element | null = element; current && current !== root; current = current.parentElement) {
    const siblings = current.parentElement
      ? [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName)
      : [];
    parts.unshift(`${current.tagName.toLowerCase()}:${siblings.indexOf(current) + 1}`);
  }
  return parts.join("/");
}

function groupFor(element: Element): string {
  const landmark = element.closest("section, article, header, footer, nav, main");
  const name = landmark?.id || landmark?.classList[0] || landmark?.tagName.toLowerCase() || "Page";
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readDraft(): Record<string, string> | null {
  try {
    const value = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

function validFields(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, text]) => typeof text === "string"));
}

function encodeUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function publishFile(branch: "main" | "gh-pages", path: string, content: string, token: string): Promise<string> {
  const url = `${API}${path}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const existing = await fetch(`${url}?ref=${branch}`, { headers, cache: "no-store" });
  let sha: string | undefined;
  if (existing.ok) sha = (await existing.json() as { sha?: string }).sha;
  else if (existing.status !== 404) throw new Error(`Could not read ${branch}: ${existing.status}`);

  const result = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update Listen Closer website text",
      content: encodeUtf8(content),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!result.ok) {
    const error = await result.json().catch(() => ({})) as { message?: string };
    throw new Error(`${branch}: ${error.message || `GitHub returned ${result.status}`}`);
  }
  const response = await result.json() as { commit?: { html_url?: string } };
  return response.commit?.html_url || `https://github.com/${REPOSITORY}`;
}

export function editHref(path: string): string {
  if (!isEditing) return path;
  const hashIndex = path.indexOf("#");
  const beforeHash = hashIndex < 0 ? path : path.slice(0, hashIndex);
  const hash = hashIndex < 0 ? "" : path.slice(hashIndex);
  return `${beforeHash}${beforeHash.includes("?") ? "&" : "?"}edit=1${hash}`;
}

export default function LiveCopyEditor() {
  const [fields, setFields] = useState<Field[]>([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [commitUrl, setCommitUrl] = useState("");
  const [revision, setRevision] = useState(0);
  const entries = useRef(new Map<string, Field>());
  const overrides = useRef<Record<string, string>>({});
  const fieldSignature = useRef("");

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    let alive = true;
    let frame = 0;
    const knownText = new WeakMap<Text, string>();
    const originalMailto = new WeakMap<HTMLAnchorElement, string>();
    const attributes = ["alt", "aria-label", "title", "placeholder"];

    const scan = () => {
      frame = 0;
      const found = new Map<string, Field>();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const element = textNode.parentElement;
        if (!element || element.closest("[data-live-copy-editor], script, style")) continue;
        const raw = knownText.get(textNode) ?? textNode.data;
        if (!raw.trim()) continue;
        knownText.set(textNode, raw);
        const index = [...element.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).indexOf(textNode);
        const key = `${page}:${pathFor(element, root)}:text:${index}`;
        const lead = raw.match(/^\s*/)?.[0] || "";
        const tail = raw.match(/\s*$/)?.[0] || "";
        found.set(key, {
          key, group: groupFor(element), label: raw.trim().slice(0, 80), original: raw.trim(),
          apply: (value) => {
            const next = lead + value + tail;
            if (textNode.data !== next) textNode.data = next;
            if (raw.trim() === "engineering@metorom.com") {
              for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')) {
                const base = originalMailto.get(link) || link.getAttribute("href") || "";
                originalMailto.set(link, base);
                const updated = base.replace("engineering@metorom.com", value);
                if (updated && link.getAttribute("href") !== updated) link.setAttribute("href", updated);
              }
            }
          },
        });
      }
      for (const element of root.querySelectorAll("*")) {
        if (element.closest("[data-live-copy-editor], script, style")) continue;
        for (const attribute of attributes) {
          const original = element.getAttribute(attribute);
          if (!original || !original.trim()) continue;
          const key = `${page}:${pathFor(element, root)}:${attribute}`;
          const earlier = entries.current.get(key);
          found.set(key, {
            key, group: groupFor(element), label: `${attribute}: ${(earlier?.original || original).slice(0, 70)}`,
            original: earlier?.original || original,
            apply: (value) => { if (element.getAttribute(attribute) !== value) element.setAttribute(attribute, value); },
          });
        }
      }
      const titleKey = `${page}:document:title`;
      found.set(titleKey, {
        key: titleKey, group: "Page information", label: "Browser title",
        original: entries.current.get(titleKey)?.original || document.title,
        apply: (value) => { if (document.title !== value) document.title = value; },
      });
      const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (description) {
        const key = `${page}:document:description`;
        found.set(key, {
          key, group: "Page information", label: "Search description",
          original: entries.current.get(key)?.original || description.content,
          apply: (value) => { if (description.content !== value) description.content = value; },
        });
      }
      entries.current = found;
      for (const field of found.values()) {
        const value = overrides.current[field.key];
        if (typeof value === "string") field.apply(value);
      }
      const signature = [...found.keys()].join("|");
      if (isEditing && signature !== fieldSignature.current) {
        fieldSignature.current = signature;
        setFields([...found.values()]);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(scan); };
    const observer = new MutationObserver(schedule);
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...attributes, "href"] });
    scan();

    void fetch(`${CONTENT_URL}?v=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("No published text file")))
      .then((file: CopyFile) => {
        if (!alive) return;
        overrides.current = { ...validFields(file.fields), ...(isEditing ? readDraft() || {} : {}) };
        schedule();
        setRevision((value) => value + 1);
      })
      .catch(() => {
        if (!alive) return;
        overrides.current = isEditing ? readDraft() || {} : {};
        schedule();
        if (isEditing) setStatus("Published text could not be loaded. The page defaults are available for editing.");
      });

    return () => { alive = false; observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, []);

  if (!isEditing) return null;

  const visible = fields.filter((field) => `${field.group} ${field.label} ${overrides.current[field.key] || ""}`.toLowerCase().includes(search.toLowerCase()));
  const grouped = visible.reduce<Record<string, Field[]>>((groups, field) => {
    (groups[field.group] ||= []).push(field);
    return groups;
  }, {});
  const update = (field: Field, value: string) => {
    overrides.current = { ...overrides.current, [field.key]: value };
    entries.current.get(field.key)?.apply(value);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(overrides.current)); } catch { /* The current edit still works. */ }
    setRevision((count) => count + 1);
    setStatus("Draft saved in this browser. Publish to update the live site.");
  };
  const publish = async () => {
    if (!token.trim()) { setStatus("Enter a GitHub token with Contents read and write access to Metorom."); return; }
    setPublishing(true);
    setCommitUrl("");
    const content = JSON.stringify({ version: 1, fields: overrides.current } satisfies CopyFile, null, 2) + "\n";
    try {
      await publishFile("main", "public/content/taste-v2.json", content, token.trim());
      const url = await publishFile("gh-pages", "content/taste-v2.json", content, token.trim());
      localStorage.removeItem(DRAFT_KEY);
      setCommitUrl(url);
      setStatus("Published to GitHub Pages. The live site may take a short time to refresh.");
    } catch (error) {
      setStatus(`Publishing stopped: ${error instanceof Error ? error.message : "Unknown error"}. Your draft is still saved here.`);
    } finally { setPublishing(false); setToken(""); }
  };

  return <aside className="lc-editor" data-live-copy-editor aria-label="Website text editor">
    <div className="lc-editor__heading"><strong>Edit website text</strong><a href={location.pathname}>Exit editor</a></div>
    <p>Choose a page, change any text, then publish. Your draft stays in this browser until publishing succeeds.</p>
    <nav aria-label="Pages to edit">
      <a aria-current={page === "home" ? "page" : undefined} href="./index.html?edit=1">Home</a>
      <a aria-current={page === "philosophy" ? "page" : undefined} href="./philosophy.html?edit=1">Philosophy</a>
      <a aria-current={page === "contact" ? "page" : undefined} href="./contact.html?edit=1">Contact</a>
    </nav>
    <label className="lc-editor__search">Find text<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search page text" /></label>
    <div className="lc-editor__fields" data-revision={revision}>
      {Object.entries(grouped).map(([group, items], index) => <details key={group} open={Boolean(search) || index === 0}><summary>{group} <small>{items?.length}</small></summary>
        {items?.map((field) => <label key={field.key}>{field.label}<textarea rows={field.original.length > 100 ? 4 : 2} value={overrides.current[field.key] ?? field.original} onChange={(event) => update(field, event.target.value)} /></label>)}
      </details>)}
    </div>
    <div className="lc-editor__publish">
      <label>GitHub token<input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Fine-grained token for Metorom" /></label>
      <p>The token is used for this publish only and is never saved. Grant it Contents read and write access to this repository. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Create a fine-grained token ↗</a></p>
      <button type="button" disabled={publishing} onClick={() => void publish()}>{publishing ? "Publishing…" : "Publish text to website"}</button>
      {commitUrl && <a href={commitUrl} target="_blank" rel="noreferrer">View the published commit ↗</a>}
      {status && <p role="status">{status}</p>}
    </div>
  </aside>;
}
