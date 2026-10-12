"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { previewHref, useLanguage } from "@/concepts/monochrome/sculptural-v2/language";
import { DEFAULT_COPY, DEFAULT_COPY_JA, type CopyKey, type SiteCopy } from "@/concepts/monochrome/sculptural-v2/site-copy";
import "./navbar-1.css";

type Navbar1Props = { contact?: boolean; copy?: Partial<SiteCopy> };

export function Navbar1({ contact = false, copy }: Navbar1Props) {
  const [language, setLanguage] = useLanguage();
  const savedPreviewCopy = useMemo(() => {
    if (new URLSearchParams(window.location.search).get("edit") !== "1") return {} as Record<string, unknown>;
    try {
      const saved = JSON.parse(localStorage.getItem("metorom-sculptural-preview-v1") ?? "null") as { copy?: Record<string, unknown>; copyJa?: Record<string, unknown> } | null;
      return (language === "ja" ? saved?.copyJa : saved?.copy) ?? {};
    } catch { return {} as Record<string, unknown>; }
  }, [language]);
  const fallback = language === "ja" ? DEFAULT_COPY_JA : DEFAULT_COPY;
  const label = (key: CopyKey) => copy?.[key] ?? (typeof savedPreviewCopy[key] === "string" ? savedPreviewCopy[key] as string : fallback[key]);
  const brandName = label("brandName");
  const useOriginalLogo = brandName.trim().toLowerCase() === "metorom";
  const logoSource = `${import.meta.env.BASE_URL}images/taste-v2/metorom-logo.webp`;
  const sections = [
    { label: label("navObject"), id: "object" },
    { label: label("navArchitecture"), id: "architecture" },
    { label: label("navMeasurements"), id: "measurements" },
    { label: label("navListening"), id: "listening" },
  ];
  const switchLanguage = () => setLanguage(language === "en" ? "ja" : "en");
  const [isOpen, setIsOpen] = useState(false);
  const [navSize, setNavSize] = useState({ width: 1000, height: 66 });
  const navShell = useRef<HTMLDivElement>(null);
  const progressLeft = useRef<SVGPathElement>(null);
  const progressRight = useRef<SVGPathElement>(null);
  const progressPaths = useMemo(() => {
    const inset = 1.5;
    const middle = navSize.width / 2;
    const radius = (navSize.height - inset * 2) / 2;
    const bottom = navSize.height - inset;
    const leftCurve = inset + radius;
    const rightCurve = navSize.width - inset - radius;
    // Equal half-perimeters share the top-center origin and bottom-center end.
    return {
      left: `M ${middle} ${inset} H ${leftCurve} A ${radius} ${radius} 0 0 0 ${leftCurve} ${bottom} H ${middle}`,
      right: `M ${middle} ${inset} H ${rightCurve} A ${radius} ${radius} 0 0 1 ${rightCurve} ${bottom} H ${middle}`,
    };
  }, [navSize]);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstMobileLink = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const prefix = contact ? "./index.html" : "";

  useEffect(() => {
    const shell = navShell.current;
    if (!shell) return;
    const observer = new ResizeObserver(() => {
      const box = shell.getBoundingClientRect();
      setNavSize({ width: Math.max(10, box.width), height: Math.max(10, box.height) });
    });
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    let viewportWidth = window.innerWidth;
    let stableViewportHeight = window.innerHeight;
    const update = () => {
      frame = 0;
      const scrollHeight = document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight;
      const range = Math.max(1, scrollHeight - stableViewportHeight);
      const maxCurrentScroll = Math.max(0, scrollHeight - window.innerHeight);
      const atEnd = window.scrollY >= maxCurrentScroll - 2;
      const progress = atEnd ? 100 : Math.min(100, Math.max(0, window.scrollY / range * 100));
      for (const path of [progressLeft.current, progressRight.current]) {
        path?.setAttribute("stroke-dasharray", `${progress} 100`);
        path?.setAttribute("opacity", progress > 0 ? "1" : "0");
      }
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onResize = () => {
      // Safari's browser chrome changes innerHeight during a scroll. Keep the
      // progress denominator stable until the screen width/orientation changes.
      if (Math.abs(window.innerWidth - viewportWidth) > 8) {
        viewportWidth = window.innerWidth;
        stableViewportHeight = window.innerHeight;
      }
      requestUpdate();
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMobileLink.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButton.current?.focus();
      } else if (event.key === "Tab") {
        const menu = document.getElementById("sc-mobile-menu");
        const focusable = Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && (document.activeElement === first || !menu?.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !menu?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const menuTransition = reduceMotion ? { duration: 0 } : { type: "spring" as const, damping: 27, stiffness: 300 };

  return (
    <>
      <a className="sc-skip" href="#main">{label("navSkip")}</a>
      <header className="sc-header">
        <div className="sc-nav-slot flex justify-center w-full py-6 px-4">
          <div ref={navShell} className="sc-nav-shell flex items-center justify-between px-6 py-3 bg-white rounded-full shadow-lg w-full max-w-5xl relative z-10">
            <svg className="sc-progress-outline" viewBox={`0 0 ${navSize.width} ${navSize.height}`} aria-hidden="true">
              <rect x="1.5" y="1.5" width={navSize.width - 3} height={navSize.height - 3} rx={(navSize.height - 3) / 2} pathLength="100" />
              <path ref={progressLeft} className="sc-progress-outline__active" d={progressPaths.left} pathLength="100" strokeDasharray="0 100" opacity="0" />
              <path ref={progressRight} className="sc-progress-outline__active" d={progressPaths.right} pathLength="100" strokeDasharray="0 100" opacity="0" />
            </svg>
            <motion.a
              className="sc-brand flex items-center"
              href={contact ? previewHref("./index.html") : "#top"}
              aria-label={label("navBrandAria")}
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={reduceMotion ? undefined : { rotate: -1 }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              {useOriginalLogo ? (
                <img className="sc-brand-logo" src={logoSource} width="260" height="107" alt="" />
              ) : <span>{brandName}</span>}
            </motion.a>

            <nav className="sc-desktop-nav hidden lg:flex items-center space-x-8" aria-label={label("navPageAria")}>
              {sections.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={prefix ? previewHref(`${prefix}#${item.id}`) : `#${item.id}`}
                  className="text-sm text-gray-900 font-medium"
                  initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                >{item.label}</motion.a>
              ))}
            </nav>

            <motion.a
              href={previewHref(contact ? "./contact.html#sc-contact-compose" : "./contact.html")}
              className="sc-nav-cta hidden lg:inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-black rounded-full"
              initial={reduceMotion ? false : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={reduceMotion ? undefined : { scale: 1.035 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : 0.15 }}
            >{contact ? label("navWrite") : label("navConversation")}<ArrowUpRight size={15} aria-hidden="true" /></motion.a>

            <button className="sc-language-toggle" type="button" onClick={switchLanguage} lang={language === "en" ? "ja" : "en"} aria-label={label("navLanguageAria")}>
              {label("navLanguageLabel")}
            </button>

            <motion.button
              ref={menuButton}
              type="button"
              className="sc-menu-button lg:hidden flex items-center"
              onClick={() => setIsOpen((open) => !open)}
              whileTap={reduceMotion ? undefined : { scale: 0.92 }}
              aria-controls="sc-mobile-menu"
              aria-expanded={isOpen}
              aria-label={isOpen ? label("navCloseMenu") : label("navOpenMenu")}
            >{isOpen ? <X size={23} /> : <Menu size={23} />}</motion.button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="sc-mobile-menu"
            className="sc-mobile-menu fixed inset-0 bg-white z-50 pt-24 px-6 lg:hidden"
            aria-label={label("navMobileAria")}
            initial={reduceMotion ? false : { opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: "100%" }}
            transition={menuTransition}
          >
            <button className="sc-mobile-close" type="button" onClick={() => { closeMenu(); menuButton.current?.focus(); }} aria-label={label("navCloseMenu")}><X size={25} /></button>
            <span className="sc-mobile-menu__brand">
              {useOriginalLogo ? (
                <img className="sc-brand-logo" src={logoSource} width="260" height="107" alt={brandName} />
              ) : brandName}
            </span>
            <button className="sc-mobile-language" type="button" onClick={switchLanguage} lang={language === "en" ? "ja" : "en"} aria-label={label("navLanguageAria")}>{label("navLanguageLabel")}</button>
            <div className="sc-mobile-menu__links flex flex-col space-y-6">
              {sections.map((item, index) => (
                <motion.a
                  key={item.id}
                  ref={index === 0 ? firstMobileLink : undefined}
                  href={prefix ? previewHref(`${prefix}#${item.id}`) : `#${item.id}`}
                  onClick={closeMenu}
                  initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 20 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                >{item.label}<ArrowUpRight size={20} aria-hidden="true" /></motion.a>
              ))}
              <motion.a className="sc-mobile-menu__cta" href={previewHref(contact ? "./contact.html#sc-contact-compose" : "./contact.html")} onClick={closeMenu}>{label("navStartConversation")} <ArrowUpRight size={20} aria-hidden="true" /></motion.a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
