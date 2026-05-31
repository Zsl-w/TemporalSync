import fs from 'fs';
import path from 'path';

/**
 * Copy static subdirectories from public/ to dist/.
 * Vite sometimes doesn't recursively copy nested public subdirectories,
 * so we manually ensure they land in dist/.
 */

const PUBLIC_DIR = 'public';
const DIST_DIR = 'dist';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-static] Source not found: ${src}`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[copy-static] Copied: ${destPath}`);
    }
  }
}

try {
  // Copy all subdirectories from public/ to dist/
  const publicEntries = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true });
  for (const entry of publicEntries) {
    if (entry.isDirectory()) {
      const src = path.join(PUBLIC_DIR, entry.name);
      const dest = path.join(DIST_DIR, entry.name);
      copyDirRecursive(src, dest);
      console.log(`[copy-static] Copied directory: ${entry.name}/`);
    }
  }
  console.log('[copy-static] Done.');
} catch (err) {
  console.error('[copy-static] Error:', err.message);
  process.exit(1);
}
