const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const pluginDir = path.join(__dirname, '../packages/wp-plugin');
const distDir = path.join(__dirname, '../dist');
const zipPath = path.join(distDir, 'seosuite-connector.zip');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  const zip = new AdmZip();
  // Add the directory to the zip, but place it inside a 'seosuite-connector' folder
  zip.addLocalFolder(pluginDir, 'seosuite-connector');
  zip.writeZip(zipPath);
  console.log(`✅ Plugin successfully packaged at ${zipPath}`);
} catch (e) {
  console.error('Error creating zip:', e);
  process.exit(1);
}
