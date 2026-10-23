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
# cap: rows above the first blue neck pixel get a clean rounded rectangle
rgb=np.array(im).astype(int)
blue=(rgb[:,:,2]-rgb[:,:,0])>60
ys,xs=np.nonzero(m)
top=ys.min(); cx=int(np.median(xs[ys<top+40]))
neck=next(y for y in range(top,m.shape[0]) if blue[y,cx-30:cx+30].any())
L=[];R=[]
for y in range(top+10,neck-2):
    xs_=np.nonzero(m[y])[0]
    if len(xs_): L.append(xs_[0]); R.append(xs_[-1])
l=int(np.percentile(L,20)); r=int(np.percentile(R,20))
m[top:neck]=False
capmask=Image.new('L',(m.shape[1],m.shape[0]),0)
ImageDraw.Draw(capmask).rounded_rectangle((l,top,r,neck+4),radius=14,fill=255)
m|=np.array(capmask)>0
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
out=im.convert('RGBA'); out.putalpha(mask)
out=out.crop(mask.getbbox()); out.save(dst); print(out.size)
