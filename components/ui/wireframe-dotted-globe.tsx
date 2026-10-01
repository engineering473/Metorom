import { useEffect, useRef } from "react";

type Coordinate = [longitude: number, latitude: number];

interface RotatingEarthProps {
  className?: string;
}

// Simplified land silhouettes keep the globe self-contained and usable offline.
// The point cloud follows these coastlines; Kyoto uses its actual coordinates.
const LAND: Coordinate[][] = [
  [
    [-11, 35], [-10, 44], [-7, 52], [-11, 58], [-6, 63], [4, 58], [10, 54], [15, 55],
    [19, 60], [25, 65], [31, 70], [44, 68], [58, 70], [70, 73], [90, 76], [112, 75],
    [129, 72], [143, 68], [155, 62], [166, 61], [178, 66], [180, 53], [173, 51],
    [162, 56], [156, 54], [150, 48], [145, 44], [140, 42], [136, 46], [131, 43],
    [128, 39], [125, 39], [123, 41], [121, 38], [124, 36], [122, 34], [120, 32],
    [122, 29], [120, 25], [116, 23], [112, 21], [108, 18], [109, 14], [106, 10],
    [104, 4], [101, 1], [98, 5], [99, 12], [97, 19], [94, 22], [89, 22], [86, 21],
    [82, 17], [78, 9], [74, 8], [72, 13], [69, 21], [64, 25], [58, 24], [56, 27],
    [52, 25], [49, 30], [46, 30], [43, 35], [38, 37], [35, 42], [29, 41], [27, 37],
    [20, 39], [15, 37], [9, 43], [3, 43], [-2, 40], [-7, 43], [-11, 35],
  ],
  [
    [-17, 37], [-5, 36], [9, 37], [16, 32], [24, 31], [32, 30], [35, 23], [40, 14],
    [51, 12], [51, 5], [44, -1], [42, -12], [38, -18], [35, -26], [31, -32],
    [22, -35], [17, -31], [14, -24], [11, -16], [10, -5], [5, 4], [-3, 5], [-8, 11],
    [-16, 13], [-17, 22], [-13, 28], [-17, 37],
  ],
  [
    [-168, 66], [-159, 71], [-148, 69], [-140, 62], [-130, 58], [-125, 52],
    [-124, 46], [-119, 39], [-117, 32], [-111, 31], [-107, 27], [-100, 25],
    [-97, 20], [-92, 18], [-89, 21], [-86, 21], [-83, 26], [-81, 30], [-82, 35],
    [-76, 37], [-72, 43], [-66, 45], [-61, 52], [-53, 55], [-56, 61], [-69, 60],
    [-79, 63], [-87, 66], [-98, 69], [-107, 73], [-126, 72], [-144, 71], [-158, 64],
    [-168, 66],
  ],
  [
    [-81, 12], [-76, 9], [-71, 10], [-67, 11], [-62, 10], [-60, 5], [-51, 3],
    [-49, -1], [-44, -3], [-35, -7], [-38, -13], [-39, -18], [-44, -23],
    [-47, -28], [-52, -33], [-56, -38], [-63, -43], [-67, -49], [-72, -54],
    [-75, -49], [-74, -40], [-72, -31], [-70, -19], [-76, -13], [-79, -4],
    [-81, 4], [-81, 12],
  ],
  [
    [112, -11], [116, -20], [121, -18], [127, -14], [136, -12], [144, -14],
    [149, -22], [153, -28], [150, -37], [143, -39], [136, -35], [129, -32],
    [123, -34], [116, -30], [113, -24], [112, -11],
  ],
  [[-52, 60], [-44, 60], [-38, 66], [-41, 74], [-48, 82], [-54, 83], [-60, 76], [-58, 68], [-52, 60]],
  [[130, 31], [133, 32], [135, 34], [137, 35], [140, 38], [141, 41], [139, 40], [136, 37], [134, 35], [131, 34], [130, 31]],
  [[140, 41], [143, 42], [146, 44], [145, 45], [142, 45], [140, 43], [140, 41]],
  [[130, 32], [132, 34], [131, 34], [129, 33], [130, 32]],
  [[134, 34], [135, 35], [133, 34], [134, 34]],
  [[119, 25], [121, 26], [122, 24], [121, 22], [120, 21], [119, 25]],
  [[120, 18], [122, 19], [124, 15], [125, 12], [122, 11], [120, 14], [120, 18]],
  [[122, 10], [124, 11], [125, 8], [123, 6], [122, 10]],
  [[125, 9], [127, 9], [127, 6], [125, 5], [125, 9]],
  [[95, 6], [102, 5], [106, 1], [110, -1], [109, -7], [105, -6], [102, -3], [97, 0], [95, 6]],
  [[105, -5], [112, -6], [115, -8], [114, -9], [108, -8], [105, -5]],
  [[108, 7], [115, 7], [118, 4], [116, -1], [111, -4], [109, 0], [108, 7]],
  [[120, 2], [125, 2], [127, -1], [125, -4], [121, -3], [120, 2]],
  [[131, -1], [136, -2], [140, -6], [145, -8], [150, -6], [148, -2], [141, -2], [137, 1], [131, -1]],
  [[166, -34], [173, -40], [175, -42], [171, -43], [168, -39], [166, -34]],
  [[172, -41], [178, -43], [178, -46], [174, -46], [172, -41]],
  [[47, -13], [50, -16], [50, -25], [47, -26], [44, -20], [47, -13]],
  [[-84, 23], [-80, 24], [-75, 21], [-78, 20], [-84, 23]],
  [[-75, 19], [-69, 20], [-68, 18], [-73, 18], [-75, 19]],
  [[-11, 50], [-5, 51], [-2, 56], [-5, 59], [-8, 56], [-11, 50]],
  [[-10, 52], [-6, 54], [-7, 55], [-10, 54], [-10, 52]],
];

const KYOTO: Coordinate = [135.7681, 35.0116];
const DOT_STEP = 2.65;
const radians = (degrees: number) => degrees * Math.PI / 180;

function isInside(point: Coordinate, polygon: Coordinate[]) {
  const [longitude, latitude] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[i];
    const [bx, by] = polygon[j];
    if ((ay > latitude) !== (by > latitude) && longitude < ((bx - ax) * (latitude - ay)) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside;
}

const LAND_DOTS: Coordinate[] = LAND.flatMap((polygon, index) => {
  const longitudes = polygon.map((point) => point[0]);
  const latitudes = polygon.map((point) => point[1]);
  const dots: Coordinate[] = [];
  for (let latitude = Math.ceil(Math.min(...latitudes) / DOT_STEP) * DOT_STEP; latitude <= Math.max(...latitudes); latitude += DOT_STEP) {
    for (let longitude = Math.ceil(Math.min(...longitudes) / DOT_STEP) * DOT_STEP; longitude <= Math.max(...longitudes); longitude += DOT_STEP) {
      const offset = Math.sin(longitude * 12.9898 + latitude * 78.233 + index * 4.1414);
      const dot: Coordinate = [longitude + offset * 0.21, latitude + offset * 0.16];
      if (isInside(dot, polygon)) dots.push(dot);
    }
  }
  return dots;
});

export default function RotatingEarth({ className = "" }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resetRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let radius = 1;
    let centerLongitude = 125;
    let centerLatitude = 18;
    let settledLongitude = centerLongitude;
    let settledLatitude = centerLatitude;
    let dragging = false;
    let dragStart = { x: 0, y: 0, longitude: 0, latitude: 0 };
    let inView = true;
    let frame = 0;
    let lastPaint = 0;

    const project = ([longitude, latitude]: Coordinate) => {
      const phi = radians(latitude);
      const phi0 = radians(centerLatitude);
      const delta = radians(longitude - centerLongitude);
      const depth = Math.sin(phi) * Math.sin(phi0) + Math.cos(phi) * Math.cos(phi0) * Math.cos(delta);
      return {
        x: width / 2 + radius * Math.cos(phi) * Math.sin(delta),
        y: height / 2 - radius * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(delta)),
        depth,
      };
    };

    const strokeGeographicLine = (points: Coordinate[], colour: string, lineWidth: number) => {
      context.beginPath();
      let started = false;
      for (const point of points) {
        const projected = project(point);
        if (projected.depth <= 0) {
          started = false;
          continue;
        }
        if (!started) context.moveTo(projected.x, projected.y);
        else context.lineTo(projected.x, projected.y);
        started = true;
      }
      context.strokeStyle = colour;
      context.lineWidth = lineWidth;
      context.stroke();
    };

    const paint = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const ocean = context.createRadialGradient(width * .38, height * .29, radius * .08, width / 2, height / 2, radius);
      ocean.addColorStop(0, "#34241e");
      ocean.addColorStop(.75, "#211a17");
      ocean.addColorStop(1, "#130f0d");
      context.fillStyle = ocean;
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      context.fill();

      for (let latitude = -60; latitude <= 60; latitude += 30) {
        const line: Coordinate[] = [];
        for (let longitude = -180; longitude <= 180; longitude += 2) line.push([longitude, latitude]);
        strokeGeographicLine(line, "rgba(252, 235, 213, .11)", .75);
      }
      for (let longitude = -180; longitude < 180; longitude += 30) {
        const line: Coordinate[] = [];
        for (let latitude = -89; latitude <= 89; latitude += 2) line.push([longitude, latitude]);
        strokeGeographicLine(line, "rgba(252, 235, 213, .11)", .75);
      }

      context.fillStyle = "#e8c7ad";
      const dotSize = Math.max(1, radius / 210);
      for (const dot of LAND_DOTS) {
        const point = project(dot);
        if (point.depth <= .015) continue;
        context.globalAlpha = .33 + point.depth * .52;
        context.beginPath();
        context.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      for (const polygon of LAND) {
        const detailed: Coordinate[] = [];
        for (let index = 1; index < polygon.length; index++) {
          const from = polygon[index - 1];
          const to = polygon[index];
          const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / 2));
          for (let step = 0; step < steps; step++) {
            detailed.push([from[0] + (to[0] - from[0]) * step / steps, from[1] + (to[1] - from[1]) * step / steps]);
          }
        }
        detailed.push(polygon[polygon.length - 1]);
        strokeGeographicLine(detailed, "rgba(252, 235, 213, .28)", .8);
      }

      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      context.strokeStyle = "rgba(252, 235, 213, .62)";
      context.lineWidth = 1.2;
      context.stroke();

      const kyoto = project(KYOTO);
      if (kyoto.depth > .04) {
        const pulse = motionPreference.matches ? 0 : Math.sin(time * .002) * 2.5;
        context.fillStyle = "rgba(229, 105, 65, .18)";
        context.beginPath();
        context.arc(kyoto.x, kyoto.y, 17 + pulse, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#f58b63";
        context.lineWidth = 1.4;
        context.beginPath();
        context.arc(kyoto.x, kyoto.y, 9, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = "#ffb38c";
        context.beginPath();
        context.arc(kyoto.x, kyoto.y, 3.5, 0, Math.PI * 2);
        context.fill();

        const labelOnLeft = kyoto.x > width * .62;
        const lineEnd = kyoto.x + (labelOnLeft ? -48 : 48);
        context.strokeStyle = "#f58b63";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(kyoto.x + (labelOnLeft ? -12 : 12), kyoto.y - 9);
        context.lineTo(lineEnd, kyoto.y - 26);
        context.stroke();
        context.textAlign = labelOnLeft ? "right" : "left";
        context.fillStyle = "#fff6ea";
        context.font = "600 12px 'DM Sans', sans-serif";
        context.fillText("KYOTO", lineEnd + (labelOnLeft ? -4 : 4), kyoto.y - 32);
        context.fillStyle = "#f2ba9b";
        context.font = "500 10px 'DM Sans', sans-serif";
        context.fillText("JAPAN", lineEnd + (labelOnLeft ? -4 : 4), kyoto.y - 17);
      }
    };

    const sizeCanvas = () => {
      const box = canvas.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      radius = Math.min(width, height) * .427;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      paint(performance.now());
    };

    const animate = (time: number) => {
      frame = window.requestAnimationFrame(animate);
      if (!inView || document.hidden || motionPreference.matches || dragging || time - lastPaint < 42) return;
      lastPaint = time;
      centerLongitude = settledLongitude + Math.sin(time * .00018) * 2.6;
      centerLatitude = settledLatitude + Math.sin(time * .00013) * .9;
      paint(time);
    };

    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      dragStart = { x: event.clientX, y: event.clientY, longitude: centerLongitude, latitude: centerLatitude };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      centerLongitude = dragStart.longitude - (event.clientX - dragStart.x) * .28;
      centerLatitude = Math.max(-70, Math.min(70, dragStart.latitude + (event.clientY - dragStart.y) * .22));
      paint(performance.now());
    };
    const pointerUp = () => {
      if (!dragging) return;
      dragging = false;
      settledLongitude = centerLongitude;
      settledLatitude = centerLatitude;
      canvas.style.cursor = "grab";
    };
    const keyDown = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft") centerLongitude -= 8;
      if (event.key === "ArrowRight") centerLongitude += 8;
      if (event.key === "ArrowUp") centerLatitude = Math.min(70, centerLatitude + 8);
      if (event.key === "ArrowDown") centerLatitude = Math.max(-70, centerLatitude - 8);
      settledLongitude = centerLongitude;
      settledLatitude = centerLatitude;
      paint(performance.now());
    };

    resetRef.current = () => {
      settledLongitude = centerLongitude = 125;
      settledLatitude = centerLatitude = 18;
      paint(performance.now());
    };

    const resizeObserver = new ResizeObserver(sizeCanvas);
    resizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) paint(performance.now());
    }, { threshold: .05 });
    visibilityObserver.observe(canvas);
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);
    canvas.addEventListener("keydown", keyDown);
    sizeCanvas();
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("keydown", keyDown);
      resetRef.current = () => {};
    };
  }, []);

  return (
    <div className={`dotted-globe ${className}`} role="group" aria-label="Interactive dotted globe centered on Kyoto, Japan">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Dotted globe. Use arrow keys or drag to rotate. Kyoto, Japan is marked."
        style={{ display: "block", width: "100%", height: "100%", cursor: "grab", touchAction: "pan-y" }}
      />
      <button className="dotted-globe__reset" type="button" onClick={() => resetRef.current()}>
        Locate Kyoto <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
