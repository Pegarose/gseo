# GSeoSuite API Scopes

Bu doküman, GSeoSuite API v1 endpoint'leri için geçerli yetkilendirme scope'larını tanımlar.

## Scope Listesi

| Scope | Açıklama | Kullanan Endpoint'ler |
|---|---|---|
| `site:read` | Kiracıya ait siteleri listeleme | `GET /api/v1/sites` |
| `site:write` | Yeni site oluşturma | `POST /api/v1/sites` |
| `score:read` | Skor sonuçlarını okuma | `POST /api/v1/score/url`, `POST /api/v1/score/content` |
| `score:write` | Skorlama snapshot'larını kaydetme (opsiyonel) | — |
| `semantic:read` | Semantik analiz sonuçlarını okuma | `POST /api/v1/semantic/analyze` |
| `ai:read` | AI Visibility readiness skorunu okuma | `POST /api/v1/ai-visibility/check` |
| `links:read` | İç link önerilerini okuma | `POST /api/v1/internal-links/suggest` |
| `quota:read` | Kota kullanımını okuma | `GET /api/v1/quota` |
| `webhook:write` | Webhook kaydı ekleme/silme/listeleme | `GET /api/v1/webhooks`, `POST /api/v1/webhooks`, `DELETE /api/v1/webhooks` |

## Auth Endpoint

| Endpoint | Scope Gereksinimi | Not |
|---|---|---|
| `GET /api/v1/auth/me` | — | API key geçerli olması yeterli, özel scope gerekmez. |
| `GET /api/v1/health` | — | Public endpoint. |

## Scope Olmayan Anahtarlar

Bir API key'in hiç scope'u yoksa, sadece `auth/me` ve `health` endpoint'lerine erişebilir.

## Scope En İyi Uygulamaları

- Her entegrasyon (CMS plugin, SDK, dashboard) için minimum gereken scope'ları içeren ayrı key'ler oluşturulmalıdır.
- `webhook:write` gibi yönetimsel scope'lar yalnızca sunucu tarafı entegrasyonlarda kullanılmalıdır.
