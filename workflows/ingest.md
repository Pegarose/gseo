---
id: ingest
version: "1.0"
human_summary: Yeni kaynak dokumani wiki pipelineina entegre etme
phases:
  - id: parse
    name: Parse
    skills:
      - ingest
      - wiki-management
    requires: []
    outputs:
      type: object
      properties:
        source:
          type: string
        sections_extracted:
          type: number
      required:
        - source
        - sections_extracted
      additionalProperties: false
  - id: integrate
    name: Integrate
    skills:
      - ingest
      - wiki-management
    requires:
      - parse
    outputs:
      type: object
      properties:
        wiki_page:
          type: string
        links_added:
          type: number
      required:
        - wiki_page
        - links_added
      additionalProperties: false
---

# 📥 Ingest Workflow

> Yeni kaynak belgesini wiki'ye entegre eden pipeline. Tek bir kaynak 10-15 sayfayı etkileyebilir.

## 🎯 Amaç

Bir kaynak belgesini okuyup, bilgiyi wiki genelinde ilgili tüm sayfalara yaymak. Bu süreç sadece bir özet oluşturmak değil — **tüm bilgi ağını güncellemektir**.

## ⚡ Tetikleyici

- `sources/` dizinine yeni bir kaynak eklenmesi
- Kullanıcının ingest komutu vermesi

## 📋 Adımlar

### 1. 📖 Kaynağı Tam Oku

Kaynak belgesini baştan sona oku. Formatı ne olursa olsun (`.md`, `.pdf`, `.txt`, `.png`, `.jpg`) tüm içeriği anla.

### 2. 💬 Kullanıcıyla Tartış

Anahtar çıkarımları kullanıcıyla tartış:
- Hangi noktalar vurgulanmalı?
- Bağlam nedir? (Neden bu kaynak önemli?)
- Hangi wiki alanlarını etkilemeli?
- Öncelik ve aciliyet seviyesi nedir?

### 3. 📄 Özet Sayfası Oluştur

`wiki/summaries/` dizininde özet sayfası oluştur:

```
wiki/summaries/YYYY-MM-DD-short-title.md
```

Özet sayfası frontmatter şablonu:

```yaml
---
title: "Kaynak Başlığı"
type: summary
sources:
  - YYYY-MM-DD-source-type-short-title.md
created: YYYY-MM-DD
last_verified: YYYY-MM-DD
lifecycle: active
confidence: high | medium | low
confidence_reason: "Neden bu güven seviyesi?"
---
```

### 4. 🌊 Ripple Effect — İlgili Sayfaları Güncelle

> [!IMPORTANT]
> Tek bir kaynak wiki genelinde **10-15 sayfayı** etkileyebilir. Tüm ilgili entity, concept ve module sayfalarını kontrol et ve güncelle.

Güncellenmesi gereken sayfa türleri:
- **Entity sayfaları**: Kaynakta geçen kişiler, şirketler, ürünler
- **Concept sayfaları**: Kaynakta tartışılan kavramlar, metodolojiler
- **Module sayfaları**: Etkilenen proje modülleri
- **Comparison sayfaları**: Güncellenen karşılaştırmalar
- **Synthesis sayfaları**: Yeni bilgiyle zenginleşen sentezler

Her güncellenen sayfada:
- İlgili bölümü yeni bilgiyle güncelle
- `sources:` frontmatter'ına yeni kaynağı ekle
- `last_verified:` tarihini güncelle
- Gerekirse `confidence` seviyesini revize et

### 5. 📇 INDEX.md Güncelle

`wiki/INDEX.md` dosyasına yeni sayfa girdilerini ekle:
- Yeni oluşturulan özet sayfası
- Ripple effect ile yeni oluşturulan sayfalar (varsa)

### 6. 📋 LOG.md'ye Kayıt Ekle

`wiki/LOG.md` dosyasına entry ekle:

```markdown
## [YYYY-MM-DD] ingest | kaynak-dosya-adı

- 📄 Özet: wiki/summaries/YYYY-MM-DD-short-title.md
- 🌊 Güncellenen sayfalar: N adet
  - wiki/entities/example-entity.md
  - wiki/concepts/example-concept.md
  - ...
- ⚠️ Contradiction: var/yok
```

### 7. 🔗 Çapraz Referans Kontrolü

Yeni bilginin mevcut sayfalarla **çelişip çelişmediğini** kontrol et:
- Tarihler tutarlı mı?
- Rakamlar/istatistikler uyumlu mu?
- Görüşler/pozisyonlar değişmiş mi?
- Terminoloji tutarlı mı?

### 8. ⚠️ Çelişki Yönetimi

Çelişki bulunursa:

1. Etkilenen sayfaya uyarı notu ekle:

```markdown
> [!WARNING] Contradiction
> Bu sayfadaki [belirli bilgi], [yeni kaynak] ile çelişmektedir.
> - Mevcut bilgi: [eski bilgi]
> - Yeni bilgi: [yeni bilgi]
> - Kaynak: [yeni kaynak dosya adı]
> - Tarih: YYYY-MM-DD
```

2. Lint backlog'una kaydet → bkz. [wiki-lint.md](./wiki-lint.md)

## 🏷️ Provenance (Köken Takibi)

> [!IMPORTANT]
> Güncellenen **her sayfanın** `sources:` frontmatter alanı, yeni kaynağı içermelidir.

```yaml
sources:
  - 2026-05-18-report-pr-landscape-q2.md    # mevcut kaynak
  - 2026-05-20-article-openai-agents.md      # yeni eklenen kaynak
```

## 📤 Çıktı

Başarılı bir ingest işleminin çıktıları:

| Çıktı | Konum | Zorunlu |
|-------|-------|---------|
| Özet sayfası | `wiki/summaries/YYYY-MM-DD-short-title.md` | ✅ |
| Güncellenen sayfalar | `wiki/` altında çeşitli | ✅ (varsa) |
| INDEX girişi | `wiki/INDEX.md` | ✅ |
| LOG girişi | `wiki/LOG.md` | ✅ |
| Contradiction notu | Etkilenen sayfalarda | ⚠️ (varsa) |

---

*İlgili workflow'lar: [wiki-lint.md](./wiki-lint.md) · [query-to-page.md](./query-to-page.md)*
