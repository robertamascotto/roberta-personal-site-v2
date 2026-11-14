// Makes the timeline's film-strip pictures once, so the page does not have to read the videos for them.
// For every clip currently on the Movement page: 3 non-dark frames, 112px high, saved as public/movement/thumbs/<hash>-<n>.jpg,
// plus lib/movementClips.json with each clip's running time and shape (so the page can lay out the timeline without opening the videos).
// Needs local copies of the videos and the small `frames` helper (scratchpad), so it is run by hand when the Movement videos change.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const H = { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}` };
const base = `https://${pid}.api.sanity.io/v2024-01-01`;
const S = '/private/tmp/claude-501/-Users-robertamascotto-Desktop-NEW-WEBSITE-PHOTOS-CODE/24626096-866f-4ef4-9a1a-4b0ed8384b7a/scratchpad/dir/snd/';
const OUT = '/Users/robertamascotto/Desktop/NEW WEBSITE PHOTOS/CODE/robertas-personal-site-main/public/movement/thumbs/';
const MANIFEST = '/Users/robertamascotto/Desktop/NEW WEBSITE PHOTOS/CODE/robertas-personal-site-main/lib/movementClips.json';
const manifest = {};
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(S + 'cache', { recursive: true });

const q = '*[_type=="movementPage"][0]{"reel":featuredReel.video.asset->url, videoGroups[]{videos[]{"url":video.asset->url}}}';
const doc = (await fetch(`${base}/data/query/${ds}?perspective=raw&query=${encodeURIComponent(q)}`, { headers: H }).then((r) => r.json())).result;
const urls = [doc.reel, ...doc.videoGroups.flatMap((g) => g.videos.map((v) => v.url))].filter(Boolean);
console.log(urls.length, 'clips');

// local copies I already have, matched by their content hash
const known = {};
for (const dir of [S, S + '../mvclips/']) for (const f of fs.readdirSync(dir)) if (f.endsWith('.mp4')) known[crypto.createHash('sha1').update(fs.readFileSync(dir + f)).digest('hex')] = dir + f;

const lumOf = async (file) => {
  const { data } = await sharp(file).resize(24, 24, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return data.reduce((a, b) => a + b, 0) / data.length / 255;
};

for (const url of urls) {
  const hash = path.basename(url).replace(/\.mp4$/, '');
  let file = known[hash];
  if (!file) {
    file = S + 'cache/' + hash + '.mp4';
    if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  const info = execFileSync(S + 'frames', [file, S + 'cache/dur', '0']).toString();
  const dur = parseFloat(info.match(/duration ([\d.]+)/)[1]);
  const dims = info.match(/size (\d+)x(\d+)/);
  manifest[hash] = { d: +dur.toFixed(2), ar: +(Number(dims[1]) / Number(dims[2])).toFixed(4) };
  const moments = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85];
  execFileSync(S + 'frames', [file, S + `cache/m-${hash}`, ...moments.map((m) => String(+(dur * m).toFixed(2)))]);
  const shots = [];
  for (let i = 0; i < moments.length; i++) shots.push({ i, lum: await lumOf(S + `cache/m-${hash}-${i}.jpg`) });
  const bright = shots.filter((x) => x.lum >= 0.12);
  const pool = bright.length >= 3 ? bright : [...shots].sort((a, b) => b.lum - a.lum).slice(0, 3).sort((a, b) => a.i - b.i);
  const picked = [pool[0], pool[Math.floor((pool.length - 1) / 2)], pool[pool.length - 1]];
  for (let k = 0; k < 3; k++) {
    await sharp(S + `cache/m-${hash}-${picked[k].i}.jpg`).resize({ height: 112 }).jpeg({ quality: 78 }).toFile(OUT + `${hash}-${k}.jpg`);
  }
  console.log(hash.slice(0, 10), dur.toFixed(1) + 's', 'frames', picked.map((p) => p.i + '(' + p.lum.toFixed(2) + ')').join(' '));
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
console.log('files:', fs.readdirSync(OUT).length, 'total KB:', Math.round(fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(OUT + f).size, 0) / 1024));
