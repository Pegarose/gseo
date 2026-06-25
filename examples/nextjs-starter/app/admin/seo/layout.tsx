import { loadSeoSuiteConfig, serializeAdminConfig } from '@seosuite/next';
import { SeoAdminLayout } from '@seosuite/next/admin';
import '../../../seosuite.config';
import '../../../lib/seo-settings';
import { SEO_PERSIST_LABEL, SEO_SETTINGS_API } from '../../../lib/seo-settings';
import StarterDemoBanner from './StarterDemoBanner';

export default async function SeoAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = serializeAdminConfig(await loadSeoSuiteConfig());

  return (
    <SeoAdminLayout
      config={config}
      saveUrl={SEO_SETTINGS_API}
      persistLabel={SEO_PERSIST_LABEL}
    >
      <StarterDemoBanner />
      {children}
    </SeoAdminLayout>
  );
}
