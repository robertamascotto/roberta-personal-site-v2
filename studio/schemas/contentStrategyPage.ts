import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";

export default defineType({
  name: "contentStrategyPage",
  title: "Content Strategy Page",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "feed", title: "Feed Preview" },
    { name: "process", title: "Process" },
    { name: "research", title: "Research & Audience" },
    { name: "guidelines", title: "Brand Guidelines" },
    { name: "report", title: "Report" },
  ],
  fields: [
    defineField({ name: "heroLabel", title: "Hero Label", type: "string", initialValue: "Content Strategy", group: "hero" }),
    defineField({ name: "heroHeadline", title: "Hero Headline", type: "string", group: "hero" }),
    defineField({
      name: "heroBody",
      title: "Hero Body",
      type: "text",
      rows: 4,
      description: "Start a new paragraph with a blank line",
      group: "hero",
    }),

    defineField({
      name: "feedSection",
      title: "Feed Preview Section",
      type: "object",
      group: "feed",
      fields: [
        defineField({
          name: "media",
          title: "Feed Media (3 tiles)",
          type: "array",
          of: [{ type: "csFeedMedia" }],
          validation: (rule) => rule.length(3),
        }),
        defineField({ name: "phoneImage", title: "Phone Mockup Image", type: "image", validation: (rule) => rule.required() }),
      ],
    }),

    defineField({
      name: "processSection",
      title: "Process Section",
      type: "object",
      group: "process",
      fields: [
        defineField({ name: "sectionLabel", title: "Section Label", type: "string", initialValue: "Process" }),
        defineField({
          name: "steps",
          title: "Steps (numbered automatically)",
          type: "array",
          of: [{ type: "titleBodyItem" }],
          validation: (rule) => rule.min(1),
        }),
      ],
    }),

    defineField({
      name: "researchAudienceSection",
      title: "Research & Audience Section",
      type: "object",
      group: "research",
      fields: [
        defineField({ name: "sectionLabel", title: "Section Label", type: "string", initialValue: "Research & audience" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 2 }),
        defineField({
          name: "researchItems",
          title: "Research Items",
          type: "array",
          of: [{ type: "titleBodyItem" }],
          validation: (rule) => rule.min(1),
        }),
        defineField({ name: "corePersona", title: "Core Persona", type: "csCorePersona" }),
        defineField({
          name: "secondaryPersonas",
          title: "Secondary Personas",
          type: "array",
          of: [{ type: "titleBodyItem" }],
        }),
      ],
    }),

    defineField({
      name: "brandGuidelinesSection",
      title: "Brand Guidelines Section",
      type: "object",
      group: "guidelines",
      fields: [
        defineField({ name: "sectionLabel", title: "Section Label", type: "string", initialValue: "Brand guidelines" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 2 }),
        defineField({
          name: "rows",
          title: "Guideline Rows",
          type: "array",
          of: [{ type: "csGuidelineRow" }],
          validation: (rule) => rule.min(1),
        }),
      ],
    }),

    defineField({
      name: "reportSection",
      title: "Analytics & Reporting Section",
      type: "object",
      group: "report",
      fields: [
        defineField({ name: "sectionLabel", title: "Section Label", type: "string", initialValue: "Analytics & reporting" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({ name: "reportLabel", title: "Report Card Label", type: "string", description: "e.g. 'Moss & Milk, quarterly report'" }),
        defineField({ name: "dateRange", title: "Date Range", type: "string", description: "e.g. 'Jan – Jun'" }),
        defineField({
          name: "kpis",
          title: "KPIs (4)",
          type: "array",
          of: [
            {
              type: "object",
              name: "csKpi",
              fields: [
                defineField({ name: "value", title: "Value", type: "string" }),
                defineField({ name: "label", title: "Label", type: "string" }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            },
          ],
          validation: (rule) => rule.length(4),
        }),
        defineField({
          name: "monthlyBars",
          title: "Reach-by-Month Bars (6)",
          type: "array",
          of: [
            {
              type: "object",
              name: "csMonthlyBar",
              fields: [
                defineField({ name: "month", title: "Month label", type: "string" }),
                defineField({ name: "heightPercent", title: "Bar height (%)", type: "number", validation: (rule) => rule.min(0).max(100) }),
                defineField({ name: "highlighted", title: "Highlighted (darker green)", type: "boolean", initialValue: false }),
              ],
              preview: { select: { title: "month", subtitle: "heightPercent" } },
            },
          ],
          validation: (rule) => rule.length(6),
        }),
        defineField({
          name: "pillars",
          title: "By-Content-Pillar Bars (4)",
          type: "array",
          of: [
            {
              type: "object",
              name: "csPillar",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "percent", title: "Percent", type: "number", validation: (rule) => rule.min(0).max(100) }),
              ],
              preview: { select: { title: "label", subtitle: "percent" } },
            },
          ],
          validation: (rule) => rule.length(4),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Content Strategy Page" };
    },
  },
});
