# Sky Sandbox 2D — DEVİR TESLİM (TAKEOVER)

> Bu dosyayı yeni oturumda **ilk** oku. Sonra `CLAUDE.md`, `BACKLOG.md`, `CHANGELOG.md`.
> Kullanıcı Türkçe konuşuyor → kullanıcıya **Türkçe** cevap ver. Kod/yorum İngilizce kalabilir.

## 1. Proje nedir
Tek dosyalık (`sky-sandbox-2d.html`, ~65 KB, harici bağımlılık yok) **2D yandan görünüşlü uçuş simülatörü**.
Referanslar: App Store'daki *Flight Simulator 2D* ve *Spaceflight Simulator* (SFS). Para/görev/ekonomi **YOK** — serbest uçuş + uçak editörü.
Canlı (claude.ai Artifact): https://claude.ai/artifact/UtqNAhFehFFf4pxbfdr72d
Wireframe (tasarım artifact'ı): https://claude.ai/artifact/XZjnjdiTYwaVjvFchK8Be7  (yerel kopya: `wireframes/`)

## 2. Hızlı başlangıç (Claude Code'da)
```bash
cd sky-sandbox-handover
bash tools/check.sh                       # sözdizimi + smoke test (her değişiklikten sonra)
python3 -m http.server 8000               # sonra tarayıcıda http://localhost:8000/sky-sandbox-2d.html
```
- **Gerçek tarayıcıda (özellikle telefonda, dikey+yatay) elle test et.** `smoke.js` sadece mantığı (DOM stub'lı) doğrular; görsel/CSS/dokunmatik hatalarını YAKALAMAZ.
- Dosya çok uzun satırlardan oluşuyor (minify'a yakın). Düzenlerken **benzersiz alt-dizge** ile `Edit` kullan; bulamazsa `grep -o` ile gerçek metni gör. Büyük yeniden düzenleme için aşağıdaki "Refactor önerisi"ne bak.

## 3. Mimari (tek HTML, tek `<script>`; bölümler yaklaşık bu sırada)
| Bölüm | Önemli semboller |
|---|---|
| Parça kataloğu | `T` (kütle+ad), `A()` ASCII→parça, `V` harf→(tip,varyant), `presets` |
| Fizik yardımcıları | `stats(ps)` → {M,cx,cy,S,E,TL,W,N,thrust,fuel,a,sa,ki,sm}, `G=9.8` |
| Çizim | `dp(c,t,fl,pr,hf,hb,q)` tek hücre çizer; `drawPlane` (öncelik `PR`); `thumb`, `icon` |
| Harita | `MAP{h[241],rw[]}`, `NS=241` (25 m adım), `gh(x)` yükseklik, `slope`, `defMap`, `drawTerrain`, harita editörü (`mEd`) |
| Ölü kod | `DS,PARM,gen,parO,drawPar,openDesigner,dRender,DR` + `#designer` HTML — **"gerçekçi editör", kullanıcı sildirdi; menüden kaldırıldı, güvenle silinebilir** |
| Menü | `buildMenu`, `rwsR` (pist seçici) |
| Uçuş | `startFlight`, `step(dt)` (fizik), `crashNow`, `lose`, `fx` (enkaz/parçacık), `autoEl` (oto-iniş), `emerg` |
| Render/HUD | `drawWorld`, `drawSim`, `drawDebris`, `hud`, `gauges`, `dial`, `snd/beep`, `loop` |
| Kontroller | `km` (klavye), `K` (girdi durumu), panel IIFE'leri (cockpit paneli DOM'u JS ile kurulur) |
| Editör | `openEditor`, `drawEd`, `edAt`, palet IIFE (`CAT`), seçim kutusu IIFE (`#selb`) |

### Veri modeli (EN ÖNEMLİ)
- Uçak = `{name, c:[bodyColor,accentColor], parts:[{t,x,y,v?,txt?}]}`. Hücre = **1 m**, **+x = burun (sağ)**, **+y = yukarı**.
- Tipler: `body cockpit wing engine(eski) prop jet tail wheel gear door tank label`.
- Varyant `v`: boyutlu parçalarda 0/1/2 = S/M/L (`vv=q.v==null?1:q.v`); `gear` 0..3 = 737/747/A380/Beluga (aks sayısı `[2,2,3,3]`, v>0 → çift lastik); `door` 0..3 = yolcu/kargo yan/arka rampa/burun visor; `cockpit` 0..3 = airliner/savaş/pervane/jumbo; `label` metni `q.txt`.
- `stats()` CoM'u (cx,cy) hücre kütlelerinden hesaplar; S=kanat alanı (wing hücre × boyut çarpanı), `a`=kaldırma eğimi (2π), `sa`=stall açısı (.3), `ki`=indüklenmiş sürtünme (.012), `sm`=stabilite çarpanı (1).
- Uçuşta **`sim.live`** (kopmamış parçalar) kullanılır, `sim.p.parts` değil. Parça kopunca `lose()` → enkaza çevirir, `stats(sim.live)` yeniden hesaplanır ama **cx/cy/fuel orijinalde sabit tutulur** (çizim zıplamasın).
- Çizim animasyon durumu **global**: `GS={p:gear geri çekilme 0..1, c:sıkışma, r:tekerlek dönüşü, t:bogie eğimi}`, `GD` kapı açıklığı, `LV` boya rengi. `drawSim`/`drawEd` çizimden önce bunları ayarlar.
- Zemin teması ofsetleri (hücre merkezinden alt): body .5, wheel .8, **gear 1.0**. `startFlight`, `step` zemin döngüsü ve `btm()` aynı değerleri kullanmalı.
- localStorage: `ss2d_planes` (özel uçaklar), **`ss2d_map2`** (harita; eski `ss2d_map` bilerek terk edildi).

### Fizik (step) — formül özeti
- `rho=exp(-y/9000)`. CL: `aa<sa ? a*aoa : sign*max(.4, a*sa*(1-(aa-sa)*1.5))`.
- `lift = v²·rho·.05·S·(CL+.12+flap*.3)·(wingDamage?.55:1)·(1-.65·spoiler)·yerEtkisi`
- `drag = v²·rho·(.003·(N+(1-gp)*3+kapı*2) + S·(flap*.012+spoiler*.035) + ki·S·CL² + stall?.01·S)`
- İtki: `thr·thrust·(kalan motor oranı)·(yangın?.55:1)·(.4+.6·rho)`; prop ≈105, jet ≈98 (×S/M/L .7/1/1.5). Yakıt yakımı `thr·E·.35/s`, kütle `+fuel·.05`.
- Stall: burun düşürme (`om -= sign·1.5·dt`) + titreme. Pitch torku ∝ v²; ground-assist: yerdeyken v>16 ve pilot girdisi yoksa θ→.13.
- **Parça kaybı kuralları:** hava hızı>55 m/s + gear açık + havada → gear kopar; kapı açık + v>30 + havada → kapı kopar; g>5.5 → rastgele kanat hücresi; yangın 14 sn → motorlar; sert iniş: sabit tekerlek >9 m/s, bogie >15 m/s kopar; gövde teması >4.5 m/s kopar; **tüm uçak yok olma (`crashNow`)**: iniş hızı>17, dik yamaç+hız, devrilme, ya da parçaların %60'ından fazlası kaybı.
- Acil durumlar (`emerg`): fire, bird, leak, fail, wing, turb, gear(gj), dpop(dj), ext, fix. (`em.gj`: gear kilitli, `em.dj`: kapı kapanmaz.)

### Kontroller
Klavye: **W/S gaz**, **A burun yukarı / D aşağı** (ok tuşları da), F/G flap, Q spoiler, B/Space fren, L iniş takımı, O kapı, E motor anahtarı, Z tam gaz, X gaz kes, R pist, T hava başlangıcı, M ses kapat.
Mobil: alt cockpit paneli (`#panel`): pitch ▲▼, gaz slider, motor/gear, flap 0-3, spoiler/fren/kapı/AUTO-LAND, ALT/IAS/RPM kadranları + yakıt, üstte pist çubuğu (`#rwb`) ve uyarı lambaları (`#warn`), sağ üstte zoom (+pinch/tekerlek), ⚠ acil durum listesi, ∞ sonsuz yakıt, SOUND.
Kamera uçağı panelin üstündeki alana oturtur: `(H-130)*.58` (3 yerde: `drawWorld` sy, `drawSim`, `drawDebris`).

## 4. Editör (yeniden yapıldı — wireframe'e göre)
- Üst çubuk `#etop`: Geri | isim | canlı istatistik `#es2` (kütle, stall km/h, T/W, yakıt, CG) | Test fly | Save.
- Sol: ızgara (`#ec`, 25×13, hücre 26 px) + zoom/pan + Undo/Mirror/Clear + "3D view" (şimdilik sadece CSS perspektif eğimi). CG dikey kesik çizgi olarak çizilir.
- Sağ: sekmeler (Body, Cockpit, Wings, Engines, Fuel, Gear, Doors, Tail, Text, Tools) → resimli karolar (`icon()` aynı `dp()`'yi kullanır) → S/M/L → seçili parça kutusu (`#selb`: Delete, **Play** animasyonu gear/door, renk seçiciler, etiket metni).
- `Select` aracı: tıkla → parça seçilir (`selP`). Yerleştirme `edAt()`; `label` yerleştirirken `prompt()` ister.
- Dikey/yatay: `#eMain` flex (dikeyde sütun, yatayda 2 sütun), `@media (orientation:landscape)`. Eski `#tools` paleti gizli ama kodda duruyor.

## 5. Kısıtlar / tuzaklar (acı tecrübe)
1. **TDZ**: `const/let` tanımları ilk çalışma anından ÖNCE olmalı. `presets` yükleme anında kurulur → `A`, `V` ondan önce tanımlı olmalı. `smoke.js` bunu yakalar.
2. Yayınlanan sayfa kısıtları (claude.ai Artifact): tek dosya, <16 MB, dış script yalnızca cdnjs/jsdelivr/tailwind/jquery; localStorage çalışır (try/catch ile); `window.storage`/Claude API YOK.
3. `stats()` dönüşünü değiştirirken `ki`, `sa`, `a`, `sm` alanlarını koru (fizik bunlara bağlı). Daha önce `parO` çağrısı unutulunca fizik bozuldu.
4. Tek-yerde-kopya tuzağı: zemin ofsetleri 3 yerde (startFlight/step/btm); kamera ofseti 3 yerde.
5. Dokunmatik: panel `touch-action:pan-x`, slider/canvas `touch-action:none`; gövde `touch-action:none`.
6. Metinlerde tipografik kesme (’) kullan; kod içinde düz tırnak.

## 6. Doğrulama durumu (dürüst durum)
- ✅ `tools/check.sh`: sözdizimi OK; 8 preset yüklenir, stats sonlu; tam gaz + senaryolu rotasyonla hepsi hızlanır (Beluga sınırda: maxAGL≈1); 0 gazda enerji kazancı yok; 10 acil durum hatasız; auto-land çökmeden durur.
- ⚠️ **Gerçek tarayıcıda görsel test YAPILMADI** (sohbet boyunca da yapılamadı). Özellikle: yeni editör düzeni (üst çubuk, seçim kutusu, yatay/dikey), HUD yerleşimi (rwb/warn/top çakışmaları dar telefonda), gear/kapı çizimleri, ses.
- Bu devirden hemen önce yapılan iki düzeltme: (a) gear/kapı aşırı-hız kopması artık yalnızca **havada**; (b) pervane itkisi 70→105 (hafif uçaklar kalkamıyordu).

## 7. Önerilen ilk adımlar (yeni oturum)
1. `bash tools/check.sh` çalıştır → yeşil olmalı.
2. Tarayıcıda aç; menü → her preset'i uç (kalkış, iniş takımı L, flap F, kapı O); editörü dikey+yatay dene; sorun listesi çıkar.
3. `BACKLOG.md` sırasına göre ilerle. Her değişiklik sonrası `check.sh`.
4. Kullanıcıyla her büyük özellikten önce kısaca onay al (kullanıcı önce wireframe görmek istedi, "izin vermeden yapma" dedi).

## 8. Refactor önerisi (isteğe bağlı, riskli → önce kullanıcıya sor)
Dosyayı `src/` altında modüllere bölüp (`parts.js, physics.js, render.js, ui.js, editor.js`) `tools/build.py` ile tek HTML'e birleştirmek bakımı kolaylaştırır. Yayınlanan artifact tek dosya kalmalı. Yapmadan önce `check.sh`'in yeşil olduğundan emin ol; yük sırası (TDZ) bozulmasın.
