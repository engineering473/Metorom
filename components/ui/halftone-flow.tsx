"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type EffectMode = "dark" | "light";

export type HalftoneFlowProps = {
  mode?: EffectMode;
  hue?: number;
  saturation?: number;
  brightness?: number;
  waveDensity?: number;
  playing?: boolean;
  className?: string;
  style?: CSSProperties;
};

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// The source component's flowing halftone field, kept inside this component's
// canvas instead of an iframe with an unrelated page and remote scripts.
const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_light;
  uniform float u_waves;

  mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    float shortSide = min(u_resolution.x, u_resolution.y);
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / shortSide;
    vec2 flow = p;
    float time = u_time * 0.34;

    for (int i = 1; i < 4; i++) {
      float layer = float(i);
      flow *= rotate(0.065 * sin(time * 0.38 + layer));
      flow.x += sin(flow.y * (2.4 + layer * 0.68) * u_waves + time) * 0.16 / layer;
      flow.y += cos(flow.x * (1.8 + layer * 0.48) * u_waves - time * 0.82) * 0.15 / layer;
    }

    float wave = sin((flow.x * 5.2 + flow.y * 2.6) * u_waves + sin(flow.y * 4.0 * u_waves - time) * 0.5);
    float current = cos((flow.y * 4.5 - flow.x * 1.8) * u_waves + time * 0.74);
    float intensity = smoothstep(-0.56, 0.88, wave * 0.68 + current * 0.32);

    float cellSize = clamp(shortSide / 116.0, 4.0, 10.0);
    vec2 grid = gl_FragCoord.xy / cellSize;
    float distanceToCenter = length(fract(grid) - 0.5);
    float radius = 0.045 + intensity * 0.41;
    float dotMask = 1.0 - smoothstep(radius - 0.055, radius + 0.055, distanceToCenter);

    vec3 darkGround = vec3(0.040, 0.024, 0.020);
    vec3 darkDot = mix(vec3(0.53, 0.13, 0.075), vec3(1.0, 0.58, 0.28), intensity);
    vec3 lightGround = vec3(0.970, 0.957, 0.933);
    vec3 lightDot = mix(vec3(0.62, 0.20, 0.13), vec3(0.39, 0.11, 0.075), intensity);
    vec3 ground = mix(darkGround, lightGround, u_light);
    vec3 ink = mix(darkDot, lightDot, u_light);
    float coverage = dotMask * (0.15 + intensity * 0.82);
    vec3 color = mix(ground, ink, coverage);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function compileShader(gl: WebGLRenderingContext, kind: number, source: string) {
  const shader = gl.createShader(kind);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function drawFallback(canvas: HTMLCanvasElement, mode: EffectMode, width: number, height: number, waveDensity: number) {
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = width;
  canvas.height = height;
  const isLight = mode === "light";
  context.fillStyle = isLight ? "#f7f4ee" : "#0a0605";
  context.fillRect(0, 0, width, height);

  const shortSide = Math.min(width, height);
  const cellSize = clamp(shortSide / 116, 6, 11);
  context.fillStyle = isLight ? "#8e321e" : "#e1743d";

  for (let y = cellSize / 2; y < height; y += cellSize) {
    for (let x = cellSize / 2; x < width; x += cellSize) {
      const px = (x - width / 2) / shortSide;
      const py = (y - height / 2) / shortSide;
      const flowX = px + Math.sin(py * 3.08 * waveDensity) * 0.16 + Math.sin(py * 3.76 * waveDensity) * 0.08;
      const flowY = py + Math.cos(flowX * 2.28 * waveDensity) * 0.15 + Math.cos(flowX * 2.76 * waveDensity) * 0.08;
      const wave = Math.sin((flowX * 5.2 + flowY * 2.6) * waveDensity + Math.sin(flowY * 4 * waveDensity) * 0.5);
      const current = Math.cos((flowY * 4.5 - flowX * 1.8) * waveDensity);
      const intensity = clamp((wave * 0.68 + current * 0.32 + 0.56) / 1.44, 0, 1);
      const radius = cellSize * (0.045 + intensity * 0.41);
      context.globalAlpha = 0.15 + intensity * 0.82;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}

export function HalftoneFlow({
  mode = "dark",
  hue = 0,
  saturation = 1,
  brightness = 1,
  waveDensity = 1,
  playing = true,
  className,
  style,
}: HalftoneFlowProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const playbackRef = useRef<{ play: () => void; pause: () => void } | null>(null);
  const safeMode: EffectMode = mode === "light" ? "light" : "dark";
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);
  const safeWaveDensity = clamp(waveDensity, 0.5, 2.5);

  useEffect(() => {
    const host = hostRef.current;
    const fallback = fallbackRef.current;
    if (!host || !fallback) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowPower = window.matchMedia("(pointer: coarse), (max-width: 760px)").matches;
    const glCanvas = document.createElement("canvas");
    glCanvas.setAttribute("aria-hidden", "true");
    glCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";

    const gl = glCanvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    const vertex = gl ? compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER) : null;
    const fragment = gl ? compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER) : null;
    const program = gl && vertex && fragment ? gl.createProgram() : null;
    if (gl && program && vertex && fragment) {
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
    }

    const ready = Boolean(gl && program && gl.getProgramParameter(program, gl.LINK_STATUS));
    const buffer = ready && gl ? gl.createBuffer() : null;
    let resolution: WebGLUniformLocation | null = null;
    let time: WebGLUniformLocation | null = null;
    let light: WebGLUniformLocation | null = null;
    let waves: WebGLUniformLocation | null = null;
    let lost = false;

    if (ready && gl && program && buffer) {
      host.appendChild(glCanvas);
      fallback.hidden = true;
      fallback.style.display = "none";
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      resolution = gl.getUniformLocation(program, "u_resolution");
      time = gl.getUniformLocation(program, "u_time");
      light = gl.getUniformLocation(program, "u_light");
      waves = gl.getUniformLocation(program, "u_waves");
    }

    let visible = false;
    let frame = 0;
    let lastFrame = 0;
    let lastTick = 0;
    let elapsed = 0;
    let size = { width: 1, height: 1 };

    function draw() {
      if (!ready || !buffer || !gl || lost || !program) return;
      gl.uniform2f(resolution, size.width, size.height);
      gl.uniform1f(time, motion.matches ? 0 : elapsed);
      gl.uniform1f(light, safeMode === "light" ? 1 : 0);
      gl.uniform1f(waves, safeWaveDensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
    }

    function tick(now: number) {
      frame = 0;
      if (!visible || document.hidden || motion.matches || lost || !playingRef.current) return;
      if (lastTick) elapsed += Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;
      if (now - lastFrame >= 1000 / (lowPower ? 18 : 30)) {
        draw();
        lastFrame = now;
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (frame || !ready || !buffer || !visible || document.hidden || motion.matches || lost || !playingRef.current) return;
      frame = requestAnimationFrame(tick);
    }

    function resize() {
      const bounds = host!.getBoundingClientRect();
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        lowPower ? 1 : 1.5,
        Math.sqrt(1_800_000 / Math.max(1, bounds.width * bounds.height)),
      );
      size = {
        width: Math.max(1, Math.round(bounds.width * pixelRatio)),
        height: Math.max(1, Math.round(bounds.height * pixelRatio)),
      };
      if (ready && buffer && gl && !lost) {
        if (glCanvas.width !== size.width || glCanvas.height !== size.height) {
          glCanvas.width = size.width;
          glCanvas.height = size.height;
          gl.viewport(0, 0, size.width, size.height);
        }
        draw();
      } else {
        drawFallback(fallback!, safeMode, size.width, size.height, safeWaveDensity);
      }
    }

    function showFallback(event?: Event) {
      event?.preventDefault();
      lost = true;
      stop();
      glCanvas.hidden = true;
      glCanvas.style.display = "none";
      fallback!.hidden = false;
      fallback!.style.display = "block";
      drawFallback(fallback!, safeMode, size.width, size.height, safeWaveDensity);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0.01 });
    visibilityObserver.observe(host);
    const onVisibilityChange = () => document.hidden ? stop() : start();
    const onMotionChange = () => {
      if (motion.matches) {
        stop();
        draw();
      } else start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    motion.addEventListener("change", onMotionChange);
    glCanvas.addEventListener("webglcontextlost", showFallback);
    playbackRef.current = { play: start, pause: stop };
    resize();

    return () => {
      stop();
      playbackRef.current = null;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motion.removeEventListener("change", onMotionChange);
      glCanvas.removeEventListener("webglcontextlost", showFallback);
      glCanvas.remove();
      fallback.hidden = false;
      fallback.style.display = "block";
      if (gl && buffer) gl.deleteBuffer(buffer);
      if (gl && program) gl.deleteProgram(program);
      if (gl && vertex) gl.deleteShader(vertex);
      if (gl && fragment) gl.deleteShader(fragment);
    };
  }, [safeMode, safeWaveDensity]);

  useEffect(() => {
    playingRef.current = playing;
    if (playing) playbackRef.current?.play();
    else playbackRef.current?.pause();
  }, [playing]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: safeMode === "light" ? "#f7f4ee" : "#0a0605",
        filter: `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`,
        ...style,
      }}
    >
      <canvas ref={fallbackRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

export default HalftoneFlow;
