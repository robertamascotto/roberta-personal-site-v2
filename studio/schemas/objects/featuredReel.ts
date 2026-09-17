import { defineType, defineField } from "sanity";

export default defineType({
  name: "featuredReel",
  title: "Featured Reel",
  type: "object",
  description: "The single large video at the top of the Movement page",
  fields: [
    defineField({
      name: "video",
      title: "Video File",
      type: "file",
      options: { accept: "video/mp4,video/quicktime" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "tag", title: "Tag", type: "string", description: "Small label above the title (e.g. 'Editorial')" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "blurb", title: "Blurb", type: "text", rows: 3 }),
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({
      name: "linkedEditorial",
      title: "Linked Editorial (optional)",
      type: "reference",
      to: [{ type: "editorial" }],
      description: "If this reel is a preview of an editorial shoot, link it here",
    }),
  ],
});
