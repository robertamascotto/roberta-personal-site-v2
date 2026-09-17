import { defineType, defineField } from "sanity";

export default defineType({
  name: "uiLabels",
  title: "UI Labels",
  type: "object",
  fields: [
    defineField({ name: "portfolioHeading", title: "Portfolio Heading", type: "string", description: "Page heading for the portfolio page", initialValue: "Portfolio" }),
    defineField({ name: "allPhotosLabel", title: "All Photos Label", type: "string", description: "Label for the 'All' filter tab on the portfolio page", initialValue: "All" }),
    defineField({ name: "noPhotos", title: "No Photos", type: "string", description: "Message shown when there are no photographs to display", initialValue: "No photographs yet." }),
    defineField({ name: "noImages", title: "No Images", type: "string", description: "Message shown when lightbox has no images", initialValue: "No images in this gallery." }),
  ],
});
