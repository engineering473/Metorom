import { useEffect, useState } from "react";

export type Language = "en" | "ja";

const STORAGE_KEY = "metorom-sculptural-language";
const CHANGE_EVENT = "metorom-language-change";

function initialLanguage(): Language {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "ja") {
    try { localStorage.setItem(STORAGE_KEY, requested); } catch { /* The requested language still works in this tab. */ }
    return requested;
  }
  try { return localStorage.getItem(STORAGE_KEY) === "ja" ? "ja" : "en"; } catch { return "en"; }
}

let currentLanguage: Language = initialLanguage();
document.documentElement.lang = currentLanguage;

function changeLanguage(language: Language) {
  if (language === currentLanguage) return;
  currentLanguage = language;
  document.documentElement.lang = language;
  try { localStorage.setItem(STORAGE_KEY, language); } catch { /* Language still changes in this tab. */ }
  const url = new URL(window.location.href);
  if (url.searchParams.has("lang")) {
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", url);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLanguage(): [Language, (language: Language) => void] {
  const [language, setLanguage] = useState<Language>(currentLanguage);

  useEffect(() => {
    const update = () => setLanguage(currentLanguage);
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      currentLanguage = event.newValue === "ja" ? "ja" : "en";
      document.documentElement.lang = currentLanguage;
      update();
    };
    window.addEventListener(CHANGE_EVENT, update);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, update);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  return [language, changeLanguage];
}

export function previewHref(href: string): string {
  if (new URLSearchParams(window.location.search).get("edit") !== "1" || href.startsWith("#")) return href;
  const [path, hash] = href.split("#", 2);
  return `${path}${path.includes("?") ? "&" : "?"}edit=1${hash ? `#${hash}` : ""}`;
}
