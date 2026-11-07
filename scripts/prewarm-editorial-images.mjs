#!/usr/bin/env node

/**
 * Warms Sanity's image CDN for the Editorials full-screen viewer.
 *
 * The first time a photo is requested at a given size, Sanity has to generate that size,
 * which can take a second or two. This script asks for every editorial photo once, at the
 * viewer's standard sizes (see lib/sanityResize.ts), so even the first visitor gets a cached
 * copy. It only reads: it changes nothing in Sanity.
 *
 * Run it after adding or replacing editorial photos:
 *   node --env-file=.env.local scripts/prewarm-editorial-images.mjs
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID (and optionally NEXT_PUBLIC_SANITY_DATASET,
 * SANITY_API_TOKEN if the dataset is private) in the environment.
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

// Keep these in step with lib/sanityResize.ts
const SIZES = [1200, 1600, 2000, 2400, 3200];
const QUALITY = 85;
// Browsers ask for different formats (auto=format), and the CDN keeps a copy per format.
const ACCEPTS = [
  "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8", // Chrome, Edge, Firefox, current Safari
  "image/webp,image/png,image/*,*/*;q=0.8", // older Safari
];
const HIDDEN_EDITORIALS = ["in-session"]; // keep in step with lib/constants.ts
const CONCURRENCY = 4;

if (!projectId) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Run with: node --env-file=.env.local scripts/prewarm-editorial-images.mjs");
  process.exit(1);
}

async function fetchPhotos() {
  const query = encodeURIComponent(`*[_type == "editorial"]{ "slug": slug.current, "refs": gallery[].image.asset._ref }`);
  const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
  const { result } = await res.json();
  const refs = new Set();
  for (const e of result) {
    if (HIDDEN_EDITORIALS.includes(e.slug)) continue;
    for (const ref of e.refs ?? []) if (ref) refs.add(ref);
  }
  return [...refs];
}

// image-<id>-<width>x<height>-<ext>  ->  <id>-<width>x<height>.<ext>
function assetPath(ref) {
  const m = ref.match(/^image-([a-f0-9]+-\d+x\d+)-([a-z0-9]+)$/i);
  return m ? `${m[1]}.${m[2]}` : null;
}

async function warm(url, accept) {
  const started = Date.now();
  try {
    const res = await fetch(url, { headers: { Accept: accept } });
    await res.arrayBuffer();
    return { ok: res.ok, ms: Date.now() - started };
  } catch {
    return { ok: false, ms: Date.now() - started };
  }
}

const refs = await fetchPhotos();
const jobs = [];
for (const ref of refs) {
  const path = assetPath(ref);
  if (!path) continue;
  for (const w of SIZES) {
    for (const accept of ACCEPTS) {
      jobs.push({ url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${path}?w=${w}&q=${QUALITY}&auto=format&fit=max`, accept });
    }
  }
}

console.log(`Warming ${refs.length} photos x ${SIZES.length} sizes x ${ACCEPTS.length} formats = ${jobs.length} requests...`);
let done = 0;
let failed = 0;
let slowest = 0;
async function worker() {
  while (jobs.length) {
    const job = jobs.pop();
    const r = await warm(job.url, job.accept);
    done += 1;
    if (!r.ok) failed += 1;
    slowest = Math.max(slowest, r.ms);
    if (done % 25 === 0) console.log(`  ${done} done...`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`Finished. ${done} requests, ${failed} failed, slowest ${slowest} ms.`);
process.exit(failed ? 1 : 0);
