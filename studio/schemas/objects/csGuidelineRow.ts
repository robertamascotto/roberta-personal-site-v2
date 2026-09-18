import { defineType, defineField } from "sanity";

export default defineType({
  name: "csGuidelineRow",
  title: "Guideline Row",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", description: "e.g. 'Tone of voice'", validation: (rule) => rule.required() }),
    defineField({ name: "body", title: "Body", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({ name: "exampleLabel", title: "Example Card Label", type: "string", description: "e.g. 'Example — Moss & Milk, tone of voice'", validation: (rule) => rule.required() }),
    defineField({
      name: "exampleLayout",
      title: "Example Layout",
      type: "string",
      options: {
        list: [
          { title: "Text grid (2 columns)", value: "textGrid" },
          { title: "Visual grid (4 columns, with images)", value: "visualGrid" },
        ],
      },
      initialValue: "textGrid",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "exampleItems",
      title: "Example Items",
      type: "array",
      of: [{ type: "csGuidelineExampleItem" }],
      validation: (rule) => rule.min(2).max(4),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
