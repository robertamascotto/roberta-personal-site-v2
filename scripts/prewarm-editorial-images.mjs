#!/usr/bin/env node

/**
 * Warms Sanity's image CDN for the full-screen photo viewer (Editorials and Products).
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

import { readFileSync } from "node:fs";
import { createImageUrlBuilder } from "@sanity/image-url";

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
  const query = encodeURIComponent(`*[_type == "editorial"]{ "slug": slug.current, "images": gallery[].image }`);
  const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
  const { result } = await res.json();
  // The photos chosen for each Products set live in lib/productSelection.ts (40-character file ids).
  const chosen = new Set(readFileSync(new URL("../lib/productSelection.ts", import.meta.url), "utf8").match(/[a-f0-9]{40}/g) ?? []);
  const selectedSets = new Set(
    [...readFileSync(new URL("../lib/productSelection.ts", import.meta.url), "utf8").matchAll(/"([a-z0-9-]+\/[a-z0-9-]+)":/g)].map((m) => m[1])
  );
  // The same bare address the site uses (includes the crop, if one is set in Sanity).
  const builder = createImageUrlBuilder({ projectId, dataset });
  const urls = new Set();
  for (const e of result) {
    if (HIDDEN_EDITORIALS.includes(e.slug)) continue;
    for (const image of e.images ?? []) if (image?.asset) urls.add(builder.image(image).url());
  }
  // Products
  const pq = encodeURIComponent(`*[_type == "productCaseStudy"]{ "slug": slug.current, coverImage, "own": gallery[]{ image, "images": images[].image },
    "sets": *[_type == "productSubGallery" && parentCaseStudy._ref == ^._id]{ "slug": slug.current, "images": fullGallery[].image } }`);
  const pres = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${pq}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!pres.ok) throw new Error(`Sanity query failed: ${pres.status} ${await pres.text()}`);
  const idOf = (image) => image?.asset?._ref?.match(/^image-([a-f0-9]+)-/i)?.[1];
  for (const project of (await pres.json()).result) {
    if (project.coverImage?.asset) urls.add(builder.image(project.coverImage).url());
    for (const block of project.own ?? []) {
      if (block.image?.asset) urls.add(builder.image(block.image).url());
      for (const image of block.images ?? []) if (image?.asset) urls.add(builder.image(image).url());
    }
    for (const set of project.sets ?? []) {
      const limited = selectedSets.has(`${project.slug}/${set.slug}`);
      for (const image of set.images ?? []) {
        if (!image?.asset) continue;
        if (limited && !chosen.has(idOf(image))) continue;
        urls.add(builder.image(image).url());
      }
    }
  }
  return [...urls];
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

const baseUrls = await fetchPhotos();
const jobs = [];
for (const base of baseUrls) {
  for (const w of SIZES) {
    for (const accept of ACCEPTS) {
      const url = new URL(base);
      url.searchParams.set("w", String(w));
      url.searchParams.set("q", String(QUALITY));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "max");
      jobs.push({ url: url.toString(), accept });
    }
  }
}

console.log(`Warming ${baseUrls.length} photos x ${SIZES.length} sizes x ${ACCEPTS.length} formats = ${jobs.length} requests...`);
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
