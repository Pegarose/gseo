# SeoSuite WordPress User Guide

This guide helps editors, writers, and SEO specialists use the SeoSuite Connector inside the WordPress editor.

## Interpreting the Score Bands

SeoSuite assigns an overall score (0-100) and groups it into a "Score Band". You can see this score as a colored badge in your "All Posts" or "All Pages" list, as well as inside the post editor.

- **🟢 Excellent (90-100):** Ready to publish. The content is semantically rich, technically flawless, and well-structured.
- **🟢 Good (75-89):** Solid content. Minor technical or structural opportunities remain, but it is generally safe to publish.
- **🟡 Needs Improvement (60-74):** Missing crucial signals. Consider adding missing target keywords, headings, or structured data before publishing.
- **🟠 Poor (40-59):** Substantial issues. The page may lack enough text (thin content) or suffer from critical missing tags.
- **🔴 Critical (0-39):** Do not publish. The page has blocking crawler errors (e.g., `noindex`), missing titles, or an empty main content body.

## Using the Editor Metabox

When editing a Post or Page, look for the **SeoSuite Analysis** box on the right sidebar.

### Running a Manual Score
1. Ensure your latest content changes are saved (click "Save Draft").
2. In the SeoSuite Analysis box, click **"Score Now"**.
3. The page will quickly reload, and your new Score, Band, Top Issues, and Quick Wins will be displayed.

### Reading the Analysis
- **Top Issues:** These are the heaviest penalties applied to your score. Focus on these first (e.g., `TITLE_MISSING` or `MAIN_CONTENT_EMPTY`).
- **Quick Wins:** High-impact, low-effort recommendations (e.g., adding an H1, writing a meta description).

### Auto-Score on Save
If enabled by your administrator, clicking the WordPress "Update" or "Publish" button will automatically fetch a new score from SeoSuite in the background.

## Understanding Errors
If the SeoSuite scoring engine becomes temporarily unreachable, you may see an error in the sidebar:
- **Rate limit exceeded. Please wait before scoring again.** 
  - *Cause:* Your site has performed too many scoring requests in a single hour (Current limits: ~120 manual scores per hour).
  - *Action:* Wait a few minutes and try again.
- **SeoSuite API Error: cURL error 28: Operation timed out**
  - *Cause:* The scoring engine took longer than 8 seconds to respond. 
  - *Action:* Don't worry. Your post was successfully saved to WordPress. Simply click "Score Now" again later.

## Understanding AI Visibility Readiness

> **Note:** SeoSuite provides an *AI Visibility Readiness* metric in your full reports. This reflects how well your content is structured for Language Models (like ChatGPT, Perplexity, or Google AI Overviews).

**What it means:**
- It checks for clear `FAQ` blocks, concise headings, outbound source citations, and distinct entity definitions.
- High readiness means LLMs can easily parse and extract your answers.

**What it DOES NOT mean:**
- It is **not a guarantee** that your page will appear in an AI overview. Inclusion relies on external authority, backlinks, and proprietary AI algorithms outside of SeoSuite's control.
