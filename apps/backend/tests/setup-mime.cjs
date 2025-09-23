const path = require('node:path');

const mimeModulePath = path.join(__dirname, '../../..', 'node_modules', 'mime');
const mime = require(mimeModulePath);

if (typeof mime.getType !== 'function' && typeof mime.lookup === 'function') {
  mime.getType = mime.lookup.bind(mime);
}

if (typeof mime.lookup !== 'function' && typeof mime.getType === 'function') {
  mime.lookup = mime.getType.bind(mime);
}
