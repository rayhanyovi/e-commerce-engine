import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  settingsMetadata,
  settingsPageContent,
} from "@/content/docs/domains/settings";

export const metadata: Metadata = settingsMetadata;

export default function SettingsPage() {
  return <DocsDomainPage content={settingsPageContent} />;
}
