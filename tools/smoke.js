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
  startFlight(p,false);sim.thr=1;let maxy=0,crashed=0;for(let k=0;k<1500;k++){const sp=Math.hypot(sim.vx,sim.vy),agl=sim.y-sim.hg-gh(sim.x);K.up=(sp>26&&agl<12&&!sim.crash)?1:0;step(1/60);maxy=Math.max(maxy,sim.y-sim.hg);if(sim.crash>0)crashed=1}
  K.up=0;return {fin,E:s.E,maxy,v:Math.hypot(sim.vx,sim.vy),crashed,live:sim.live.length,n:p.parts.length}})()`);
 ok(r.fin,names[i]+': stats sonlu'); if(r.E>0) ok(r.maxy>3||r.v>10,`${names[i]}: tam gazda kalkis/hizlanma (maxAGL=${r.maxy.toFixed(0)}, v=${r.v.toFixed(0)})`);
}
// 0 gazda enerji kazanci olmamali (hava baslangici, gaz 0)
const gl=R(`(()=>{startFlight(presets[0],true);sim.thr=0;const y0=sim.y;let mx=0;for(let k=0;k<1800;k++){step(1/60);mx=Math.max(mx,sim.y-y0)}return mx})()`);
ok(gl<60,`0 gazda tirmanma sinirli (max +${gl.toFixed(0)} m; zoom-climb haric artmamali)`);
// acil durumlar
for(const k of['fire','bird','leak','fail','wing','turb','gear','dpop','ext','fix']){try{R(`startFlight(presets[0],true);emerg('${k}');for(let i=0;i<120;i++)step(1/60)`);ok(true,'acil durum: '+k)}catch(e){ok(false,'acil durum '+k+': '+e.message)}}
// auto-land
try{const a=R(`(()=>{startFlight(presets[0],true);sim.al=1;let c=0;for(let i=0;i<9000;i++){step(1/60);if(sim.crash>0)c=1}return {al:sim.al,c,v:Math.hypot(sim.vx,sim.vy),agl:sim.y-sim.hg-gh(sim.x)}})()`);
 ok(!a.c,'auto-land: crash yok');ok(a.v<5&&a.agl<3,`auto-land: durdu (v=${a.v.toFixed(1)})`)}catch(e){ok(false,'auto-land '+e.message)}
console.log(fail?`\n${fail} TEST BASARISIZ`:'\nTUM TESTLER GECTI');process.exit(fail?1:0);
