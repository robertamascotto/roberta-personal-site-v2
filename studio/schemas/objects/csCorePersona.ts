import { defineType, defineField } from "sanity";

export default defineType({
  name: "csCorePersona",
  title: "Core Persona",
  type: "object",
  fields: [
    defineField({ name: "image", title: "Portrait", type: "image", validation: (rule) => rule.required() }),
    defineField({ name: "name", title: "Name", type: "string", description: "e.g. 'The core buyer'", validation: (rule) => rule.required() }),
    defineField({ name: "quote", title: "Pull Quote", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "attribution", title: "Attribution", type: "string", description: "e.g. 'Moss & Milk core buyer, mid-30s.'" }),
  ],
  preview: {
    select: { title: "name", media: "image" },
  },
});
