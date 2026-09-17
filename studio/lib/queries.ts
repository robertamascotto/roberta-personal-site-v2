import { groq } from "next-sanity";

// Full siteConfig singleton
export const siteConfigQuery = groq`*[_type == "siteConfig"][0]{
  siteName,
  email,
  socialLinks[]{platform, url},
  footerTagline,
  footerCTA{heading, linkText, linkUrl},
  navigationLinks[]{label, href},
  mobileTagline,
  homePage{
    heroTagline,
    heroImage,
    "heroImageLqip": heroImage.asset->metadata.lqip,
    heroHeadline,
    heroSubtitle,
    "heroTaglineColor": heroTaglineColor.hex,
    "heroHeadlineColor": heroHeadlineColor.hex,
    "heroSubtitleColor": heroSubtitleColor.hex,
    featuredProjects{
      editorial{image, video, blurb},
      products{image, video, blurb},
      movement{image, video, blurb},
      strategy{image, video, blurb}
    }
  },
  contactPage{
    sectionLabel,
    heading,
    introText,
    location,
    availability,
    quote,
    formLabels{name, email, projectType, message, submitButton},
    formPlaceholders{name, email, projectType, message},
    projectTypes,
    successMessage,
    errorMessage,
    contactInfoHeading,
    emailLabel,
    locationLabel,
    availabilityLabel,
    socialLabel
  },
  footerLabels{navigationHeading, contactHeading, copyrightText},
  siteMetadata{siteDescription, siteTitleTemplate},
  theme{themePreset, "backgroundColor": backgroundColor.hex, "textColor": textColor.hex, "accentColor": accentColor.hex, fontPairing}
}`;

const imageWithAspectProjection = groq`{ image, alt, aspectRatio }`;

// All editorials, ordered for the Editorials index page
export const editorialsQuery = groq`*[_type == "editorial"] | order(orderRank asc){
  _id,
  title,
  "slug": slug.current,
  year,
  description,
  coverFrames[]${imageWithAspectProjection}
}`;

// A single editorial by slug, with its full gallery
export const editorialBySlugQuery = groq`*[_type == "editorial" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  year,
  description,
  gallery[]${imageWithAspectProjection}
}`;

// Adjacent editorial slugs/titles for prev/next navigation
export const editorialNeighborsQuery = groq`*[_type == "editorial"] | order(orderRank asc){
  "slug": slug.current,
  title
}`;

const galleryBlockProjection = groq`
  _type == "imageWithAspect" => ${imageWithAspectProjection},
  _type == "imageGridBlock" => { _type, columns, images[]${imageWithAspectProjection} },
  _type == "scrollStripBlock" => { _type, images[]${imageWithAspectProjection} }
`;

// All product case studies, ordered for the Products index page
export const productCaseStudiesQuery = groq`*[_type == "productCaseStudy"] | order(orderRank asc){
  _id,
  title,
  "slug": slug.current,
  categoryLabel,
  yearRange,
  coverImage,
  coverAlt
}`;

// A single product case study by slug, with gallery + its sub-galleries
export const productCaseStudyBySlugQuery = groq`*[_type == "productCaseStudy" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  categoryLabel,
  yearRange,
  description,
  "gallery": gallery[]{ ${galleryBlockProjection} },
  "subGalleries": *[_type == "productSubGallery" && parentCaseStudy._ref == ^._id] | order(orderRank asc){
    title,
    "slug": slug.current,
    description,
    teaserImages[]${imageWithAspectProjection}
  }
}`;

// Adjacent product case study slugs/titles for prev/next navigation
export const productCaseStudyNeighborsQuery = groq`*[_type == "productCaseStudy"] | order(orderRank asc){
  "slug": slug.current,
  title
}`;

// A single sub-gallery by parent + own slug, with the parent's title/slug and sibling order for prev/next
export const productSubGalleryBySlugQuery = groq`*[_type == "productSubGallery" && slug.current == $subSlug && parentCaseStudy->slug.current == $parentSlug][0]{
  title,
  "slug": slug.current,
  fullGallery[]${imageWithAspectProjection},
  "parent": parentCaseStudy->{title, "slug": slug.current},
  "siblings": *[_type == "productSubGallery" && parentCaseStudy._ref == ^.parentCaseStudy._ref] | order(orderRank asc){
    title,
    "slug": slug.current
  }
}`;

const videoAssetProjection = groq`{
  "videoUrl": video.asset->url,
  poster,
  label,
  caption,
  aspectRatio
}`;

// Movement page singleton
export const movementPageQuery = groq`*[_type == "movementPage"][0]{
  heroLabel,
  heroHeadline,
  heroBody,
  featuredReel{
    "videoUrl": video.asset->url,
    tag,
    title,
    blurb,
    year,
    "linkedEditorialSlug": linkedEditorial->slug.current
  },
  videoGroups[]{
    sectionLabel,
    intro,
    layout,
    videos[]${videoAssetProjection}
  }
}`;

// Content strategy page singleton
export const contentStrategyPageQuery = groq`*[_type == "contentStrategyPage"][0]{
  heroLabel,
  heroHeadline,
  heroBody,
  sections[]{
    heading,
    body,
    image,
    stats[]{label, value}
  }
}`;
