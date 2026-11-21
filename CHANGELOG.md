# CHANGELOG (sohbet sırasıyla; kullanıcı istekleri → yapılanlar)
1. **İlk sürüm**: 2D yandan uçuş, 5 preset, serbest uçuş (para yok), hücre tabanlı editör. Tek HTML artifact.
2. **Görsel/oynanış**: daha iyi preset çizimleri, gerçekçi çarpma (enkaz+duman), daha kolay kalkış, SFS tarzı cam butonlar.
3. **Liveri/yakıt/harita**: boya (2 renk), yakıt+ağırlık, kanat-gövde birleşme hatası düzeltildi, yoğunluk-irtifa, harita editörü, 3 pist, acil durumlar (yangın, kuş, yakıt sızıntısı, motor arızası, kanat hasarı, türbülans).
4. **Kontroller**: W/S gaz, A/D pitch, flap/spoiler/fren.
5. "Gerçekçi parametrik editör" yapıldı → **kullanıcı sildirdi**; blok editör geliştirildi.
6. **Mobil cockpit paneli** (SFS referans fotoğrafı), zoom (butonlar+pinch+tekerlek), geri çekilebilir iniş takımı, kapılar, parça kaybı (tüm uçak değil), uçak kamera ofseti (panelin üstü).
7. Resimli palet, **pervane + jet motor** (eski "roket" motor kaldırıldı), Beluga tarzı çift tekerlekli bogie, tekerlek dönüşü/süspansiyon/bogie eğimi, sonsuz yakıt butonu, "0 gazda yükselme" düzeltmesi (kaldırma azaltıldı).
8. Editör dikey/yatay düzen + zoom/pan.
9. **Wireframe** (3 pano) hazırlandı, kullanıcı onayladı; iniş takımı z-sırası düzeltildi.
10. **Büyük güncelleme**: sekmeli katalog + S/M/L varyantlar, 737/747/A380/Beluga gear, 4 kapı tipi (animasyonlu), 4 kokpit, metin etiketi, daha iyi stall, gear-arızası/kapı-açılması acil durumları, arazi uyarısı + sesli uyarı, pist mesafe çubuğu, AUTO-LAND, 5 pist, 747 + Beluga preset.
11. Kullanıcı "wireframe'ler farklıydı" dedi → editör üst çubuğu, canlı istatistik, CG çizgisi, seçili-parça kutusu (Play/renk/etiket), 3D view (CSS), HUD pist çubuğu + üst uyarı lambaları + büyük AUTO-LAND düzeni uygulandı. (Görsel doğrulama yapılmadı.)
12. **Devir hazırlığı sırasında**: smoke test yazıldı; iki hata bulundu/düzeltildi (yerde aşırı-hız gear kopması; pervane itkisi).
13. **Efekt güncellemesi** (yeni oturum): pist kutusu (`#rwb`) CSS çakışması düzeltildi (ekranı kaplıyordu; artık küçük, dokununca daralır); **Mouse pitch** modu (🖱 MOUSE düğmesi, burun imleci takip eder); parçacık sistemi (`P_`, `emitN`, `drawPt`): motor yangını (alev+duman), yakıt sızıntısı, motor arızası dumanı, büyük patlama (flaş, şok halkası, kıvılcım), gerçek kuş çarpması (kuş yaklaşır, tüyler), flap/spoiler çizimi (`GS.f`, `GS.s`), kuyruk çarpması + sürtünme kıvılcımı, iniş lastik dumanı. Playwright (headless Chromium) ile masaüstü ekran görüntüleri alındı; gerçek telefonda test edilmedi.
