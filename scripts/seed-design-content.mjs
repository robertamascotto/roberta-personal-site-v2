#!/usr/bin/env node

/**
 * One-time seed: populates Sanity with the real editorial/product/movement/
 * strategy content from the Claude Design export ("Photography Portfolio
 * Template"), so the rebuilt site isn't empty on first load.
 *
 * Uploads every referenced image/video from that export's uploads/ folder
 * and creates the editorial, productCaseStudy, productSubGallery,
 * movementPage, and contentStrategyPage documents, plus the Home page's
 * featuredProjects.
 *
 * Idempotent: uses createOrReplace with deterministic _ids, safe to re-run.
 * Skips uploading a file if an asset with that exact filename already
 * exists in the dataset (so re-runs are fast and don't duplicate assets).
 *
 * Usage:
 *   SANITY_API_TOKEN=... NEXT_PUBLIC_SANITY_PROJECT_ID=... node scripts/seed-design-content.mjs
 *
 * Optional env var:
 *   DESIGN_EXPORT_DIR — path to the design export's uploads/ folder.
 *   Defaults to "../Photography Portfolio Template/uploads" next to this repo.
 */

import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Missing env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN");
  console.error("(SANITY_API_TOKEN needs Editor or Admin permissions.)");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", useCdn: false, token });

const SOURCE_DIR =
  process.env.DESIGN_EXPORT_DIR || path.resolve(ROOT, "..", "Photography Portfolio Template", "uploads");

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Can't find the design export's uploads folder at:\n  ${SOURCE_DIR}`);
  console.error("Set DESIGN_EXPORT_DIR to the correct path and try again.");
  process.exit(1);
}

// --- Upload helpers (cached by filename, both in-memory and against existing assets) ---

const assetCache = new Map();
const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

async function findExistingAsset(kind, filename) {
  const type = kind === "image" ? "sanity.imageAsset" : "sanity.fileAsset";
  const result = await client.fetch(`*[_type == $type && originalFilename == $filename][0]{_id}`, {
    type,
    filename,
  });
  return result?._id || null;
}

async function uploadOnce(kind, filename) {
  const cacheKey = `${kind}:${filename}`;
  if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);

  const existingId = await findExistingAsset(kind, filename);
  if (existingId) {
    assetCache.set(cacheKey, existingId);
    console.log(`  = ${filename} (already uploaded)`);
    return existingId;
  }

  const filePath = path.join(SOURCE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing source file: ${filePath}`);
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || (kind === "image" ? "image/jpeg" : "video/mp4");

  console.log(`  ↑ ${filename}`);
  const asset = await client.assets.upload(kind, fs.createReadStream(filePath), {
    filename,
    contentType,
  });
  assetCache.set(cacheKey, asset._id);
  return asset._id;
}

async function image(filename) {
  const id = await uploadOnce("image", filename);
  return { _type: "image", asset: { _type: "reference", _ref: id } };
}

async function file(filename) {
  const id = await uploadOnce("file", filename);
  return { _type: "file", asset: { _type: "reference", _ref: id } };
}

function key() {
  return Math.random().toString(36).slice(2, 10);
}

/** An `imageWithAspect` object: [filename, alt, aspectRatio, frameWidth?] */
async function frame([filename, alt, aspectRatio, frameWidth]) {
  return {
    _type: "imageWithAspect",
    _key: key(),
    image: await image(filename),
    alt,
    aspectRatio: String(aspectRatio),
    ...(frameWidth ? { frameWidth } : {}),
  };
}

async function frames(list) {
  const out = [];
  for (const item of list) out.push(await frame(item));
  return out;
}

function orderRank(index) {
  return "a" + String(index).padStart(5, "0");
}

// --- Editorials --------------------------------------------------------

const editorials = [
  {
    slug: "bloom-in-the-dark",
    title: "Bloom in the Dark",
    year: "2021",
    description:
      "Personal editorial shot against black with a single directional light source.\nExplores what a body reveals and withholds under partial light.\nDried florals and a bare shoulder are the only points of contact with the frame.",
    coverFrames: [
      ["ed-1a-e53b1f5a.jpg", "Soft Exposure — frame 1", "2/3", 320],
      ["ed-1b-d2cd0a3b.jpg", "Soft Exposure — frame 2", "3/4", 380],
      ["ed-1c-eb44c6b5.jpg", "Soft Exposure — frame 3", "3/2", 400],
    ],
    gallery: [
      ["se-full-1-a0c8973f.jpg", "Soft Exposure — frame 1", "5184/3455"],
      ["se-full-2-03bf8189.jpg", "Soft Exposure — frame 2", "7078/4719"],
      ["se-full-3-2daa9cec.jpg", "Soft Exposure — frame 3", "3456/5184"],
      ["se-full-4-e53b1f5a.jpg", "Soft Exposure — frame 4", "3456/5184"],
      ["se-full-5-6ff206a4.jpg", "Soft Exposure — frame 5", "3456/5184"],
      ["se-full-6-7ad56aab.jpg", "Soft Exposure — frame 6", "3456/2304"],
      ["se-full-7-310a19ae.jpg", "Soft Exposure — frame 7", "3456/5184"],
    ],
  },
  {
    slug: "busy-signal",
    title: "Busy Signal",
    year: "2023",
    description:
      "A personal editorial about waiting for someone who isn't calling back and deciding it doesn't matter anymore.\nVintage phone, pearls, and soft pink satin play against the character's shift from longing to not caring at all.",
    coverFrames: [
      ["ed-2a.jpg", "Double Exposure — frame 1", "3/4", 200],
      ["ed-2b.jpg", "Double Exposure — frame 2", "3/2", 520],
      ["ed-2c.jpg", "Double Exposure — frame 3", "2/3", 160],
    ],
    gallery: [
      ["do-full1.jpg", "Double Exposure — frame 1", "3/2"],
      ["do-full2.jpg", "Double Exposure — frame 2", "2/3"],
      ["do-full3.jpg", "Double Exposure — frame 3", "3/2"],
      ["do-full4.jpg", "Double Exposure — frame 4", "3/2"],
      ["do-full5.jpg", "Double Exposure — frame 5", "3/2"],
      ["do-full6.jpg", "Double Exposure — frame 6", "2/3"],
      ["do-full7.jpg", "Double Exposure — frame 7", "3/2"],
      ["do-full8.jpg", "Double Exposure — frame 8", "2/3"],
      ["do-full9.jpg", "Double Exposure — frame 9", "2/3"],
      ["do-full10.jpg", "Double Exposure — frame 10", "3/2"],
      ["do-full11.jpg", "Double Exposure — frame 11", "3/2"],
      ["do-full12.jpg", "Double Exposure — frame 12", "2/3"],
      ["do-full13.jpg", "Double Exposure — frame 13", "2/3"],
    ],
  },
  {
    slug: "tinted",
    title: "Tinted",
    year: "2024",
    description:
      "Personal editorial split across two treatments,\nWarm, retro portraits with vintage sunglasses and silk headscarves.\nCold, moody portraits shot with colored flash.\nThe amber lenses and the blue-lit color shift carry the mood shift between the two halves.",
    coverFrames: [
      ["ed-3a.jpg", "Wrong Number — frame 1", "3/2", 360],
      ["ed-3b.jpg", "Wrong Number — frame 2", "4/5", 340],
      ["ed-3c.jpg", "Wrong Number — frame 3", "1/1", 300],
    ],
    gallery: [
      ["wn-full1.jpg", "Wrong Number — frame 1", "3/2"],
      ["wn-full2.png", "Wrong Number — frame 2", "2/3"],
      ["wn-full3.png", "Wrong Number — frame 3", "4/3"],
      ["wn-full4.jpg", "Wrong Number — frame 4", "3/2"],
      ["wn-full5.JPG", "Wrong Number — frame 5", "2/3"],
      ["wn-full6.jpg", "Wrong Number — frame 6", "3/2"],
      ["wn-full7.jpg", "Wrong Number — frame 7", "3/2"],
      ["wn-full8.jpg", "Wrong Number — frame 8", "3/2"],
      ["wn-full9.jpg", "Wrong Number — frame 9", "2/3"],
    ],
  },
  {
    slug: "strike",
    title: "Strike",
    year: "2024",
    description: "Wet-look hair, heavy silver and gold jewelry,\nA smoky eye play against the rawness of fire held close to skin.",
    coverFrames: [
      ["ed-4a.jpg", "Strike — frame 1", "1/1", 200],
      ["ed-4b.jpg", "Strike — frame 2", "3/4", 220],
      ["ed-4m.jpg", "Strike — frame 3", "4/5", 300],
      ["ed-4c.jpg", "Strike — frame 4", "16/10", 290],
    ],
    gallery: [
      ["st-full-1.JPG", "Strike — frame 1", "1/1"],
      ["st-full-2.jpg", "Strike — frame 2", "4000/5146"],
      ["st-full-3.jpg", "Strike — frame 3", "3/2"],
      ["st-full-4.JPG", "Strike — frame 4", "2/3"],
      ["st-full-5.jpg", "Strike — frame 5", "4000/5615"],
      ["st-full-6.jpg", "Strike — frame 6", "3/2"],
      ["st-full-7.jpg", "Strike — frame 7", "3/5"],
      ["st-full-8.jpg", "Strike — frame 8", "3/2"],
    ],
  },
  {
    slug: "in-session",
    title: "In Session",
    year: "2025",
    description:
      "Campaign photography for Smoke Rise NY's SS25 collection, styled around a recording studio setting.\nTalent shot in and around studio gear: headphones, mixing consoles, mic booths with the intent to ground the collection in a real working environment rather than a traditional studio backdrop.",
    coverFrames: [
      ["ed-5a.jpg", "In Session SS25 — frame 1", "1/1", 270],
      ["ed-5b.jpg", "In Session SS25 — frame 2", "3/4", 380],
      ["ed-5c.jpg", "In Session SS25 — frame 3", "3/2", 310],
    ],
    gallery: [
      ["is25-full-1.jpg", "In Session — 2025 — frame 1", "3/5"],
      ["is25-full-2.jpg", "In Session — 2025 — frame 2", "3/5"],
      ["is25-full-3.JPG", "In Session — 2025 — frame 3", "3/2"],
      ["is25-full-4.JPG", "In Session — 2025 — frame 4", "3341/5012"],
      ["is25-full-5.jpg", "In Session — 2025 — frame 5", "2/3"],
      ["is25-full-6.jpg", "In Session — 2025 — frame 6", "2/3"],
      ["is25-full-7.jpg", "In Session — 2025 — frame 7", "3/5"],
      ["is25-full-8.JPG", "In Session — 2025 — frame 8", "3857/5786"],
      ["is25-full-9.jpg", "In Session — 2025 — frame 9", "3/5"],
      ["is25-full-10.jpg", "In Session — 2025 — frame 10", "2/3"],
      ["is25-full-11.jpg", "In Session — 2025 — frame 11", "3/5"],
      ["is25-full-12.jpg", "In Session — 2025 — frame 12", "3/5"],
    ],
  },
  {
    slug: "portrait-series",
    title: "Portrait Series",
    year: "2022",
    description:
      "A black and white portrait series shot using natural window light.\nSimple, undone styling across multiple subjects, focused on face and expression rather than concept or wardrobe.",
    galleryGap: 0,
    coverFrames: [
      ["ed-6a.jpg", "West Village — frame 1", "5/4", 240],
      ["ed-6b.jpg", "West Village — frame 2", "1/1", 280],
      ["ed-6c.jpg", "West Village — frame 3", "4/5", 200],
      ["ed-6d.jpg", "West Village — frame 4", "3/2", 240],
    ],
    gallery: [
      ["wv-full-1.jpg", "West Village — 2022 — frame 1", "3/2"],
      ["wv-full-2.jpg", "West Village — 2022 — frame 2", "3/2"],
      ["wv-full-3.jpg", "West Village — 2022 — frame 3", "3/2"],
      ["wv-full-4.jpg", "West Village — 2022 — frame 4", "3/2"],
      ["wv-full-5.jpg", "West Village — 2022 — frame 5", "3/2"],
      ["wv-full-6.jpg", "West Village — 2022 — frame 6", "3/2"],
      ["wv-full-7.jpg", "West Village — 2022 — frame 7", "3/2"],
      ["wv-full-8.jpg", "West Village — 2022 — frame 8", "3/2"],
      ["wv-full-9.jpg", "West Village — 2022 — frame 9", "3/2"],
      ["wv-full-10.jpg", "West Village — 2022 — frame 10", "3/2"],
      ["wv-full-11.jpg", "West Village — 2022 — frame 11", "3/2"],
      ["wv-full-12.jpg", "West Village — 2022 — frame 12", "3/2"],
    ],
  },
  {
    slug: "west-village",
    title: "West Village",
    year: "2022",
    description:
      "New York City streets.\nSimple styling: a white collared top and tan trousers, kept the focus on candid movement and the surrounding city backdrop.",
    coverFrames: [
      ["ed-7a.jpg", "Loft — frame 1", "3/2", 310],
      ["ed-7b.jpg", "Loft — frame 2", "1/1", 360],
      ["ed-7c.jpg", "Loft — frame 3", "4/5", 250],
    ],
    gallery: [
      ["loft-full-1.JPG", "Loft — 2024 — frame 1", "3/2"],
      ["loft-full-2.jpg", "Loft — 2024 — frame 2", "2/3"],
      ["loft-full-3.jpg", "Loft — 2024 — frame 3", "2/3"],
      ["loft-full-4.JPG", "Loft — 2024 — frame 4", "3/2"],
      ["loft-full-5.jpg", "Loft — 2024 — frame 5", "3/2"],
      ["loft-full-6.jpg", "Loft — 2024 — frame 6", "3/2"],
      ["loft-full-7.JPG", "Loft — 2024 — frame 7", "2/3"],
      ["loft-full-8.JPG", "Loft — 2024 — frame 8", "3/2"],
      ["loft-full-9.jpg", "Loft — 2024 — frame 9", "3/2"],
      ["loft-full-10.jpg", "Loft — 2024 — frame 10", "2/3"],
    ],
  },
];

// --- Products ------------------------------------------------------------

const smokeRiseFullGalleries = {
  onFigure: Array.from({ length: 48 }, (_, i) => {
    const n = i + 1;
    const padded = String(n).padStart(2, "0");
    const filename = n === 5 || n === 7 ? `srf-full-${n}` : `srf-full-${n}.jpg`;
    return [filename, `On figure — ${padded}`, "3/4"];
  }),
  naturalLight: [
    ...Array.from({ length: 20 }, (_, i) => [`srn-full-${i + 1}.JPG`, `Natural light — ${String(i + 1).padStart(2, "0")}`, "4/5"]),
    ["srn-full-21-647884cb.JPG", "Natural light — 21", "4/5"],
    ["srn-full-22-b22f03a9.JPG", "Natural light — 22", "4/5"],
    ["srn-full-23-408ea582.JPG", "Natural light — 23", "4/5"],
    ["srn-full-24-854c32bc.JPG", "Natural light — 24", "4/5"],
    ["srn-full-25-0209e48a.JPG", "Natural light — 25", "4/5"],
    ["srn-full-26-f13d7b4a.JPG", "Natural light — 26", "4/5"],
    ["srn-full-27-aabc5a1c.JPG", "Natural light — 27", "4/5"],
    ["srn-full-28-251d21f2.JPG", "Natural light — 28", "4/5"],
    ["srn-full-29-dcdb9256.JPG", "Natural light — 29", "4/5"],
    ["srn-full-30-31a9ad7b.JPG", "Natural light — 30", "4/5"],
    ...Array.from({ length: 6 }, (_, i) => [`srn-full-${i + 31}.JPG`, `Natural light — ${i + 31}`, "4/5"]),
  ],
  flats: Array.from({ length: 28 }, (_, i) => [`srl-full-${i + 1}.JPG`, `Flats — ${String(i + 1).padStart(2, "0")}`, "3/4"]),
};
// A few natural-light files don't match the .JPG default — fix those
smokeRiseFullGalleries.naturalLight[0][0] = "srn-full-1.PNG";
smokeRiseFullGalleries.naturalLight[5][0] = "srn-full-6.jpg";
smokeRiseFullGalleries.naturalLight[11][0] = "srn-full-12.jpg";
// srl-full-21..28 are lowercase .jpg on disk, not .JPG — fix those
for (let i = 20; i < 28; i++) smokeRiseFullGalleries.flats[i][0] = `srl-full-${i + 1}.jpg`;

const productCaseStudies = [
  {
    slug: "smoke-rise-ny",
    title: "Smoke Rise NY",
    categoryLabel: "Ecommerce",
    yearRange: "2024-2026",
    coverImage: "prod-smokerise.jpg",
    coverAlt: "Smoke Rise NY — ecommerce",
    description: null,
    gallery: [],
    subGalleries: [
      {
        slug: "on-figure",
        title: "On Figure",
        description:
          "On-figure ecommerce shoot. Each piece photographed against a consistent, post-edited background for a clean, uniform look across the collection. Shot with controlled lighting to ensure accurate color and detail reproduction.",
        teaserImages: [
          ["sr-onfigure-1.jpg", "On figure — 01", "3/4"],
          ["sr-onfigure-2.jpg", "On figure — 02", "3/4"],
          ["sr-onfigure-3.jpg", "On figure — 03", "3/4"],
          ["sr-onfigure-4.jpg", "On figure — 04", "3/4"],
        ],
        fullGallery: smokeRiseFullGalleries.onFigure,
      },
      {
        slug: "natural-light",
        title: "Natural Light",
        description:
          "Ecommerce shoot for the Korean capsule collection. Shot entirely in natural light, preserving the true texture and color of each garment. No background editing or post-production alterations.",
        teaserImages: [
          ["sr-natural-1.PNG", "Natural light — 01", "3/4"],
          ["sr-natural-2.JPG", "Natural light — 02", "3/4"],
          ["sr-natural-3.JPG", "Natural light — 03", "3/4"],
          ["sr-natural-4.JPG", "Natural light — 04", "3/4"],
        ],
        fullGallery: smokeRiseFullGalleries.naturalLight,
      },
      {
        slug: "flats",
        title: "Flats",
        description:
          "Flat lay ecommerce, shot with consistent lighting and framing to maintain visual coherence throughout the catalog. Focused on texture, construction details, and accurate color rendering.",
        teaserImages: [
          ["sr-flats-1.JPG", "Flats — 01", "3/4"],
          ["sr-flats-2.JPG", "Flats — 02", "3/4"],
          ["sr-flats-3.jpg", "Flats — 03", "3/4"],
          ["sr-flats-4.JPG", "Flats — 04", "3/4"],
        ],
        fullGallery: smokeRiseFullGalleries.flats,
      },
    ],
  },
  {
    slug: "risa-venezia",
    title: "Risa Venezia",
    categoryLabel: "Fashion",
    yearRange: "2022",
    coverImage: "prod-risa.jpg",
    coverAlt: "Risa Venezia — fashion",
    description:
      "Photography for Risa Venezia, a small independent brand whose designs are inspired by the city of Venice. Shot on location during a live showcase of the collection, capturing the handcrafted details and artisanal quality of each piece. Each garment photographed in the environment curated by the designer.",
    gallery: { type: "risa" },
    subGalleries: [],
  },
  {
    slug: "apre",
    title: "Apre",
    categoryLabel: "Jewelry",
    yearRange: "2022",
    coverImage: "prod-apre.jpg",
    coverAlt: "Apre — jewelry campaign",
    description:
      "Campaign photography for jewelry brand Apre. Shot with a warm, film-inspired aesthetic to give the pieces an organic, intimate feel. Focused on styling and composition to present the jewelry in a natural, wearable context.",
    gallery: { type: "apre" },
    subGalleries: [],
  },
];

async function imageGrid(columns, list) {
  return { _type: "imageGridBlock", _key: key(), columns, images: await Promise.all(list.map(frame)) };
}

async function scrollStrip(list) {
  return { _type: "scrollStripBlock", _key: key(), images: await Promise.all(list.map(frame)) };
}

async function buildRisaGallery() {
  return [
    await frame(["risa-1.jpg", "Location — hero, wide", "16/9"]),
    await imageGrid(2, [
      ["risa-2.jpg", "Look 01 — full garment", "4/5"],
      ["risa-3.jpg", "Look 02 — full garment", "4/5"],
    ]),
    await imageGrid(4, [
      ["risa-4.jpg", "Detail — embroidery", "1/1"],
      ["risa-5.jpg", "Detail — clasps", "1/1"],
      ["risa-6.jpg", "Detail — weave", "1/1"],
      ["risa-7.jpg", "Detail — lining", "1/1"],
    ]),
    await imageGrid(3, [
      ["risa-8.jpg", "Risa Venezia — 08", "4/5"],
      ["risa-9.jpg", "Risa Venezia — 09", "4/5"],
      ["risa-10.jpg", "Risa Venezia — 10", "4/5"],
    ]),
    await imageGrid(3, [
      ["risa-11.jpg", "Risa Venezia — 11", "4/5"],
      ["risa-12.jpg", "Risa Venezia — 12", "4/5"],
      ["risa-13.jpg", "Risa Venezia — 13", "4/5"],
    ]),
    await frame(["risa-14.jpg", "Closing spread — wide", "16/9"]),
  ];
}

async function buildApreGallery() {
  return [
    await imageGrid(2, [
      ["apre-1.jpg", "Apre — vertical 01", "4/5"],
      ["apre-2.jpg", "Apre — vertical 02", "4/5"],
    ]),
    await scrollStrip([
      ["apre-3.jpg", "Apre — wide 03", "3/2"],
      ["apre-4.jpg", "Apre — vertical 04", "4/5"],
      ["apre-5-4ab7dc7d.jpg", "Apre — 05", "4/5"],
      ["apre-6-d40c108d.jpg", "Apre — 06", "4/5"],
      ["apre-7.jpg", "Apre — 07", "4/5"],
      ["apre-8.jpg", "Apre — 08", "4/5"],
      ["apre-9.jpg", "Apre — 09", "4/5"],
      ["apre-10.jpg", "Apre — 10", "4/5"],
      ["apre-11.jpg", "Apre — 11", "4/5"],
      ["apre-12.jpg", "Apre — 12", "4/5"],
      ["apre-13.jpg", "Apre — 13", "4/5"],
      ["apre-14.jpg", "Apre — 14", "4/5"],
    ]),
    await frame(["apre-6.jpg", "Apre — wide, full 06", "16/9"]),
  ];
}

// --- Movement --------------------------------------------------------

async function buildMovementPage() {
  return {
    _id: "movementPage",
    _type: "movementPage",
    heroLabel: "Movement",
    heroHeadline: "Reels and short-form video content.",
    heroBody:
      "Motion as an extension of the photography.\nThe tool changed over time, from camera to phone to old digital formats, but the eye behind it stayed the same.",
    featuredReel: {
      _type: "featuredReel",
      video: await file("mv-banner-e5768110.mp4"),
      tag: "Editorial",
      title: "Wrong Number",
      blurb: "Movement carried over from the stills of the Wrong Number editorial, used as a sneak peek for the photos to come.",
      linkedEditorial: { _type: "reference", _ref: "editorial-tinted" },
    },
    videoGroups: [
      {
        _type: "videoGroupBlock",
        _key: key(),
        sectionLabel: "Brand films",
        layout: "wide-2up",
        videos: [
          {
            _type: "videoAsset",
            _key: key(),
            video: await file("mv-wide-1.mp4"),
            poster: await image("mv-wide-1-poster.jpg"),
            label: "Smoke Rise NY — 2025",
            caption:
              "Pre-release teaser for fall-winter collection, shot on iPhone in NYC. Unposed footage, prioritizing a real setting over a styled shoot.",
            aspectRatio: "16/9",
          },
          {
            _type: "videoAsset",
            _key: key(),
            video: await file("mv-wide-2.mp4"),
            poster: await image("mv-wide-2-poster.jpg"),
            label: "Smoke Rise NY — 2026",
            caption:
              "Pre-release teaser for the spring-summer collection, shot in NYC on an older digital camera. A rawer, lower-fidelity look than the fall-winter teaser, prioritizing texture over polish.",
            aspectRatio: "16/9",
          },
        ],
      },
      {
        _type: "videoGroupBlock",
        _key: key(),
        sectionLabel: "Social content",
        intro:
          "Short-form content built for social for Smoke Rise NY, each one showcasing a specific style or collection. Location and gear shift with the moment, outdoor, in studio, or on the go, captured on phone or camera depending on what the shot called for. (2024—2026)",
        layout: "vertical-3up",
        videos: [
          { _type: "videoAsset", _key: key(), video: await file("mv-vert-3-001bd12b.mp4"), aspectRatio: "9/16" },
          {
            _type: "videoAsset",
            _key: key(),
            video: await file("mv-vert-1.mp4"),
            poster: await image("mv-vert-1-poster.jpg"),
            aspectRatio: "9/16",
          },
          {
            _type: "videoAsset",
            _key: key(),
            video: await file("mv-vert-2.mp4"),
            poster: await image("mv-vert-2-poster.jpg"),
            aspectRatio: "9/16",
          },
        ],
      },
      {
        _type: "videoGroupBlock",
        _key: key(),
        sectionLabel: "Brand content",
        layout: "mixed",
        videos: [
          {
            _type: "videoAsset",
            _key: key(),
            video: await file("mv-mix-wide.mp4"),
            poster: await image("mv-mix-wide-poster.jpg"),
            label: "Smoke Rise NY — 2025",
            caption: "Denim ad shot in studio against an all-white set, white backdrop, white tee, white shoes, keeping the jeans as the sole focal point.",
            aspectRatio: "16/9",
          },
          {
            _type: "videoAsset",
            _key: key(),
            video: await file("mv-mix-vert-70aa94a9.mp4"),
            label: "Smoke Rise NY — 2025",
            caption: "Social content styled around matching couple's looks for Valentine's Day, with a projector used on set to create a practical smoke effect.",
            aspectRatio: "9/16",
          },
        ],
      },
      {
        _type: "videoGroupBlock",
        _key: key(),
        sectionLabel: "How it started",
        intro:
          "Trips first. No brief, no client. These are some of the first videos I made, filmed on trips with no plan beyond keeping a record of them. Editing was the part that hooked me: finding the rhythm of a place in ten seconds of footage, choosing what to leave out. Everything I do for brands now comes out of that habit, the same instinct for movement and pacing, applied to a shot list instead of a trip. (2017—2019)",
        layout: "vertical-3up",
        videos: [
          { _type: "videoAsset", _key: key(), video: await file("mv-origin-1.mp4"), poster: await image("mv-origin-1-poster.jpg"), aspectRatio: "9/16" },
          { _type: "videoAsset", _key: key(), video: await file("mv-origin-2.mp4"), poster: await image("mv-origin-2-poster.jpg"), aspectRatio: "9/16" },
          { _type: "videoAsset", _key: key(), video: await file("mv-origin-3.mp4"), poster: await image("mv-origin-3-poster.jpg"), aspectRatio: "9/16" },
        ],
      },
    ],
  };
}

// --- Content Strategy --------------------------------------------------
// The design export's Content-Strategy page is a much more elaborate,
// bespoke layout (phone mockups, KPI dashboard, tone-of-voice example
// cards, bar charts) than the general-purpose section builder in the
// schema. This seeds the real copy and numbers into that simpler,
// flexible structure rather than attempting to reproduce that one-off
// dashboard pixel-for-pixel.

async function buildContentStrategyPage() {
  return {
    _id: "contentStrategyPage",
    _type: "contentStrategyPage",
    heroLabel: "Content Strategy",
    heroHeadline: "Planning the content, not just shooting it.",
    heroBody:
      "A shoot is only as good as the plan around it. Content strategy decides what a campaign says. It sets the formats that carry the message and the dates each asset publishes, so one shoot becomes a month of content.\n\nTo show the process, I created Moss & Milk, a fictional skincare brand, and built its strategy from scratch.",
    sections: [
      {
        _type: "strategySection",
        _key: key(),
        heading: "Before anything gets shot",
        body:
          "Research sets the brief. Audiences get a face, not a demographic.\n\nMarket & category — where the brand sits in its price bracket, and which of the category's visual conventions are worth breaking.\n\nCompetitive scan — five to eight comparable accounts read side by side: posting rhythm, formats, and the hooks that keep working.\n\nChannel audit — the brand's own last ninety days: top and bottom performers, and which pillars are missing entirely.\n\nThe core buyer already owns the brand and reorders without being prompted. The discoverer arrives from reels with no idea of the name — a strong first frame is what stops the scroll. The industry eye (press, retailers, collaborators) watches whether the imagery holds up over time.",
        image: await image("core-buyer.jpg"),
      },
      {
        _type: "strategySection",
        _key: key(),
        heading: "A written rulebook the whole team can shoot to",
        body:
          "Guidelines keep a feed coherent when several people are producing for it. Each project ends with a short document covering voice, framing, color, and the things the brand never does.\n\nTone of voice — how captions read: sentence length, use of humor, whether the brand says \"we\" or disappears behind the product.\n\nVisual direction — light, framing, crop and grade; which surfaces and locations recur, and the treatment applied to every export.\n\nGrid rules — how posts sit next to each other, alternating product, portrait and detail so the profile reads as one piece.\n\nAsset specs — ratios, safe areas, file naming, and delivery, so one shoot serves ecommerce, paid, and organic without extra exports.",
        image: await image("palette-2ad61167.jpg"),
      },
      {
        _type: "strategySection",
        _key: key(),
        heading: "Every campaign closes with a report",
        body:
          "Monthly reporting tracks reach, engagement and saves against the pillars set at the start, then feeds the next shot list. The numbers below cover a spring launch for a fictional skincare brand.",
        stats: [
          { _type: "stat", _key: key(), label: "Reach, 90 days", value: "+128%" },
          { _type: "stat", _key: key(), label: "Engagement rate", value: "6.4%" },
          { _type: "stat", _key: key(), label: "Saves / month", value: "3.1k" },
          { _type: "stat", _key: key(), label: "Assets / shoot", value: "42" },
        ],
      },
    ],
  };
}

// --- Home featured projects ---------------------------------------------

async function buildFeaturedProjects() {
  return {
    editorial: {
      _type: "projectTeaser",
      image: await image("footer-editorial.jpg"),
      blurb: "Fashion and portrait editorials shot on location, built around mood, light, and character.",
    },
    products: {
      _type: "projectTeaser",
      image: await image("footer-products.jpg"),
      blurb: "Ecommerce and product photography for fashion and jewelry brands, spanning studio and on-location work.",
    },
    movement: {
      _type: "projectTeaser",
      video: await file("mv-featured.mp4"),
      blurb: "Short-form video and reels, including behind-the-scenes footage from shoots in studio and on location.",
    },
    strategy: {
      _type: "projectTeaser",
      video: await file("cs-strategy-preview.mp4"),
      blurb: "Social planning and content strategy that turns shoots into a consistent brand presence.",
    },
  };
}

// --- Run -----------------------------------------------------------------

async function run() {
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Target: ${projectId}/${dataset}\n`);

  console.log("Editorials:");
  for (let i = 0; i < editorials.length; i++) {
    const e = editorials[i];
    console.log(`- ${e.title}`);
    const doc = {
      _id: `editorial-${e.slug}`,
      _type: "editorial",
      title: e.title,
      slug: { _type: "slug", current: e.slug },
      year: e.year,
      description: e.description,
      galleryGap: e.galleryGap,
      coverFrames: await frames(e.coverFrames),
      gallery: await frames(e.gallery),
      orderRank: orderRank(i),
    };
    await client.createOrReplace(doc);
  }

  console.log("\nProduct case studies:");
  for (let i = 0; i < productCaseStudies.length; i++) {
    const p = productCaseStudies[i];
    console.log(`- ${p.title}`);
    let gallery = [];
    if (p.gallery?.type === "apre") gallery = await buildApreGallery();
    if (p.gallery?.type === "risa") gallery = await buildRisaGallery();

    const doc = {
      _id: `productCaseStudy-${p.slug}`,
      _type: "productCaseStudy",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      categoryLabel: p.categoryLabel,
      yearRange: p.yearRange,
      coverImage: await image(p.coverImage),
      coverAlt: p.coverAlt,
      description: p.description,
      gallery,
      orderRank: orderRank(i),
    };
    await client.createOrReplace(doc);

    for (let j = 0; j < p.subGalleries.length; j++) {
      const sg = p.subGalleries[j];
      console.log(`  - ${sg.title}`);
      const subDoc = {
        _id: `productSubGallery-${p.slug}-${sg.slug}`,
        _type: "productSubGallery",
        parentCaseStudy: { _type: "reference", _ref: `productCaseStudy-${p.slug}` },
        title: sg.title,
        slug: { _type: "slug", current: sg.slug },
        description: sg.description,
        teaserImages: await frames(sg.teaserImages),
        fullGallery: await frames(sg.fullGallery),
        orderRank: orderRank(j),
      };
      await client.createOrReplace(subDoc);
    }
  }

  console.log("\nMovement page:");
  await client.createOrReplace(await buildMovementPage());

  console.log("\nContent Strategy page:");
  await client.createOrReplace(await buildContentStrategyPage());

  console.log("\nHome page (hero + featured projects):");
  const featuredProjects = await buildFeaturedProjects();
  const heroImage = await image("home-portrait.jpg");
  await client.createIfNotExists({ _id: "siteConfig", _type: "siteConfig" });
  await client
    .patch("siteConfig")
    .setIfMissing({ homePage: {} })
    .set({
      "homePage.heroImage": heroImage,
      "homePage.heroHeadline": "Roberta Mascotto",
      "homePage.featuredProjects": featuredProjects,
    })
    .commit();

  console.log("\nDone. Note: siteConfig's other fields (siteName, email,");
  console.log("navigation links, footer tagline/description, social links)");
  console.log("are untouched — set those in Studio if they aren't already.");
}

run().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
