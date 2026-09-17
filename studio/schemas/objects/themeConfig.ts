import { defineType, defineField } from "sanity";

export default defineType({
  name: "themeConfig",
  title: "Theme Configuration",
  type: "object",
  fields: [
    defineField({
      name: "themePreset",
      title: "Theme Preset",
      type: "string",
      description: "Choose a curated theme — individual colors below override the preset",
      initialValue: "warm-neutral",
      options: {
        list: [
          { title: "Warm Neutral — cream bg, brown text, tan accent", value: "warm-neutral" },
          { title: "Dark Moody — near-black bg, light text, gold accent", value: "dark-moody" },
          { title: "Light Airy — white bg, gray text, blue accent", value: "light-airy" },
          { title: "Earth Tones — warm ivory bg, deep brown text, sage accent", value: "earth-tones" },
          { title: "Monochrome — light gray bg, near-black text, gray accent", value: "monochrome" },
        ],
      },
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "color",
      description: "Leave blank to use the preset color",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "textColor",
      title: "Text Color",
      type: "color",
      description: "Leave blank to use the preset color",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "accentColor",
      title: "Accent Color",
      type: "color",
      description: "Leave blank to use the preset color",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "fontPairing",
      title: "Font Pairing",
      type: "string",
      description: "Leave blank to use the preset font",
      options: {
        list: [
          { title: "Default (Inter)", value: "default" },
          { title: "Classic Serif — Cormorant Garamond + Inter", value: "classic-serif" },
          { title: "Bold Modern — League Spartan + Montserrat", value: "bold-modern" },
          { title: "Editorial — Playfair Display + Source Sans 3", value: "editorial" },
          { title: "Minimal — DM Serif Display + DM Sans", value: "minimal" },
          { title: "Refined Luxury — Lora + Raleway", value: "refined-luxury" },
          { title: "Classic Editorial — Libre Baskerville + Karla", value: "classic-editorial" },
          { title: "High Fashion — Bodoni Moda + Work Sans", value: "high-fashion" },
          { title: "Contemporary — Syne + Space Grotesk", value: "contemporary" },
          { title: "Modern Soft — Fraunces + Outfit", value: "modern-soft" },
          { title: "Timeless — EB Garamond + Tenor Sans", value: "timeless" },
          { title: "Warm Swiss — Newsreader + Jost", value: "warm-swiss" },
        ],
      },
    }),
  ],
});
