---
description: "CapInt daily use — chat-first, no ceremony."
---

# Günlük kullanım — chat yeterli

CapInt arka planda **kurallar + capability router + skill bundle** sağlar.  
Günlük iş **Cursor (veya IDE) chat’i** — terminal prosedürü değil.

---

## Kim ne yapar?

| Sen | Agent |
|-----|--------|
| Görevi normal dille yaz | `AGENT.md` + IDE kurallarını okur |
| Screenshot / “beklenen vs mevcut” ekle | Kısa Execution Intent; orta/ağırda kısa soru |
| “Önce plan, onaylayınca kod” de | Seçimine göre plan veya kod |
| İstersen oturum sonu özet onayla | Değişiklik özeti; `DONE.md` + `HANDOFF.md` günceller |

**Kapanış:** `kapan` veya `HANDOFF + DONE güncelle`

**Yazmana gerek yok:** Skill adları, `capint route` çıktısı, matrix jargonu.

---

## Mesaj şablonu (kopyala-yapıştır)

```
[Sorun / istek — 2–4 cümle]

[Varsa: ekte screenshot = hedef görünüm]

Kısıt: Sadece [modül/sayfa]. Başka yere dokunma.

Önce kısa Execution Intent göster; hafif işte doğrudan uygula, orta/ağırda kısa soru sor (devam/plan/analiz).
```

---

## Senaryolar

### Bug fix

```
Ödeme callback 500 veriyor. Log: [varsa yapıştır].
Kök neden + regression test. Sadece ilgili service ve test.
Önce plan.
```

Agent muhtemelen: `Capability: systematic-debugging` · mesajında “önce plan” varsa plan modu

### Çeviri / i18n

```
Lang dosyaları uyumsuz. Tek kaynak lang/*.php olsun.
Önce hangi key'ler drift etmiş listele, onaylayınca düzelt.
```

Agent muhtemelen: `Capability: localization-hub`

### Refactor

```
Auth modülünde code smell var. Davranış değişmesin.
Mevcut testler geçmeli. Önce kısa plan.
```

### “Olmuş gibi değil” (UI)

```
Ekteki görsel doğru örnek. Şu anki sayfa uymuyor.
Farkları listele → onay → düzelt.
```

### Mimari / karar

```
İki yaklaşım var: [A] ve [B]. Tek kaynak [A] olsun.
Önce mimari plan — kod yok.
```

Confirm’de **`analiz`** veya “kod yazma” diyebilirsin.

---

## Confirm (adaptive)

Confirm, agent’ın kontrolsüz kod yazmasını önlemek içindi. Günlük kullanımda:

| Ağırlık | Sen |
|---------|-----|
| 🟢 Light | Ek adım yok — agent Intent sonrası uygular |
| 🟡🔴 Medium/heavy | `devam` / `plan` / `analiz` yeterli — `apply_now` yazmana gerek yok |

| Doğal dil | Anlam |
|-----------|--------|
| devam, yap, evet, tamam | Hemen uygula |
| plan, planla, önce plan | Önce kısa plan |
| analiz, incele, kod yazma | Sadece analiz |

---

## Terminal — sadece gerekirse

| Ne zaman | Komut |
|----------|--------|
| Projeye **ilk kez** CapInt | `npx @bcelep/capint init` |
| Agent kuralları gelmiyor | `capint ide sync` |
| Bir şey eksik mi? | `capint doctor` |
| Route kararını **görmek** istiyorsan (opsiyonel) | `capint route --verbose "..."` |

Global kurulum varsa: `capint` (`npx` olmadan).

---

## Sık karışanlar

| Yanlış algı | Gerçek |
|-------------|--------|
| Her görevde `capint route` | Hayır — chat yeterli |
| Skill adını bilmem lazım | Hayır — agent seçer |
| CapInt = terminal aracı | Hayır — IDE agent davranışı |
| Init sonrası hâlâ zor | Yeni sohbet aç; IDE sync kontrol et |

---

## İlgili

- [GUNLUK.md](../../GUNLUK.md) — tek sayfa özet
- [kullanim-kilavuzu.md](../kullanim-kilavuzu.md) — tam kılavuz
- [task-to-capability-cheatsheet.md](task-to-capability-cheatsheet.md) — görev → capability
