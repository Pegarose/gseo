# SeoSuite WordPress Connector Setup

This connector allows you to securely analyze your WordPress pages using the SeoSuite Scoring API.

## Requirements
- WordPress 5.0+
- PHP 7.4+
- A valid SeoSuite API Key

## API Rate Limiting & Scaling Notes
> [!IMPORTANT]
> The SeoSuite API endpoints are currently protected by an **in-memory rate limiter** designed for the MVP / Internal Pilot phase. 

### Current Limits (per hour, per tenant)
- **Score Content:** 120 requests
- **Score URL:** 60 requests
- **NeuronWriter Enrich:** 30 requests

If you exceed these limits during bulk editing, the plugin will gracefully inform you with a "Rate limit exceeded" message.

**Production Scaling:** The current rate limiter uses a Node.js `lru-cache` which resets during serverless cold-starts. Before deploying to high-traffic production environments or multi-region edges, this must be migrated to a centralized store like Redis or Vercel KV.

## Installation

1. Go to the SeoSuite distribution folder (`dist/`) and locate `seosuite-connector.zip`.
2. In your WordPress admin dashboard, navigate to **Plugins > Add New**.
3. Click **Upload Plugin** at the top.
4. Select the `seosuite-connector.zip` file and click **Install Now**.
5. Once installed, click **Activate Plugin**.

## Configuration

1. In the WordPress sidebar, go to **Settings > SeoSuite**.
2. **API Base URL:** Keep this as default unless you are testing locally.
3. **API Key:** Paste your secure API Key. (It will be masked upon save).
4. **Site ID:** Enter your Site ID if your SeoSuite tenant requires it.
5. **Auto-Score on Save:** Check this box if you want the API to automatically evaluate your content every time you click "Update" or "Publish".
6. Click **Save Changes**.
7. Click the **Test Connection** button below the form to verify your API credentials.

## Features

- **Score Column:** A new column appears in "All Posts" and "All Pages" displaying the latest SeoSuite score and score band color.
- **Editor Metabox:** While editing a post, look for the "SeoSuite Analysis" box on the right sidebar to view your Score, Top Issues, and Quick Wins.

## Security Note

Your API key is stored securely in the WordPress database and is **never** exposed to the frontend JavaScript. All requests are proxied through your WordPress server (`wp_remote_post`), ensuring your SeoSuite tenant remains completely isolated.
