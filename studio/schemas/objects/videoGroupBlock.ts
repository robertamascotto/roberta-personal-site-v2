import { defineType, defineField } from "sanity";

export default defineType({
  name: "videoGroupBlock",
  title: "Video Group",
  type: "object",
  description: "A labeled section of videos, e.g. 'Brand films' or 'Social content'",
  fields: [
    defineField({
      name: "sectionLabel",
      title: "Section Label",
      type: "string",
      description: "Small uppercase heading above the videos (e.g. 'Brand films')",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro Text",
      type: "text",
      rows: 3,
      description: "Optional paragraph shown above the videos",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Two wide, side by side", value: "wide-2up" },
          { title: "Three vertical, side by side", value: "vertical-3up" },
          { title: "One wide + one vertical", value: "mixed" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videos",
      title: "Videos",
      type: "array",
      of: [{ type: "videoAsset" }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "sectionLabel", layout: "layout", count: "videos.length" },
    prepare({ title, layout, count }) {
      return { title, subtitle: `${layout} — ${count || 0} video${count === 1 ? "" : "s"}` };
    },
  },
});
