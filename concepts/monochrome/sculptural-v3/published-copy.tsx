import { useState } from "react";

type TextCopy = Record<string, string>;
export type PublishedPage<T extends TextCopy> = { version: 1; en: T; ja: T };
export type SpeakerImageUpload = { slot: number; file: File };

const REPOSITORY = "engineering473/Metorom";
const API = `https://api.github.com/repos/${REPOSITORY}/contents/`;

export function mergePublished<T extends TextCopy>(base: T, saved: unknown): T {
  const source = saved && typeof saved === "object" && !Array.isArray(saved) ? saved as Record<string, unknown> : {};
  const result = { ...base };
  for (const key of Object.keys(base) as (keyof T)[]) {
    if (typeof source[key as string] === "string") result[key] = source[key as string] as T[keyof T];
  }
  return result;
}

export async function loadPublishedPage(page: string): Promise<Partial<PublishedPage<TextCopy>>> {
  const path = `${import.meta.env.BASE_URL}content/sculptural-v3-${page}.json`;
  const response = await fetch(`${path}?v=${Date.now()}`, { cache: "no-store" });
  if (response.status === 404) return {};
  if (!response.ok) throw new Error(`Published text could not be loaded (${response.status}).`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || (data as { version?: number }).version !== 1) throw new Error("Published text has an unknown format.");
  return data as Partial<PublishedPage<TextCopy>>;
}

function encodeUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function publishFile(branch: "main" | "gh-pages", path: string, content: string, token: string, alreadyEncoded = false): Promise<string> {
  const url = `${API}${path}`;
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
  const existing = await fetch(`${url}?ref=${branch}`, { headers, cache: "no-store" });
  let sha: string | undefined;
  if (existing.ok) sha = (await existing.json() as { sha?: string }).sha;
  else if (existing.status !== 404) throw new Error(`Could not read ${branch}: ${existing.status}`);
  const result = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Update sculptural ${path}`, content: alreadyEncoded ? content : encodeUtf8(content), branch, ...(sha ? { sha } : {}) }),
  });
  if (!result.ok) {
    const error = await result.json().catch(() => ({})) as { message?: string };
    throw new Error(`${branch}: ${error.message || `GitHub returned ${result.status}`}`);
  }
  const response = await result.json() as { commit?: { html_url?: string } };
  return response.commit?.html_url || `https://github.com/${REPOSITORY}`;
}

const imageExtensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

export function validateSpeakerImage(file: File): string | null {
  if (!imageExtensions[file.type]) return "Choose a JPG, PNG, WebP, or AVIF image.";
  if (file.size > 8 * 1024 * 1024) return "Choose an image under 8 MB.";
  return null;
}

async function encodeImage(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
  }
  return btoa(chunks.join(""));
}

export async function publishPage<T extends TextCopy>(page: string, copy: PublishedPage<T>, token: string, uploads: SpeakerImageUpload[] = []): Promise<string> {
  for (const upload of uploads) {
    const error = validateSpeakerImage(upload.file);
    if (error) throw new Error(`Image ${upload.slot}: ${error}`);
  }
  const updated: PublishedPage<TextCopy> = { version: 1, en: { ...copy.en }, ja: { ...copy.ja } };
  for (const { slot, file } of uploads) {
    const name = `speaker-${slot}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${imageExtensions[file.type]}`;
    const encoded = await encodeImage(file);
    await publishFile("main", `public/images/speaker-gallery/${name}`, encoded, token, true);
    await publishFile("gh-pages", `images/speaker-gallery/${name}`, encoded, token, true);
    const url = `${import.meta.env.BASE_URL}images/speaker-gallery/${name}`;
    updated.en[`galleryImage${slot}`] = url;
    updated.ja[`galleryImage${slot}`] = url;
  }
  const content = JSON.stringify(updated, null, 2) + "\n";
  await publishFile("main", `public/content/sculptural-v3-${page}.json`, content, token);
  return publishFile("gh-pages", `content/sculptural-v3-${page}.json`, content, token);
}

export function PublishControls<T extends TextCopy>({ page, settings, uploads = [], onSuccess }: { page: string; settings: PublishedPage<T>; uploads?: SpeakerImageUpload[]; onSuccess: () => void }) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [commitUrl, setCommitUrl] = useState("");

  const publish = async () => {
    if (!token.trim()) { setMessage("Enter a GitHub token with Contents read and write access to Metorom."); return; }
    setPublishing(true);
    setCommitUrl("");
    try {
      const url = await publishPage(page, settings, token.trim(), uploads);
      onSuccess();
      setCommitUrl(url);
      setMessage("Published to the website. GitHub Pages may take a short time to refresh.");
    } catch (error) {
      setMessage(`Publishing stopped: ${error instanceof Error ? error.message : "Unknown error"}. Your draft is still saved in this browser.`);
    } finally { setPublishing(false); setToken(""); }
  };

  return <div className="sc-editor__publish">
    <label>GitHub token
      <input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Fine-grained token for Metorom" />
    </label>
    <p>Give the token Contents read and write access to this repository. It publishes this page’s text{uploads.length ? ` and ${uploads.length} selected speaker image${uploads.length === 1 ? "" : "s"}` : ""} and is never saved. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Create a token ↗</a></p>
    <button type="button" disabled={publishing} onClick={() => void publish()}>{publishing ? "Publishing…" : uploads.length ? "Publish text and speaker photos" : "Publish this page’s text"}</button>
    {commitUrl && <a href={commitUrl} target="_blank" rel="noreferrer">View published commit ↗</a>}
    {message && <p role="status">{message}</p>}
  </div>;
}
