# Usage (from the repo root): python3 product-photos/src/bundle_promo.py en 288 388  (lang, price, compare-at price)
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import math, sys
SRC='product-photos/src/cooler-stand.webp'
JUG='RoutesTab.js'
F='/usr/share/fonts/opentype/inter/'
def font(n,s): return ImageFont.truetype(F+n,s)
lang,PRICE,WAS=(sys.argv[1:4]+['en','288','388'][len(sys.argv)-1:])[:3]
W=2048
NAVY=(16,34,82); BLUE=(31,118,191); SKY=(240,246,252); GOLD=(245,166,35); WHITE=(255,255,255); PALE=(170,212,245)
T={'en':dict(pill='MEGA SALE',h1='Water Cooler',h2='+ 5 Purified Bottles & Stand FREE',foot='Delivered to NJ & NY  ·  973-742-0435'),
   'es':dict(pill='MEGA OFERTA',h1='Dispensador de agua',h2='+ 5 botellas purificadas y estante GRATIS',foot='Entregas en NJ y NY  ·  973-742-0435')}[lang]
c=Image.new('RGBA',(W,W),SKY+(255,))
band=640
top=Image.new('RGBA',(W,W),(0,0,0,0)); td=ImageDraw.Draw(top)
for y in range(band+80):
    t=y/(band+80); td.line([(0,y),(W,y)],fill=tuple(int(NAVY[i]*(1-t)+BLUE[i]*t) for i in range(3))+(255,))
mask=Image.new('L',(W,W),0)
ImageDraw.Draw(mask).polygon([(0,0),(W,0)]+[(x,band+28*math.sin(x/W*2*math.pi*1.1+0.6)) for x in range(W,-1,-16)],fill=255)
top.putalpha(mask); c.alpha_composite(top)
d=ImageDraw.Draw(c)
def fit(txt,name,size,maxw):
    while d.textlength(txt,font=font(name,size))>maxw: size-=4
    return font(name,size)
def ctext(y,txt,f,fill):
    w=d.textlength(txt,font=f); d.text(((W-w)/2,y),txt,font=f,fill=fill)
# pill
pf=font('Inter-ExtraBold.otf',44); pw=d.textlength(T['pill'],font=pf)+80; px=(W-pw)/2
d.rounded_rectangle((px,80,px+pw,156),radius=38,fill=GOLD); ctext(93,T['pill'],pf,NAVY)
ctext(190,T['h1'],fit(T['h1'],'InterDisplay-Black.otf',132,1800),WHITE)
ctext(355,T['h2'],fit(T['h2'],'InterDisplay-Bold.otf',74,1800),PALE)
# price row: $288  $388 (struck)
pf2=font('InterDisplay-Black.otf',96); wf=font('InterDisplay-SemiBold.otf',60)
p1='$'+PRICE; p2='$'+WAS; w1=d.textlength(p1,font=pf2); w2=d.textlength(p2,font=wf); gap=34
x=(W-(w1+gap+w2))/2; y=455
d.text((x,y),p1,font=pf2,fill=WHITE)
bb=wf.getbbox(p2); y2=y+pf2.getbbox(p1)[3]-bb[3]
d.text((x+w1+gap,y2),p2,font=wf,fill=PALE)
ym=y2+(bb[1]+bb[3])//2; d.line((x+w1+gap-4,ym,x+w1+gap+w2+4,ym),fill=PALE,width=6)
# products
back=Image.open(SRC).convert('RGBA'); back=back.crop(back.getbbox())
jug=Image.open(JUG).convert('RGBA'); jug=jug.crop(jug.getbbox())
def floor_shadow(cx,cy,w,h,op):
    pad=h*3; m=Image.new('L',(w+2*pad,h+2*pad),0)
    ImageDraw.Draw(m).ellipse((pad,pad,pad+w,pad+h),fill=op); m=m.filter(ImageFilter.GaussianBlur(h*0.6))
    s=Image.new('RGBA',m.size,(25,35,60,0)); s.putalpha(m); c.alpha_composite(s,(int(cx-w/2-pad),int(cy-h/2-pad)))
def put(im,h,x,yb,op=100):
    w=int(im.width*h/im.height); j=im.resize((w,h),Image.LANCZOS)
    floor_shadow(x+w/2,yb-h*0.01,int(w*0.95),max(12,int(h*0.06)),op); c.alpha_composite(j,(int(x),int(yb-h))); return w
floor=1900; bh=1080; bw=int(back.width*bh/back.height); bx=(W-bw)//2-40
put(back,bh,bx,floor-120,60)
jh=440; jw=int(jug.width*jh/jug.height); g=-12; tot=5*jw+4*g; x0=(W-tot)//2
for i in range(5): put(jug,jh,x0+i*(jw+g),floor)
# small footer line
ctext(1945,T['foot'],font('Inter-SemiBold.otf',44),(80,95,120))
c.convert('RGB').save(f'promo_{lang}.jpg',quality=92)
t=c.convert('RGB'); t.thumbnail((800,800)); t.save(f'promo_{lang}_s.png')
