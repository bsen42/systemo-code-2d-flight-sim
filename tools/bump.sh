#!/usr/bin/env bash
# Y (patch) degerini 1 artirir ve tarih/saati gunceller. x'i (minor) ELLE degistirme: sadece kullanici isterse.
set -e
cd "$(dirname "$0")/.."
python3 - <<'PY'
import re,datetime
p='sky-sandbox-2d.html'
s=open(p).read()
m=re.search(r'<span id="ver">v(\d+)\.(\d+)\.(\d+) · ([^<]*)</span>',s)
a,x,y=int(m.group(1)),int(m.group(2)),int(m.group(3))
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
new='<span id="ver">v%d.%d.%d · %s</span>'%(a,x,y+1,now)
s=s.replace(m.group(0),new)
open(p,'w').write(s)
print(new)
PY
