from PIL import Image, ImageFilter, ImageDraw, ImageFont
import math, sys
SRC='product-photos/src/cooler-stand.webp'
JUG='RoutesTab.js'
F='/usr/share/fonts/opentype/inter/'
def font(n,s): return ImageFont.truetype(F+n,s)
W=2048
NAVY=(16,34,82); BLUE=(31,118,191); SKY=(234,244,252); GOLD=(245,166,35); WHITE=(255,255,255)
lang=sys.argv[1] if len(sys.argv)>1 else 'en'
T={'en':dict(pill='MEGA SALE · WHILE SUPPLIES LAST',h1='Water Cooler',h2='+ 5 Purified Bottles FREE',h3='+ 1 Bottle Stand FREE',
            free1='FREE',free2='5 BOTTLES',free3='+ STAND',foot='Delivered to NJ & NY  ·  Se Habla Español  ·  973-742-0435',brand='BLUE STAR PURE WATER'),
   'es':dict(pill='MEGA OFERTA · HASTA AGOTAR EXISTENCIAS',h1='Dispensador de agua',h2='+ 5 botellas purificadas GRATIS',h3='+ 1 estante GRATIS',
            free1='GRATIS',free2='5 BOTELLAS',free3='+ ESTANTE',foot='Entregas en NJ y NY  ·  Hablamos español  ·  973-742-0435',brand='BLUE STAR PURE WATER')}[lang]
c=Image.new('RGBA',(W,W),SKY+(255,))
d=ImageDraw.Draw(c)
# top gradient band with wave edge
top=Image.new('RGBA',(W,W),(0,0,0,0)); td=ImageDraw.Draw(top)
band=700
for y in range(band+120):
    t=y/(band+120); col=tuple(int(NAVY[i]*(1-t)+BLUE[i]*t) for i in range(3))
    td.line([(0,y),(W,y)],fill=col+(255,))
mask=Image.new('L',(W,W),0); md=ImageDraw.Draw(mask)
pts=[(0,0),(W,0)]+[(x, band+40*math.sin(x/W*2*math.pi*1.2+0.6)) for x in range(W,-1,-16)]
md.polygon(pts,fill=255)
top.putalpha(mask); c.alpha_composite(top)
# lighter second wave
w2=Image.new('RGBA',(W,W),(0,0,0,0)); wd=ImageDraw.Draw(w2)
pts2=[(x, band+40*math.sin(x/W*2*math.pi*1.2+0.6)) for x in range(0,W+1,16)]+[(x, band+70+30*math.sin(x/W*2*math.pi*1.2+1.4)) for x in range(W,-1,-16)]
wd.polygon(pts2,fill=(159,208,245,255)); c.alpha_composite(w2)
d=ImageDraw.Draw(c)
def ctext(y,txt,f,fill):
    w=d.textlength(txt,font=f); d.text(((W-w)/2,y),txt,font=f,fill=fill); return f.getbbox(txt)[3]
# brand line
ctext(52,T['brand'],font('Inter-Bold.otf',44),(159,208,245))
# pill
pf=font('Inter-ExtraBold.otf',46); pw=d.textlength(T['pill'],font=pf)+90; px=(W-pw)/2
d.rounded_rectangle((px,122,px+pw,204),radius=41,fill=GOLD); ctext(137,T['pill'],pf,NAVY)
# headline (auto-fit)
def fit(txt,name,size,maxw):
    while d.textlength(txt,font=font(name,size))>maxw: size-=4
    return font(name,size)
ctext(232,T['h1'],fit(T['h1'],'InterDisplay-Black.otf',136,1850),WHITE)
ctext(395,T['h2'],fit(T['h2'],'InterDisplay-ExtraBold.otf',92,1850),(159,208,245))
ctext(518,T['h3'],fit(T['h3'],'InterDisplay-ExtraBold.otf',92,1850),(159,208,245))
# products
back=Image.open(SRC).convert('RGBA'); back=back.crop(back.getbbox())
jug=Image.open(JUG).convert('RGBA'); jug=jug.crop(jug.getbbox())
def floor_shadow(cx,cy,w,h,op):
    pad=h*3; m=Image.new('L',(w+2*pad,h+2*pad),0)
    ImageDraw.Draw(m).ellipse((pad,pad,pad+w,pad+h),fill=op); m=m.filter(ImageFilter.GaussianBlur(h*0.6))
    s=Image.new('RGBA',m.size,(25,35,60,0)); s.putalpha(m); c.alpha_composite(s,(int(cx-w/2-pad),int(cy-h/2-pad)))
def put(im,h,x,yb,op=110):
    w=int(im.width*h/im.height); j=im.resize((w,h),Image.LANCZOS)
    floor_shadow(x+w/2,yb-h*0.01,int(w*0.95),max(12,int(h*0.06)),op); c.alpha_composite(j,(int(x),int(yb-h))); return w
floor=1860; bh=1060; bw=int(back.width*bh/back.height); bx=(W-bw)//2-60
put(back,bh,bx,floor-110,70)
jh=450; jw=int(jug.width*jh/jug.height); g=-14
tot=5*jw+4*g; x0=(W-tot)//2
for i in range(5): put(jug,jh,x0+i*(jw+g),floor)
# FREE burst
cx,cy,r=1745,960,170
burst=Image.new('RGBA',(W,W),(0,0,0,0)); bd=ImageDraw.Draw(burst)
pts=[]
for k in range(48):
    a=k*math.pi/24; rr=r if k%2==0 else r*0.88; pts.append((cx+rr*math.cos(a),cy+rr*math.sin(a)))
bd.polygon(pts,fill=GOLD+(255,))
sh=burst.split()[-1].filter(ImageFilter.GaussianBlur(14)); s=Image.new('RGBA',(W,W),(25,35,60,0)); s.putalpha(sh.point(lambda v:int(v*0.35)))
c.alpha_composite(s,(0,10)); c.alpha_composite(burst)
d=ImageDraw.Draw(c)
for txt,f,yy in [(T['free1'],fit(T['free1'],'InterDisplay-Black.otf',92,270),cy-105),(T['free2'],fit(T['free2'],'Inter-ExtraBold.otf',44,260),cy+2),(T['free3'],fit(T['free3'],'Inter-ExtraBold.otf',44,260),cy+52)]:
    w=d.textlength(txt,font=f); d.text((cx-w/2,yy),txt,font=f,fill=NAVY)
# footer strip
d.rectangle((0,1890,W,W),fill=NAVY)
ff=fit(T['foot'],'Inter-Bold.otf',54,1900); ctext(1938,T['foot'],ff,WHITE)
c.convert('RGB').save(f'promo_{lang}.jpg',quality=92)
t=c.convert('RGB'); t.thumbnail((800,800)); t.save(f'promo_{lang}_s.png')
