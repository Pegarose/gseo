# Phase 2 Score Calibration Report

Based on the `scripts/dogfood.ts` run against 6 live URLs, we performed a manual calibration pass to interpret the scoring output and identify necessary adjustments.

## 1. `https://example.com`

- **Beklenen kalite yorumu:** Zayıf. Sadece bilgilendirme amaçlı tek cümlelik bir HTML sayfası. SEO değeri yok.
- **SeoSuite skor yorumu:** 56 (poor). Tespit edilen sorunlar: `MAIN_CONTENT_EMPTY`, `THIN_CONTENT_RISK`, `CANONICAL_MISSING`. AI Visibility skorları doğal olarak düşük (40-65).
- **False positive var mı?:** Hayır.
- **False negative var mı?:** Hayır. Beklendiği gibi ciddi oranda cezalandırıldı.
- **Hangi scoring rule ayarlanmalı?:** -
- **Aksiyon:** `no change`

## 2. `https://vercel.com/docs`

- **Beklenen kalite yorumu:** Mükemmel. İyi yapılandırılmış, modern bir dokümantasyon sayfası.
- **SeoSuite skor yorumu:** 89 (good). Tespit edilen başlıca sorun: `HTML_SIZE_LARGE` (739 KB payload). Ayrıca sidebar'daki kompleks menü yapısı nedeniyle DOM boyutu büyük.
- **False positive var mı?:** Evet. Dokümantasyon sayfaları veya zengin CSR app'ler için 500 KB limit çok agresif olabilir. 
- **False negative var mı?:** Hayır.
- **Hangi scoring rule ayarlanmalı?:** `HTML_SIZE_LARGE` eşiği (threshold).
- **Aksiyon:** `adjust threshold`. 500 KB sınırı modern React/Next.js projeleri (özellikle hydrate olan dokümantasyon siteleri) için `800 KB`'a esnetilebilir veya `add pageType-specific logic` uygulanabilir.

## 3. `https://react.dev`

- **Beklenen kalite yorumu:** Mükemmel. Semantic HTML5 ve yüksek performanslı modern SPA.
- **SeoSuite skor yorumu:** 91 (excellent). Ancak `MULTIPLE_H1` hatası aldı.
- **False positive var mı?:** Kısmen. HTML5 yapılarında (örneğin `<article>` veya `<section>` içlerinde) birden fazla H1 kullanımı W3C standartlarına uygun olsa da geleneksel SEO araçları bunu sorun olarak işaretler.
- **False negative var mı?:** Hayır.
- **Hangi scoring rule ayarlanmalı?:** `MULTIPLE_H1` (Technical SEO Metadata module).
- **Aksiyon:** `lower severity`. `medium` olan severity, bilgi amaçlı `low` veya `info` seviyesine çekilebilir. Ayrıca short landing/product sayfalarında tek `H1` zorunlu tutulurken, blog veya docs gibi sayfa tiplerinde bu kural hafifletilebilir.

---

## Genel Çıkarımlar

- **AI Visibility Readiness:** Başarılı çalışıyor. Hiçbir URL için ana SEO skorunu (`finalScore`) manipüle etmiyor, sadece `experimental/info` tavsiyesi olarak kalıyor. İleride AI cevap blokları eklenmesi noktasında net rehberlik sunuyor.
- **CSR / Headless Riskleri:** React.dev ve Vercel/docs gibi siteler hydrate olsalar dahi ilk SSR payload'ları çok zengin olduğu için `JS_RENDER_RISK` hatası fırlatmadılar. Ancak tamamen boş bir `<div id="root">` dönen sitelerde (CSR only) bu kural aşırı cap'e yol açabilir. 
- **Short Landing/Product Pages:** GMedya ve EfesusStone (94, 92) mükemmel skorlar aldı. Ürün/landing sayfaları gereksiz kelime sayısı zorlamasına girmedi, sadece eksik Schema ve Open Graph uyarıları verdiler ki bu beklenen ve doğru bir davranıştır.
