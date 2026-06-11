# SeoSuite - Yerel Kurulum, Çalıştırma ve Kullanma Kılavuzu

Bu kılavuz, SeoSuite projesini yerel bilgisayarınızda nasıl başlatacağınızı, WordPress eklentisini nasıl kuracağınızı ve tüm sistemi nasıl test edip kontrol edeceğinizi adım adım açıklamaktadır.

---

## 🛠️ 1. Gereksinimler

Başlamadan önce bilgisayarınızda aşağıdaki yazılımların kurulu olduğundan emin olun:
- **Node.js** (v18.0.0 veya daha yeni bir sürüm)
- **Docker & Docker Compose** (PostgreSQL veritabanını çalıştırmak için)
- **Yerel WordPress Ortamı** (Eklentiyi test etmek için [LocalWP](https://localwp.com/) veya XAMPP önerilir)

---

## 🚀 2. API Backend (Next.js) Kurulumu ve Çalıştırılması

SeoSuite API ve Puanlama Motoru (Scoring Engine) bir Next.js uygulamasıdır. Aşağıdaki adımları sırasıyla takip ederek API sunucusunu ayağa kaldırabilirsiniz:

### Adım 2.1: Bağımlılıkları Yükleyin
Proje ana dizinindeyken terminalde şu komutu çalıştırarak gerekli paketleri yükleyin:
```bash
npm install
```

### Adım 2.2: Veritabanını Docker ile Başlatın
Docker Desktop uygulamanızın açık olduğundan emin olun. Ardından terminalde şu komutu çalıştırarak PostgreSQL veritabanını arka planda başlatın:
```bash
docker-compose up -d
```
*Bu komut, yerelinizde `5432` portunda çalışan bir PostgreSQL veritabanı ayağa kaldıracaktır.*

### Adım 2.3: Çevre Değişkenlerini Tanımlayın (.env)
Proje kök dizininde bulunan `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun:
```bash
copy .env.example .env
```
Varsayılan `.env` dosyası yerel Docker veritabanına bağlanacak şekilde önceden yapılandırılmıştır. Dosya içeriğinin şuna benzer olduğunu doğrulayın:
```env
DATABASE_URL="postgresql://seosuite_user:seosuite_password@localhost:5432/seosuite_db?schema=public"
NODE_ENV="development"
APP_URL="http://localhost:3000"
GSEO_API_BASE_URL="http://localhost:3000/api/v1"
API_KEY_SECRET="seosuite_local_api_key_secret_key_minimum_32_characters"
ENCRYPTION_SECRET="00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
NEURONWRITER_API_KEY="local_test_neuronwriter_fallback_key"
```

### Adım 2.4: Veritabanı Şemasını ve Tabloları Oluşturun
Prisma ORM kullanarak veritabanı şemasını yerel veritabanınıza uygulayın:
```bash
npx prisma db push
```

### Adım 2.5: Veritabanını Seed Edin (API Key Üretimi)
Sistemde kullanılacak varsayılan kiracı (tenant), yönetici hesabı ve **API Anahtarını (API Key)** üretmek için seed betiğini çalıştırın:
```bash
npx prisma db seed
```
> [!IMPORTANT]
> **Komut tamamlandığında terminale basılan `gseo_live_...` formatındaki API Key değerini mutlaka kopyalayın ve bir yere not edin.** Bu anahtar, WordPress entegrasyonu için gereklidir ve güvenlik nedeniyle veritabanında şifrelenmiş olarak saklandığı için daha sonra tekrar görüntülenemez.

### Adım 2.6: Next.js Sunucusunu Başlatın
API sunucusunu geliştirme (development) modunda başlatın:
```bash
npm run dev
```
Sunucu başarıyla başladığında API yerel olarak şu adreste erişilebilir olacaktır: `http://localhost:3000/api/v1`

**Sunucunun çalışıp çalışmadığını test etmek için tarayıcınızda şu adresi açabilirsiniz:**
`http://localhost:3000/api/v1/health`

---

## 🔌 3. WordPress Eklentisi (Connector) Kurulumu ve Ayarları

SeoSuite WordPress Connector eklentisi, WordPress siteniz ile yerel API sunucunuzu birbirine bağlar.

### Adım 3.1: WordPress Sitenizi Hazırlayın
Eğer kurulu bir WordPress siteniz yoksa, [LocalWP](https://localwp.com/) uygulamasını indirip hızlıca 1 dakikada yerel bir WordPress sitesi oluşturabilirsiniz.

### Adım 3.2: Eklentiyi WordPress'e Yükleyin
1. WordPress Admin Paneline giriş yapın.
2. Sol menüden **Eklentiler > Yeni Ekle (Plugins > Add New)** sekmesine gidin.
3. Üst kısımdaki **Eklenti Yükle (Upload Plugin)** butonuna tıklayın.
4. Dosya seçiciyi kullanarak projenin içindeki `dist/seosuite-connector.zip` dosyasını seçin.
5. **Şimdi Kur (Install Now)** butonuna tıklayın ve kurulum tamamlandığında **Eklentiyi Etkinleştir (Activate Plugin)** butonuna basın.

### Adım 3.3: Eklentiyi Yapılandırın
1. WordPress sol menüsünde **Ayarlar > SeoSuite (Settings > SeoSuite)** yolunu takip edin.
2. Aşağıdaki alanları doldurun:
   - **API Base URL:** `http://localhost:3000/api/v1` (Yerel Next.js sunucunuzun adresi)
   - **API Key:** Adım 2.5'te terminalden kopyaladığınız `gseo_live_...` ile başlayan API anahtarı.
   - **Site ID:** `site_gmedya_dev` (veya seed çıktısında belirtilen site kimliği)
   - **Auto-Score on Save (Kaydederken Otomatik Skorla):** Yazıları her kaydettiğinizde veya güncellediğinizde arka planda otomatik puanlanması için bu seçeneği işaretleyebilirsiniz.
3. **Değişiklikleri Kaydet (Save Changes)** butonuna tıklayın.
4. Ayarlar kaydedildikten sonra formun altındaki **Bağlantıyı Test Et (Test Connection)** butonuna tıklayarak entegrasyonun başarılı olduğunu doğrulayın. `Connection Successful!` mesajını görmelisiniz.

---

## 🔍 4. Projeyi Kontrol Etme ve Test Etme Adımları

Kurulumları tamamladıktan sonra sistemin tüm özelliklerini doğrulamak için aşağıdaki test senaryolarını uygulayabilirsiniz:

### Senaryo A: Yazı Listesinde Skor Sütununu Kontrol Etme
1. WordPress sol menüsünden **Yazılar > Tüm Yazılar (Posts > All Posts)** sekmesine gidin.
2. Listede en sağda **"SeoSuite Skoru"** adında yeni bir sütun göreceksiniz.
3. Henüz analiz edilmemiş yazılar için burada gri renkte `N/A` rozeti yer alır. Analiz edildikçe puanlar renklendirilmiş (Yeşil, Sarı, Turuncu, Kırmızı) skor rozetlerine dönüşecektir.

### Senaryo B: Yazı Editöründe Manuel Skorlama Yapma
1. Yeni bir yazı oluşturun veya mevcut bir yazıyı düzenlemek için **Düzenle (Edit)** butonuna tıklayın.
2. Sayfa düzenleyicinin (Gutenberg veya Klasik Editör) sağ sütununda (Kenar çubuğunda) **"SeoSuite Analizi"** adında bir kutucuk (Metabox) göreceksiniz.
3. Yazınızı kaydedin (Taslağı Kaydet / Save Draft).
4. **"Şimdi Skorla (Score Now)"** butonuna tıklayın.
5. Sayfa kısa bir süre içinde yenilenecek ve sağ panelde güncel **SEO Skoru**, **Skor Bandı**, **Top Issues (En Önemli Sorunlar)** ve **Quick Wins (Hızlı Kazanımlar)** listelenecektir.

### Senaryo C: Hataların ve Limitlerin Simülasyonu
- **Rate Limit Testi:** API sunucumuzda istek sınırı bulunmaktadır. Çok kısa sürede arka arkaya 10-15 kez "Score Now" butonuna basarsanız, sistem güvenli bir şekilde `Rate limit exceeded. Please wait before scoring again.` uyarısı verecektir.
- **API Çevrimdışı Durumu:** Next.js sunucunuzu terminalden geçici olarak kapatın (`Ctrl + C`). WordPress editörüne gidip "Score Now" butonuna basın. Yazınızın kaybolmadığını, eklentinin hata alsa bile WordPress kaydetme akışını bloklamadığını ve kenar çubuğunda açıklayıcı bir timeout/hata mesajı gösterdiğini doğrulayın.
