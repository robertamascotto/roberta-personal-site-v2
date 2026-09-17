import { defineType, defineField } from "sanity";

export default defineType({
  name: "strategySection",
  title: "Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "body", title: "Body Text", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({
      name: "image",
      title: "Image (optional)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "stats",
      title: "Stat Callouts (optional)",
      type: "array",
      description: "Numbers to highlight, e.g. Audience / Engagement rate",
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "heading", media: "image" },
  },
});
