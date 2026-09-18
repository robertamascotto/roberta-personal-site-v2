import { defineType, defineField } from "sanity";

export default defineType({
  name: "titleBodyItem",
  title: "Title + Body",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "title", subtitle: "body" },
  },
});
