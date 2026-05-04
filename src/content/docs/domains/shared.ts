import type { ReactNode } from "react";

export interface DomainDocRouteEntry {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  access: "Public" | "Customer" | "Admin";
}

export interface DomainDocCodeBlock {
  title: string;
  language: string;
  code: string;
}

export type DomainDocSectionBlock =
  | {
      type: "paragraphs";
      items: ReactNode[];
    }
  | {
      type: "bullets";
      items: ReactNode[];
    }
  | {
      type: "flow";
      title: string;
      diagram: string;
    }
  | {
      type: "routes";
      endpoints: DomainDocRouteEntry[];
    }
  | {
      type: "codeBlocks";
      items: DomainDocCodeBlock[];
    };

export interface DomainDocSection {
  id: string;
  title: string;
  blocks: DomainDocSectionBlock[];
}

export interface DomainDocPageContent {
  eyebrow: string;
  title: string;
  description: string;
  status: "stable" | "experimental" | "coming-soon";
  currentHref: string;
  sections: DomainDocSection[];
}
