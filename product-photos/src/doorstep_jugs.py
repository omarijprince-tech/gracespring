from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
R=''  # run from the repo root
GRACE='product-photos/src/grace-spring-jug-cutout.png'  # made with product-photos/src/jug_cutout.py
bg=Image.open('product-photos/src/doorstep-original.png').convert('RGBA')
S=2; bg=bg.resize((bg.width*S,bg.height*S),Image.LANCZOS)
def load(p): j=Image.open(R+p).convert('RGBA'); return j.crop(j.getbbox())
spring=Image.open(GRACE).convert('RGBA'); spring=spring.crop(spring.getbbox()); spring=ImageEnhance.Color(spring).enhance(0.8); spring=ImageEnhance.Brightness(spring).enhance(1.04); blue=load('RoutesTab.js'); alk=load('purified-5gal.png')
# drop the grey floor shadow baked into the ALKAID cutout
ap=alk.load()
for y in range(alk.height-110,alk.height):
    for x in range(alk.width):
        r,g,b,a=ap[x,y]
        if a and abs(r-g)<14 and abs(g-b)<16 and b-r<18: ap[x,y]=(r,g,b,0)
alk=alk.crop(alk.getbbox())
out=bg.copy()
def soften(j):
    j=ImageEnhance.Contrast(j).enhance(0.88); j=ImageEnhance.Color(j).enhance(0.88); j=ImageEnhance.Brightness(j).enhance(0.94)
    return j.filter(ImageFilter.GaussianBlur(0.5))
def shadow(cx,yb,w):
    pad=40; h=14; m=Image.new('L',(w+2*pad,h+2*pad),0)
    ImageDraw.Draw(m).ellipse((pad,pad,pad+w,pad+h),fill=150); m=m.filter(ImageFilter.GaussianBlur(7))
    s=Image.new('RGBA',m.size,(20,25,35,0)); s.putalpha(m); out.alpha_composite(s,(int(cx-w/2-pad),int(yb-h/2-pad)))
# old jug boxes (original px): x0,x1 ; bottom 334
boxes=[(183,245),(249,312),(314,378)]
bottom=335
for (x0,x1),j in zip(boxes,[spring,blue,alk]):
    w=int((x1-x0+4)*S); h=int(j.height*w/j.width)
    jj=soften(j.resize((w,h),Image.LANCZOS))
    cx=(x0+x1)/2*S
    shadow(cx,bottom*S-2,int(w*0.92))
    out.alpha_composite(jj,(int(cx-w/2),int(bottom*S-h)))
out.convert('RGB').save('product-photos/doorstep-delivery-blue-star-jugs.jpg',quality=93)

