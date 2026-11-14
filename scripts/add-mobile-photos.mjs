// Puts the tall PHONE photos into Sanity (the "Phone photos (vertical)" field of each editorial).
//
// Folder layout (next to the project folder):   CODE/mobile photos/<Shoot title>/1.jpg, 2.jpg, 3.jpg ...
// The photos go in name order (1, 2, 3 ... 10, not 1, 10, 2). The first one is the shoot's card on phones.
//
//   node --env-file=.env.local scripts/add-mobile-photos.mjs           (dry run: only checks and reports)
//   node --env-file=.env.local scripts/add-mobile-photos.mjs apply     (uploads and saves)
//   node --env-file=.env.local scripts/add-mobile-photos.mjs apply "West Village"   (only that shoot)
//
// A shoot whose folder is empty is skipped. Running it again REPLACES that shoot's phone photos with what is in the folder.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const APPLY = process.argv[2] === "apply";
const ONLY = process.argv[3]?.trim().toLowerCase(); // optional: only this shoot's folder
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const H = { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}` };
const base = `https://${pid}.api.sanity.io/v2024-01-01`;
const ROOT = path.resolve(process.cwd(), "../mobile photos");

const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
const isImage = (f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith(".");
const key = () => Math.random().toString(36).slice(2, 10);

const eds = (await fetch(`${base}/data/query/${ds}?perspective=raw&query=${encodeURIComponent('*[_type=="editorial"]{_id,_rev,title,"n":count(mobileGallery)}')}`, { headers: H }).then((r) => r.json())).result;
fs.mkdirSync(path.join(ROOT, "_backups"), { recursive: true });

for (const dir of fs.readdirSync(ROOT).filter((d) => !d.startsWith(".") && !d.startsWith("_") && fs.statSync(path.join(ROOT, d)).isDirectory())) {
  if (ONLY && dir.trim().toLowerCase() !== ONLY) continue;
  const files = fs.readdirSync(path.join(ROOT, dir)).filter(isImage).sort(natural);
  if (!files.length) {
    console.log(`- ${dir}: empty, skipped`);
    continue;
  }
  const ed = eds.find((e) => e.title.trim().toLowerCase() === dir.trim().toLowerCase());
  if (!ed) {
    console.log(`! ${dir}: no editorial with this title, skipped`);
    continue;
  }
  console.log(`\n${ed.title}: ${files.length} photos (currently ${ed.n || 0} phone photos)`);
  const items = [];
  for (const [i, f] of files.entries()) {
    const file = path.join(ROOT, dir, f);
    const buf = fs.readFileSync(file);
    const meta = await sharp(buf).metadata();
    const w = meta.width, h = meta.height;
    const ar = w / h;
    const warn = [];
    if (ar > 0.95) warn.push("not vertical");
    if (w < 1100) warn.push(`narrow (${w}px: 1200+ is best)`);
    console.log(`   ${i + 1}. ${f}  ${w}x${h}  ratio ${ar.toFixed(2)}  ${(buf.length / 1048576).toFixed(1)} MB${warn.length ? "   <-- " + warn.join(", ") : ""}`);
    if (!APPLY) continue;
    const up = await fetch(`${base}/assets/images/${ds}?filename=${encodeURIComponent(f)}`, {
      method: "POST",
      headers: { ...H, "Content-Type": meta.format === "png" ? "image/png" : meta.format === "webp" ? "image/webp" : "image/jpeg" },
      body: buf,
    }).then((r) => r.json());
    if (!up.document) throw new Error(`upload failed for ${f}: ${JSON.stringify(up).slice(0, 200)}`);
    items.push({
      _key: key(),
      _type: "imageWithAspect",
      alt: `${ed.title}, phone photo ${i + 1} of ${files.length}`,
      aspectRatio: `${w}/${h}`,
      image: { _type: "image", asset: { _type: "reference", _ref: up.document._id } },
    });
  }
  if (!APPLY) continue;
  const old = (await fetch(`${base}/data/query/${ds}?perspective=raw&query=${encodeURIComponent(`*[_id=="${ed._id}"][0].mobileGallery`)}`, { headers: H }).then((r) => r.json())).result;
  fs.writeFileSync(path.join(ROOT, "_backups", `${ed.title}-before-${Date.now()}.json`), JSON.stringify(old ?? null, null, 1));
  const res = await fetch(`${base}/data/mutate/${ds}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: [{ patch: { id: ed._id, set: { mobileGallery: items } } }] }),
  }).then((r) => r.json());
  console.log(`   -> saved ${items.length} phone photos`, JSON.stringify(res).slice(0, 120));
}
console.log(APPLY ? "\nDone. Phone pages show the new photos within about a minute (an hour on the live site until its cache refreshes)." : "\nDry run only. Add `apply` to upload and save.");
