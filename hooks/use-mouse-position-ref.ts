import { useEffect, useRef, type RefObject } from "react";

type MousePosition = { x: number; y: number; active: boolean };

/** Pointer coordinates without a React render for every movement. */
export function useMousePositionRef(
  containerRef?: RefObject<HTMLElement | SVGElement | null>,
  onChange?: () => void,
  enabled = true,
) {
  const positionRef = useRef<MousePosition>({ x: Infinity, y: Infinity, active: false });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const clear = () => {
      positionRef.current = { x: Infinity, y: Infinity, active: false };
      onChangeRef.current?.();
    };
    if (!enabled) { clear(); return; }
    const update = (event: PointerEvent) => {
      if (event.pointerType === "touch") { clear(); return; }
      const bounds = containerRef?.current?.getBoundingClientRect();
      positionRef.current = {
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
        active: true,
      };
      onChangeRef.current?.();
    };
    window.addEventListener("pointermove", update, { passive: true });
    document.documentElement.addEventListener("pointerleave", clear);
    window.addEventListener("blur", clear);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      window.removeEventListener("pointermove", update);
      document.documentElement.removeEventListener("pointerleave", clear);
      window.removeEventListener("blur", clear);
      window.removeEventListener("scroll", clear);
      clear();
    };
  }, [containerRef, enabled]);

  return positionRef;
}
