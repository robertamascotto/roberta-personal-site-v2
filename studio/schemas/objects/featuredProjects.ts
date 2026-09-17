import { defineType, defineField } from "sanity";

export default defineType({
  name: "featuredProjects",
  title: "Featured Projects",
  type: "object",
  description: "The four project teasers shown as you scroll down the home page",
  fields: [
    defineField({ name: "editorial", title: "Editorial Teaser", type: "projectTeaser" }),
    defineField({ name: "products", title: "Products Teaser", type: "projectTeaser" }),
    defineField({ name: "movement", title: "Movement Teaser", type: "projectTeaser" }),
    defineField({ name: "strategy", title: "Strategy Teaser", type: "projectTeaser" }),
  ],
});
