#!/usr/bin/env python3
"""
Image2Skill — Exact Pixel Palette & Contrast Extractor
Mathematically extracts dominant colors (Canvas, Surfaces, Borders, Text)
and high-saturation accent candidates directly from an image or screenshot,
while computing relative WCAG contrast ratios.

Usage:
  python3 <skill-dir>/scripts/extract_palette.py <image-path> [--json]
"""

import argparse
import colorsys
import json
import math
import sys
from collections import Counter
from pathlib import Path
from PIL import Image


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    def channel(c: int) -> float:
        v = c / 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast_ratio(rgb1: tuple[int, int, int], rgb2: tuple[int, int, int]) -> float:
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)


def color_distance(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))


def deduplicate_colors(
    counts: list[tuple[tuple[int, int, int], int]],
    total_pixels: int,
    min_distance: float = 14.0,
    limit: int = 15,
) -> list[dict]:
    selected: list[dict] = []
    for rgb, count in counts:
        if any(color_distance(rgb, item["rgb_tuple"]) < min_distance for item in selected):
            continue
        r, g, b = rgb
        h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
        pct = round((count / total_pixels) * 100, 2)
        selected.append(
            {
                "hex": rgb_to_hex(rgb),
                "rgb": f"{r}, {g}, {b}",
                "rgb_tuple": rgb,
                "percentage": pct,
                "luminance": round(relative_luminance(rgb), 3),
                "saturation": round(s, 3),
                "lightness": round(l, 3),
            }
        )
        if len(selected) >= limit:
            break
    return selected


def analyze_image(image_path: str) -> dict:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = Image.open(path).convert("RGB")
    orig_w, orig_h = img.size

    # Analyze at full resolution whenever practical. Downsampling to a small size
    # drops thin details (1px borders, text, small icons, chart strokes), which then
    # never show up as palette candidates. Only very large images are reduced, and
    # NEAREST is kept so no blended, non-existent colors are introduced.
    max_pixels = 4_000_000
    if orig_w * orig_h > max_pixels:
        scale = (max_pixels / (orig_w * orig_h)) ** 0.5
        sample_w = max(1, int(orig_w * scale))
        sample_h = max(1, int(orig_h * scale))
        resized = img.resize((sample_w, sample_h), Image.Resampling.NEAREST)
    else:
        resized = img

    pixels = list(
        resized.get_flattened_data()
        if hasattr(resized, "get_flattened_data")
        else resized.getdata()
    )
    total_pixels = len(pixels)

    # Light quantization (step of 2) groups minor compression artifacts, but each group
    # is reported by its most frequent REAL color. Reporting the quantized key itself
    # would shift exact values (e.g. #151515 would come out as #141414).
    exact_counter = Counter(pixels)
    group_totals: Counter = Counter()
    group_best: dict = {}
    for (r, g, b), count in exact_counter.items():
        key = (r - (r % 2), g - (g % 2), b - (b % 2))
        group_totals[key] += count
        best = group_best.get(key)
        if best is None or count > best[1]:
            group_best[key] = ((r, g, b), count)
    counter = Counter({group_best[key][0]: total for key, total in group_totals.items()})
    most_common = counter.most_common(400)

    dominant = deduplicate_colors(most_common, total_pixels, min_distance=12.0, limit=12)

    # Filter accent candidates (high saturation and mid-range lightness)
    accent_candidates_raw = [
        (rgb, count)
        for (rgb, count) in counter.most_common(2000)
        if colorsys.rgb_to_hls(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0)[2] >= 0.38
        and 0.12 <= colorsys.rgb_to_hls(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0)[1] <= 0.88
    ]
    accents = deduplicate_colors(
        accent_candidates_raw, total_pixels, min_distance=24.0, limit=8
    )

    canvas_rgb = dominant[0]["rgb_tuple"] if dominant else (0, 0, 0)
    canvas_lum = relative_luminance(canvas_rgb)
    theme_type = "dark" if canvas_lum < 0.25 else "light"

    for item in dominant:
        item["contrast_vs_canvas"] = contrast_ratio(canvas_rgb, item["rgb_tuple"])
        del item["rgb_tuple"]

    for item in accents:
        item["contrast_vs_canvas"] = contrast_ratio(canvas_rgb, item["rgb_tuple"])
        del item["rgb_tuple"]

    return {
        "file": str(path.resolve()),
        "dimensions": f"{orig_w}x{orig_h}",
        "detected_theme": theme_type,
        "canvas_candidate": dominant[0] if dominant else None,
        "surface_candidates": dominant[1:5],
        "dominant_colors": dominant,
        "accent_candidates": accents,
    }


def main():
    parser = argparse.ArgumentParser(description="Image2Skill Palette Extractor")
    parser.add_argument("image", help="Path to the image or screenshot")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()

    result = analyze_image(args.image)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    print(f"=== Image2Skill Palette Extractor ===")
    print(f"File:       {result['file']} ({result['dimensions']})")
    print(f"Base Theme: {result['detected_theme'].upper()}")
    print("\n--- Dominant Colors (Canvas, Surfaces, Borders & Text) ---")
    for idx, c in enumerate(result["dominant_colors"], 1):
        role = " [Primary Canvas]" if idx == 1 else ""
        print(
            f"  {idx:2d}. {c['hex']}  (rgb: {c['rgb']}) | {c['percentage']:5.2f}% | "
            f"lum: {c['luminance']:.3f} | contrast vs canvas: {c['contrast_vs_canvas']}:1{role}"
        )

    print("\n--- Accent & Chart Candidates (High Saturation) ---")
    if not result["accent_candidates"]:
        print("  (No high-saturation colors detected — monochromatic/achromatic design)")
    for idx, c in enumerate(result["accent_candidates"], 1):
        print(
            f"  {idx:2d}. {c['hex']}  (rgb: {c['rgb']}) | {c['percentage']:5.2f}% | "
            f"sat: {c['saturation']:.2f} | contrast vs canvas: {c['contrast_vs_canvas']}:1"
        )


if __name__ == "__main__":
    main()
