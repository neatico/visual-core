export interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  flipX?: boolean;
  flipY?: boolean;
}
function assertLayout(layout: Layout): void {
  for (const field of ["x", "y", "width", "height"] as const)
    if (!Number.isFinite(layout[field]))
      throw new TypeError(`Invalid layout ${field}`);
  for (const field of [
    "rotation",
    "scaleX",
    "scaleY",
    "skewX",
    "skewY",
  ] as const)
    if (layout[field] !== undefined && !Number.isFinite(layout[field]))
      throw new TypeError(`Invalid layout ${field}`);
  if (layout.width < 0 || layout.height < 0)
    throw new RangeError("Layout dimensions cannot be negative");
}
export type Matrix = [number, number, number, number, number, number];
export function layoutMatrix(l: Layout): Matrix {
  assertLayout(l);
  const angle = ((l.rotation || 0) * Math.PI) / 180,
    cos = Math.cos(angle),
    sin = Math.sin(angle);
  const sx = (l.scaleX ?? 1) * (l.flipX ? -1 : 1),
    sy = (l.scaleY ?? 1) * (l.flipY ? -1 : 1);
  const kx = Math.tan(((l.skewX || 0) * Math.PI) / 180),
    ky = Math.tan(((l.skewY || 0) * Math.PI) / 180);
  const a = cos * sx * (1 + kx * ky) - sin * sy * ky,
    b = sin * sx * (1 + kx * ky) + cos * sy * ky,
    c = cos * sx * kx - sin * sy,
    d = sin * sx * kx + cos * sy;
  const x = l.width / 2,
    y = l.height / 2;
  return [a, b, c, d, l.x + x - a * x - c * y, l.y + y - b * x - d * y];
}
export function multiplyMatrix(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}
export function flattenGroupLayout<T extends Layout>(
  parent: Layout,
  child: T,
): T {
  const [a, b, c, d, e, f] = multiplyMatrix(
    layoutMatrix(parent),
    layoutMatrix(child),
  );
  const scaleX = Math.hypot(a, b);
  if (!Number.isFinite(scaleX) || scaleX < 1e-8)
    throw new Error("Cannot ungroup a degenerate transform");
  const det = a * d - b * c;
  let outScaleX = scaleX;
  let outScaleY = det / scaleX;
  let skewX = (Math.atan((a * c + b * d) / (scaleX * scaleX)) * 180) / Math.PI;
  let skewY = 0;
  let flipX = false;
  let flipY = false;
  // When skew is ~0, move reflection into flip flags so editor checkboxes
  // stay in sync with the mirrored visual (world matrix unchanged).
  if (Math.abs(skewX) < 1e-6 && Math.abs(skewY) < 1e-6) {
    if (outScaleY < 0) {
      flipY = true;
      outScaleY = -outScaleY;
    }
  }
  return {
    ...child,
    x: e - child.width / 2 + (a * child.width) / 2 + (c * child.height) / 2,
    y: f - child.height / 2 + (b * child.width) / 2 + (d * child.height) / 2,
    rotation: (Math.atan2(b, a) * 180) / Math.PI,
    scaleX: outScaleX,
    scaleY: outScaleY,
    skewX,
    skewY,
    flipX,
    flipY,
  };
}
export function layoutBounds(l: Layout) {
  const [a, b, c, d, e, f] = layoutMatrix(l);
  const points = [
    [0, 0],
    [l.width, 0],
    [0, l.height],
    [l.width, l.height],
  ].map(([x, y]) => [a * x + c * y + e, b * x + d * y + f]);
  return {
    minX: Math.min(...points.map((p) => p[0])),
    maxX: Math.max(...points.map((p) => p[0])),
    minY: Math.min(...points.map((p) => p[1])),
    maxY: Math.max(...points.map((p) => p[1])),
  };
}
