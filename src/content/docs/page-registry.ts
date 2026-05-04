import { docsSidebar } from "./sidebar";

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface PageRegistryEntry {
  href: string;
  title: string;
  section: string;
}

export const docsPageRegistry: PageRegistryEntry[] = docsSidebar.flatMap((section) =>
  section.items.map((item) => ({
    href: item.href,
    title: item.title,
    section: section.title,
  })),
);

export function getPageByHref(href: string): PageRegistryEntry | undefined {
  return docsPageRegistry.find((p) => p.href === href);
}

export function getPreviousPage(href: string): PageRegistryEntry | undefined {
  const index = docsPageRegistry.findIndex((p) => p.href === href);
  return index > 0 ? docsPageRegistry[index - 1] : undefined;
}

export function getNextPage(href: string): PageRegistryEntry | undefined {
  const index = docsPageRegistry.findIndex((p) => p.href === href);
  return index >= 0 && index < docsPageRegistry.length - 1
    ? docsPageRegistry[index + 1]
    : undefined;
}

export function getBreadcrumbs(
  href: string,
): { label: string; href?: string }[] {
  const page = getPageByHref(href);
  if (!page) return [{ label: "Docs", href: "/docs" }];

  const crumbs: { label: string; href?: string }[] = [
    { label: "Docs", href: "/docs" },
  ];

  if (page.section !== "Getting Started" || href !== "/docs") {
    crumbs.push({ label: page.section });
  }

  if (href !== "/docs") {
    crumbs.push({ label: page.title });
  }

  return crumbs;
}
