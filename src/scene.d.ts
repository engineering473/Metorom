export type SceneView = 'Front' | 'Back' | 'Top';
export type SceneLoadPhase = 'loading' | 'preparing' | 'ready' | 'error';

export function initScene(options: {
  canvas: HTMLCanvasElement;
  sectionEl: HTMLElement;
  onProgress?: (progress: number, viewName: SceneView) => void;
  onLoadProgress?: (percent: number, phase: SceneLoadPhase) => void;
  renderFallback?: boolean;
  appearance?: 'wireframe' | 'rendered';
}): () => void;
