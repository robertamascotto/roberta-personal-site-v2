import { defineType, defineField } from "sanity";
import { CogIcon } from "@sanity/icons";

export default defineType({
  name: "siteConfig",
  title: "Site Configuration",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "pages", title: "Pages" },
    { name: "navigation", title: "Navigation" },
    { name: "footer", title: "Footer" },
    { name: "theme", title: "Theme" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      description: "Brand name shown in the navigation bar and footer",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Contact email displayed in the footer and contact page",
      group: "general",
      validation: (rule) =>
        rule.required().custom((value: unknown) => {
          if (typeof value !== "string") return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Must be a valid email address";
        }),
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [{ type: "socialLink" }],
      description: "Social media profiles shown in the footer",
      group: "general",
    }),
    defineField({
      name: "homePage",
      title: "Home Page",
      type: "homePage",
      description: "Hero section content, featured project teasers, and color overrides for the landing page",
      group: "pages",
    }),
    defineField({
      name: "contactPage",
      title: "Contact Page",
      type: "contactPage",
      description: "Contact form labels, placeholders, and sidebar content",
      group: "pages",
    }),
    defineField({
      name: "navigationLinks",
      title: "Navigation Links",
      type: "array",
      of: [{ type: "navigationLink" }],
      description: "Links shown in the top navigation bar and mobile menu",
      group: "navigation",
    }),
    defineField({
      name: "mobileTagline",
      title: "Mobile Tagline",
      type: "string",
      description: "Short tagline displayed at the bottom of the mobile menu",
      group: "navigation",
      initialValue: "Photography & Content Strategy",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer Tagline",
      type: "string",
      description: "Short description displayed in the footer beneath the site name",
      group: "footer",
    }),
    defineField({
      name: "footerCTA",
      title: "Footer Call-to-Action",
      type: "footerCTA",
      description: "Call-to-action section in the footer with a heading and link",
      group: "footer",
    }),
    defineField({
      name: "footerLabels",
      title: "Footer Labels",
      type: "footerLabels",
      description: "Section headings and copyright text for footer columns",
      group: "footer",
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "themeConfig",
      description: "Site-wide colors and font pairing",
      group: "theme",
    }),
    defineField({
      name: "siteMetadata",
      title: "Site Metadata",
      type: "siteMetadata",
      description: "SEO description and browser title template",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Configuration" };
    },
  },
});
