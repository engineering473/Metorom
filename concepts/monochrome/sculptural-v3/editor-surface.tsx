import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const EditorSurfaceContext = createContext<{ target: HTMLElement | null; setTarget: (target: HTMLElement | null) => void }>({ target: null, setTarget: () => {} });

export function EditorSurfaceProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ target, setTarget }), [target]);
  return <EditorSurfaceContext.Provider value={value}>{children}</EditorSurfaceContext.Provider>;
}

export function useEditorSurface() { return useContext(EditorSurfaceContext); }

export function EditorPortal({ children }: { children: ReactNode }) {
  const { target } = useEditorSurface();
  // Keep editor component state at its original location while its controls join
  // the native dialog's top layer, where they remain interactive during preview.
  return target ? createPortal(<div onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>{children}</div>, target) : children;
}
