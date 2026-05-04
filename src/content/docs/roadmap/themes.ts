import type { Metadata } from "next";

export const themesRoadmapMetadata: Metadata = {
  title: "Theme Presets | E-Commerce Engine Docs",
  description:
    "Planned pre-built storefront UI starter kits for the e-commerce engine.",
  robots: { index: false },
};

export const themesRoadmapContent = {
  title: "Theme Presets",
  description:
    "Pre-built storefront UI starter kits that give new storefronts a production-ready design out of the box. Each preset includes a complete set of storefront pages, components, and Tailwind theme tokens - ready to customize for a specific brand.",
  proposedArchitecture:
    "Theme presets will be self-contained directories with storefront pages, components, and a globals.css override. Developers will select a preset when creating a new storefront, getting a complete UI that consumes the engine through the standard server module and client helper interfaces. Presets will cover different store types: minimal, fashion, food, electronics.",
} as const;
