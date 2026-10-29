import { DEFAULT_COPY, DEFAULT_COPY_JA } from "./site-copy";

const sharedKeys = [
  "brandName", "navObject", "navArchitecture", "navMeasurements", "navListening",
  "navConversation", "navWrite", "navStartConversation", "navSkip", "navPageAria",
  "navMobileAria", "navOpenMenu", "navCloseMenu", "navBrandAria", "navLanguageLabel", "navLanguageAria",
  "footerPhilosophy", "footerEdit", "footerNavigationAria",
] as const;

type SharedKey = (typeof sharedKeys)[number];
type SharedPageCopy = Record<SharedKey, string>;

function sharedCopy(copy: typeof DEFAULT_COPY): SharedPageCopy {
  return Object.fromEntries(sharedKeys.map((key) => [key, copy[key]])) as SharedPageCopy;
}

export const SHARED_PAGE_COPY_EN = sharedCopy(DEFAULT_COPY);
export const SHARED_PAGE_COPY_JA = sharedCopy(DEFAULT_COPY_JA);

export function publishedSharedCopy(copy: unknown): Partial<SharedPageCopy> {
  if (!copy || typeof copy !== "object") return {};
  const source = copy as Record<string, unknown>;
  return Object.fromEntries(sharedKeys.filter((key) => typeof source[key] === "string").map((key) => [key, source[key]]));
}

export function readSharedPreviewCopy(language: "en" | "ja"): Partial<SharedPageCopy> {
  try {
    const saved = JSON.parse(localStorage.getItem("metorom-sculptural-v3-preview-v1") ?? "null");
    const source = language === "ja" ? saved?.copyJa : saved?.copy;
    return Object.fromEntries(sharedKeys.filter((key) => typeof source?.[key] === "string").map((key) => [key, source[key]]));
  } catch { return {}; }
}

export function pageCopyGroup(key: string): string {
  if (key === "brandName" || key.startsWith("nav")) return "Brand & navigation";
  if (key.startsWith("page")) return "Page information";
  if (key.startsWith("globe")) return "Globe";
  if (/^(meta|hero|field|opening)/.test(key)) return "Opening";
  if (key.startsWith("statement")) return "Philosophy statement";
  if (/^(channel|direct|ways|topic[123]|otherTopic|otherSubject)/.test(key)) return "Conversation topics";
  if (/^(form|topicLabel|name|email|message|submit|copy|status|draft|validation)/.test(key)) return "Message form";
  if (/^(premise|moment)/.test(key)) return "The gathering";
  if (/^(details|when|where|entry|toBeAnnounced)/.test(key)) return "Session details";
  if (/^(close|ask|otherWays)/.test(key)) return "Next steps";
  if (key.startsWith("footer")) return "Footer";
  return "Other text";
}
