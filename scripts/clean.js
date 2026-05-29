import fs from 'fs';
import path from 'path';

function cleanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const curPath = path.join(dirPath, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      cleanDir(curPath);
      try {
        console.log(`Deleting dir: ${curPath}`);
        fs.rmdirSync(curPath);
      } catch (err) {
        console.error(`Failed to delete dir ${curPath}:`, err.message);
      }
    } else {
      try {
        console.log(`Deleting file: ${curPath}`);
        fs.unlinkSync(curPath);
      } catch (err) {
        console.error(`Failed to delete file ${curPath}:`, err.message);
      }
    }
  }
}

try {
  if (fs.existsSync('dist')) {
    console.log('Starting detailed clean of dist...');
    cleanDir('dist');
    console.log('Deleting root dist dir...');
    fs.rmdirSync('dist');
    console.log('Clean dist finished.');
  }
  if (fs.existsSync('server.js')) {
    fs.unlinkSync('server.js');
    console.log('server.js cleaned.');
  }
} catch (err) {
  console.error('Fatal clean error:', err);
}
