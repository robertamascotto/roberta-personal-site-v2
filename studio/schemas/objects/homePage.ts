import { defineType, defineField } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "object",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero Portrait",
      type: "image",
      options: { hotspot: true },
      description: "Full-height portrait shown on the right side of the home page hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      description: "The name/headline shown over the hero — defaults to 'Roberta Mascotto'",
    }),
    defineField({
      name: "featuredProjects",
      title: "Featured Projects",
      type: "featuredProjects",
      description: "The Editorial / Products / Movement / Strategy teasers in the home page scroll section",
    }),
  ],
});
