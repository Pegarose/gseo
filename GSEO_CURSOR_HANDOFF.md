# GSeoSuite - Cursor Development Handoff & Project Guide

Bu doküman, GSeoSuite projesinin mevcut durumunu, son geliştirmeleri, mimari yapısını ve bundan sonra Cursor kullanarak projeyi nasıl geliştirebileceğinizi özetleyen **el sıkışma (handoff)** rehberidir.

---

## 🚀 Son Durum ve Tamamlanan Sürüm (v1.0-Beta Hardening)
Son sprint kapsamında GSeoSuite projesini beta sürümüne hazırlayan ve sistem güvenliği ile kaynak yönetimini otomatikleştiren kritik özellikleri tamamladık:

1.  **Resmi NeuronWriter API (v0.5) Entegrasyonu:**
    *   Eski tek adımlı mockup çağrı yerine resmi NeuronWriter API standartları ([neuronwriter.ts](file:///c:/bc-proje/GSeoSuite/src/lib/providers/neuronwriter.ts)) entegre edildi.
    *   Önce projeleri listeleme (`/list-projects`), ardından anahtar kelime sorgulama (`/list-queries`), yoksa yeni analiz kuyruğu başlatma (`/new-query`) ve analiz hazır olduğunda sonuçları çekme (`/get-query`) asenkron akışı kuruldu.
    *   Resmi API yanıtından **Hedef Kelime Sayısı** (`targetWordCount`) ve **Okunabilirlik Limiti** (`targetReadability`) çekilip veritabanına ve API çıktılarına eklendi.
2.  **Akıllı Kota & AI Kredisi Yönetimi:**
    *   Tüm tarama istekleri (`score/url` ve `score/content`) öncesinde kiracının AI kredisi kalıp kalmadığı kontrol edilmektedir. Kredisi biten istekler `429` / `403` ile engellenir.
    *   Başarılı her analizde `Tenant.aiCreditUsed` sayacı veritabanında atomik olarak artırılmaktadır.
3.  **Güvenlik Sıkılaştırması (Beta Hardening):**
    *   Production modunda (`process.env.NODE_ENV === 'production'`) geliştirici test token'ı olan `gseo_admin_secret_token` tamamen devre dışı bırakıldı. Canlı ortamda `SUPER_ADMIN_TOKEN` çevre değişkeninin tanımlanması zorunlu hale getirildi.
4.  **Sayaç Senkronizasyonu & Cron Altyapısı:**
    *   Super Admin Tenant Detay sayfasına yerel [TenantCreditSync](file:///c:/bc-proje/GSeoSuite/src/app/super-admin/tenants/[id]/TenantCreditSync.tsx) eşitleme kartı eklendi.
    *   Tüm kiracıların aylık kredi sayaçlarını `QuotaUsage` loglarına göre sıfırlayan/düzenleyen [sync-quotas.ts](file:///c:/bc-proje/GSeoSuite/scripts/sync-quotas.ts) scripti kodlandı.

---

## 🛠️ Mimari Yapı ve Dizin Haritası

Projeyi Cursor ile geliştirirken takip edeceğiniz kritik dosya yolları:

```text
/
├── prisma/
│   ├── schema.prisma         # Veritabanı modeli (Tenant, Site, ApiKey, QuotaUsage, Snapshot)
│   └── seed.ts               # Demo tenant/API key tohumlama scripti
├── src/
│   ├── app/
│   │   ├── api/v1/           # REST API Uçları (Auth, Quota, Sites, Score, NW Enrich)
│   │   ├── dashboard/        # Kiracı (Müşteri) SaaS Paneli
│   │   └── super-admin/      # GMedya Sistem Yöneticisi Paneli
│   ├── lib/
│   │   ├── auth/             # API Key yetkilendirme ve Quota Kontrol (quota.ts)
│   │   ├── scoring/          # Scoring Engine v1.2 (7 adet bağımsız analiz modülü)
│   │   └── providers/        # Dış sağlayıcı adaptörleri (NeuronWriter, PageSpeed)
│   └── components/           # UI Bileşenleri
├── scripts/
│   ├── sync-quotas.ts        # Kredi eşitleme cron scripti
│   └── dogfood.ts            # E2E test turları için 14 URL skorlama aracı
├── packages/
│   └── wp-plugin/            # WordPress Connector Eklentisi (Settings, Metabox, Auto-Score)
```

---

## 💡 Gelecek Ürün Vizyonu: Next.js Freemium SDK & RankMath Modeli
Cursor ile geliştirmeye devam ederken odaklanabileceğiniz yeni ürün vizyonu:

### Hedef: `@gseo/nextjs` Freemium NPM Paketi
Next.js geliştiricilerinin projelerine kurup SEO ayarlarını sıfırdan yapmalarını engelleyen bir tak-çalıştır eklenti mimarisi.

1.  **Ücretsiz Katman (NPM SDK - Tamamen Local):**
    *   NPM paketi, kurulan Next.js projesinin yapısını tarayarak otomatik `/sitemap.xml` ve `/robots.txt` üretmeli.
    *   Geliştiricilerin sayfaya yerel olarak dinamik `<title>`, `canonical` ve JSON-LD şemaları basmasını sağlayan hazır React Context / Layout bileşenleri sunulmalı.
    *   Yönlendirmeler (Redirects) yerel bir `redirects.json` dosyasından okunup Next.js middleware katmanında kod yazılmadan çalıştırılmalı.
2.  **Ücretli Katman (Cloud SaaS):**
    *   GSeoSuite Cloud API'ye bağlanıp NeuronWriter semantik önerilerini editör paneline taşımalı.
    *   ChatGPT, Perplexity ve Google AI Overviews görünürlük puanlamalarını admin paneline yansıtmalı.
    *   Dahili link fırsatlarını (internal linking) arka planda crawler ile tarayıp Next.js editörüne fırlatmalı.

---

## 💻 Geliştirici Kılavuzu (Cheat-Sheet)

Cursor üzerinde terminal komutları çalıştırmak veya hata ayıklamak istediğinizde bu komutları kullanabilirsiniz:

### 1. Projeyi Çalıştırma
*   **Geliştirme Sunucusu (GSeoSuite Port 3001):**
    ```bash
    npm run dev
    ```
*   **Production Derleme Testi:**
    ```bash
    npm run build
    ```

### 2. Veritabanı ve Prisma İşlemleri
*   **Şemayı DB'ye Gönderme (Docker Postgres 5432 aktifken):**
    ```bash
    npx prisma db push
    ```
*   **Tohumlama (Seeding):**
    ```bash
    npx prisma db seed
    ```
*   **Sayaç Eşitleme Scriptini Manuel Çalıştırma:**
    ```bash
    npx tsx scripts/sync-quotas.ts
    ```

### 3. Testler ve Doğrulama
*   **TypeScript Hata Denetimi:**
    ```bash
    npx tsc --noEmit
    ```
*   **E2E API ve NeuronWriter Mock Test Senaryosu:**
    ```bash
    npx tsx test-phase1-step34.ts
    ```

---

## 🔒 Önemli Çevre Değişkenleri (.env)
Geliştirme yaparken yerel makinenizde aşağıdaki `.env` değişkenlerinin varlığından emin olun:

```env
DATABASE_URL="postgresql://seosuite_user:seosuite_password@localhost:5432/seosuite_db?schema=public"
SUPER_ADMIN_TOKEN="gseo_admin_secret_token" # Local test için fallback
DASHBOARD_MOCK_TENANT_ID="gmedya" # Demo modunda dashboard'un otomatik bağlanacağı organizasyon
NEURONWRITER_API_KEY="local_test_neuronwriter_fallback_key" # Mock test verisi tetikleyen anahtar
```

Artık Cursor üzerinde geliştirmeye hazırsınız. Kolay gelsin!
