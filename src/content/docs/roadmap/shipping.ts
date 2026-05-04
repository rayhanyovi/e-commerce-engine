import type { Metadata } from "next";

export const shippingRoadmapMetadata: Metadata = {
  title: "Shipping Adapters | E-Commerce Engine Docs",
  description:
    "Planned pluggable shipping provider interface for the e-commerce engine.",
  robots: { index: false },
};

export const shippingRoadmapContent = {
  title: "Shipping Adapters",
  description:
    "A pluggable shipping provider interface that goes beyond the current internal flat rate. This will allow storefronts to integrate with real shipping carriers and calculate live rates, tracking numbers, and estimated delivery windows.",
  proposedArchitecture:
    "The shipping adapter will define a provider interface with methods for rate calculation, label generation, and tracking lookup. The engine will ship with the existing internal flat rate as the default adapter, and new providers (JNE, SiCepat, GoSend, or international carriers) can be registered through the store configuration. The checkout service will call the active shipping adapter instead of using hardcoded flat rate values.",
} as const;
