// Headless smoke test (DOM stub'lu). Kullanim: node tools/smoke.js [html]
// Yakalar: yukleme hatalari (TDZ/ReferenceError), preset stats, kalkis, 0 gazda tirmanma, acil durumlar, auto-land.
// YAKALAMAZ: gorsel/CSS/dokunmatik sorunlar -> mutlaka gercek tarayicida (telefon dahil) elle test et.
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','sky-sandbox-2d.html'),'utf8');
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const mk=()=>{const f=function(){};return new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='length')return 0;if(k==='then')return undefined;
 if(['children','firstChild','parentNode','style','classList','dataset'].includes(k))return mk();
 if(k==='getBoundingClientRect')return()=>({left:0,top:0,width:650,height:300});if(k==='querySelector')return()=>mk();if(k==='querySelectorAll')return()=>[];
 if(k==='value')return'';if(k==='width'||k==='height')return 650;return t[k]!==undefined?t[k]:mk()},set(t,k,v){t[k]=v;return true},apply(){return mk()},construct(){return mk()}})};
const els={},store={};
const g={document:{getElementById:id=>els[id]||(els[id]=mk()),createElement:()=>mk(),querySelectorAll:()=>[],addEventListener(){}},
 localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},innerWidth:900,innerHeight:420,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},
 performance:{now:()=>0},setInterval(){},clearInterval(){},setTimeout(){},prompt:()=>'TXT',console,Math,JSON,Set,Array,Object,Number,String,Date,Proxy,Symbol,parseInt,parseFloat,isNaN};
g.window=g;vm.createContext(g);
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
try{vm.runInContext(code,g);ok(true,'script yuklendi')}catch(e){console.log('FAIL yukleme:',e.stack.split('\n').slice(0,4).join('\n'));process.exit(1)}
const R=s=>vm.runInContext(s,g);
R(`var __r=[];`);
const names=R(`presets.map(p=>p.name)`);
for(let i=0;i<names.length;i++){
 const r=R(`(()=>{const p=presets[${i}],s=stats(p.parts);const fin=[s.M,s.S,s.thrust,s.fuel,s.cx,s.cy].every(Number.isFinite);
  startFlight(p,false);sim.thr=1;let maxy=0,crashed=0;const vs=Math.sqrt((s.M+s.fuel*.05)*9.8/(.05*Math.max(.1,s.S)*(s.a*s.sa+.12)));for(let k=0;k<2400;k++){const sp=Math.hypot(sim.vx,sim.vy);K.up=(sp>1.15*vs&&sim.th<.22&&!sim.crash)?1:0;K.down=sim.th>.35?1:0;step(1/60);maxy=Math.max(maxy,sim.y-sim.hg);if(sim.crash>0)crashed=1}
  K.down=0;K.up=0;return {fin,E:s.E,maxy,v:Math.hypot(sim.vx,sim.vy),crashed,live:sim.live.length,n:p.parts.length}})()`);
 ok(r.fin,names[i]+': stats sonlu'); if(r.E>0) ok(r.maxy>10,`${names[i]}: tam gazda kalkis/hizlanma (maxAGL=${r.maxy.toFixed(0)}, v=${r.v.toFixed(0)})`);
}
// 0 gazda enerji kazanci olmamali (hava baslangici, gaz 0)
const gl=R(`(()=>{startFlight(presets[0],true);sim.thr=0;const y0=sim.y;let mx=0;for(let k=0;k<1800;k++){step(1/60);mx=Math.max(mx,sim.y-y0)}return mx})()`);
ok(gl<60,`0 gazda tirmanma sinirli (max +${gl.toFixed(0)} m; zoom-climb haric artmamali)`);
// acil durumlar
for(const k of['fire','bird','leak','fail','wing','turb','gear','dpop','ext','fix']){try{R(`startFlight(presets[0],true);emerg('${k}');for(let i=0;i<120;i++)step(1/60)`);ok(true,'acil durum: '+k)}catch(e){ok(false,'acil durum '+k+': '+e.message)}}
// auto-land
try{const a=R(`(()=>{startFlight(presets[0],true);sim.al=1;let c=0;for(let i=0;i<9000;i++){step(1/60);if(sim.crash>0)c=1}return {al:sim.al,c,v:Math.hypot(sim.vx,sim.vy),agl:sim.y-sim.hg-gh(sim.x)}})()`);
 ok(!a.c,'auto-land: crash yok');ok(a.v<5&&a.agl<3,`auto-land: durdu (v=${a.v.toFixed(1)})`)}catch(e){ok(false,'auto-land '+e.message)}
// auto-land acikken kalkis kosusunda frenlememeli
try{const a=R(`(()=>{startFlight(presets[0],false);sim.al=1;sim.alAir=0;sim.thr=1;for(let i=0;i<300;i++)step(1/60);return {v:sim.vx,al:sim.al}})()`);ok(a.v>10,`auto-land yerde frenlemiyor (v=${a.v.toFixed(0)})`)}catch(e){ok(false,'auto-land yer '+e.message)}
// kanat kaybi -> burun asagi egilimi (asimetri)
try{const w=R(`(()=>{const run=b=>{startFlight(presets[4],true);sim.thr=.7;for(let i=0;i<60;i++)step(1/60);if(b){const ws=sim.live.filter(q=>q.t=='wing');lose(ws.slice(0,Math.floor(ws.length/2)),5)}for(let i=0;i<120;i++)step(1/60);return sim.th};return [run(0),run(1)]})()`);ok(w[1]<w[0]-.05,`kanat kaybi burnu asagi ceker (saglam ${w[0].toFixed(2)} -> hasarli ${w[1].toFixed(2)})`)}catch(e){ok(false,'kanat asimetri '+e.message)}
// sifir hiz + sifir gazda yerde burun kalkmamali
try{const a=R(`(()=>{startFlight(presets[4],false);K.up=1;for(let i=0;i<240;i++)step(1/60);K.up=0;return sim.th})()`);ok(Math.abs(a)<.02,`durgun ucak pitch yapmiyor (th=${a.toFixed(3)})`)}catch(e){ok(false,'durgun pitch '+e.message)}
// secilen motor yanar, digerleri yanmaz; sadece o motor kopar
try{const r=R(`(()=>{startFlight(presets[4],true);const e=sim.live.filter(q=>isEng(q.t));const n0=e.length;e[0].fire=1;e[0].ft=0;step(1/60);const only=!!sim.em.fire&&!e[1].fire;for(let i=0;i<60*16;i++)step(1/60);return {only,n0,n1:sim.live.filter(q=>isEng(q.t)).length}})()`);ok(r.only&&r.n1==r.n0-1,`tek motor yangini (motor ${r.n0}->${r.n1})`)}catch(e){ok(false,'motor yangin '+e.message)}
// secilen iniş takimi sikisir
try{const r=R(`(()=>{startFlight(presets[4],true);const g=sim.live.filter(q=>q.t=='gear');g[0].jam=1;sim.gu=0;for(let i=0;i<60*4;i++)step(1/60);return {a:g[0].gp,b:g[1].gp}})()`);ok(r.a>.95&&r.b<.05,`tek iniş takimi sikisti (sikisan ${r.a.toFixed(2)}, diger ${r.b.toFixed(2)})`)}catch(e){ok(false,'gear jam '+e.message)}
// iniş / kaza sonrasi sonuc ekrani
try{const r=R(`(()=>{startFlight(presets[0],true);sim.al=1;for(let i=0;i<9000;i++){step(1/60)}const a=sim.st.shown,td=sim.st.td;startFlight(presets[0],true);sim.vy=-70;sim.y=gh(sim.x)+25;for(let i=0;i<600;i++)step(1/60);return {a,td:!!td,b:sim.st.shown,crash:sim.crash>0}})()`);ok(r.a==1&&r.td,'inis sonrasi sonuc ekrani acildi');ok(r.b==1&&r.crash,'kaza sonrasi sonuc ekrani acildi')}catch(e){ok(false,'sonuc ekrani '+e.message)}
// auto-land: yumusak inis (sink < 3 m/s) ve pistte durus
for(const i of [0,4,5]){try{const r=R(`(()=>{window.INF=true;RW=0;startFlight(presets[${i}],true);sim.x=MAP.rw[0].x+100;sim.y=gh(sim.x)+450;sim.al=1;for(let k=0;k<20000;k++){step(1/60);if(sim.crash>0||sim.st.shown)break}window.INF=false;const rw=MAP.rw.find(r=>sim.x>=r.x-5&&sim.x<=r.x+r.len+5);return {c:sim.crash>0,vs:sim.st.td?sim.st.td.vs:99,rw:!!rw,shown:sim.st.shown}})()`);ok(!r.c&&r.shown&&r.rw&&r.vs<3,`auto-land ${names[i]}: yumusak inis ve pistte durus (sink ${r.vs.toFixed(1)} m/s)`)}catch(e){ok(false,'auto-land '+e.message)}}
// her parca tipi bir seyler ciziyor mu (kaybolan parca hatasi)
try{const bad=R(`(()=>{const out=[];LV=DEF;for(const t of Object.keys(T)){let n=0;const c=new Proxy({},{get:(o,k)=>k=='createLinearGradient'||k=='createRadialGradient'?()=>({addColorStop(){}}):k=='measureText'?()=>({width:1}):(...a)=>{if(k=='fill'||k=='stroke'||k=='fillRect'||k=='fillText')n++},set:()=>true});try{dp(c,t,.5,0,1,1,{v:1,txt:'X'})}catch(e){n=-1}if(n<=0)out.push(t)}return out.join(',')})()`);ok(bad=='','her parca tipi cizilebiliyor'+(bad?' (cizilmeyen: '+bad+')':''))}catch(e){ok(false,'cizim testi '+e.message)}
console.log(fail?`\n${fail} TEST BASARISIZ`:'\nTUM TESTLER GECTI');process.exit(fail?1:0);
