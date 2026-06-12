# GSeoSuite Tenant Dashboard Demo Script

This script serves as a step-by-step guide for internally presenting or testing the refined GSeoSuite client/tenant dashboard.

---

## 1. Setup & Environment
Ensure your local development environment has the proper configuration flags set.

### Environment Configuration (`.env`)
```env
DASHBOARD_DEMO_MODE=true
DASHBOARD_MOCK_TENANT_ID=   # Leave blank to fallback to 'gmedya' seed tenant, or provide a specific ID
PORT=3001
```

### Start the Server
Run the local next.js server:
```powershell
npm run dev
```
Open your browser and navigate to: `http://localhost:3001/dashboard`

---

## 2. Walkthrough Steps

### Step 1: Main Dashboard Overview ("Genel Bakış")
**Visual Focus:**
* A clean, modern B2B SaaS sidebar showing **Overview**, **Sites**, **AI Visibility**, and **Settings**.
* A light-gray dashboard background with harmonic shadow borders.

**Narrative:**
* *"Hoş geldiniz. Bu GSeoSuite müşteri ve ajans panelidir. Burası tamamen beyaz etiketli (white-labeled) olup, alt yapıda kullanılan NeuronWriter gibi servislerin detaylarını gizleyerek, müşterinin doğrudan aksiyon alabileceği bir deneyim sunar."*

**Click-Through Actions:**
1. **Riskli Siteler Card:** Point out the count. *"Burada, SEO skoru 60'ın altında olan veya son taramasında kritik hata tespit edilen sitelerimizin toplam sayısını görüyoruz."*
2. **Kritik Hatalar Card:** *"Bu kart, hemen çözülmesi gereken en yüksek aciliyete sahip kritik SEO sorunlarını gösteriyor."*
3. **AI Readiness Düşük Card:** *"Yapay zeka arama motorları için optimize edilmemiş (hazırlık skoru 50'nin altında olan) sayfalarımızın sayısı burada toplanıyor."*
4. **Aylık AI Analiz Kredisi Progress Bar:**
   * Hover over the small **Information Icon (i)** to trigger the tooltip: *"Bu kredi semantic içerik analizi, AI readiness ve provider destekli öneriler için kullanılır."*
   * Point out the progress bar limits. Explain that if the customer usage is close to 80%, the bar turns orange; if it exceeds 100%, it turns red. If no limit is assigned to the package, it displays `"Sınırsız"` or `"Kota tanımlanmadı"` gracefully.

---

### Step 2: Customer Actions

**Visual Focus:**
* The two main action tables on the left column: **Müdahale Bekleyen Siteler** and **Hızlı Kazanımlar**.

**Narrative:**
* *"Dashboard artık pasif bir raporlama alanı değil, kararlar aldıran aktif bir çalışma masasıdır."*

**Click-Through Actions:**
1. **Müdahale Bekleyen Siteler (Sites Needing Attention):**
   * Walk through the list of domains. Explain that clicking **"Detaylar"** navigates directly to the specific site dashboard to see all snapshots.
2. **Hızlı Kazanımlar (Quick Wins):**
   * Highlight the recommendation list. *"Burada, veritabanından süzülen, düzeltilmesi en kolay (Düşük Efor) fakat etkisi yüksek (Orta/Yüksek Etki) olan önerileri görüyoruz. Editörler ve SEO uzmanları işe doğrudan buradan başlayabilirler."*

---

### Step 3: AI Visibility Readiness Page

**Click-Through Actions:**
1. Click **"AI Visibility"** on the sidebar.
2. **Disclaimer Banner:** Highlight the warning block at the top:
   > *"AI Visibility metrics are readiness indicators based on content structure, entity clarity and citation-friendly formatting. They do not guarantee visibility or citations in AI platforms."*
   * Narrative: *"Yapay zeka platformlarında (ChatGPT, Perplexity vb.) kesin sıralama garantisi vermenin gerçekçi olmadığının bilincindeyiz. Bu nedenle, üst kısımdaki banner ile müşterilerimizi bu skorların birer 'hazırlık göstergesi (readiness indicator)' olduğu konusunda şeffafça bilgilendiriyoruz."*
3. **Action Cards:**
   * Point out the four key metric blocks: **Missing Answer Blocks**, **Weak Citation Readiness**, **Entity Clarity Issues**, and **Low AI Readiness Pages**.
4. **Pages Needing AI Readiness Work Table:**
   * Walk through the columns: **URL**, **AI Score**, **Main Weakness**, **Suggested Action**, **Experimental label**, and **Last analyzed**.
   * Highlight the **"Experimental"** badge on each row. Explaining that these metrics are cutting-edge semantic evaluation systems.

---

### Step 4: Settings & White-Labeling Check

**Click-Through Actions:**
1. Click **"Settings"** on the sidebar.
2. Review the **Organization Profile** showing Tenant ID, Plan Type, and Member Date.
3. Review the **API Keys** table. Explain that this is where clients download their WordPress plugin or fetch keys to sync their custom static sites (Next.js/Shopify) with GSeoSuite.
4. **Final Security note:** Point out that all administrative options like Master API keys, billing configurations, and billing tiers are restricted to the **Super Admin Panel** and do not leak here.
