#!/usr/bin/env python3
"""HTML icindeki oyun JS'ini /tmp/game.js (veya argv[2]) dosyasina cikarir. Kullanim: python3 tools/extract.py [html] [out.js]"""
import re,sys
src=sys.argv[1] if len(sys.argv)>1 else 'sky-sandbox-2d.html'
out=sys.argv[2] if len(sys.argv)>2 else '/tmp/game.js'
s=open(src,encoding='utf-8').read()
m=re.findall(r'<script>(.*?)</script>',s,re.S)
open(out,'w',encoding='utf-8').write(m[-1]); print('extracted',len(m[-1]),'bytes ->',out)
