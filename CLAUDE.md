# CLAUDE.md — Sky Sandbox 2D
- Kullanıcıya **Türkçe** cevap ver. Kısa ve net ol; yapılmayanı yapılmış gibi söyleme (test etmediysen "test etmedim" de).
- Önce `TAKEOVER.md`, `BACKLOG.md` oku. Kaynak: `sky-sandbox-2d.html` (tek dosya; tek `<script>`).
- Her değişiklikten sonra: `bash tools/check.sh` (sözdizimi + smoke). Görsel/dokunmatik için gerçek tarayıcıda dene (dikey+yatay telefon).
- Kullanıcı büyük özellikten önce **wireframe/onay** istedi; büyük değişiklikte önce planı/taslağı göster, izin bekle.
- Kısıtlar: tek dosya, harici kaynak yok, para/görev sistemi YOK, localStorage try/catch, `ss2d_planes` / `ss2d_map2` anahtarları.
- Uçak veri modeli: `{t,x,y,v?,txt?}` hücre=1 m, +x burun, +y yukarı. Uçuşta `sim.live` kullan. Zemin ofsetleri: body .5, wheel .8, gear 1.0 (3 yerde aynı kalmalı).
- Yeni `const/let` eklerken yükleme sırasına (TDZ) dikkat et.
- Ölü kod (`gen/parO/drawPar/openDesigner/...`) kullanıcı isteğiyle silinmiş özellik; yeniden bağlama.
