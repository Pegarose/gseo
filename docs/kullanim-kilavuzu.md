# CapInt Kullanım Kılavuzu

> **Sürüm:** 0.4.2 · **CLI:** `@bcelep/capint`  
> **Günlük kullanıcı:** [GUNLUK.md](../GUNLUK.md) — **3 adım, terminal yok**  
> **Detay:** [conventions/daily-use.md](conventions/daily-use.md)

---

## 0. Günlük kullanım (çoğu insan — buradan başla)

CapInt **zor bir uygulama değil** — terminal aracı gibi görünür ama asıl iş **IDE chat’inde** olur. CLI kurulum ve debug içindir.

```
1. Görevi chat'e yaz (+ screenshot)
2. Kısa intenti gör: Intent → Capability → Resolution → Plan
3. Hafif iş: soru yok, doğrudan uygula. Orta/ağır: `devam` / `plan` / `analiz` yeterli
```

| Yapma | Yap |
|-------|-----|
| Skill/workflow adı ezberleme | Agent capability seçsin |
| Her seferinde `capint route` | Sadece merak/debug: `--verbose` |
| Uzun prosedür yazdırma | Kısa intent + şıklı seçim |
| Init sonrası terminalde takılma | Yeni chat aç, görevi yaz |

**Örnek mesaj:** *“Lang dosyaları uyumsuz. Tek kaynak lang/*.php. Önce plan, onaylayınca düzelt.”*

Terminal: yalnızca **kurulum** (`init`), **sorun** (`doctor`), **IDE kuralı** (`ide sync`).  
Aşağıdaki bölümler referans / ileri seviye içindir.

---

## 1. CapInt nedir?

CapInt, IDE agent’ına (Cursor, Claude Code, Gemini, Antigravity, …) **tutarlı görev yönlendirme** verir:

| Sorun | CapInt çözümü |
|-------|----------------|
| Agent her görevde farklı davranır | `AGENT.md` + IDE session kuralları |
| Hangi playbook kullanılacak belirsiz | Capability router (chat içinde sessiz) |
| “Önce plan mı kod mu?” karışır | Execution Intent + **tek şıklı Confirm** |
| Skill dosyası yok, route boşa | Init **bundle** (skills + workflows) |

CapInt **PrismX kadar geniş değil** — bilinçli olarak hafif router; init ile **tam skill kütüphanesi** diskte, agent göreve göre okur.

---

## 2. İlk kurulum (bir kez)

```bash
cd your-project
npx @bcelep/capint init
```

Bu komut kurar:

| Çıktı | Ne işe yarar |
|-------|----------------|
| `GUNLUK.md` | Günlük 6 satır — **bunu oku** |
| `AGENT.md`, `design.md`, `AGENTS.md` | Agent sözleşmesi |
| `skill-routing-matrix.json` | Görev → capability haritası |
| `registry.json` | Matrix’ten türetilmiş skill listesi |
| `skills/*` | Tam skill kütüphanesi (~115) — init ile projeye kopyalanır |
| `workflows/forge.md` | Orta/ağır görevler için fazlı workflow |
| `.capint/` | Manifest, kurallar |
| IDE dosyaları | Cursor `.mdc`, `CLAUDE.md`, … (**varsayılan açık**) |

IDE sync istemezsen:

```bash
capint init --no-ide-sync
capint ide sync   # sonra
```

CapInt uyumlu preset (HANDOFF + context):

```bash
capint init --preset capint-compatible
```

### Kurulum sonrası — hemen yap

1. **Yeni IDE sohbeti aç** (eski chat eski kuralları taşır)
2. `GUNLUK.md` dosyasına göz at (30 saniye)
3. Chat’e ilk görevini yaz — terminal gerekmez

Global CLI (opsiyonel):

```bash
npm i -g @bcelep/capint
```

---

## 3. Oturum akışı (her yeni sohbet)

Agent (`capint ide sync` sonrası):

```
1. AGENT.md + design.md okur           → kısa startup (2–5 satır)
2. Görev gelince → Execution Intent    → Intent/Capability/Resolution/Memory/Plan
3. Adaptive confirm: light → uygula; medium/heavy → kısa soru (devam/plan/analiz)
4. Seçime göre kod / plan / analiz
5. Capability seçimi sessiz            → skill-routing-matrix.json
```

**Senin yapman gereken:** Görevi yaz — hafif işlerde ek adım yok; orta/ağırda `devam`, `plan` veya `analiz` yeterli.

### Execution Intent örneği

```
Intent: lang dosyaları uyumsuz
Capability: localization-hub
Resolution: skill/localization-hub
Memory: optional
Plan: auto          # light görev — confirm yok

# medium/heavy örneği:
Plan: confirm
Confirm: Nasıl ilerleyeyim? (1=uygula 2=plan 3=analiz)
Default: uygula (devam / yap / tamam da geçerli)
```

---

## 4. Complexity (🟢 🟡 🔴)

Agent içsel ağırlık seçer; sen emoji görmezsin ama Confirm davranışı buna bağlıdır.

| Ağırlık | Davranış | Örnek |
|---------|----------|-------|
| 🟢 Light | Hızlı uygulama mümkün | Tek dosya typo |
| 🟡 Medium | Confirm zorunlu | Birkaç dosya, test |
| 🔴 Heavy | plan_first önerilir | Yeni modül, mimari |

Auth, payment, secret → **min 🟡**.

---

## 5. Görev → Capability

Detaylı tablo: [conventions/task-to-capability-cheatsheet.md](conventions/task-to-capability-cheatsheet.md)

| Sen dersen | Capability |
|------------|------------|
| bug, hata, fix | systematic-debugging |
| i18n, çeviri | localization-hub |
| refactor | refactor-simplify |
| geçen karar, memory | memory-retrieval |

### CLI önizleme (opsiyonel)

```bash
capint route "i18n çeviri"
capint route --json "debug login"
capint route --verbose "..."    # Skill Plan tablosu
capint route --list             # referans
```

---

## 6. IDE entegrasyonu

CapInt tek kaynak (`projections/session-start.md`) + IDE projection modeli.

```bash
capint ide sync
capint ide sync --targets cursor,claude,antigravity
capint ide check
capint ide check --json
```

| IDE | `ide sync` çıktısı |
|-----|-------------------|
| **Cursor** | `.cursor/rules/00-capint-session.mdc` (`alwaysApply`) |
| **Claude Code** | `CLAUDE.md` |
| **Gemini** | `GEMINI.md` |
| **Antigravity** | `.agents/rules/`, `CAPINT.md`, `capint-router` skill |
| **Codex** | Root `AGENTS.md` (init stub) |

**Önemli:** Projection dosyalarını elle düzenleme — kaynak `capint ide sync`; değişiklikten sonra sync yenile.

### Agent kuralları gelmiyorsa

```bash
capint ide check          # hangi dosya eksik?
capint ide sync           # yeniden yaz
# Yeni sohbet aç
```

---

## 7. Sağlık ve sorun giderme

```bash
capint doctor
capint status
capint audit
capint consult "..."      # dry-run, yan etkisiz
```

### `resolution_status: not_installed`

Route veya agent şunu gösterirse skill bundle eksiktir:

```
Resolution status: not_installed
Hint: Skill "localization-hub" not installed — run capint init ...
```

**Çözüm:**

```bash
capint init               # bundle tekrar kopyalanır (mevcut dosyalar korunur)
capint doctor
```

### `installed` ≠ Cursor skill listesi

Init sonrası `skills/` altında ~115 skill **diskte** vardır. Cursor’un global “Skills” panelinde hepsi **listelenmez** — bu normal.

| Durum | Anlam |
|-------|--------|
| `capint route` → `installed` | `skills/<ad>/SKILL.md` var ve disable değil |
| Cursor skill picker’da yok | Beklenen; agent görevde dosyayı okur |
| Agent skill okumuyor | `AGENT.md` activation model + route **Explanation → Read** listesi |

Önizleme:

```bash
capint route "prd hazırla"
# Explanation → Read: skills/prd/SKILL.md ...
```

Skill geçici kapatma (silmeden):

```bash
capint skill disable localization-hub
capint skill enable localization-hub
capint skill pin prd                # öne çıkar → registry.project_added
```

### 7.1 Öne Çıkan Yetenekler (Primary Skills) ve Özelleştirme

CapInt, her görev kategorisi için varsayılan bir **Öne Çıkan Yetenek (Primary Skill)** (örneğin arayüz tasarımlarında `frontend-design-pro`, testlerde `playwright`) tanımlar. Kullanıcılar bu sistemi diledikleri gibi özelleştirebilir:

1. **Öne Çıkan Yeteneği Değiştirme:** Proje dizininizin kökündeki `skill-routing-matrix.json` dosyasını düzenleyerek ilgili görevler için hangi yeteneğe öncelik verileceğini (`confidence_base` değerini artırarak) belirleyebilirsiniz.
2. **Yetenek Kapatma (Disable):** Bir yeteneği geçici olarak pasifleştirmek için `capint skill disable <yetenek-adi>` komutunu kullanabilirsiniz. Router, bu yeteneği atlayıp otomatik olarak kategorideki alternatif yeteneklere yönelecektir.
3. **Yeni Yetenek Ekleme (Add Custom Skill):** Kendi yeteneğinizi eklemek için `skills/` dizini altında yeni bir klasör açıp içine bir `SKILL.md` belgesi oluşturmanız yeterlidir. Ardından terminalde `capint skill refresh` çalıştırarak bu yeteneği projeye kaydedebilirsiniz.

**Minimal bundle (CI):**

```bash
capint init --bundle minimal
```

Matrix/registry bozulduysa:

```bash
capint recover --list
capint recover --latest --apply
```

### capint ui (terminal istemeyenler)

Proje kökünde:

```bash
capint ui --open
```

1. Proje / doctor kontrolü  
2. Görev yaz → route  
3. Explanation + confirm seç  
4. Metni chat'e kopyala  

### Çakışma (conflict)

Init mevcut dosyayı **asla ezmez** (capint managed block yoksa). Yeni içerik `*.capint.new.md` sidecar’da kalır — karşılaştırıp birleştir.

---

## 8. Matrix güncelleme

```bash
capint upgrade --dry-run    # çakışmaları gör (package wins)
capint upgrade --apply        # yedek + güncelle
```

Custom `task_types` korunur. Apply öncesi dry-run şart.

---

## 9. Kaldırma

```bash
capint uninstall --dry-run
capint uninstall --yes
capint uninstall --yes --keep-agent --keep-ide
npm uninstall -g @bcelep/capint
```

| Flag | Etki |
|------|------|
| `--keep-agent` | AGENT.md, design.md, AGENTS.md kalır |
| `--keep-ide` | Cursor/CLAUDE projection kalır |
| `--include-sidecars` | `*.capint.new.md` temizlenir |

---

## 10. Opsiyonel: yerel context (v0.4.2)

Route varsayılanında değişmez.

```bash
capint memory status
set CAPINT_LOCAL_CONTEXT=1
capint route "memory lookup ..."
```

---

## 11. Dosya yapısı (init sonrası)

```
your-project/
├── GUNLUK.md                 ← günlük kullanıcı buradan
├── AGENT.md
├── AGENTS.md
├── design.md
├── docs/
│   ├── kullanim-kilavuzu.md
│   └── conventions/
│       ├── daily-use.md
│       └── task-to-capability-cheatsheet.md
├── skill-routing-matrix.json
├── registry.json
├── skills/
├── workflows/
├── .capint/
│   ├── scaffold-manifest.json
│   └── rules/core.md
└── .cursor/rules/00-capint-session.mdc
```

---

## 12. Sık sorulan sorular

**CapInt kullanmak zor mu?**  
Hayır — init’ten sonra chat yeterli. Terminal sadece kurulum/sorun için.

**Her görevde `capint route` çalıştırmalı mıyım?**  
Hayır. Agent IDE kurallarından Intent üretir. Route maintainer/debug içindir.

**Skill adını bilmem gerekir mi?**  
Hayır. Matrix + agent seçer.

**Init yaptım, agent hâlâ eski davranıyor?**  
Yeni sohbet aç. `capint ide check` → `ide sync`.

**PrismX ile fark?**  
CapInt daha hafif: capability router + minimal bundle. Tam playbook kütüphanesi yok.

**Hangi IDE en iyi?**  
Cursor: `alwaysApply` `.mdc` ile en tutarlı oturum başlangıcı.

---

## 13. İlgili dokümanlar

| Doküman | Konu |
|---------|------|
| **GUNLUK.md** | Günlük 3 adım (herkes) |
| conventions/daily-use.md | Chat şablonları + senaryolar |
| conventions/task-to-capability-cheatsheet.md | Görev → capability |
| execution-intent-contract.md | JSON şema (maintainer) |
| manifest-schema.md | Uninstall/upgrade manifest |

---

*Son güncelleme: 2026-05-30 · @bcelep/capint 0.4.2*
