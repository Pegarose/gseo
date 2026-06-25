---
id: wiki-lint
version: "1.0"
human_summary: Wiki saglik kontrolu ve tutarsizlik tespiti
phases:
  - id: lint
    name: Lint
    skills:
      - wiki-lint
      - audit
    requires: []
    outputs:
      type: object
      properties:
        pages_scanned:
          type: number
        issues_found:
          type: number
      required:
        - pages_scanned
        - issues_found
      additionalProperties: false
  - id: fix
    name: Fix
    skills:
      - wiki-lint
      - wiki-management
    requires:
      - lint
    outputs:
      type: object
      properties:
        auto_fixed:
          type: number
        manual_fixes_needed:
          type: number
      required:
        - auto_fixed
        - manual_fixes_needed
      additionalProperties: false
---

# 🔍 Wiki Lint Workflow

> Wiki sağlık kontrolü. Tutarsızlıkları, eksiklikleri ve iyileştirme fırsatlarını tespit eder.

## 🎯 Amaç

Wiki'nin bütünlüğünü, tutarlılığını ve tazeliğini denetlemek. Sorunları önem derecesine göre sınıflandırarak raporlamak.

## ⚡ Tetikleyici

- `/audit` komutu
- Periyodik çalıştırma (önerilen: **aylık**)
- Manuel istek

## 📤 Çıktı Konumu

```
wiki/lint-reports/YYYY-MM-DD.md
```

---

## 🏥 Sağlık Kontrolleri

### 🔴 Kritik (Critical)

| Kontrol | Açıklama | Tespit Yöntemi |
|---------|----------|----------------|
| **Contradictions** | Sayfalar arası çelişkiler | İki sayfa aynı konuda farklı bilgi veriyor |
| **Missing provenance** | `sources:` frontmatter'ı eksik sayfalar | Frontmatter taraması |
| **Missing lifecycle** | `lifecycle:` durumu eksik sayfalar | Frontmatter taraması |
| **Missing confidence_reason** | `confidence_reason:` eksik sayfalar | Frontmatter taraması |

### 🟡 İlgilenilmeli (Needs Attention)

| Kontrol | Açıklama | Tespit Yöntemi |
|---------|----------|----------------|
| **Orphan pages** | Hiçbir sayfadan bağlantı almayan sayfalar | Backlink analizi |
| **Stale pages** | `last_verified` > 14 gün olan sayfalar | Tarih karşılaştırması |
| **Missing backlinks** | Bahsedildiği halde backlink verilmeyen referanslar | Çapraz referans taraması |
| **Outdated summaries** | Kaynak güncellenmiş ama özet güncellenmemiş | Kaynak-özet tarih karşılaştırması |
| **Unverified high-impact** | Yüksek etkili ama doğrulanmamış sayfalar | `confidence: low` + çok referans |

### 🟢 Sağlıklı (Healthy)

Yukarıdaki kontrollerin hiçbirinde sorun yoksa sayfa sağlıklıdır.

---

## 🔮 Proaktif Keşif

Lint sadece sorunları bulmaz — **fırsatları** da tespit eder:

| Keşif | Açıklama |
|-------|----------|
| **Missing concept pages** | Wiki'de bahsedilen ama sayfası olmayan kavramlar |
| **Missing entity pages** | Wiki'de bahsedilen ama sayfası olmayan varlıklar (kişi, şirket, ürün) |
| **Candidate sources to seek** | Bilgi boşluklarını dolduracak potansiyel kaynak önerileri |
| **Candidate syntheses** | Birden fazla kaynağı birleştiren sentez sayfası adayları |

---

## 📊 Önem Dereceleri

| Seviye | Emoji | Anlamı | Aksiyon |
|--------|-------|--------|---------|
| Critical | 🔴 | Bilgi bütünlüğü tehlikede | Hemen çözülmeli |
| Needs attention | 🟡 | İyileştirme gerekiyor | Planlı çözüm |
| Healthy | 🟢 | Sorun yok | Aksiyon gerekmez |

---

## 📋 Lint Raporu Şablonu

```markdown
---
title: "Wiki Lint Report"
type: lint-report
date: YYYY-MM-DD
total_pages_scanned: N
---

# 🔍 Wiki Lint Report — YYYY-MM-DD

> Taranan sayfa sayısı: N

## 📊 Özet

| Seviye | Sayı |
|--------|------|
| 🔴 Critical | X |
| 🟡 Needs attention | Y |
| 🟢 Healthy | Z |

---

## 🔴 Critical Issues

### Contradictions
- [ ] `sayfa-a.md` ↔ `sayfa-b.md` — [çelişki açıklaması]

### Missing Provenance
- [ ] `sayfa.md` — `sources:` frontmatter eksik

### Missing Lifecycle
- [ ] `sayfa.md` — `lifecycle:` frontmatter eksik

### Missing Confidence Reason
- [ ] `sayfa.md` — `confidence_reason:` frontmatter eksik

---

## 🟡 Needs Attention

### Orphan Pages
- [ ] `sayfa.md` — hiçbir sayfadan bağlantı almıyor

### Stale Pages
- [ ] `sayfa.md` — son doğrulama: YYYY-MM-DD (X gün önce)

### Missing Backlinks
- [ ] `sayfa-a.md` bahsediyor → `sayfa-b.md` ama backlink yok

### Outdated Summaries
- [ ] `summaries/sayfa.md` — kaynak güncellenmiş ama özet eski

### Unverified High-Impact Pages
- [ ] `sayfa.md` — confidence: low, referans sayısı: N

---

## 🔮 Proactive Discovery

### Missing Concept Pages
- [ ] "kavram-adı" — N sayfada bahsediliyor, sayfası yok

### Missing Entity Pages
- [ ] "varlık-adı" — N sayfada bahsediliyor, sayfası yok

### Candidate Sources to Seek
- [ ] "konu" — bilgi boşluğu, kaynak araştırılmalı

### Candidate Syntheses
- [ ] "sentez-başlığı" — şu kaynaklar birleştirilebilir: [kaynak listesi]

---

## 🟢 Healthy Pages

Toplam sağlıklı sayfa: Z / N
```

---

*İlgili workflow'lar: [ingest.md](./ingest.md) · [query-to-page.md](./query-to-page.md)*
