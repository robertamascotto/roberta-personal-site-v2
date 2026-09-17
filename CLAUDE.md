# Roberta Photography Portfolio

## Project Purpose
Photography portfolio website for Roberta, designed to showcase photography with a minimal, elegant aesthetic featuring warm neutral tones. Photos are organized into three categories (E-Commerce, Campaigns, Branded Content) with tag-based filtering within each category page.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **CMS**: Sanity (headless, real-time) — Studio at `/studio`
- **Styling**: Tailwind CSS v4 with custom warm neutral color palette
- **Image Lightbox**: yet-another-react-lightbox
- **Image Hosting**: Sanity assets via `cdn.sanity.io`
- **Forms**: Formspree (contact form)
- **Hosting**: Vercel

## Key Directories

```
├── app/                        # Next.js App Router
│   ├── (site)/                 # Public-facing pages (route group)
│   │   ├── page.tsx            # Home — hero + intro landing
│   │   ├── layout.tsx          # Site layout (Nav + Footer, metadata, theme)
│   │   ├── not-found.tsx       # 404 page
│   │   ├── robots.ts           # Robots.txt (disallows /studio)
│   │   ├── sitemap.ts          # Dynamic sitemap
│   │   ├── contact/page.tsx    # Contact page with Formspree form
│   │   └── portfolio/
│   │       ├── page.tsx        # Redirects to /portfolio/e-commerce
│   │       └── [category]/
│   │           ├── page.tsx    # Per-category portfolio gallery with tag filtering
│   │           └── opengraph-image.tsx  # Dynamic OG image generation (edge runtime)
│   ├── (studio)/               # Sanity Studio (route group)
│   │   ├── layout.tsx          # Minimal layout for Studio
│   │   └── studio/[[...tool]]/
│   │       └── page.tsx        # Sanity Studio at /studio
│   └── api/
│       ├── draft/
│       │   └── route.ts        # Enable draft preview mode
│       ├── disable-draft/
│       │   └── route.ts        # Disable draft preview mode
│       └── revalidate/
│           └── route.ts        # On-demand revalidation webhook
├── components/                 # React components
│   ├── Navigation.tsx          # Site navigation
│   ├── Footer.tsx              # Site footer
│   ├── PortfolioClient.tsx     # Portfolio grid with tag filtering + lightbox
│   ├── HomePageClient.tsx      # Client component for home page
│   ├── ContactPageClient.tsx   # Client component for contact form
│   ├── AnimateOnScroll.tsx     # Scroll-triggered animation wrapper
│   ├── BackToTop.tsx           # Back-to-top button
│   └── PageTransition.tsx      # Page navigation transitions
├── studio/                     # Sanity CMS configuration (named to avoid shadowing the `sanity` npm package)
│   ├── client.ts               # Sanity client instance
│   ├── env.ts                  # Project ID, dataset, API version
│   ├── structure.ts            # Studio desk structure
│   ├── schemas/                # Content schema definitions
│   │   ├── index.ts            # Schema registry
│   │   ├── siteConfig.ts       # Site configuration (singleton)
│   │   ├── photo.ts            # Photo document type
│   │   ├── tag.ts              # Tag document type (portfolio filters)
│   │   └── objects/            # Reusable object types
│   │       ├── socialLink.ts   # Social media link (platform + URL)
│   │       ├── footerCTA.ts    # Footer call-to-action (heading + link)
│   │       ├── navigationLink.ts
│   │       ├── homePage.ts
│   │       ├── contactPage.ts
│   │       ├── footerLabels.ts
│   │       ├── uiLabels.ts
│   │       ├── siteMetadata.ts
│   │       └── themeConfig.ts
│   ├── tools/                  # Custom Studio tools
│   │   ├── dashboard.tsx       # Dashboard tool (welcome screen, stats, quick actions)
│   │   ├── bulkManager.tsx     # Bulk Manager tool (plugin definition + tabs)
│   │   ├── BulkImport.tsx      # Bulk photo import with drag-and-drop
│   │   └── BulkEdit.tsx        # Bulk photo editing (tags, featured, delete)
│   └── lib/                    # Sanity utilities
│       ├── queries.ts          # GROQ queries
│       ├── helpers.ts          # Data fetching helpers
│       ├── image.ts            # Image URL builder
│       └── validators.ts       # Shared validation functions (slug, URL)
├── lib/                        # Shared utilities
│   ├── constants.ts            # Site URL, CATEGORIES, default nav links
│   ├── types.ts                # TypeScript interfaces + validation helpers
│   ├── socialIcons.tsx         # SVG icons for social platforms
│   ├── urlSanitizer.ts         # URL security utility
│   ├── themePresets.ts         # Theme style builder
│   ├── useInView.ts            # Intersection Observer hook (scroll animations)
│   └── useReducedMotion.ts     # Reduced motion preference hook (a11y)
├── scripts/
│   └── migrate-to-sanity.mjs   # TinaCMS → Sanity migration script
├── sanity.config.ts            # Sanity Studio configuration (root)
└── public/                     # Static assets
    └── uploads/                # Local media uploads
```

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Run content migration script
npm run migrate
```

## ESLint Configuration

This project uses ESLint 9 with the flat config format (`eslint.config.mjs`). The configuration:
- Extends `eslint-config-next` for Next.js specific rules
- Uses the new flat config format (not legacy `.eslintrc.json`)

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
| `NEXT_PUBLIC_SITE_URL` | Production site URL (default: `https://robertamascotto.com`) |

### Content Types

1. **Site Config** (singleton) — organized into 8 Studio tabs: General, Pages, Navigation, Footer, Theme, Portfolio, Labels, SEO
   - `siteName`: Brand name displayed in navigation and footer
   - `email`: Contact email address (validated)
   - `socialLinks`: Array of `socialLink` objects (platform + URL, both required)
   - `homePage`: Home page content (heroTagline, heroImage, heroHeadline, heroSubtitle, color overrides)
   - `contactPage`: Contact page content with form labels/placeholders
   - `navigationLinks`: Custom navigation links (label + href)
   - `mobileTagline`: Tagline shown at bottom of mobile menu
   - `footerTagline`: Short description shown in footer
   - `footerCTA`: `footerCTA` object (heading, linkText, linkUrl — cross-field validation: linkText and linkUrl are mutually required)
   - `footerLabels`: Section headings for footer columns
   - `theme`: Theme configuration (backgroundColor, textColor, accentColor, fontPairing)
   - `portfolioLayout`: masonry/grid/single-column (global default for all categories)
   - `portfolioColumns`: Number of columns (2–4, hidden when layout is single-column) (global default)
   - `portfolioAspectRatio`: Image shape — natural/square/portrait/landscape/cinematic (global default)
   - `categoryOverrides`: Array of per-category layout overrides (max 3). Each entry targets one category and can optionally override `portfolioLayout`, `portfolioColumns`, and/or `portfolioAspectRatio`. Fields left blank inherit the global defaults.
   - `uiLabels`: Customizable UI text (portfolioHeading, allPhotosLabel, noPhotos, noImages)
   - `siteMetadata`: SEO metadata (description with 160-char warning, title template)

2. **Photos** — organized into 2 Studio tabs: Image, Details
   - `image`: The photograph (required, with hotspot)
   - `alt`: Alt text (required) — improves accessibility for screen readers and aids SEO
   - `caption`: Optional caption shown in lightbox
   - `tags`: Array of weak tag references for filtering (weak refs allow deleting tags without removing them from photos first; dangling refs are filtered out in GROQ queries)
   - `category`: Which portfolio section (e-commerce/campaigns/branded-content) — can be changed at any time to move photos between categories. Uses `CATEGORIES` from `lib/constants.ts`.
   - `date`: Photo date (defaults to today, used for sorting)
   - `sortOrder`: Manual position override (hidden in form — drag-and-drop is the primary ordering method)
   - `featured`: Boolean — featured photos are pinned to top of grid (★ prefix in Studio). Recommend 3–5 per category.
   - `orderRank`: Hidden field managed via drag-and-drop in "All Photos" and per-category lists (not editable in form)
   - Preview: Shows date + tag names in subtitle (e.g. "Mar 4, 2026 — On-Figure, Flats")
   - Orderings: Drag-and-drop, Featured + Sort Order, Date (Newest First)

3. **Tags**
   - `label`: Tag name displayed as a filter tab
   - `slug`: URL Identifier (validated: lowercase, numbers, hyphens only; auto-generated from label, can be regenerated if the tag is renamed)
   - `sortOrder`: Controls left-to-right order of filter tabs (default: 99)
   - Preview: Shows slug in subtitle (e.g. `/on-figure`)
   - Orderings: Sort Order, Alphabetical
   - Inline creation: Both Bulk Import and Bulk Edit support creating new tags on the fly (see Studio Tools)

### Page Content (CMS-Editable)

**Home Page** (`homePage` on Site Config):
- `heroTagline`: Small label above headline
- `heroImage`: Hero banner image (optional)
- `heroHeadline`: Main hero heading
- `heroSubtitle`: Hero description text
- `heroTaglineColor` / `heroHeadlineColor` / `heroSubtitleColor`: Optional color overrides (color picker, stored as `{hex}` objects, GROQ extracts `.hex`)

**Contact Page** (`contactPage` on Site Config) — organized into 3 sub-tabs: Page Content, Sidebar Info, Form Settings
- `sectionLabel` / `heading` / `introText`: Page header content
- `location` / `availability` / `quote`: Sidebar info (leave blank to hide)
- `contactInfoHeading` / `emailLabel` / `locationLabel` / `availabilityLabel` / `socialLabel`: Sidebar section labels (leave blank to hide section)
- `formLabels`: Display labels for form fields (name, email, projectType, message, submitButton) — shown above inputs
- `formPlaceholders`: Placeholder text for form inputs — shown inside empty fields for guidance
- `projectTypes[]`: Dropdown options for project type field
- `successMessage` / `errorMessage`: Form feedback messages (e.g., "Thank you! We'll be in touch soon.")

### Revalidation

- **ISR fallback**: `revalidate = 3600` in `app/(site)/layout.tsx` (hourly)
- **On-demand**: POST to `/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>` triggers full site revalidation
- **Sanity webhook**: Configure in Sanity dashboard to call the revalidation endpoint on content changes

### Studio Tools

The Studio has three tool tabs in the top navigation:

1. **Dashboard** (`studio/tools/dashboard.tsx`) — Landing screen showing:
   - Dynamic welcome greeting (pulls first name from Site Config)
   - Current date and time
   - Photo counts per category and total tag count (fetched via single GROQ query)
   - "Needs Attention" alerts for photos missing alt text or tags (each with "Open Bulk Manager" action button)
   - Quick action buttons to create photos by category or open Bulk Import
   - "Quick Tip: Drafts & Publishing" card explaining the draft/publish workflow
   - Recent uploads grid (last 8 photos with thumbnails)

2. **Structure** (built-in) — Standard Sanity document editor for Site Config, Photos, and Tags

3. **Bulk Manager** (`studio/tools/bulkManager.tsx`) — Two-tab tool:
   - **Bulk Import**: Drag-and-drop multiple images, select category + shared tags + per-image tags, edit alt text per image, searchable tag list with inline tag creation ("Don't see the tag you need?" input), import all at once with progress tracking
   - **Bulk Edit**: Grid view of all photos with color-coded category badges and multi-select (selection preserved across actions). Bulk actions: Add/Remove Tags (with search and inline tag creation), Set Date, Move Category, Set/Unset Featured (with confirmation dialog), Delete (with confirmation)

### Draft Preview

Allows previewing unpublished changes on the live site before publishing.

- **Enable**: GET `/api/draft?secret=<SANITY_REVALIDATE_SECRET>&slug=/path` — enables Next.js draft mode and redirects
- **Disable**: GET `/api/disable-draft` — disables draft mode and redirects to `/`
- **Studio integration**: Click the preview/eye icon on any photo or siteConfig document to open a preview tab
- **How it works**: When draft mode is active, data fetching uses `previewClient` (with `perspective: "previewDrafts"`) instead of the CDN client. A fixed amber banner appears on the site indicating preview mode.
- **Security**: The draft API validates the secret parameter; the slug redirect is restricted to relative paths to prevent open redirects.

### Dynamic OG Images

Auto-generated Open Graph images for social sharing, per category page.

- **Route**: `app/(site)/portfolio/[category]/opengraph-image.tsx`
- **Runtime**: Edge (uses `ImageResponse` from `next/og`)
- **Design**: 1200x630px — cream background, site name, category title, photo count, up to 4 photo thumbnails, gold accent bar
- **Data**: Fetches directly from Sanity REST API (edge-compatible, no `@sanity/client`)
- **Security**: Category param validated against `CATEGORIES` before use in GROQ query

## Design System

### Colors (defined in `app/globals.css`)
- Background: `--color-cream` (#FAF8F5)
- Text: `--color-warm-gray` (#3D3D3D)
- Light text: `--color-warm-gray-light` (#6B6B6B)
- Accent: `--color-accent` (#C4A484)

### Typography
- Default font: Inter (Google Fonts)
- Style: Light weight, generous letter-spacing
- Hero headline font: Rubik Glitch (Google Fonts, `preload: false`, CSS variable `--font-rubik-glitch`). Uses `clamp(2rem, 8vw, 5.5rem)` for fluid responsive sizing with `whitespace-nowrap` to keep on one line.
- Available font pairings (configured via theme in Sanity): Inter, Cormorant Garamond, Montserrat, League Spartan, Source Sans 3, Playfair Display, DM Sans, DM Serif Display

## Shared Utilities

### Constants (`lib/constants.ts`)
Shared constants used across the app and Sanity schemas.
- `SITE_URL`: Production site URL (from env or default)
- `CATEGORIES`: Array of `{ slug, label }` for portfolio categories (E-Commerce, Campaigns, Branded Content) — single source of truth used by route generation, Sanity schema options, and navigation
- `CategorySlug`: Type union derived from `CATEGORIES`
- `getCategoryLabel(slug)`: Returns the display label for a category slug (used across Studio schemas, tools, and frontend pages)
- `DEFAULT_NAVIGATION_LINKS`: Fallback nav links when none configured in CMS

### Types (`lib/types.ts`)
TypeScript interfaces and validation helpers for Sanity data.
- `NavigationLink` / `ValidNavigationLink`: Nav link types
- `SocialLink` / `ValidSocialLink`: Social link types
- `toValidNavLinks(links)`: Filters and sanitizes navigation links
- `toValidSocialLinks(links)`: Filters and sanitizes social links

### Social Icons (`lib/socialIcons.tsx`)
Provides SVG icons for social platforms used in Footer component.
- `getSocialIcon(platform)`: Returns the appropriate icon for a platform name

### URL Sanitizer (`lib/urlSanitizer.ts`)
Security utility for sanitizing user-provided URLs.
- `sanitizeUrl(url)`: Returns sanitized URL or undefined if unsafe
- `isUrlSafe(url)`: Returns boolean indicating if URL is safe
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`
- Allows: `http:`, `https:`, `mailto:`, and relative paths starting with `/`

### Theme Presets (`lib/themePresets.ts`)
Builds CSS custom property overrides from Sanity theme configuration.
- `buildThemeStyles(bg, text, accent, fontPairing)`: Returns style object for `<html>` element

### Hooks
- `useInView` (`lib/useInView.ts`): Intersection Observer hook — triggers once when element scrolls into view
- `useReducedMotion` (`lib/useReducedMotion.ts`): Detects `prefers-reduced-motion` media query for accessible animations

### Helpers (`studio/lib/helpers.ts`)
Shared utilities for Sanity operations.
- `createTag(client, label)`: Creates a tag document with auto-generated slug and returns the created tag
- `categoryTone(slug)`: Returns Sanity UI Badge tone for a category (used in Bulk Edit grid for color-coded badges)

### Schema Validators (`studio/lib/validators.ts`)
Shared validation functions used across Sanity schemas.
- `generateSlug(label)`: Converts a label to a URL-friendly slug (lowercase, hyphens, no special chars)
- `validateSlug(slug)`: Ensures slug contains only lowercase letters, numbers, and hyphens
- `validateUrl(value)`: Validates full URLs or relative paths starting with `/`

## Component Props

### Navigation (`components/Navigation.tsx`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `siteName` | `string` | `"Roberta"` | Brand name in header |
| `navigationLinks` | `array` | From `lib/constants.ts` | Custom nav items |
| `mobileTagline` | `string` | `"Lifestyle & Ecommerce Photography"` | Mobile menu tagline |

### Footer (`components/Footer.tsx`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `siteName` | `string` | `"Roberta"` | Brand name in footer |
| `footerTagline` | `string` | Default tagline | Description text |
| `footerCTA` | `object` | Default CTA | Call-to-action section |
| `socialLinks` | `array` | `[]` | Social media links |
| `navigationLinks` | `array` | Default links | Footer nav items |
| `footerLabels` | `object` | `null` | Section headings (navigationHeading, contactHeading, copyrightText) |

## Deployment

### Vercel Setup
1. Create Vercel project, connect Git repo
2. Add environment variables (see Environment Variables table above)
3. Build command: `npm run build` (auto-detected by Vercel)
4. Framework preset: Next.js (auto-detected)

### Sanity Webhook Setup (in Sanity dashboard)
1. URL: `https://<domain>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
2. Trigger on: create, update, delete — all document types

## Troubleshooting

### Images Not Loading
If images fail to load, verify:
1. Sanity project ID and dataset are set correctly in env vars
2. `cdn.sanity.io` is listed in `next.config.js` `remotePatterns`
3. Image assets are published (not just drafts) in Sanity
4. `images.unoptimized: true` is set in `next.config.js` — Sanity CDN handles optimization
