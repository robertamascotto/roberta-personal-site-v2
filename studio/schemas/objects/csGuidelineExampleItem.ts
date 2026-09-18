import { defineType, defineField } from "sanity";

export default defineType({
  name: "csGuidelineExampleItem",
  title: "Example Item",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image (visual-direction rows only)",
      type: "image",
      description: "Only used when the parent row's layout is 'Visual grid (with images)'",
    }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "value",
      title: "Value line (optional)",
      type: "string",
      description: "A short highlighted value between the heading and body — only used by the Asset Specs row (e.g. '1:1 feed / 4:5 stories')",
    }),
    defineField({ name: "body", title: "Body", type: "text", rows: 2, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "heading", subtitle: "value", media: "image" },
  },
});
