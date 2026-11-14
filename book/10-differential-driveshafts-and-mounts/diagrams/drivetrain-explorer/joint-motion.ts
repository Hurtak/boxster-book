import { Object3D, Quaternion, Vector3 } from 'three';

/** Uncalibrated joint demonstration. The neutral installed assembly is unchanged. */
export function createJointMotion(model: Object3D) {
  const sides = [1, -1].map((side) => {
    const name = side === 1 ? 'left' : 'right';
    const shaft = model.getObjectByName(`${name}-shaft`)!;
    const hub = model.getObjectByName(`${name}-hub`)!;
    return {
      side,
      hub,
      children: shaft.children.map((object) => ({
        object,
        position: object.position.clone(),
        rotation: object.quaternion.clone(),
      })),
    };
  });
  return (amount: number) => {
    const value = Number.isFinite(amount) ? Math.max(-1, Math.min(1, amount)) : 0;
    for (const { side, hub, children } of sides) {
      const dx = -side * 0.02 * value * value;
      const dy = 0.065 * value;
      // The shared viewer resets each top-level part's assembled/exploded position.
      hub.position.x += dx;
      hub.position.y += dy;
      const direction = new Vector3(0.4 + side * dx, side * dy, 0).normalize();
      const tilt = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), direction);
      for (const { object, position, rotation } of children) {
        object.position.copy(position);
        object.quaternion.copy(rotation);
        if (object.name === 'rigid-axle-bar') {
          // Follow the outboard joint, keeping the bar's geometry and scale fixed.
          object.position.set(side * 0.2 + dx, dy, 0).addScaledVector(direction, -side * 0.2);
          object.quaternion.premultiply(tilt);
        } else {
          const fraction = Math.max(0, Math.min(1, (side * position.x + 0.18) / 0.36));
          object.position.x += dx * fraction;
          object.position.y += dy * fraction;
          if (fraction > 0 && fraction < 1) object.quaternion.premultiply(tilt);
        }
      }
    }
  };
}
