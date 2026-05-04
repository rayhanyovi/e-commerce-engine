import type { Metadata } from "next";

import { codeExamples, hooks } from "./reference-data";

export const hooksMetadata: Metadata = {
  title: "Hooks | E-Commerce Engine Docs",
  description:
    "Thin client hooks for hydrated cart and session state, built on top of the engine's same-origin client helpers.",
};

export const hooksPageContent = {
  eyebrow: "Engine Internals",
  title: "Hooks",
  description:
    "Hooks are used sparingly for hydrated UI state. They wrap client helpers instead of duplicating server logic.",
  overview:
    "The engine keeps hooks small on purpose. Most business flows remain server-first, so hooks are only used where client-side interactivity is genuinely necessary after hydration, such as cart mutations and session awareness in interactive shells.",
  hooks,
  example:
    codeExamples.find((example) => example.title === "Client-side cart hook") ??
    codeExamples[0],
} as const;
