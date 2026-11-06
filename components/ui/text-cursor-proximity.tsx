"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type RefObject } from "react";
import { mix, motion, motionValue, useReducedMotion, type MotionStyle } from "motion/react";
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref";
import { cn } from "@/lib/utils";

type StyleRange = { from: string | number; to: string | number };
export type ProximityStyles = Partial<Record<keyof CSSProperties, StyleRange>>;
type TextProps = HTMLAttributes<HTMLSpanElement> & {
  label: string;
  styles: ProximityStyles;
  containerRef: RefObject<HTMLElement | SVGElement | null>;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
};

/** Per-letter cursor interpolation, adapted from the supplied component.
 * MotionValue factories are safe in loops; React hooks are called once. */
const TextCursorProximity = forwardRef<HTMLSpanElement, TextProps>(function TextCursorProximity({
  label, styles, containerRef, radius = 100, falloff = "linear", className, ...props
}, ref) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scheduleRef = useRef<() => void>(() => {});
  const [inView, setInView] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const reducedMotion = useReducedMotion();
  const enabled = inView && finePointer && !reducedMotion;
  const notifyMove = useCallback(() => scheduleRef.current(), []);
  const mousePosition = useMousePositionRef(containerRef, notifyMove, enabled);
  const letters = useMemo(() => Array.from(label.replace(/\s/g, "")).map(() => {
    const properties = Object.entries(styles).flatMap(([name, range]) => range ? [{
      name,
      value: motionValue<string | number>(range.from),
      interpolate: mix(range.from, range.to),
    }] : []);
    return {
      properties,
      style: Object.fromEntries(properties.map(({ name, value }) => [name, value])) as MotionStyle,
    };
  }), [label, styles]);

  useEffect(() => () => letters.forEach(letter => letter.properties.forEach(property => property.value.destroy())), [letters]);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    const root = rootRef.current;
    const observer = root && "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "40px" })
      : null;
    if (observer && root) observer.observe(root);
    else setInView(true);
    return () => { query.removeEventListener("change", update); observer?.disconnect(); };
  }, []);

  useEffect(() => {
    let frame = 0;
    const reset = () => letters.forEach(letter => letter.properties.forEach(property => property.value.set(property.interpolate(0))));
    const update = () => {
      frame = 0;
      const container = containerRef.current;
      const pointer = mousePosition.current;
      if (!enabled || !container || !pointer.active) { reset(); return; }
      const bounds = container.getBoundingClientRect();
      const safeRadius = Math.max(1, radius);
      // Finish layout reads before updating any styles.
      const proximity = letterRefs.current.map(letter => {
        if (!letter) return 0;
        const rect = letter.getBoundingClientRect();
        const distance = Math.hypot(pointer.x - (rect.left + rect.width / 2 - bounds.left), pointer.y - (rect.top + rect.height / 2 - bounds.top));
        const linear = Math.max(0, 1 - distance / safeRadius);
        return falloff === "gaussian" ? Math.exp(-Math.pow(distance / (safeRadius / 2), 2) / 2)
          : falloff === "exponential" ? linear * linear : linear;
      });
      letters.forEach((letter, index) => letter.properties.forEach(property => property.value.set(property.interpolate(proximity[index] ?? 0))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    scheduleRef.current = schedule;
    if (!enabled) reset();
    return () => {
      scheduleRef.current = () => {};
      if (frame) cancelAnimationFrame(frame);
      reset();
    };
  }, [containerRef, enabled, falloff, letters, mousePosition, radius]);

  let letterIndex = 0;
  return <span {...props} className={cn("text-cursor-proximity", className)} ref={element => {
    rootRef.current = element;
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  }}>
    {label.split(" ").map((word, wordIndex, words) => <span className="text-cursor-proximity__word" key={wordIndex} aria-hidden="true">
      {Array.from(word).map(character => {
        const index = letterIndex++;
        return <motion.span className="text-cursor-proximity__letter" key={index} initial={false}
          ref={element => { letterRefs.current[index] = element; }} style={letters[index]?.style}>{character}</motion.span>;
      })}{wordIndex < words.length - 1 && "\u00a0"}
    </span>)}
    <span className="sr-only">{label}</span>
  </span>;
});

export default TextCursorProximity;
