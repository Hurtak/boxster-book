import { writeFile } from 'node:fs/promises';
import { staticFrame } from './drawing';

for (let index = 0; index < 3; index++) {
  await writeFile(
    new URL(`../../images/speaker-plan-${index}.svg`, import.meta.url),
    staticFrame(index).replace(/[\t ]+$/gm, ''),
  );
}
await writeFile(new URL('./poster.svg', import.meta.url), staticFrame(0).replace(/[\t ]+$/gm, ''));
