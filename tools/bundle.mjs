// Builds one bundle per run of local scripts that a page passes to WB_LOAD (see the site head), plus the
// homepage main script's own module list. Usage: node tools/bundle.mjs  → writes bundles/*.js + prints the WB_BUNDLED list.
// A run = consecutive local items of one WB_LOAD list; external URLs (gsap, lenis) stay separate tags.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const LISTS = JSON.parse(readFileSync(new URL('./bundle-lists.json', import.meta.url), 'utf8'));
const file = (n) => (n.includes('/') || n.endsWith('.js') ? n : 'modules22/wb-' + n + '.js');
const name = (m) => (typeof m === 'string' ? m : m.src);
const isExt = (n) => /^https?:/.test(n);
// same hash as WB_LOAD in the site head (djb2 → base36)
export const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); };

const runs = new Map();
for (const list of LISTS) {
  let run = [];
  const flush = () => { if (run.length > 1) runs.set(run.join(','), run.slice()); run = []; };
  for (const m of list) { const n = name(m); if (isExt(n)) flush(); else run.push(n); }
  flush();
}
// homepage main script loads these itself (WB_MODS in wubble-v22-r14.js); bundled as 'r14-mods'
const main = readFileSync('wubble-v22-r14.js', 'utf8');
const mods = JSON.parse(main.match(/var WB_MODS = (\[[^\]]*\])/)[1]);

mkdirSync('bundles', { recursive: true });
const build = (out, files) => {
  files.forEach((f) => { if (!existsSync(f)) throw new Error('missing ' + f); });
  const src = files.map((f) => '/* ' + f + ' */\n' + readFileSync(f, 'utf8')).join('\n;\n');
  new vm.Script(src, { filename: out }); // throws on syntax errors and on clashing top-level let/const/class across files
  writeFileSync(out, src);
  return src.length;
};
const keys = [];
for (const [key, list] of runs) { const h = hash(key), len = build('bundles/' + h + '.js', list.map(file)); keys.push(h); console.log(h, Math.round(len / 1024) + 'KB', key); }
console.log('r14-mods', Math.round(build('bundles/r14-mods.js', mods) / 1024) + 'KB');
console.log("\nWB_BUNDLED='" + keys.join(',') + "'");
