import { DocsCodeBlock } from "./docs-code-block";
import { DocsFlowDiagram } from "./docs-flow-diagram";
import { DocsPageHeader } from "./docs-page-header";
import { DocsPreviousNext } from "./docs-previous-next";
import { DocsRouteTable } from "./docs-route-table";
import { DocsSection } from "./docs-section";
import type {
  DomainDocPageContent,
  DomainDocSectionBlock,
} from "@/content/docs/domains/shared";

function renderBlock(block: DomainDocSectionBlock) {
  switch (block.type) {
    case "paragraphs":
      return block.items.map((item, index) => (
        <p key={index} className="text-sm leading-7 text-muted">
          {item}
        </p>
      ));
    case "bullets":
      return (
        <ul className="list-inside list-disc space-y-2 text-sm leading-7 text-muted">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case "flow":
      return <DocsFlowDiagram title={block.title} diagram={block.diagram} />;
    case "routes":
      return <DocsRouteTable endpoints={block.endpoints} />;
    case "codeBlocks":
      return block.items.map((item) => (
        <DocsCodeBlock
          key={item.title}
          title={item.title}
          language={item.language}
          code={item.code}
        />
      ));
  }
}

export function DocsDomainPage({ content }: { content: DomainDocPageContent }) {
  return (
    <>
      <DocsPageHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        status={content.status}
      />

      {content.sections.map((section) => (
        <DocsSection key={section.id} id={section.id} title={section.title}>
          {section.blocks.map((block, index) => (
            <div key={index}>{renderBlock(block)}</div>
          ))}
        </DocsSection>
      ))}

      <DocsPreviousNext currentHref={content.currentHref} />
    </>
  );
}
