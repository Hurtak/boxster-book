import { group, box, cylinder, annulus } from '../geometry.js';

// CDR-30 face and case, fitted to the existing centre-console aperture.
export function radioUnit(parent, m) {
  const root = group('radio-unit', parent, [0, .70, .32]);
  root.rotation.x = -.2;
  root.userData.carPart = true;
  box(root, [.205, .012, .175], m.metal, [0, -.065, 0]);
  box(root, [.012, .13, .175], m.metal, [-.097, 0, 0]);
  box(root, [.205, .13, .012], m.metal, [0, 0, .083]);
  box(root, [.215, .145, .014], m.black, [0, 0, -.088]);
  box(root, [.13, .066, .003], m.blue, [0, .012, -.097]).name = 'monochrome-screen';
  for (const x of [-.085, .085]) {
    cylinder(root, .015, .012, m.dark, [x, -.045, -.101], [Math.PI / 2, 0, 0]);
    cylinder(root, .011, .013, m.metal, [x, -.045, -.104], [Math.PI / 2, 0, 0]);
    for (const y of [-.016, .002, .02, .038]) box(root, [.022, .009, .006], m.dark, [x, y, -.099]);
  }
  box(root, [.15, .004, .005], m.metal, [0, .059, -.098]).name = 'cd-slot';
  box(root, [.16, .006, .135], m.dark, [0, .016, .005]).name = 'single-disc-drive';
  const disc = annulus(root, .055, .008, .002, m.metal, [0, .021, .008]);
  disc.rotation.set(-Math.PI / 2, 0, 0);
  for (let i = 0; i < 6; i++) box(root, [.012, .014, .03], m.dark, [-.062 + i * .025, -.042, .045]);

  return root;
}
