import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";

export default defineType({
  name: "contentStrategyPage",
  title: "Content Strategy Page",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Sections" },
  ],
  fields: [
    defineField({ name: "heroLabel", title: "Hero Label", type: "string", initialValue: "Content Strategy", group: "hero" }),
    defineField({ name: "heroHeadline", title: "Hero Headline", type: "string", group: "hero" }),
    defineField({ name: "heroBody", title: "Hero Body", type: "text", rows: 3, group: "hero" }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      description: "The essay-style sections of the case study, in order (e.g. Research, Brand Guidelines, Reporting)",
      of: [{ type: "strategySection" }],
      group: "sections",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Content Strategy Page" };
    },
  },
});
