import { createSitemapRoute } from "@seosuite/next";
import "../seosuite.config";
import "../lib/seo-settings";

const sitemap = createSitemapRoute({
  entries: [
    { url: "https://gseosuite.com/", changeFrequency: "weekly", priority: 1.0 },
    { url: "https://gseosuite.com/blog/hello-world", changeFrequency: "monthly", priority: 0.8 },
  ],
});

export default sitemap;
