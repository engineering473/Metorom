import { useEffect, useState } from "react";

const base = import.meta.env.BASE_URL;

export const HERO_IMAGE = `${base}images/concepts/speaker-render-front-v3.webp`;
export const OBJECT_POSTER = `${base}images/concepts/speaker-interactive-front-v3.webp`;
export const BRAND_IMAGE = `${base}images/taste-v2/metorom-logo.webp`;
export const VIDEO_SOURCES = {
  "sub-explode": `${base}videos/speaker-sub-explode-go.mp4`,
  "sub-return": `${base}videos/speaker-sub-explode-return.mp4`,
  "mid-explode": `${base}videos/speaker-mid-left-explode-go.mp4`,
  "mid-return": `${base}videos/speaker-mid-left-explode-return.mp4`,
  "sub-forward": `${base}videos/speaker-sub.mp4`,
  "sub-reverse": `${base}videos/speaker-sub-reverse.mp4`,
  "mid-forward": `${base}videos/speaker-mid-left.mp4`,
  "mid-reverse": `${base}videos/speaker-mid-left-reverse.mp4`,
  "right-forward": `${base}videos/speaker-mid-right.mp4`,
  "right-reverse": `${base}videos/speaker-mid-right-reverse.mp4`,
  "tweeter-forward": `${base}videos/speaker-tweeter.mp4`,
  "tweeter-reverse": `${base}videos/speaker-tweeter-reverse.mp4`,
};

type Resource = { promise: Promise<boolean>; ready: boolean; failed: boolean; objectUrl?: string };
const resources = new Map<string, Resource>();
const listeners = new Set<() => void>();
const queue: (() => Promise<void>)[] = [];
let active = 0;

function runQueue() {
  while (active < 3 && queue.length) {
    const job = queue.shift()!;
    active++;
    void job().finally(() => { active--; runQueue(); });
  }
}

function addResource(source: string, load: () => Promise<string | void>) {
  const existing = resources.get(source);
  if (existing) return existing.promise;
  let settle: (ready: boolean) => void = () => {};
  const record: Resource = { promise: new Promise((resolve) => { settle = resolve; }), ready: false, failed: false };
  resources.set(source, record);
  queue.push(async () => {
    try {
      const objectUrl = await load();
      if (objectUrl) record.objectUrl = objectUrl;
      record.ready = true;
    } catch { record.failed = true; }
    settle(record.ready);
    listeners.forEach((notify) => notify());
  });
  runQueue();
  return record.promise;
}

export function prepareImage(source: string) {
  return addResource(source, () => new Promise<void>((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => { cleanUp(); reject(new Error("Image preparation timed out")); }, 12000);
    function cleanUp() { window.clearTimeout(timeout); image.onload = null; image.onerror = null; }
    image.onload = () => { cleanUp(); void image.decode().catch(() => {}).then(resolve); };
    image.onerror = () => { cleanUp(); reject(new Error("Image unavailable")); };
    image.src = source;
  }));
}

export function prepareVideo(source: string) {
  return addResource(source, async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      // Retain a local Blob URL: the interactive player uses these downloaded
      // bytes instead of starting a second media request after the gate opens.
      const response = await fetch(source, { signal: controller.signal, cache: "force-cache" });
      if (!response.ok) throw new Error("Video unavailable");
      const blob = await response.blob();
      if (!blob.size) throw new Error("Empty video");
      return URL.createObjectURL(blob);
    } finally { window.clearTimeout(timeout); }
  });
}

export function getMediaUrl(source: string) {
  return resources.get(source)?.objectUrl ?? source;
}

/** Keep video src empty while its single shared fetch is pending. */
export function usePreparedMediaSources<T extends Record<string, string>>(sources: T): T {
  const [, refresh] = useState(0);
  const key = Object.values(sources).join("\n");
  useEffect(() => {
    const notify = () => refresh((revision) => revision + 1);
    listeners.add(notify);
    Object.values(sources).forEach((source) => { void prepareVideo(source); });
    return () => { listeners.delete(notify); };
  }, [key]);
  return Object.fromEntries(Object.entries(sources).map(([name, source]) => {
    const resource = resources.get(source);
    return [name, resource?.ready || resource?.failed ? getMediaUrl(source) : ""];
  })) as T;
}

export function resourceIsReady(source: string) { return resources.get(source)?.ready ?? false; }
