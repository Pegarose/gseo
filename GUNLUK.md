# CapInt — Günlük kullanım

> **Terminal zorunlu değil.** Kurulumdan sonra her şey chat’te.

## CapInt stack (4 katman)

| Katman | Günlük |
|--------|--------|
| Workflows | `/forge` `/blueprint` — drift/regresyon kapısı |
| Routing | Bu dosya + chat (Execution Intent) |
| Graph | Cursor `/graphify …` (proje değişince `--update`) |
| Memory | agentmemory MCP + oturum kapanışında HANDOFF/DONE |

Kurulum: `capint init --stack` → `capint stack doctor` · [docs/capint-stack.md](docs/capint-stack.md)

---

1. Chat'e görevi doğal dille yaz (+ screenshot varsa ekle).
2. Agent kısa **Execution Intent** gösterir (`Intent` / `Capability` / `Resolution` / `Plan`).
3. **Hafif iş:** soru yok, doğrudan uygular. **Orta/ağır:** `devam` / `plan` / `analiz` yeterli.
4. Skill veya workflow adı **ezberlemezsin**; seçimi agent yapar.
5. `/workflow` veya `/skill` sadece override içindir (nadiren gerekir).
6. Terminal yalnızca: **ilk kurulum** (`init --stack`), **stack doctor**, sorun (`doctor`).
7. **Oturum kapanışı:** `kapan` veya `HANDOFF + DONE güncelle` — tamamlanan iş `DONE.md`, sıradaki iş `HANDOFF.md`.

**Tam kılavuz:** [docs/kullanim-kilavuzu.md](docs/kullanim-kilavuzu.md) · **Chat şablonları:** [docs/conventions/daily-use.md](docs/conventions/daily-use.md)
