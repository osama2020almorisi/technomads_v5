# توليد أيقونات PNG
from PIL import Image, ImageDraw, ImageFont
import math

BASE = "/mnt/agents/output/bidaya-reader-pro"

def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # خلفية متدرجة تقريبية
    grad = Image.new("RGBA", (size, size))
    gd = ImageDraw.Draw(grad)
    for y in range(size):
        t = y/size
        c1 = (13,23,39); c2 = (23,105,170)
        c = tuple(int(c1[i]+(c2[i]-c1[i])*t) for i in range(3)) + (255,)
        gd.line([(0,y),(size,y)], fill=c)
    img.paste(grad, (0,0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0,0,size-1,size-1], fill=(13,23,39,255))
        d.rectangle([0,size//2,size-1,size-1], fill=(23,105,170,255))
    # زخرفة دائرية
    r = int(size*0.34)
    cx, cy = size//2, size//2 - int(size*0.02)
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(226,189,99,255), width=max(2,size//40))
    # كتاب مفتوح (مضلع بسيط)
    bw, bh = int(size*0.30), int(size*0.20)
    y0 = cy - bh//3
    d.polygon([(cx-bw,y0),(cx,y0+bh//3),(cx+bw,y0),(cx+bw,y0+bh),(cx,y0+bh+bh//3),(cx-bw,y0+bh)],
              outline=(226,189,99,255), width=max(2,size//48))
    d.line([(cx,y0+bh//3),(cx,y0+bh+bh//3)], fill=(226,189,99,255), width=max(2,size//48))
    return img

make_icon(192).save(f"{BASE}/icons/icon-192.png")
make_icon(512).save(f"{BASE}/icons/icon-512.png")
make_icon(512, maskable=True).save(f"{BASE}/icons/maskable-512.png")
make_icon(180).save(f"{BASE}/icons/apple-touch-icon.png")
print("✔ icons")