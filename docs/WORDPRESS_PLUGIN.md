# GSeoSuite WordPress Plugin Public Beta

## Özellikler

- Site score endpoint'ine otomatik submit
- AI Visibility sonuçlarını WordPress admin panelinde gösterme
- Hızlı kazanımlar listesi

## Kurulum

1. `plugins/gseosuite/` klasörünü WordPress `wp-content/plugins/` altına kopyalayın.
2. Eklentiyi WordPress admin'den aktif edin.
3. Ayarlar sayfasından API URL ve API Key girin.

## Geliştirme Notu

Plugin kodu `packages/wordpress-plugin/` altına eklenecektir. Beta aşamasında temel kanca noktaları:

- `admin_menu` — Ayarlar sayfası
- `save_post` — İçerik güncellendiğinde otomatik score tetikleme
- `add_meta_box` — Editör yan panelinde score göstergesi
