// --- Color utilities ---

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!match) return null;
  const num = parseInt(match[1], 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.round(Math.max(0, Math.min(255, c)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r * (1 - amount),
    rgb.g * (1 - amount),
    rgb.b * (1 - amount)
  );
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount
  );
}

/** Mix two hex colors by a 0-1 amount (0 = hex1, 1 = hex2) */
function mixColors(hex1: string, hex2: string, amount: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return hex1;
  return rgbToHex(
    c1.r + (c2.r - c1.r) * amount,
    c1.g + (c2.g - c1.g) * amount,
    c1.b + (c2.b - c1.b) * amount
  );
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

// --- Font pairings ---

export const fontPairings = {
  "classic-serif": {
    label: "Classic Serif",
    sans: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  },
  "bold-modern": {
    label: "Bold Modern",
    sans: 'var(--font-montserrat), ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-league-spartan), "League Spartan", ui-sans-serif, system-ui, sans-serif',
  },
  editorial: {
    label: "Editorial",
    sans: 'var(--font-source-sans), "Source Sans 3", ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-playfair), "Playfair Display", Georgia, serif',
  },
  minimal: {
    label: "Minimal",
    sans: 'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-dm-serif), "DM Serif Display", Georgia, serif',
  },
  "refined-luxury": {
    label: "Refined Luxury",
    sans: 'var(--font-raleway), Raleway, ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-lora), Lora, Georgia, serif',
  },
  "classic-editorial": {
    label: "Classic Editorial",
    sans: 'var(--font-karla), Karla, ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-libre-baskerville), "Libre Baskerville", Georgia, serif',
  },
  "high-fashion": {
    label: "High Fashion",
    sans: 'var(--font-work-sans), "Work Sans", ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-bodoni-moda), "Bodoni Moda", "Didot", Georgia, serif',
  },
  contemporary: {
    label: "Contemporary",
    sans: 'var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-syne), Syne, ui-sans-serif, system-ui, sans-serif',
  },
  "modern-soft": {
    label: "Modern Soft",
    sans: 'var(--font-outfit), Outfit, ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-fraunces), Fraunces, Georgia, serif',
  },
  timeless: {
    label: "Timeless",
    sans: 'var(--font-tenor-sans), "Tenor Sans", ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-eb-garamond), "EB Garamond", Georgia, serif',
  },
  "warm-swiss": {
    label: "Warm Swiss",
    sans: 'var(--font-jost), Jost, ui-sans-serif, system-ui, sans-serif',
    display: 'var(--font-newsreader), Newsreader, Georgia, serif',
  },
} as const;

export type FontPairingId = keyof typeof fontPairings;

// --- Theme presets ---

export const themePresets: Record<string, {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontPairing: FontPairingId;
}> = {
  "warm-neutral": {
    backgroundColor: "#FAF8F5",
    textColor: "#2D2A26",
    accentColor: "#B8956C",
    fontPairing: "contemporary",
  },
  "dark-moody": {
    backgroundColor: "#1A1A1A",
    textColor: "#E8E4DF",
    accentColor: "#D4A96A",
    fontPairing: "editorial",
  },
  "light-airy": {
    backgroundColor: "#FAFBFC",
    textColor: "#5A5A5A",
    accentColor: "#7FA8B8",
    fontPairing: "minimal",
  },
  "earth-tones": {
    backgroundColor: "#F5F0E8",
    textColor: "#2C1E10",
    accentColor: "#7D8C6E",
    fontPairing: "classic-serif",
  },
  monochrome: {
    backgroundColor: "#F0F0F0",
    textColor: "#1A1A1A",
    accentColor: "#808080",
    fontPairing: "bold-modern",
  },
};

// --- Theme style builder ---

export function buildThemeStyles(
  bgColor?: string | null,
  textColor?: string | null,
  accentColor?: string | null,
  fontPairing?: string | null,
  themePreset?: string | null
): Record<string, string> {
  const styles: Record<string, string> = {};

  // Resolve values: explicit overrides take precedence over preset defaults
  const preset = themePreset && themePresets[themePreset] ? themePresets[themePreset] : null;

  const resolvedBg = (bgColor && isValidHex(bgColor)) ? bgColor : preset?.backgroundColor ?? null;
  const resolvedText = (textColor && isValidHex(textColor)) ? textColor : preset?.textColor ?? null;
  const resolvedAccent = (accentColor && isValidHex(accentColor)) ? accentColor : preset?.accentColor ?? null;
  const resolvedFont = fontPairing ?? preset?.fontPairing ?? null;

  const hasBg = !!resolvedBg;
  const hasText = !!resolvedText;

  if (hasBg) {
    styles["--color-cream"] = resolvedBg;
    if (hasText) {
      styles["--color-cream-dark"] = mixColors(resolvedBg, resolvedText, 0.06);
      styles["--color-cream-darker"] = mixColors(resolvedBg, resolvedText, 0.12);
    } else {
      styles["--color-cream-dark"] = darken(resolvedBg, 0.04);
      styles["--color-cream-darker"] = darken(resolvedBg, 0.09);
    }
  }

  if (hasText) {
    styles["--color-warm-gray"] = resolvedText;
    if (hasBg) {
      styles["--color-warm-gray-light"] = mixColors(resolvedText, resolvedBg, 0.25);
      styles["--color-warm-gray-lighter"] = mixColors(resolvedText, resolvedBg, 0.50);
    } else {
      styles["--color-warm-gray-light"] = lighten(resolvedText, 0.22);
      styles["--color-warm-gray-lighter"] = lighten(resolvedText, 0.44);
    }
  }

  if (resolvedAccent) {
    styles["--color-accent"] = resolvedAccent;
    styles["--color-accent-dark"] = darken(resolvedAccent, 0.16);
    styles["--color-accent-light"] = lighten(resolvedAccent, 0.35);
  }

  if (resolvedFont && resolvedFont in fontPairings) {
    const pairing = fontPairings[resolvedFont as FontPairingId];
    styles["--font-sans"] = pairing.sans;
    styles["--font-display"] = pairing.display;
  }

  return styles;
}
