import { appendFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const environmentFile = process.env.GITHUB_ENV;
if (!environmentFile) throw new Error('GITHUB_ENV must point to the Actions environment file');
await appendFile(environmentFile, `BROWSER_EXECUTABLE_PATH=${chromium.executablePath()}\n`);
