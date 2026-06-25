# Görev → Capability cheatsheet

Agent chat’te capability seçer; sen ezberlemezsin. Referans / maintainer içindir.

| Sen dersen (örnek) | Capability | Skill | Workflow |
|--------------------|------------|-------|----------|
| bug, hata, fix, çalışmıyor | systematic-debugging | systematic-debugging | /forge |
| i18n, çeviri, lang file | localization-hub | localization-hub | — |
| refactor, simplify, code smell | refactor-simplify | refactor | /forge |
| memory lookup, geçen karar | memory-retrieval | context-memory-bridge | — |
| Belirsiz / genel | request-clarification | capability-router | — |
| `/workflow`, `/skill` | workflow-override | capability-router | — |

**Ağırlık (agent içsel):**

| Emoji | Anlam | Tipik davranış |
|-------|-------|----------------|
| 🟢 light | Tek dosya, küçük fix | `apply_now` uygun olabilir |
| 🟡 medium | Birkaç dosya, test | Confirm zorunlu |
| 🔴 heavy | Mimari, yeni modül | `plan_first` önerilir |

Auth, payment, secret kelimeleri → minimum 🟡.

CLI önizleme (opsiyonel):

```bash
capint route --list
capint route --verbose "i18n çeviri"
```
