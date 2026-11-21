# BACKLOG / bilinen sorunlar

## Öncelik 1 — doğrulama & hata avı (önce bunlar)
- [ ] Gerçek tarayıcıda (telefon dikey+yatay) yeni editör düzenini doğrula; wireframe ile karşılaştır (`wireframes/`). Çakışma/taşma varsa düzelt.
- [ ] HUD çakışmaları: `#rwb`, `#warn`, `#top`, `#info`, `#zb` dar ekranda; `#panel` yatay kaydırma.
- [ ] Beluga preset'i marjinal (tam gazda zor kalkıyor) → kanat/itki dengesi.
- [ ] Auto-land: `(K.br||sim.al)&&cw` → oto-iniş açıkken kalkış koşusunda frenler. Sadece iniş fazında frenle. İlk sürüm; sert/pist ıskalayabilir; go-around yok.
- [ ] `lose()` sonrası `sim.s` yeniden kuruluyor; kanat kaybında asimetri yok (sadece alan azalır).
- [ ] Ses: sadece kare dalga bip; kullanıcı sesli uyarıları "warning sound" olarak istedi → daha iyi ses (ör. "PULL UP" sesi/konuşma).

## Öncelik 2 — wireframe'de olup yapılmayanlar
- [ ] Editör: **Systems** ve **Paint** sekmeleri, **XL** boyut, gear "Fixed/Retract" çipleri, "Can fail" anahtarı (parça bazlı arıza), gerçek 3B önizleme (şu an sadece CSS eğimi).
- [ ] Motor varyantlarının görsel farkı (S/M/L çizimde aynı).
- [ ] 737 preset'i (737 gear karosu var, preset yok), daha fazla preset (ör. bush uçağı, A380, savaş uçağı).
- [ ] Acil durumlar: **hidrolik kaybı, flap sıkışması**, elektrik, kapı kopması görseli.
- [ ] **FLIP** (uçağı ters yöne çevir) ve gelişmiş AUTO-LAND (go-around, ILS çizgisi).
- [ ] Daha gerçekçi stall (kanat düşmesi/spin), flap çizimde görünür animasyon, spoiler görseli.
- [ ] Parçalar daha gerçekçi görünsün (kullanıcı tekrar istedi): panel çizgileri, kanat flap/aileron çizimi, motor nacelle detayları.

## Öncelik 3 — temizlik
- [ ] Ölü kod: parametrik tasarımcı (`DS,PARM,gen,parO,drawPar,openDesigner,dRender,DR,#designer`), eski `#tools` paleti, eski `thumb`/`openEditor` kalıntıları.
- [ ] Kod bölme (`src/` + build) — önce kullanıcıya sor.
- [ ] Harita editöründe dikey/yatay düzen ve yeni piste uyarlama.
