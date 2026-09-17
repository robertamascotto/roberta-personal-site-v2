# Roberta Mascotto — Photography & Content Strategy

## Project Purpose
Photography portfolio and content-strategy site for Roberta Mascotto, built around curated case studies rather than a flat tagged grid: editorial shoots, product/ecommerce case studies (with sub-galleries), a movement (video) showcase, and a content-strategy case study. Visual identity: warm off-white (`#fdfdfc`) on near-black (`#111110`), Big Shoulders Display headlines, Spectral italic accents, Poppins body text.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **CMS**: Sanity (headless, real-time) — Studio at `/studio`
- **Styling**: Tailwind CSS v4 with a fixed two-color editorial palette (no configurable theme)
- **Image Lightbox**: yet-another-react-lightbox (used only on product sub-gallery "see all" pages)
- **Image/Video Hosting**: Sanity assets via `cdn.sanity.io`
- **Forms**: Formspree (contact form)
- **Hosting**: Vercel

## Key Directories

```
├── app/
│   ├── (site)/                          # Public-facing pages (route group)
│   │   ├── page.tsx                     # Home — split hero + featured-project scroll section
│   │   ├── layout.tsx                   # Site layout (fonts, Nav + Footer, metadata)
│   │   ├── not-found.tsx                # 404 page
│   │   ├── robots.ts / sitemap.ts
│   │   ├── editorials/
│   │   │   ├── page.tsx                 # Editorials index (staggered teasers)
│   │   │   └── [slug]/page.tsx          # Single editorial shoot
│   │   ├── products/
│   │   │   ├── page.tsx                 # Products index
│   │   │   ├── [slug]/page.tsx          # Product case study (gallery + sub-gallery teasers)
│   │   │   └── [slug]/[subSlug]/page.tsx # Sub-gallery "see all" page (lightbox grid)
│   │   ├── movement/page.tsx            # Movement (video) page
│   │   ├── strategy/page.tsx            # Content Strategy case study
│   │   └── contact/page.tsx             # Contact page with Formspree form
│   ├── (studio)/                        # Sanity Studio (route group)
│   └── api/
│       ├── draft/ , disable-draft/      # Draft preview mode
│       └── revalidate/                  # On-demand revalidation webhook
├── components/
│   ├── Navigation.tsx                   # Fixed blur-on-scroll nav, RM monogram, full-screen mobile menu
│   ├── Footer.tsx                       # Centered footer (tagline, social, nav, copyright)
│   ├── PageHero.tsx / PageContainer.tsx # Shared page-header and centered-container shells
│   ├── ContactPageClient.tsx            # Contact form (client) — Formspree submit
│   ├── BackToTop.tsx / PageTransition.tsx
│   ├── home/
│   │   ├── HomeHero.tsx                 # Split-screen hero with scroll cue (client)
│   │   └── ProjectTeaserRow.tsx         # Alternating image/video + text row
│   └── gallery/
│       ├── AspectImage.tsx              # Sanity image in a fixed aspect-ratio box
│       ├── GalleryBlockRenderer.tsx     # Renders a productCaseStudy's flexible gallery array
│       ├── LightboxGrid.tsx             # Click-to-zoom grid (yet-another-react-lightbox)
│       ├── EditorialTeaser.tsx          # Staggered cover-frame teaser on the Editorials index
│       ├── VideoTile.tsx                # Click-to-play (or ambient autoplay) video tile
│       └── VideoGroupRenderer.tsx       # Lays out a movementPage video group by `layout`
├── studio/                              # Sanity CMS configuration
│   ├── client.ts / env.ts
│   ├── structure.ts                     # Studio desk structure
│   ├── schemas/
│   │   ├── index.ts                     # Schema registry
│   │   ├── siteConfig.ts                # Site configuration (singleton)
│   │   ├── editorial.ts                 # Editorial shoot (document)
│   │   ├── productCaseStudy.ts          # Product/ecommerce case study (document)
│   │   ├── productSubGallery.ts         # Named sub-gallery within a case study (document)
│   │   ├── movementPage.ts              # Movement page content (singleton)
│   │   ├── contentStrategyPage.ts       # Content Strategy page content (singleton)
│   │   └── objects/                     # Reusable object types (see Content Types below)
│   └── lib/
│       ├── queries.ts                   # GROQ queries
│       ├── helpers.ts                   # Typed data-fetching helpers
│       ├── image.ts                     # Image URL builder
│       └── validators.ts                # Shared validation functions (slug, URL)
├── lib/                                 # Shared utilities (constants, types, social icons, URL sanitizer)
├── scripts/
│   └── migrate-to-sanity.mjs            # Historical TinaCMS → Sanity migration script (stale — predates the current schema, kept for reference only)
├── sanity.config.ts                     # Sanity Studio configuration (root)
└── public/uploads/                      # Local static assets (legacy)
```

## Common Commands

```bash
npm run dev      # Development
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint code
```

## Sanity CMS

### Studio Access
- Local development: http://localhost:3000/studio
- Production: https://your-domain.com/studio

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name (default: `production`) |
| `SANITY_API_TOKEN` | API token for server-side reads |
| `SANITY_REVALIDATE_SECRET` | Secret for webhook revalidation |
| `NEXT_PUBLIC_FORMSPREE_ID` | Formspree form ID for contact form |
| `NEXT_PUBLIC_SITE_URL` | Production site URL (default: `robertamascotto.com`) |

### Content Types

1. **Site Config** (singleton) — General, Pages, Navigation, Footer, SEO tabs
   - `siteName`, `email`, `socialLinks[]`
   - `homePage`: `heroImage` (portrait), `heroHeadline`, `featuredProjects` (Editorial/Products/Movement/Strategy teasers — each an image or video + blurb)
   - `contactPage`: form labels/placeholders/project types, sidebar copy (location, availability, quote), success/error messages
   - `navigationLinks[]`, `footerTagline`, `footerDescription`, `footerCTA`, `footerLabels`
   - `siteMetadata`: SEO description and title template
   - Note: the old per-category portfolio layout settings (masonry/grid, columns, aspect ratio) and the configurable theme/font-pairing system have been **retired** — the new design is a fixed brand identity, not a swappable template.

2. **Editorial** — one of the personal/campaign portrait shoots
   - `title`, `slug`, `year`, `description`
   - `coverFrames[]` (2–4 images) — used for the staggered teaser on the Editorials index
   - `gallery[]` — the full set of images on the shoot's own page
   - Orderable via drag-and-drop (`orderRank`)

3. **Product Case Study** — Apre / Risa Venezia / Smoke Rise NY, etc.
   - `title`, `slug`, `categoryLabel` (e.g. "Jewelry"), `yearRange`, `coverImage` + `coverAlt`, `description`
   - `gallery[]` — a flexible page-builder: single images, image grids (2/3/4 columns), or horizontal scroll strips, in any order
   - Orderable via drag-and-drop

4. **Product Sub-Gallery** — a named sub-section within a case study (e.g. Smoke Rise's Flats / Natural Light / On Figure)
   - `parentCaseStudy` (reference), `title`, `slug`, `description`
   - `teaserImages[]` — shown on the parent case study page
   - `fullGallery[]` — the complete set, shown on this sub-gallery's own "see all" page (with a click-to-zoom lightbox)
   - Orderable via drag-and-drop within its parent

5. **Movement Page** (singleton)
   - `heroLabel` / `heroHeadline` / `heroBody`
   - `featuredReel`: an ambient autoplay video with tag/title/blurb/year, optionally linked to an Editorial
   - `videoGroups[]` — labeled sections (e.g. "Brand films"), each with a `layout` (two-wide / three-vertical / mixed) and a list of videos (file + poster + label + caption)

6. **Content Strategy Page** (singleton)
   - `heroLabel` / `heroHeadline` / `heroBody`
   - `sections[]` — an essay-style page builder: each section has a heading, body text, an optional image, and optional stat callouts (label/value pairs, e.g. "Engagement rate")

### Retired (as of the design rebuild)
- `photo` / `tag` document types and the `/portfolio/[category]` routes — replaced by the curated case-study model above.
- Bulk Import / Bulk Edit / Dashboard Studio tools — built entirely around the flat category+tag model; removed rather than adapted. (A new bulk-upload tool scoped to the new gallery arrays could be built later if needed.)
- `themeConfig` (configurable colors/font pairing) — the new design is a fixed identity, not a per-site theme.
- `uiLabels`, `portfolioLayout` / `portfolioColumns` / `portfolioAspectRatio` / `categoryOverrides` on Site Config — only meaningful for the retired flat grid.

### Revalidation
- **ISR fallback**: `revalidate = 3600` in `app/(site)/layout.tsx` (hourly)
- **On-demand**: POST to `/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>` triggers full site revalidation
- **Sanity webhook**: Configure in Sanity dashboard to call the revalidation endpoint on content changes

### Draft Preview
- **Enable**: GET `/api/draft?secret=<SANITY_REVALIDATE_SECRET>&slug=/path` — enables Next.js draft mode and redirects
- **Disable**: GET `/api/disable-draft` — disables draft mode
- Production URL previews are wired up in `sanity.config.ts` for Site Config, Movement Page, Content Strategy Page, Editorials, and Product Case Studies.

## Design System

- **Colors**: `--color-paper` (`#fdfdfc`) background, `--color-ink` (`#111110`) text — muted text is `text-ink/50` .. `text-ink/72` opacity steps, not a separate palette.
- **Fonts** (all via `next/font/google`, see `app/(site)/layout.tsx`):
  - `--font-heading` — Big Shoulders Display (900 weight) — page titles
  - `--font-mark` — Oswald — the "RM" nav monogram
  - `--font-accent` — Spectral italic — section labels, pull-quote-style subheadings
  - `--font-body` — Poppins — body copy, UI text
  - `--font-mono-label` — IBM Plex Mono — reserved for technical/placeholder labels

## Shared Utilities
- `lib/constants.ts` — `SITE_URL`, `DEFAULT_NAVIGATION_LINKS` (Editorials/Products/Movement/Strategy/Contact)
- `lib/types.ts` — nav/social link validation (`toValidNavLinks`, `toValidSocialLinks`)
- `lib/socialIcons.tsx` — SVG icons by platform name
- `lib/urlSanitizer.ts` — blocks unsafe URL protocols
- `studio/lib/helpers.ts` — typed fetchers: `getSiteConfig`, `getEditorials`/`getEditorialBySlug`, `getProductCaseStudies`/`getProductCaseStudyBySlug`, `getProductSubGallery`, `getMovementPage`, `getContentStrategyPage`

## Deployment

### Vercel Setup
1. Create Vercel project, connect Git repo
2. Add environment variables (see table above)
3. Build command: `npm run build` (auto-detected)
4. Framework preset: Next.js (auto-detected)

### Sanity Webhook Setup (in Sanity dashboard)
1. URL: `https://<domain>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
2. Trigger on: create, update, delete — all document types

## Troubleshooting

### Images Not Loading
1. Verify Sanity project ID and dataset are set correctly in env vars
2. `cdn.sanity.io` is listed in `next.config.js` `remotePatterns`
3. Image/video assets are published (not just drafts) in Sanity
4. `images.unoptimized: true` is set in `next.config.js` — Sanity CDN handles optimization
