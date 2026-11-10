import { profile } from './surfaces.js';

// The shell is one lofted surface. Between the bumpers every station is a
// half-section from the bonnet or deck centreline, over the wing crest, down the
// flank and under the sill. Ahead of `noseStart` and behind `tailStart` each
// longitudinal line curves round in plan and closes on the centreline profile of
// the nose or tail, so the bumpers are part of the same continuous surface.
// Heights were read from a calibrated side photograph of a 987.
export const noseStart = 1.66,
  tailStart = -1.74;
export const axles = [1.2075, -1.2075];
export const archRadius = (axle) => (axle > 0 ? 0.368 : 0.38);

const table = (rows) => (z) => profile(rows, z);
const centre = table([
  [-1.74, 0.785],
  [-1.5, 0.818],
  [-1.25, 0.838],
  [-0.95, 0.85],
  [-0.7, 0.85],
  [0, 0.83],
  [0.7, 0.81],
  [0.95, 0.77],
  [1.2, 0.718],
  [1.45, 0.668],
  [1.66, 0.632],
]);
// Half-width of the bonnet shut line, which runs along the inner flank of each wing.
const bonnetEdge = table([
  [0.75, 0.6],
  [1.2, 0.585],
  [1.6, 0.55],
  [1.86, 0.47],
  [1.97, 0.4],
]);
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
const crestY = table([
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
const half = table([
  [-1.74, 0.852],
  [-1.5, 0.893],
  [-1.25, 0.9],
  [-0.95, 0.89],
  [-0.65, 0.868],
  [-0.2, 0.86],
  [0.3, 0.862],
  [0.8, 0.876],
  [1.2, 0.886],
  [1.45, 0.876],
  [1.66, 0.852],
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
export const marks = counts.reduce((list, n) => [...list, list.at(-1) + n], [0]);
export const columns = marks.at(-1) + 1;

function hermite(a, ta, b, tb, t) {
  const t2 = t * t,
    t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1,
    h10 = t3 - 2 * t2 + t,
    h01 = -2 * t3 + 3 * t2,
    h11 = t3 - t2;
  return [
    h00 * a[0] + h10 * ta[0] + h01 * b[0] + h11 * tb[0],
    h00 * a[1] + h10 * ta[1] + h01 * b[1] + h11 * tb[1],
  ];
}

// Half-section [x, y] points at a station; index 0 is the top centreline.
export function section(z) {
  const p0 = [0, centre(z)],
    p1 = [crestX(z), crestY(z)],
    p2 = [half(z), waistY(z)],
    p3 = [sillX(z), bottom(z)],
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
        // Toward the nose the rise starts further in, so the headlamps sit on a smooth flank.
        const knee = (bonnetEdge(z) - 0.05 - 0.035 * smooth(1.2, 1.66, z)) / p1[0];
        const u = bonnetSpacing(i / counts[s], knee);
        const y = p0[1] + (p1[1] - p0[1]) * bonnetRise(u, knee);
        point[0] = lerp(point[0], p1[0] * u, lid);
        point[1] = lerp(point[1], y, lid);
      }
      points.push(point);
    }
  });
  return points;
}

// Share of the centre-to-crest rise at a fraction u of the crest width. The lid
// is nearly flat; from `knee`, just inside the shut line, the wing rises to its crest.
function bonnetRise(u, knee, lid = 0.32) {
  const t = Math.min(1, Math.max(0, (u - knee) / (1 - knee)));
  return lid * Math.sin((Math.PI * u) / 2) ** 2 + (1 - lid) * t ** 3 * (t * (6 * t - 15) + 10);
}
// Spends 40% of the columns on the wing flank outside `knee`.
function bonnetSpacing(v, knee, share = 0.6) {
  return v <= share ? (v / share) * knee : knee + ((v - share) / (1 - share)) * (1 - knee);
}

// Centreline profiles [tau, y, z]; tau 0 is the bonnet or lid edge, 1 the underside.
const noseProfile = [
  [0, 0.595, 2.0],
  [0.22, 0.52, 2.135],
  [0.38, 0.44, 2.19],
  [0.5, 0.37, 2.215],
  [0.68, 0.26, 2.21],
  [0.85, 0.16, 2.18],
  [1, 0.125, 2.07],
];
const tailProfile = [
  [0, 0.768, -1.965],
  [0.18, 0.7, -2.015],
  [0.34, 0.6, -2.07],
  [0.5, 0.48, -2.105],
  [0.7, 0.37, -2.115],
  [0.85, 0.235, -2.1],
  [1, 0.215, -1.97],
];
const along = (rows, tau, column) =>
  profile(
    rows.map((row) => [row[0], row[column]]),
    tau
  );
// Section index to centreline-profile position.
function tauOf(i) {
  const stops = [0, 0.22, 0.5, 0.86, 1];
  const s = marks.findIndex((mark, j) => i <= marks[j + 1]);
  const t = (i - marks[s]) / (marks[s + 1] - marks[s]);
  return stops[s] + (stops[s + 1] - stops[s]) * t;
}
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (rows, i) => profile(rows, i / (columns - 1));

// Plan-view squareness and height easing per longitudinal line.
function endLine(i, isNose) {
  return isNose
    ? {
        squareness: ramp([[0, 3.8], [0.3, 3.8], [0.6, 3.5], [1, 2.8]], i),
        easing: ramp([[0, 1.6], [0.25, 1.0], [0.6, 1.1], [1, 1.2]], i),
      }
    : {
        squareness: ramp([[0, 3.6], [0.3, 3.8], [0.6, 3.7], [1, 3.2]], i),
        easing: ramp([[0, 2.6], [0.3, 1.8], [0.6, 1.3], [1, 1.3]], i),
      };
}

export function endPoint(i, start, theta, isNose) {
  const [x0, y0] = start;
  const tau = tauOf(i);
  const rows = isNose ? noseProfile : tailProfile;
  const yEnd = along(rows, tau, 1),
    zEnd = along(rows, tau, 2),
    z0 = isNose ? noseStart : tailStart;
  const { squareness, easing } = endLine(i, isNose);
  const c = Math.cos(theta),
    s = Math.sin(theta);
  const w = Math.pow(Math.max(0, s), 2 / squareness);
  const x = x0 * Math.pow(Math.max(0, c), 2 / squareness);
  let y = y0 + (yEnd - y0) * Math.pow(w, easing);
  // The ducktail lid kicks up just ahead of its trailing edge.
  if (!isNose && i < marks[1])
    y += 0.014 * Math.sin(Math.PI * Math.min(1, w)) ** 2 * w * Math.cos((i / marks[1]) * Math.PI / 2);
  return [x, y, z0 + (zEnd - z0) * w];
}

export const stations = { tail: 22, middle: 156, nose: 22 };

// Rows of half-section points [x, y, z] from the tail tip to the nose tip.
export function grid() {
  const rows = [];
  const tailStartSection = section(tailStart),
    noseStartSection = section(noseStart);
  for (let k = stations.tail; k >= 1; k--) {
    const theta = (k / stations.tail) * (Math.PI / 2);
    rows.push(tailStartSection.map((point, i) => endPoint(i, point, theta, false)));
  }
  for (let k = 0; k <= stations.middle; k++) {
    const z = lerp(tailStart, noseStart, k / stations.middle);
    rows.push(section(z).map(([x, y]) => [x, y, z]));
  }
  for (let k = 1; k <= stations.nose; k++) {
    const theta = (k / stations.nose) * (Math.PI / 2);
    rows.push(noseStartSection.map((point, i) => wingDrop(endPoint(i, point, theta, true))));
  }
  return rows;
}

const smooth = (a, b, t) => {
  const s = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return s * s * (3 - 2 * s);
};
// Ahead of the lamps the wings fall below the bonnet, which ends at its shut
// line, so the lamp glass faces forward and its lower edge meets the bumper at
// about 0.48 m.
function wingDrop([x, y, z]) {
  // Across the bumper face the step widens into one rounded chin between the lamps.
  const chin = smooth(1.84, 2.05, z);
  const outside = smooth(-0.05 - 0.13 * chin, 0.1 + 0.03 * chin, x - bonnetEdge(z));
  const drop = 0.1 * outside * smooth(1.7, 2.02, z) * smooth(0.38, 0.68, y);
  return [x, y - drop, z];
}
