import { rmSync } from 'node:fs';

try {
  rmSync('dist', { recursive: true, force: true });
  console.log('Build output cleaned.');
} catch {
  console.error('Unable to clean build output; stopping to avoid publishing stale files.');
  process.exit(1);
}
