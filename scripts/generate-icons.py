#!/usr/bin/env python3
"""Generate rainbow PWA icons (no text)."""

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
COLORS = [
    (255, 107, 107),
    (255, 159, 67),
    (254, 202, 87),
    (38, 222, 129),
    (69, 170, 242),
    (165, 94, 234),
    (253, 121, 168),
    (255, 107, 214),
]


def lerp(a, b, t):
    return int(a + (b - a) * t)


def rainbow_pixel(x, y, size):
    t = (x / size + y / size) / 2
    t = max(0.0, min(1.0, t))
    idx = t * (len(COLORS) - 1)
    i = int(idx)
    f = idx - i
    c1 = COLORS[min(i, len(COLORS) - 1)]
    c2 = COLORS[min(i + 1, len(COLORS) - 1)]
    return tuple(lerp(c1[j], c2[j], f) for j in range(3))


def make_icon(size):
    img = Image.new("RGBA", (size, size))
    px = img.load()
    radius = size * 0.22

    for y in range(size):
        for x in range(size):
            dx = x - size / 2
            dy = y - size / 2
            if dx * dx + dy * dy <= (size / 2 - 2) ** 2:
                px[x, y] = (*rainbow_pixel(x, y, size), 255)

    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2 + size * 0.05
    rings = [
        (0.62, 0.055, 0),
        (0.49, 0.048, 1),
        (0.36, 0.042, 2),
        (0.23, 0.038, 3),
    ]
    for scale, width_frac, color_idx in rings:
        r = size * scale / 2
        w = max(2, int(size * width_frac))
        bbox = [cx - r, cy - r, cx + r, cy + r]
        c = COLORS[color_idx % len(COLORS)]
        draw.arc(bbox, start=200, end=340, fill=(*c, 220), width=w)

    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, size in [
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("apple-touch-icon.png", 180),
    ]:
        make_icon(size).save(OUT / name, "PNG")
        print(f"Wrote {OUT / name}")


if __name__ == "__main__":
    main()
