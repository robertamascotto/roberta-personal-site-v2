import { defineType, defineField } from "sanity";

export default defineType({
  name: "footerLabels",
  title: "Footer Labels",
  type: "object",
  fields: [
    defineField({ name: "navigationHeading", title: "Navigation Heading", type: "string", description: "Heading above the navigation links column in the footer", initialValue: "Navigation" }),
    defineField({ name: "contactHeading", title: "Contact Heading", type: "string", description: "Heading above the contact information column in the footer", initialValue: "Get in Touch" }),
    defineField({ name: "copyrightText", title: "Copyright Text", type: "string", description: "Copyright notice at the bottom of the footer (e.g. All rights reserved)", initialValue: "All rights reserved." }),
  ],
});
