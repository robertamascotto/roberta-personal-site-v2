import { defineType, defineField } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "projects", title: "Featured Projects" },
    { name: "colors", title: "Color Overrides" },
  ],
  fields: [
    defineField({
      name: "heroTagline",
      title: "Hero Tagline",
      type: "string",
      description: "Small label above the headline (e.g. Lifestyle & Ecommerce)",
      group: "content",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "Full-width banner — recommended: landscape, at least 1920x1080px",
      group: "content",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      description: "Main hero heading — the first thing visitors read",
      group: "content",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text",
      description: "Supporting text below the headline",
      group: "content",
    }),
    defineField({
      name: "featuredProjects",
      title: "Featured Projects",
      type: "featuredProjects",
      description: "The Editorial / Products / Movement / Strategy teasers in the home page scroll section",
      group: "projects",
    }),
    defineField({
      name: "heroTaglineColor",
      title: "Hero Tagline Color",
      type: "color",
      options: { disableAlpha: true },
      description: "Optional color override for the tagline text",
      group: "colors",
    }),
    defineField({
      name: "heroHeadlineColor",
      title: "Hero Headline Color",
      type: "color",
      options: { disableAlpha: true },
      description: "Optional color override for the headline text",
      group: "colors",
    }),
    defineField({
      name: "heroSubtitleColor",
      title: "Hero Subtitle Color",
      type: "color",
      options: { disableAlpha: true },
      description: "Optional color override for the subtitle text",
      group: "colors",
    }),
  ],
});
