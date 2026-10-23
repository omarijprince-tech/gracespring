from PIL import Image, ImageFilter, ImageChops, ImageDraw
import sys
src,dst=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGB')
bgc=(241,240,238)
bl=im.filter(ImageFilter.GaussianBlur(1.2))
diff=ImageChops.difference(bl, Image.new('RGB',im.size,bgc))
r,g,b=diff.split(); d=ImageChops.lighter(ImageChops.lighter(r,g),b)
cand=d.point(lambda v: 255 if v<11 else 0)          # background-like pixels
# flood from the border over background-like pixels -> mark as 128
cand=cand.convert('L'); W,H=cand.size
for seed in [(0,0),(W-1,0),(0,H-1),(W-1,H-1),(W//2,0),(W//2,H-1),(0,H//2),(W-1,H//2)]:
    if cand.getpixel(seed)==255: ImageDraw.floodfill(cand,seed,128)
mask=cand.point(lambda v: 0 if v==128 else 255)
# the jug silhouette is solid on every row: fill between the outermost opaque pixels
import numpy as np
m=np.array(mask)>0
for y in range(m.shape[0]):
    xs=np.nonzero(m[y])[0]
    if len(xs)>1: m[y,xs[0]:xs[-1]+1]=True
# cap: traced from this photo (grace-spring-water-5-gallon-jug.jpg, 1800px):
# rounded cap 792..972 x 156..292 (r=14) plus the tamper strip hanging on the left
rgb=np.array(im).astype(int)
ys,xs=np.nonzero(m)
S4=4; cap=Image.new('L',(m.shape[1]*S4,m.shape[0]*S4),0); cd=ImageDraw.Draw(cap)
cd.rounded_rectangle((792*S4,156*S4,972*S4,300*S4),radius=14*S4,fill=255)
cd.rounded_rectangle((786*S4,240*S4,815*S4,318*S4),radius=3*S4,fill=255)
cap=cap.resize((m.shape[1],m.shape[0]),Image.LANCZOS)
capa=np.array(cap)
m[:286]=False            # everything above the neck comes from the traced cap
# base: drop neutral-grey (shadow) pixels in the bottom band
H=m.shape[0]; ys_=ys.max()
band=slice(ys_-140,ys_+1)
sat=rgb.max(axis=2)-rgb.min(axis=2)
m[band]&=~(sat[band]<22)
for y in range(ys_-140,ys_+1):
    xs2=np.nonzero(m[y])[0]
    if len(xs2)>1: m[y,xs2[0]:xs2[-1]+1]=True
mask=Image.fromarray((m*255).astype('uint8'))
mask=mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
mask=Image.fromarray(np.maximum(np.array(mask),capa))
out=im.convert('RGBA'); out.putalpha(mask)
out=out.crop(mask.getbbox()); out.save(dst); print(out.size)
