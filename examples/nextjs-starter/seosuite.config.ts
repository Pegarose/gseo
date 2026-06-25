import { defineSeoSuiteConfig } from '@seosuite/next';

export default defineSeoSuiteConfig({
  siteUrl: 'https://gseosuite.com',
  siteName: 'GSeoSuite',
  defaultLocale: 'en-US',
  defaultTitle: 'GSeoSuite — SEO for Next.js and WordPress',
  defaultDescription: 'All-in-one SEO toolkit for modern sites.',
  separator: '|',
  titleTemplate: '%title% %sep% %sitename%',
  titleTemplates: {
    homepage: '%sitename%',
    article: '%title% — %sitename%',
    page: '%title% %sep% %sitename%',
  },
  descriptionTemplates: {
    article: 'Read %title% on %sitename%. %excerpt%',
  },
  homepage: {
    title: '%sitename% — %page%',
    description: '%sitename% — %excerpt%',
  },
  openGraph: {
    type: 'website',
    siteName: 'GSeoSuite',
    images: [
      {
        url: 'https://gseosuite.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GSeoSuite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gseosuite',
  },
  schema: {
    organization: {
      name: 'GSeoSuite',
      url: 'https://gseosuite.com',
      logo: 'https://gseosuite.com/logo.png',
      sameAs: [
        'https://twitter.com/gseosuite',
        'https://linkedin.com/company/gseosuite',
      ],
    },
  },
  redirects: 'redirects.json',
});
