import { profile } from './surfaces.ts';

// The shell is one lofted surface. Between the bumpers every station is a
// half-section from the bonnet or deck centreline, over the wing crest, down the
// flank and under the sill. Ahead of `noseStart` and behind `tailStart` each
// longitudinal line curves round in plan and closes on the centreline profile of
// the nose or tail, so the bumpers are part of the same continuous surface.
// Section heights are visual approximations guided by the reference photographs.
export const noseStart = 1.66,
  tailStart = -1.74;
export const axles = [1.2075, -1.2075];
export const archRadius = (axle: number) => (axle > 0 ? 0.368 : 0.365);

const table = (rows: number[][]) => (z: number) => profile(rows, z);
// Restore the raised haunches and front wings seen in the level side reference.
// Lift the lid and crest together so the bonnet keeps its outward crown.
const upperLift = table([
  [-1.74, 0.005],
  [-1.5, 0.03],
  [-1.25, 0.045],
  [-0.95, 0.04],
  [-0.7, 0.035],
  [0, 0.03],
  [0.6, 0.03],
  [0.95, 0.04],
  [1.2, 0.045],
  [1.45, 0.03],
  [1.66, 0.01],
]);
const centreBase = table([
  [-1.74, 0.785],
  [-1.5, 0.818],
  [-1.25, 0.838],
  [-0.95, 0.85],
  [-0.7, 0.85],
  [0, 0.83],
  // A shallow crown between the wings, falling smoothly towards the nose.
  // The lower centreline formerly turned these sections into a recessed valley.
  [0.7, 0.835],
  [0.95, 0.823],
  [1.2, 0.801],
  [1.45, 0.768],
  [1.66, 0.733],
]);
const centre = (z: number) => centreBase(z) + upperLift(z);
const crestX = table([
  [-1.74, 0.64],
  [-1.5, 0.665],
  [-1.25, 0.69],
  [-0.95, 0.725],
  [-0.65, 0.765],
  [0, 0.78],
  [0.6, 0.75],
  [0.95, 0.69],
  [1.2, 0.665],
  [1.45, 0.645],
  [1.66, 0.625],
]);
const crestBase = table([
  [-1.74, 0.8],
  [-1.6, 0.84],
  [-1.45, 0.867],
  [-1.28, 0.882],
  [-1.1, 0.877],
  [-0.9, 0.862],
  [-0.68, 0.846],
  [-0.3, 0.84],
  [0.4, 0.84],
  [0.74, 0.837],
  [0.86, 0.827],
  [1.03, 0.808],
  [1.2, 0.786],
  [1.37, 0.761],
  [1.5, 0.744],
  [1.66, 0.726],
]);
const crestY = (z: number) => crestBase(z) + upperLift(z);
const half = table([
  [-1.74, 0.857],
  [-1.5, 0.898],
  [-1.25, 0.905],
  [-0.95, 0.895],
  [-0.65, 0.873],
  [-0.2, 0.865],
  [0.3, 0.867],
  [0.8, 0.881],
  [1.2, 0.891],
  [1.45, 0.881],
  [1.66, 0.857],
]);
const waistY = table([
  [-1.74, 0.56],
  [-1.25, 0.61],
  [-0.65, 0.57],
  [0, 0.55],
  [0.8, 0.53],
  [1.2, 0.52],
  [1.66, 0.47],
]);
const sillX = table([
  [-1.74, 0.79],
  [-1.25, 0.83],
  [-0.65, 0.8],
  [0.6, 0.8],
  [1.2, 0.82],
  [1.66, 0.78],
]);
const bottom = table([
  [-1.74, 0.235],
  [-1.5, 0.21],
  [-1.2, 0.17],
  [-0.8, 0.14],
  [0.8, 0.14],
  [1.2, 0.152],
  [1.45, 0.15],
  [1.66, 0.135],
]);
// Hermite tangent scale across the shoulder: round wings, a tighter door top.
const shoulderRound = table([
  [-1.74, 1.45],
  [-1.25, 1.55],
  [-0.65, 1.25],
  [0, 1.15],
  [0.6, 1.3],
  [1.2, 1.55],
  [1.66, 1.5],
]);

export const counts = [20, 16, 16, 5];
export const marks = counts.reduce((list, n) => [...list, list.at(-1)! + n], [0]);
export const columns = marks.at(-1)! + 1;

function hermite(a: number[], ta: number[], b: number[], tb: number[], t: number) {
  const t2 = t * t,
    t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1,
    h10 = t3 - 2 * t2 + t,
    h01 = -2 * t3 + 3 * t2,
    h11 = t3 - t2;
  return [h00 * a[0] + h10 * ta[0] + h01 * b[0] + h11 * tb[0], h00 * a[1] + h10 * ta[1] + h01 * b[1] + h11 * tb[1]];
}

// Half-section [x, y] points at a station; index 0 is the top centreline.
export function section(z: number) {
  // The outer rocker turns in above the lower floor. Extending the door flank
  // down to the floor gave the old model a deep rectangular side silhouette.
  const rockerStep = 0.075 * smooth(-1, -0.8, z) * (1 - smooth(0.8, 1, z));
  const p0 = [0, centre(z)],
    p1 = [crestX(z), crestY(z)],
    p2 = [half(z), waistY(z)],
    p3 = [sillX(z), bottom(z) + rockerStep],
    p4 = [0, bottom(z)];
  const k = shoulderRound(z);
  const segments = [
    [p0, [p1[0] * 1.15, 0], p1, [p1[0] * 1.15, 0]],
    [p1, [k * (p2[0] - p1[0]), 0], p2, [0, -k * (p1[1] - p2[1])]],
    [p2, [0, -1.5 * (p2[1] - p3[1])], p3, [-1.5 * (p2[0] - p3[0]), 0]],
    [p3, [-p3[0], 0], p4, [-p3[0], 0]],
  ];
  const points = [p0];
  const lid = smooth(0.55, 0.8, z);
  segments.forEach(([a, ta, b, tb], s) => {
    for (let i = 1; i <= counts[s]; i++) {
      const point = hermite(a, ta, b, tb, i / counts[s]);
      if (s === 0 && lid > 0) {
        // One smooth crown runs from the bonnet centre to each wing crest.
        const u = i / counts[s];
        const y = p0[1] + (p1[1] - p0[1]) * Math.sin((Math.PI * u) / 2) ** 2;
        point[0] = lerp(point[0], p1[0] * u, lid);
        point[1] = lerp(point[1], y, lid);
      }
      points.push(point);
    }
  });
  return points;
}

// Continue the lid's slope into a short rounded shoulder before the bumper
// turns down. Without that shared tangent the loft forms a pointed corner at
// its top centre, even when the two mirrored halves have matching normals.
function endTangent(from: number, to: number, startTangent: number, isNose: boolean) {
  // A quadratic roll keeps the bonnet turning outwards all the way to its edge.
  // Ending at the average slope makes a cubic flatten and reverse curvature.
  return isNose ? 2 * (to - from) - startTangent : to - from;
}

function roundLidCorner(rows: number[][], start: number, run: number, tau: number, isNose = false) {
  const [, y, z] = rows[0];
  const tangent = ((centre(start) - centre(start - 0.015)) / 0.015) * (z - start);
  const slope = endTangent(centre(start), y, tangent, isNose) / (z - start);
  return [rows[0], [tau, y + slope * run, z + run], ...rows.slice(1)];
}

// Centreline profiles [tau, y, z]; tau 0 is the bonnet or lid edge, 1 the underside.
const noseProfile = roundLidCorner(
  [
    [0, 0.605, 2.005],
    [0.1, 0.553, 2.085],
    // Keep this panel convex: recessing the station creates an S-bend whose
    // reflected highlight closes into a dented ring above the number plate.
    [0.22, 0.48, 2.14],
    [0.38, 0.415, 2.16],
    [0.5, 0.35, 2.175],
    [0.68, 0.26, 2.17],
    [0.85, 0.16, 2.145],
    [1, 0.125, 2.04],
  ],
  noseStart,
  0.035,
  0.04,
  true,
);
const tailProfile = roundLidCorner(
  [
    [0, 0.768, -1.985],
    [0.1, 0.745, -2.052],
    [0.18, 0.7, -2.077],
    [0.34, 0.6, -2.102],
    [0.5, 0.48, -2.12],
    [0.7, 0.37, -2.125],
    [0.85, 0.235, -2.1],
    [1, 0.215, -1.97],
  ],
  tailStart,
  -0.035,
  0.035,
);
const along = (rows: number[][], tau: number, column: number) =>
  profile(
    rows.map((row) => [row[0], row[column]]),
    tau,
  );
// Section index to centreline-profile position.
function tauOf(i: number) {
  const stops = [0, 0.22, 0.5, 0.86, 1];
  const s = marks.findIndex((mark, j) => i <= marks[j + 1]);
  const span = marks[s + 1] - marks[s],
    t = (i - marks[s]) / span;
  const slope = (j: number) =>
    j === 0 || j === marks.length - 1 ? 0 : (stops[j + 1] - stops[j - 1]) / (marks[j + 1] - marks[j - 1]);
  // Both top and underside meet their mirror with a horizontal tangent.
  // A linear endpoint mapping leaves a V-shaped ridge along the lid centre.
  return hermite([stops[s], 0], [slope(s) * span, 0], [stops[s + 1], 0], [slope(s + 1) * span, 0], t)[0];
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ramp = (rows: number[][], i: number) => profile(rows, i / (columns - 1));

// Rounded bumper corners in plan; the height blend below retains the side
// profile's tangent instead of joining the bonnet to a second inflated shape.
function endLine(i: number, isNose: boolean) {
  return isNose
    ? {
        squareness: ramp(
          [
            [0, 3.1],
            [0.3, 3.1],
            [0.6, 3.0],
            [1, 2.8],
          ],
          i,
        ),
      }
    : {
        squareness: ramp(
          [
            [0, 3.2],
            [0.3, 3.3],
            [0.6, 3.2],
            [1, 2.8],
          ],
          i,
        ),
      };
}

export function endPoint(i: number, start: number[], theta: number, isNose: boolean) {
  const [x0, y0] = start;
  const tau = tauOf(i);
  const rows = isNose ? noseProfile : tailProfile;
  const yEnd = along(rows, tau, 1),
    zEnd = along(rows, tau, 2),
    z0 = isNose ? noseStart : tailStart;
  const { squareness } = endLine(i, isNose);
  const c = Math.cos(theta),
    s = Math.sin(theta);
  const w = Math.pow(Math.max(0, s), 2 / squareness);
  const x = x0 * Math.pow(Math.max(0, c), 2 / squareness);
  const inside = section(z0 + (isNose ? -0.015 : 0.015))[i];
  const slope = (y0 - inside[1]) / (isNose ? 0.015 : -0.015);
  const tangent = slope * (zEnd - z0);
  // Keep the revised roll on the bonnet, fading out before the lamp-bearing wings.
  const roll = isNose ? 1 - smooth(0.35, 0.7, i / counts[0]) : 0;
  const finish = lerp(yEnd - y0, endTangent(y0, yEnd, tangent, isNose), roll);
  const y =
    (2 * w ** 3 - 3 * w * w + 1) * y0 +
    (w ** 3 - 2 * w * w + w) * tangent +
    (-2 * w ** 3 + 3 * w * w) * yEnd +
    (w ** 3 - w * w) * finish;
  return [x, y, z0 + (zEnd - z0) * w];
}

export const stations = { tail: 48, middle: 156, nose: 48 };

// Concentrate rows at both ends of the rounded caps. Uniform angular steps
// become widely spaced, visibly straight facets near a superellipse's poles.
const endAngle = (t: number) => (0.5 - 0.5 * Math.cos(Math.PI * t)) * (Math.PI / 2);

// Rows of half-section points [x, y, z] from the tail tip to the nose tip.
export function grid() {
  const rows = [];
  const tailStartSection = section(tailStart),
    noseStartSection = section(noseStart);
  for (let k = stations.tail; k >= 1; k--) {
    const theta = endAngle(k / stations.tail);
    rows.push(tailStartSection.map((point, i) => endPoint(i, point, theta, false)));
  }
  for (let k = 0; k <= stations.middle; k++) {
    const z = lerp(tailStart, noseStart, k / stations.middle);
    rows.push(section(z).map(([x, y]) => [x, y, z]));
  }
  for (let k = 1; k <= stations.nose; k++) {
    const theta = endAngle(k / stations.nose);
    rows.push(noseStartSection.map((point, i) => endPoint(i, point, theta, true)));
  }
  return rows;
}

const smooth = (a: number, b: number, t: number) => {
  const s = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return s * s * (3 - 2 * s);
};
