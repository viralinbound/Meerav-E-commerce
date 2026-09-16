"""Compose new hero banner images by combining real Meerav packshot photos
on a branded gradient backdrop, with drop shadows and slight rotation for a
dynamic, professional multi-product hero look."""
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "images")
PRODUCTS_DIR = os.path.join(BASE, "products")
OUT_DIR = os.path.join(BASE, "hero")
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1920, 960

MAROON_DARK = (78, 13, 24)
MAROON = (110, 20, 35)
GOLD_LIGHT = (233, 200, 115)


def make_gradient(w, h, c1, c2, angle_deg=135):
    """Diagonal linear gradient c1 -> c2."""
    base = Image.new("RGB", (w, h), c1)
    top = Image.new("RGB", (w, h), c2)
    mask = Image.new("L", (w, h))
    mask_data = []
    rad = math.radians(angle_deg)
    dx, dy = math.cos(rad), math.sin(rad)
    diag = abs(w * dx) + abs(h * dy)
    for y in range(h):
        for x in range(0, w, 4):
            t = ((x * dx + y * dy) / diag + 1) / 2
            t = max(0, min(1, t))
            mask_data.extend([int(t * 255)] * 4)
    mask.putdata(mask_data[: w * h])
    return Image.composite(top, base, mask)


def add_vignette(img, strength=0.55):
    w, h = img.size
    vignette = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(vignette)
    draw.ellipse([-w * 0.25, -h * 0.35, w * 1.25, h * 1.35], fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(180))
    dark = Image.new("RGB", (w, h), (10, 2, 5))
    return Image.composite(img, dark, vignette.point(lambda p: int(p * (1 - strength) + 255 * strength)))


def add_jaali_pattern(img, color=GOLD_LIGHT, opacity=22, spacing=64):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = img.size
    r = spacing * 0.32
    for y in range(0, h + spacing, spacing):
        for x in range(0, w + spacing, spacing):
            draw.ellipse([x - r / 4, y - r / 4, x + r / 4, y + r / 4], fill=(*color, opacity))
            draw.line([x - r, y, x, y - r, x + r, y, x, y + r, x - r, y], fill=(*color, opacity), width=1)
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def load_packshot(name, target_h):
    p = Image.open(os.path.join(PRODUCTS_DIR, name)).convert("RGB")
    ratio = target_h / p.height
    p = p.resize((int(p.width * ratio), target_h), Image.LANCZOS)
    return p


def with_shadow_and_rotation(img, angle, shadow_blur=28, shadow_offset=(14, 22)):
    pad = shadow_blur * 3
    w, h = img.size
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_shape = Image.new("RGBA", (w, h), (0, 0, 0, 200))
    shadow.paste(shadow_shape, (pad + shadow_offset[0], pad + shadow_offset[1]))
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_blur))

    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(img, (pad, pad))

    canvas = canvas.rotate(angle, resample=Image.BICUBIC, expand=True)
    return canvas


def compose_banner(filename, packshot_names, heights, positions, angles, label):
    bg = make_gradient(W, H, MAROON_DARK, MAROON, angle_deg=130)
    bg = add_jaali_pattern(bg)
    bg = add_vignette(bg, strength=0.5)
    canvas = bg.convert("RGBA")

    for name, target_h, pos, angle in zip(packshot_names, heights, positions, angles):
        shot = load_packshot(name, target_h)
        composed = with_shadow_and_rotation(shot, angle)
        x = int(pos[0] - composed.width / 2)
        y = int(pos[1] - composed.height / 2)
        canvas.alpha_composite(composed, (x, y))

    canvas.convert("RGB").save(os.path.join(OUT_DIR, filename), quality=88)
    print("wrote", filename, "-", label)


# Slide 1: Bhujia + Namkeen + Papad (core trio), product visuals weighted right
compose_banner(
    "hero_bhujia_trio.jpg",
    ["meerav_3.jpg", "meerav_7.jpg", "meerav_1.jpg"],
    [620, 520, 560],
    [(1420, 460), (1720, 640), (1180, 700)],
    [-7, 9, 4],
    "Bhujia / Namkeen / Papad",
)

# Slide 2: Mixture + Chips + Masala Peanuts
compose_banner(
    "hero_mixture_trio.jpg",
    ["meerav_2.jpg", "meerav_4.jpg", "meerav_8.jpg"],
    [600, 520, 540],
    [(1420, 470), (1740, 650), (1160, 700)],
    [6, -8, -3],
    "Mixture / Chips / Masala Peanuts",
)

# Slide 3: Moong Dal + Raita Boondi + Papad
compose_banner(
    "hero_roasted_trio.jpg",
    ["meerav_5.jpg", "meerav_6.jpg", "meerav_1.jpg"],
    [580, 560, 520],
    [(1440, 470), (1740, 660), (1160, 690)],
    [-5, 8, -9],
    "Moong Dal / Raita Boondi / Papad",
)

print("done")
