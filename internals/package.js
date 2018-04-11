// This file will package up the built binaries and plugin.json for distribution.
const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

const OUTPUT_FILE = generateFilename() + '.zip';

require('node-zip');
const zip = new JSZip();

// Add files
zip.file('plugin.json', fs.readFileSync(path.join('src', 'plugin.json')));
zip.file(path.join('bin', 'nessus-collector.js'), fs.readFileSync(path.join('dist', 'nessus-collector.js')));
zip.file(path.join('bin', 'sc-collector.js'), fs.readFileSync(path.join('dist', 'sc-collector.js')));

// Generate ZIP file
const data = zip.generate({ base64: false, compression: 'DEFLATE' });
fs.writeFileSync(OUTPUT_FILE, data, 'binary');

function generateFilename() {
    const pkgJSON = JSON.parse(fs.readFileSync('package.json'));
    return sprintf('%s-v%s', pkgJSON.name, pkgJSON.version);
}
