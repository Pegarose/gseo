=== SeoSuite Connector ===
Contributors: gmedya
Tags: seo, ai-visibility, content-scoring
Requires at least: 5.8
Tested up to: 6.4
Stable tag: 0.1.0-alpha
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Connects your WordPress site to the SeoSuite GSEO API for CMS-agnostic SEO & AI Visibility scoring.

== Description ==

SeoSuite Connector is the official WordPress integration for the SeoSuite GSEO API. It allows you to score your content for traditional SEO and AI Visibility (LLMs) directly from the WordPress editor.

*Note: This is a Phase 0 developer skeleton and not yet feature-complete.*

== Installation ==

1. Upload the `wp-plugin` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Navigate to the new 'SeoSuite' menu in the admin dashboard.
4. Enter your API Key and Site ID provided by SeoSuite.

== Security & API Keys ==

* **Secure Storage:** SeoSuite stores your API keys as **SHA-256 hashes** combined with a secret pepper.
* **Plain Text Key:** The plain text API key is only displayed to you once upon creation. After that, we only store the hash and a short prefix.
* **Key Revocation:** If our internal secret pepper changes, all existing keys will become invalid and must be regenerated.

== Changelog ==

= 0.1.0-alpha =
* Initial skeleton release.
* Admin settings page added.
* Basic hook structure for save_post.
