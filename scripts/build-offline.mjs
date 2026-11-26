// Builds dist/jaydevs-studio-offline.html: the app with every library packed in, so it runs from a
// USB stick or a local folder with no internet connection.
//
//   npm install
//   npm run build:offline
//
// Paper.js and jsPDF are inlined as ordinary scripts. pdf.js and the DWG reader (LibreDWG compiled to
// WebAssembly) are only needed when opening a PDF or DWG, so they are stored gzip-compressed as base64
// blocks that index.html unpacks on first use (see embeddedLib in index.html).
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (p) => join(root, 'node_modules', p);
const read = (p) => readFileSync(p);

let html = readFileSync(join(root, 'index.html'), 'utf8');

const replaceOnce = (from, to) => {
  const i = html.indexOf(from);
  if (i < 0 || html.indexOf(from, i + from.length) >= 0) throw new Error('expected exactly one occurrence of: ' + from.slice(0, 80));
  html = html.slice(0, i) + to + html.slice(i + from.length);
};
// a library's text must not close the surrounding <script> element early
const inlineScript = (code) => '<script>\n' + code.toString('utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>';
const packed = (name, bytes) => `<script type="application/x-gzip-base64" id="lib-${name}">${gzipSync(bytes, { level: 9 }).toString('base64')}</script>`;

// 1. web fonts are optional; the font stacks fall back to system fonts offline
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, '');

// 2. libraries the page needs at start-up
replaceOnce('<script src="https://cdn.jsdelivr.net/npm/paper@0.12.17/dist/paper-core.min.js"></script>', inlineScript(read(nm('paper/dist/paper-core.min.js'))));
replaceOnce('<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>', inlineScript(read(nm('jspdf/dist/jspdf.umd.min.js'))));

// 3. libraries loaded on demand, packed before the app script
const blocks = [
  packed('pdfjs', read(nm('pdfjs-dist/build/pdf.min.js'))),
  packed('pdfjs-worker', read(nm('pdfjs-dist/build/pdf.worker.min.js'))),
  packed('libredwg-glue', read(nm('@mlightcad/libredwg-web/wasm/libredwg-web.js'))),
  packed('libredwg-dist', read(nm('@mlightcad/libredwg-web/dist/libredwg-web.js'))),
  packed('libredwg-wasm', read(nm('@mlightcad/libredwg-web/wasm/libredwg-web.wasm'))),
].join('\n');
const appScript = html.lastIndexOf('<script>\n(() => {\n\'use strict\';\n\n/* ====');
if (appScript < 0) throw new Error('app script not found');
html = html.slice(0, appScript) + blocks + '\n' + html.slice(appScript);

if (/<script[^>]+src="https?:/i.test(html)) throw new Error('an external script is still referenced');

const out = join(root, 'dist', 'jaydevs-studio-offline.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`Wrote ${out} (${(statSync(out).size / 1048576).toFixed(1)} MB)`);
