interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// Keep the established nearby placements, then search the remaining canvas if
// a long title or a dense assembly occupies all of those positions.
export function placeMarker(
  anchor: Point,
  width: number,
  height: number,
  placed: readonly Point[],
  blocked: Rectangle,
): Point | undefined {
  const free = (point: Point) =>
    point.x >= 14 &&
    point.x <= width - 14 &&
    point.y >= 18 &&
    point.y <= height - 14 &&
    placed.every((other) => Math.hypot(point.x - other.x, point.y - other.y) >= 28) &&
    Math.hypot(
      point.x - Math.max(blocked.left, Math.min(point.x, blocked.right)),
      point.y - Math.max(blocked.top, Math.min(point.y, blocked.bottom)),
    ) >= 16;
  for (const [dx, dy] of [
    [0, -24],
    [-30, -16],
    [30, -16],
    [-34, 20],
    [34, 20],
    [0, 32],
    [-55, -35],
    [55, 35],
    [-65, 12],
    [65, -12],
  ]) {
    const point = { x: anchor.x + dx, y: anchor.y + dy };
    if (free(point)) return point;
  }
  let best: Point | undefined;
  let distance = Infinity;
  for (let y = 18; y <= height - 14; y += 28)
    for (let x = 14; x <= width - 14; x += 28) {
      const next = (x - anchor.x) ** 2 + (y - anchor.y) ** 2;
      if (next < distance && free({ x, y })) {
        best = { x, y };
        distance = next;
      }
    }
  return best;
}
