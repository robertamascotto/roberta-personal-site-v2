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
    "heroSubtitleColor": heroSubtitleColor.hex
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
  uiLabels{portfolioHeading, allPhotosLabel, noPhotos, noImages},
  siteMetadata{siteDescription, siteTitleTemplate},
  theme{themePreset, "backgroundColor": backgroundColor.hex, "textColor": textColor.hex, "accentColor": accentColor.hex, fontPairing},
  portfolioLayout,
  portfolioColumns,
  portfolioAspectRatio,
  categoryOverrides[]{ category, portfolioLayout, portfolioColumns, portfolioAspectRatio }
}`;

// All tags ordered by sortOrder
export const tagsQuery = groq`*[_type == "tag"] | order(orderRank asc, sortOrder asc){
  _id,
  label,
  "slug": slug.current,
  sortOrder
}`;

// Shared photo projection — weak tag refs are pre-filtered to exclude deleted tags
const photoProjection = groq`{
  _id,
  "src": image.asset->url,
  "lqip": image.asset->metadata.lqip,
  alt,
  caption,
  date,
  sortOrder,
  featured,
  "tags": tags[@->_id != null]->{_id, label, "slug": slug.current}
}`;

// All photos with dereferenced tags, ordered by featured → sortOrder → date
export const photosQuery = groq`*[_type == "photo"] | order(featured desc, orderRank asc, sortOrder asc, date desc) ${photoProjection}`;

// Photos filtered by category
export const photosByCategoryQuery = groq`*[_type == "photo" && category == $category] | order(featured desc, orderRank asc, sortOrder asc, date desc) ${photoProjection}`;
