---
id: query-to-page
version: "1.0"
human_summary: Degerli sorgu-cevap alsverislerini wiki sayfasina donusturme
phases:
  - id: extract
    name: Extract
    skills:
      - query-to-page
      - wiki-management
    requires: []
    outputs:
      type: object
      properties:
        question:
          type: string
        answer_quality:
          type: string
          enum:
            - low
            - medium
            - high
      required:
        - question
        - answer_quality
      additionalProperties: false
  - id: publish
    name: Publish
    skills:
      - query-to-page
      - wiki-management
    requires:
      - extract
    outputs:
      type: object
      properties:
        wiki_path:
          type: string
        published:
          type: boolean
      required:
        - wiki_path
        - published
      additionalProperties: false
---

# 📝 Query-to-Page Workflow

> Değerli sorgu cevaplarını wiki'ye geri kazandırarak bilginin birikmesini (compounding) sağlar.

## 🎯 Amaç

Kullanıcıyla yapılan soru-cevap etkileşimlerinden çıkan **değerli bilgiyi** wiki'ye entegre etmek. Bu sayede bilgi sohbette kaybolmaz, wiki sürekli zenginleşir.

## 📁 Hedef Dizinler

| Dizin | İçerik Türü |
|-------|-------------|
| `wiki/analyses/` | Derinlemesine analizler, değerlendirmeler |
| `wiki/comparisons/` | Karşılaştırmalar (A vs B, teknoloji seçimleri) |
| `wiki/syntheses/` | Birden fazla kaynağı birleştiren sentezler |

---

## 🎯 Filing Kriterleri

> [!IMPORTANT]
> Bir cevap wiki'ye **YALNIZCA** aşağıdaki 5 koşuldan **en az 2'sini** karşılıyorsa kaydedilir.

| # | Koşul | Açıklama |
|---|-------|----------|
| 1 | **Reusable knowledge** | Tekrar kullanılabilir bilgi içeriyor |
| 2 | **Sourced synthesis** | Kaynaklara dayalı sentez sunuyor |
| 3 | **Novel connection** | Wiki'de başka yerde olmayan bir bağlantı kuruyor |
| 4 | **Decision/analysis record** | Gelecekte referans alınacak bir karar veya analiz içeriyor |
| 5 | **New artifact needed** | Mevcut bir sayfayı genişletmek yerine yeni bir artifact gerektiriyor |

> [!WARNING]
> Bu filtre, wiki'nin **sohbet çöplüğüne** dönüşmesini engeller. Basit cevaplar, tek seferlik sorular ve bağlamsız bilgiler wiki'ye **kaydedilmez**.

### Kaydetme Kararı Akış Şeması

```
Cevap oluşturuldu
    │
    ├── Koşul 1: Tekrar kullanılabilir mi? ✅/❌
    ├── Koşul 2: Kaynaklı sentez mi? ✅/❌
    ├── Koşul 3: Yeni bağlantı mı? ✅/❌
    ├── Koşul 4: Karar/analiz kaydı mı? ✅/❌
    └── Koşul 5: Yeni artifact mı? ✅/❌
              │
              ├── ≥ 2 ✅ → Wiki'ye kaydet
              └── < 2 ✅ → Kaydetme, sohbette kalsın
```

---

## 📋 Adımlar

### 1. 🔍 Tespit

Agent, bir cevabın filing kriterlerini karşıladığını tespit eder. Hangi koşulların sağlandığını belirler.

### 2. 💬 Öneri

Agent kullanıcıya filing önerisinde bulunur:

```
💡 Bu cevabı wiki'ye kaydetmemi önerir misiniz?

Karşılanan kriterler:
- ✅ Tekrar kullanılabilir bilgi içeriyor
- ✅ Kaynaklara dayalı sentez sunuyor

Önerilen konum: wiki/syntheses/YYYY-MM-DD-short-title.md
```

### 3. ✅ Onay

Kullanıcı onay verir. Onay olmadan sayfa **oluşturulmaz**.

### 4. 📄 Sayfa Oluşturma

Uygun dizinde sayfa oluşturulur. Frontmatter şablonu:

```yaml
---
title: "Sayfa Başlığı"
type: analysis | comparison | synthesis
source_type: analysis | comparison | synthesis
sources:
  - kaynak-1.md
  - kaynak-2.md
created: YYYY-MM-DD
last_verified: YYYY-MM-DD
lifecycle: active
confidence: high | medium | low
confidence_reason: "Güven seviyesi açıklaması"
filing_criteria:
  - reusable_knowledge
  - sourced_synthesis
origin: query-to-page
---
```

### 5. 📇 INDEX.md ve LOG.md Güncelle

**INDEX.md**'ye yeni sayfa girdisi ekle.

**LOG.md**'ye entry ekle:

```markdown
## [YYYY-MM-DD] query-to-page | sayfa-başlığı

- 📄 Sayfa: wiki/analyses/YYYY-MM-DD-short-title.md
- 🎯 Kriterler: reusable_knowledge, sourced_synthesis
- 🔗 İlişkili sayfalar: N adet
```

### 6. 🔗 Çapraz Referans

Yeni sayfayla ilişkili mevcut sayfalara backlink ekle. İlgili entity, concept ve module sayfalarını güncelle.

---

## 📊 Source Type Referansı

| Tür | Kullanım | Örnek |
|-----|----------|-------|
| `analysis` | Tek bir konunun derinlemesine incelenmesi | "OpenAI Agent SDK mimarisi analizi" |
| `comparison` | İki veya daha fazla alternatifin karşılaştırılması | "LangChain vs CrewAI karşılaştırması" |
| `synthesis` | Birden fazla kaynağın birleştirilmesi | "2026 Q2 AI agent ekosistemi sentezi" |

---

*İlgili workflow'lar: [ingest.md](./ingest.md) · [wiki-lint.md](./wiki-lint.md)*
