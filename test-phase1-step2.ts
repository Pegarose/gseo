import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api/v1';

async function request(endpoint: string, method = 'GET', body?: any, token?: string) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

async function runTests() {
  console.log('--- Phase 1 Step 2 Scoring Logic Tests ---');

  // Generate a valid API Key
  const rawKey = `gseo_test_${crypto.randomBytes(24).toString('hex')}`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
  const tenant = await prisma.tenant.create({ data: { id: 'tenant_step2_' + Date.now(), name: 'T2', slug: 't2-' + Date.now(), plan: 'free' } });
  await prisma.apiKey.create({ data: { tenantId: tenant.id, name: 'K2', keyPrefix: rawKey.substring(0, 12), keyHash: hashedKey, scopes: ['score:write', 'score:read', 'site:write'] } });
  const siteRes = await request('/sites', 'POST', { name: 'Step 2 Site', baseUrl: 'https://testsite.com' }, rawKey);
  const siteId = siteRes.data.siteId;

  console.log('\n[1] Scenario: Healthy HTML (Expected: Good score, no critical issues)');
  const healthyHtml = `
    <html>
      <head>
        <title>The Ultimate Guide to SeoSuite Setup in 2026</title>
        <meta name="description" content="This is a comprehensive and perfectly sized meta description that easily satisfies the length requirements for SEO metadata checks." />
        <link rel="canonical" href="https://testsite.com/guide" />
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": ["Article", "BreadcrumbList"]
          }
        </script>
      </head>
      <body>
        <h1>Ultimate Guide to SeoSuite</h1>
        <p>This is the first paragraph introducing the Ultimate Guide. It has enough text to be considered a valid introduction.</p>
        <h2>Section 1</h2>
        <p>This is a healthy paragraph with lots of words to pass the thin content checks. ${'word '.repeat(350)}</p>
        <ul>
          <li>Point 1</li>
          <li>Point 2</li>
        </ul>
        <a href="/internal-link">Read our internal guide</a>
        <a href="https://testsite.com/another">Another internal link</a>
      </body>
    </html>
  `;
  const res1 = await request('/score/content', 'POST', { siteId, url: 'https://testsite.com/guide', html: healthyHtml }, rawKey);
  if (!res1.success) console.error('Error:', res1);
  console.log('Final Score:', res1.data?.finalScore);
  console.log('Top Issues:', res1.data?.topIssues.map((i: any) => i.code));

  console.log('\n[2] Scenario: Missing Metadata + Thin Content');
  const thinHtml = `
    <html>
      <body>
        <p>Hi.</p>
        <a href="https://external.com">click here</a>
      </body>
    </html>
  `;
  const res2 = await request('/score/content', 'POST', { siteId, url: 'https://testsite.com/thin', html: thinHtml, pageType: 'article' }, rawKey);
  if (!res2.success) console.error('Error:', res2);
  console.log('Final Score:', res2.data?.finalScore);
  console.log('Top Issues:', res2.data?.topIssues.map((i: any) => i.code));

  console.log('\n[3] Scenario: Cap Rule Triggered (NOINDEX)');
  const capHtml = `
    <html>
      <head>
        <title>Secret Page for the Ultimate Guide to SeoSuite Setup</title>
        <meta name="description" content="This is a comprehensive and perfectly sized meta description that easily satisfies the length requirements for SEO metadata checks." />
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <h1>Secret Page</h1>
        <p>This page is perfectly healthy but has a noindex tag. ${'word '.repeat(300)}</p>
      </body>
    </html>
  `;
  const res3 = await request('/score/content', 'POST', { siteId, url: 'https://testsite.com/secret', html: capHtml }, rawKey);
  if (!res3.success) console.error('Error:', res3);
  console.log('Final Score:', res3.data?.finalScore);
  console.log('Top Issues:', res3.data?.topIssues.map((i: any) => i.code));

  console.log('\n[4] Scenario: FAQPage Check (No penalty, only info)');
  const faqHtml = healthyHtml; // healthyHtml does NOT have FAQPage
  const res4 = await request('/score/content', 'POST', { siteId, url: 'https://testsite.com/faq-test', html: faqHtml }, rawKey);
  const faqIssue = res4.data?.topIssues.find((i: any) => i.code === 'FAQ_SCHEMA_MISSING' || i.code === 'ANSWER_BLOCK_OPPORTUNITY');
  console.log('FAQ Related Issue:', faqIssue?.code || 'None');

  console.log('\n[5] Scenario: PageSpeed Default Behavior (Disabled)');
  const psIssue = res1.data?.topIssues.find((i: any) => i.code === 'PAGESPEED_SKIPPED' || i.code === 'PAGESPEED_PROVIDER_FAILED');
  console.log('PageSpeed Issue:', psIssue?.code, '->', psIssue?.title);

  console.log('\nDone.');
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
