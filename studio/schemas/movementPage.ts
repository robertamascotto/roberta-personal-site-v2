import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";

export default defineType({
  name: "movementPage",
  title: "Movement Page",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "featured", title: "Featured Reel" },
    { name: "groups", title: "Video Groups" },
  ],
  fields: [
    defineField({ name: "heroLabel", title: "Hero Label", type: "string", initialValue: "Movement", group: "hero" }),
    defineField({ name: "heroHeadline", title: "Hero Headline", type: "string", group: "hero" }),
    defineField({ name: "heroBody", title: "Hero Body", type: "text", rows: 3, group: "hero" }),
    defineField({ name: "featuredReel", title: "Featured Reel", type: "featuredReel", group: "featured" }),
    defineField({
      name: "videoGroups",
      title: "Video Groups",
      type: "array",
      description: "The 'Brand films' / 'Social content' / 'Brand content' / 'How it started' sections, in order",
      of: [{ type: "videoGroupBlock" }],
      group: "groups",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Movement Page" };
    },
  },
});
