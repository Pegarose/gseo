# GSeoSuite Super Admin MVP Scope v1

Bu doküman, GSeoSuite platform yönetiminin MVP (Minimum Viable Product) aşamasındaki sınırlarını, kapsam dışı (out-of-scope) konularını, veri modeli ihtiyaçlarını ve güvenlik mimarisini tanımlar.

---

## 1. MVP Kapsamındaki Özellikler (In-Scope)

MVP fazında aşağıdaki yönetim paneli özellikleri geliştirilecektir:

* **Tenant List (Kiracı Listesi):**
  - Tüm kiracıların isim, plan türü, üye sayısı ve kayıt tarihiyle listelenmesi.
  - Arama ve plan türüne göre filtreleme.
* **Tenant Detail (Kiracı Detayı):**
  - Kiracıya bağlı kullanıcıların (`User`) ve aktif API anahtarlarının (`ApiKey`) listelenmesi.
  - Kiracıya bağlı sitelerin listesi.
* **Plan & AI Credit Yönetimi (Limit ve Düzenleme):**
  - Kiracının mevcut planının (free, starter, pro, agency vb.) düzenlenebilmesi.
  - Kiracıya ait **Aylık AI Analiz Kredisi** limitinin manuel olarak artırılması/azaltılması.
* **Usage Summary (Kullanım Özeti):**
  - Kiracının harcadığı kredi miktarının ve son tarama aktivitelerinin özeti.
* **Provider Status Read-Only (Sağlayıcı Sağlık Durumu):**
  - NeuronWriter ve diğer API entegrasyonlarının ayakta olup olmadığını kontrol eden basit, salt-okunur (read-only) durum göstergeleri (Ping/Status).
* **Rate Limit Hit Summary:**
  - İstek sınırına takılan (429 alan) çağrıların basit bir log özeti.
* **Plugin Version Summary:**
  - Sitelere bağlı entegrasyon sürüm dağılımları (Örn: WordPress Plugin v1.0 kullanan sitelerin oranı).
* **Support/Debug Notes:**
  - Kiracı detay ekranında destek ekiplerinin not bırakabileceği basit bir serbest metin (text) alanı.

---

## 2. MVP Dışında Kalacak Özellikler (Out-of-Scope)

Geliştirme hızını artırmak ve güvenlik risklerini en aza indirmek için aşağıdaki özellikler sonraki fazlara ertelenmiştir:

* **Billing/Payment (Ödeme Entegrasyonları):**
  - Stripe vb. ödeme geçidi entegrasyonları. Paket değişimleri ve kredi atamaları Super Admin tarafından manuel yapılacaktır.
* **Real Subscription Automation (Otomatik Abonelik):**
  - Webhook tabanlı otomatik abonelik yenileme veya iptal döngüleri.
* **Multi-provider Load Balancing (Çoklu Sağlayıcı Yük Dengeleme):**
  - İstekleri farklı sağlayıcı anahtarlarına dağıtan yük dengeleyici (MVP'de tek bir master/env key yeterlidir).
* **Real Provider Failover (Otomatik Hesap Geçişi):**
  - Sağlayıcı kesintiye uğradığında otomatik olarak yedek hesaba geçiş (MVP'de kesinti durumunda elle müdahale edilir).
* **Provider Key Rotation UI (API Key Değiştirme Arayüzü):**
  - Harici API anahtarlarını arayüzden girmek veya değiştirmek (Tüm master anahtarlar ENV/şifreli config üzerinden yönetilmeye devam edecek).
* **Full RBAC (Gelişmiş Rol Yönetimi):**
  - Super admin rollerinin kendi içinde alt yetkilere ayrılması (MVP'de yalnızca sistem bazlı genel bir admin kontrolü olacaktır).
* **Full Impersonation with Write Access (Yazma Yetkili Kiracı Taklidi):**
  - Müşteri panelinde müşteri adına değişiklik yapabilme yetkisi.
* **Public Audit Log UI (İşlem Geçmişi Arayüzü):**
  - Yapılan değişikliklerin admin panelinde listelendiği log ekranı.
* **Enterprise SSO:**
  - Google, Okta vb. kurumsal tek tıkla oturum açma entegrasyonları.

---

## 3. Sağlayıcı Anahtarları ve Güvenlik (Provider Key Management)

* **Plain-Text Gösterimi Yok:**
  - Güvenlik gerekçesiyle harici API anahtarları (NeuronWriter vb.) kesinlikle Super Admin arayüzünde açık metin (plain-text) olarak gösterilmeyecektir.
* **Arayüzden Düzenleme Yok:**
  - MVP fazında sağlayıcı API anahtarları için bir ekleme/düzenleme formu geliştirilmeyecektir. Sağlayıcı yönetimi tamamen salt-okunur (read-only) sağlık durumundan ibaret olacaktır.
* **Secret Maskeleme:**
  - API loglarında veya konfigürasyon detaylarında hassas veriler maskelenecektir (`NW_•••••••••`).
* **Yönetim Modeli:**
  - API anahtarları sunucu tarafında ortam değişkenleri (`.env`) üzerinden yüklenecektir.

---

## 4. Kiracı Taklidi Kuralları (Impersonation Rule)

* **MVP'de Yazma Yetkisi Yok:**
  - Kiracı paneline müdahale edebilen tam yetkili taklit etme (impersonation) modu bulunmayacaktır.
* **Placeholder Dashboard Linki:**
  - MVP'de yalnızca kiracının panelini salt-okunur (read-only view) olarak simüle eden bir bağlantı veya placeholder eklenebilir.
* **Güvenlik Koşulu:**
  - Gerçek yazma yetkili kiracı taklidi için veri güvenliği ve sorumluluk gereği geri döndürülemeyen Audit Log altyapısı zorunludur ve bu özellik sonraki faza bırakılmıştır.

---

## 5. Route Yapısı ve Navigasyon

Super Admin paneli `/super-admin` alt dizininde yapılandırılacaktır:

* `/super-admin` - Genel sistem istatistikleri ve kiracı özetlerini içeren ana konsol.
* `/super-admin/tenants` - Tüm kiracıların listesi.
* `/super-admin/tenants/[id]` - Belirli bir kiracının detayları (kullanıcılar, siteler, plan türü ve AI kredi limit düzenleme formu).
* `/super-admin/providers` - Sistem genelindeki API sağlayıcılarının salt-okunur sağlık durumu.
* `/super-admin/usage` - Sistem genelinde harcanan toplam kredilerin ve API çağrılarının istatistikleri.
* `/super-admin/system` - Rate limit aşım özetleri ve CMS eklenti sürüm dağılımları.

---

## 6. Güvenlik ve Yetkilendirme (Security Guards)

* **Development/Demo Guard:**
  - Geliştirme aşamasında yetkisiz girişleri engellemek için `/super-admin` istekleri `SUPER_ADMIN_DEMO_MODE=true` ve `SUPER_ADMIN_TOKEN` doğrulamasına tabi tutulacaktır.
* **Token-Based Guard:**
  - Super admin paneli isteklerinde tarayıcıda saklanacak bir token veya session doğrulayan Next.js Middleware/Server Action koruması bulunacaktır.
* **Data Isolation:**
  - Kiracı panelinde (`/dashboard`) kullanılan veri getirme metotları ile Super Admin metotları tamamen ayrılacaktır.
  - Super admin, tüm kiracılara (`all tenants`) erişebilen özel, soyutlanmış Prisma sorgularını kullanacaktır.

---

## 7. Veri Modeli İhtiyaçları (Prisma Schema Updates)

### Mevcut Modeller Yeterli mi?
Mevcut veri modelinde kiracının (`Tenant`) planı bulunuyor ancak **AI Analiz Kredisi limiti** doğrudan kiracı modelinde kolon olarak mevcut değil. 

### Önerilen Prisma Schema Değişiklikleri:
MVP'de manuel plan ve limit düzenlemesini desteklemek için `prisma/schema.prisma` dosyasındaki `Tenant` modeline aşağıdaki alanlar eklenmelidir:

```prisma
model Tenant {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  plan            String   @default("free") // free, starter, professional, agency
  aiCreditLimit   Int      @default(500)   // Kiracının aylık maksimum kredi limiti
  aiCreditUsed    Int      @default(0)     // Kiracının cari ayda tükettiği kredi miktarı
  supportNotes    String?                  // Destek ekibi notları için serbest alan
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  ...
}
```

* **AuditLog:** MVP kapsamında veritabanında bir AuditLog modeli yer almayacaktır, sonraki faza bırakılmıştır.

---

## 8. Uygulama Adımları ve Yol Haritası (Implementation Plan Order)

Super Admin MVP'si aşağıdaki sıralama ile kodlanacaktır:

1. **Adım 1: Prisma Schema Güncellemesi ve Seed:**
   - `Tenant` modeline `aiCreditLimit`, `aiCreditUsed` ve `supportNotes` alanlarının eklenmesi.
   - Veritabanı migrasyonunun (`npx prisma migrate dev`) çalıştırılması ve seed verilerinin bu alanlarla güncellenmesi.
2. **Adım 2: Güvenlik Koruması ve Shell Layout:**
   - `/super-admin` layout yapısının, token tabanlı giriş korumasının ve ana menü navigasyonunun kurulması.
3. **Adım 3: Salt-Okunur Konsol (Read-Only Dashboard & Lists):**
   - Kiracı listesi (`/super-admin/tenants`) ve kullanım özetlerinin listelenmesi.
   - Sağlayıcı sağlık durumlarının (`/super-admin/providers`) read-only listesi.
4. **Adım 4: Limit Düzenleme ve Destek Fonksiyonları:**
   - Kiracı detay ekranı (`/super-admin/tenants/[id]`) üzerinden plan seçimi, `aiCreditLimit` düzenlenmesi ve `supportNotes` notlarının kaydedilmesi.
5. **Adım 5: Sistem Raporları:**
   - `/super-admin/usage` ve `/super-admin/system` altındaki basit rate-limit/eklenti sürüm grafiklerinin/tablolarının yapılması.
