# GSeoSuite Super Admin & Platform Management PRD

Bu doküman, GSeoSuite platform sahiplerinin (GMedya / Sistem Yöneticileri) sistem üzerindeki tüm kiracıları (tenants), API anahtarlarını, harici servis sağlayıcılarını (NeuronWriter vb.) ve kaynak kotalarını merkezi olarak yönetmesini sağlayacak **Super Admin Paneli** gereksinimlerini tanımlar.

---

## 1. Giriş ve Hedef
GSeoSuite, CMS-bağımsız bir SEO ve AI Visibility analiz platformudur. Kiracılar (müşteriler/ajanslar), platform üzerinden kota/kredi usulü ile yararlanırken; platform sahiplerinin master API anahtarlarını güvenli bir şekilde saklaması, servis maliyetlerini izlemesi, kiracı paketlerini yükseltmesi ve sistem durumunu denetlemesi gerekmektedir.

Super Admin Paneli, kiracı paneli (`/dashboard`) ile veri ve yetki bakımından tamamen izole olacak, yalnızca sistem yöneticilerinin erişebileceği güvenli bir yönetim katmanı (`/admin` veya `/super-admin`).

---

## 2. Kullanıcı Rolleri ve Erişim Denetimi (RBAC)

Super Admin yetkisi, standart kiracı kullanıcılarından kesin hatlarla ayrılmalıdır:
* **Super Admin (GMedya Yöneticisi):** Tüm kiracıların verilerini görebilir, paket değiştirebilir, master sağlayıcı anahtarlarını güncelleyebilir, hata kayıtlarını ve logları inceleyebilir.
* **Super Editor/Support:** Kiracı detaylarını görebilir, manuel crawl tetikleyebilir ve destek taleplerini çözmek için kiracı paneline "impersonate" (taklit etme) moduyla giriş yapabilir. Sağlayıcı API anahtarlarını göremez veya değiştiremez.

---

## 3. Kiracı Yönetimi (Tenant Management)

Sisteme kayıtlı tüm müşterilerin/ajansların organizasyon seviyesinde yönetilmesi:
* **Kiracı Listesi:** Aktif, askıya alınmış, demo veya deneme süresindeki kiracıların listelenmesi (üye sayısı, site sayısı, toplam tarama sayısı).
* **Yeni Kiracı Ekleme (Onboarding):** Manuel kiracı oluşturma (Tenant Name, Slug, Plan seçimi).
* **Organizasyon Detayları:** Kiracıya bağlı kullanıcıların yönetimi, API anahtarlarının listelenmesi, askıya alma/aktif etme fonksiyonları.
* **Site ve URL İzleme:** Hangi kiracının kaç site eklediğini ve hangi URL'lerin tarandığını arama/filtreleme ile görebilme.

---

## 4. Plan ve Kota Yönetimi (Plan & Quota Management)

SaaS modelinin çekirdeği olan kaynak ve limit yönetimi:
* **Paket Tanımları:** Sistemde önceden tanımlı abonelik paketleri:
  - *Free / Starter / Professional / Agency / Custom*
* **Kota Limitleri (Quota Overrides):** Her kiracı için aylık sınırların belirlenmesi:
  - Maksimum Site Sayısı
  - Ayda Taranabilecek Maksimum URL Sayısı
  - Aylık AI Analiz Kredisi Limiti
* **AI Kredi Dağıtımı (AI Credit Allocation):**
  - Kiracı kredilerinin manuel olarak artırılabilmesi veya özel durumlarda (örneğin telafi amacıyla) ek kredi (kredi override) tanımlanması.
  - Kredilerin her fatura kesim tarihinde veya ay başında otomatik olarak sıfırlanması/yenilenmesi mekanizması.

---

## 5. Sağlayıcı Yönlendirme ve Master Key Yönetimi (Provider Router & API Keys)

En kritik işlevlerden biri, maliyetli ve hassas harici API'lerin sistem genelinde paylaştırılmasıdır:
* **Merkezi API Key Deposu:** NeuronWriter, OpenAI, PageSpeed veya Google Search Console master API anahtarlarının şifrelenmiş (encrypted) olarak veritabanında saklanması.
* **Sağlayıcı Yönlendirici (Provider Router):**
  - Kiracılardan gelen AI analiz veya semantic içerik isteklerini arka planda çalışan aktif sağlayıcı hesaplarına dengeli (load balancing) veya kota limitlerine göre yönlendirme.
  - *Örnek:* A sağlayıcısının kotası bittiğinde, istekleri otomatik olarak B sağlayıcı anahtarına kaydırma (failover).
* **Maliyet & Kullanım Takibi:**
  - Hangi kiracının hangi sağlayıcıyı ne kadar tükettiğinin loglanması (`QuotaUsage` entegrasyonu).
  - Sağlayıcı bazlı aylık tahmini harcama/maliyet raporlaması.

---

## 6. Sağlayıcı Sağlığı İzleme (Provider Health Monitoring)

Sistem kesintilerini önceden tespit etmek amacıyla:
* **Sağlık Paneli (Health Dashboard):** Harici servislerin (NeuronWriter, OpenAI vb.) API yanıt süreleri (latency), HTTP durum kodları (200, 429, 500 vb.) ve hata oranları.
* **Otomatik Devre Dışı Bırakma (Circuit Breaker):** Bir harici API ardı ardına hata veriyorsa, sistemi korumak adına o sağlayıcıyı geçici olarak pasif duruma çekip yöneticilere uyarı (slack webhook/e-posta) gönderme.

---

## 7. Kullanım Analitiği (Usage Analytics)

Platform ölçeklenebilirliğini ölçmek için istatistikler:
* Kiracı bazlı günlük/aylık API çağrı sayıları.
* Hangi CMS entegrasyonunun (WordPress, Next.js vb.) daha aktif kullanıldığının dağılımı.
* Başarılı/Başarısız analiz isteklerinin oranları.

---

## 8. Hata Ayıklama ve Destek Araçları (Support & Debug Tools)

Müşteri sorunlarını hızlıca çözebilmek adına yöneticilere sunulan özel yetkiler:
* **Impersonation (Kiracı Taklidi):** Destek ekibinin, müşterinin şifresini bilmeden onun panelini (`/dashboard`) müşterinin gözünden görebilmesi.
* **Manuel Tetikleyiciler:**
  - Bir sitenin analizlerini el ile yeniden tetikleme (Recrawl/Rescore).
  - Veritabanındaki eski veya hatalı snapshot'ları manuel olarak silme veya güncelleme yetkisi.
* **Sistem Logları Görüntüleyici:** Sunucu tarafındaki kritik hataların ve API istek/yanıt loglarının filtrelenebilir arayüzü.

---

## 9. Güvenlik ve Erişim Kuralları (Security & Access Rules)

* **Çift Aşamalı Doğrulama (2FA):** Super Admin girişlerinde zorunlu 2FA (TOTP/Google Authenticator).
* **IP Kısıtlaması (IP Whitelisting):** Super Admin paneline erişimin yalnızca belirli statik IP adreslerinden veya GMedya VPN'i üzerinden yapılmasına izin veren yapılandırma.
* **Audit Logs (İşlem Günlükleri):** Super Admin panelinde yapılan kritik işlemlerin (API key değiştirme, kota artırma, kiracı silme vb.) kim tarafından, ne zaman ve hangi IP'den yapıldığının geri döndürülemez şekilde loglanması.

---

## 10. Kapsam Dışı Bırakılanlar (Non-Goals)

Super Admin MVP aşamasında yer almayacak başlıklar:
* **Otomatik Faturalandırma / Ödeme Geçidi (Stripe vb.):** İlk fazda paket geçişleri ve limit tanımlamaları tamamen yöneticiler tarafından manuel yapılacaktır.
* **Canlı Destek Chat Entegrasyonu:** Panel içi canlı sohbet yerine standart e-posta/ticket yönlendirmesi kullanılacaktır.
* **Müşteri BYOK Yönetimi:** Müşterilerin kendi API anahtarlarını getirmesi bu fazda Super Admin üzerinden de yapılandırılmayacaktır.

---

## 11. Faz Planı ve Yol Haritası

### Faz 1: Altyapı ve Veri İzolasyonu (1-2 Hafta)
- `/admin` veya `/super-admin` route yapısının kurulması.
- Super Admin kullanıcı tablolarının ve RBAC (Rol Tabanlı Yetkilendirme) mimarisinin Prisma üzerinde hazırlanması.
- Kiracı listeleme, detay görme ve manuel durum değiştirme ekranlarının yapılması.

### Faz 2: Kota ve Sağlayıcı Yönetimi (2 Hafta)
- Master API Key yönetim arayüzü (NeuronWriter, OpenAI vb. için şifreli veri girişi).
- Paket/limit tanımlama ve AI kredilerini manuel güncelleme (override) fonksiyonları.
- Sağlayıcı bazlı kota tüketim loglarının (`QuotaUsage` tablosundan beslenen) sisteme bağlanması.

### Faz 3: İzleme ve Destek Araçları (1 Hafta)
- Impersonation (kiracı taklidi) özelliğinin güvenli şekilde aktifleştirilmesi.
- API Sağlık İzleme (Health Monitoring) ve Circuit Breaker testleri.
- Super Admin Audit Logs altyapısının kurulması.
