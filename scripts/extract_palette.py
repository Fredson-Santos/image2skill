#!/usr/bin/env python3
"""
Image2Skill — Exact Pixel Palette & Contrast Extractor
Extrai matematicamente as cores dominantes (Canvas, Superfícies, Bordas, Textos)
e cores de acento (alta saturação) diretamente de uma imagem/screenshot,
além de calcular o contraste WCAG relativo.

Uso:
  python .agents/skills/image2skill/scripts/extract_palette.py <caminho-da-imagem> [--json]
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
        raise FileNotFoundError(f"Imagem não encontrada: {image_path}")

    img = Image.open(path).convert("RGB")
    orig_w, orig_h = img.size

    # Redimensiona mantendo proporção para amostragem rápida e precisa
    max_dim = 480
    scale = min(1.0, max_dim / max(orig_w, orig_h))
    sample_w = max(1, int(orig_w * scale))
    sample_h = max(1, int(orig_h * scale))
    resized = img.resize((sample_w, sample_h), Image.Resampling.NEAREST)

    pixels = list(
        resized.get_flattened_data()
        if hasattr(resized, "get_flattened_data")
        else resized.getdata()
    )
    total_pixels = len(pixels)

    # Quantização leve (arredonda em degraus de 2 para agrupar artefatos de compressão)
    quantized_pixels = [
        (r - (r % 2), g - (g % 2), b - (b % 2)) for (r, g, b) in pixels
    ]
    counter = Counter(quantized_pixels)
    most_common = counter.most_common(400)

    dominant = deduplicate_colors(most_common, total_pixels, min_distance=12.0, limit=12)

    # Filtra candidatos de acento (alta saturação e luminosidade intermediária)
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
    parser.add_argument("image", help="Caminho para a imagem ou print")
    parser.add_argument("--json", action="store_true", help="Saída em JSON puro")
    args = parser.parse_args()

    result = analyze_image(args.image)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    print(f"=== Image2Skill Palette Extractor ===")
    print(f"Arquivo:    {result['file']} ({result['dimensions']})")
    print(f"Tema Base:  {result['detected_theme'].upper()}")
    print("\n--- Cores Dominantes (Canvas, Superfícies, Bordas e Texto) ---")
    for idx, c in enumerate(result["dominant_colors"], 1):
        role = " [Canvas Principal]" if idx == 1 else ""
        print(
            f"  {idx:2d}. {c['hex']}  (rgb: {c['rgb']}) | {c['percentage']:5.2f}% | "
            f"lum: {c['luminance']:.3f} | contraste vs canvas: {c['contrast_vs_canvas']}:1{role}"
        )

    print("\n--- Candidatos de Acento & Gráficos (Alta Saturação) ---")
    if not result["accent_candidates"]:
        print("  (Nenhuma cor de alta saturação detectada — design monocromático/acromático)")
    for idx, c in enumerate(result["accent_candidates"], 1):
        print(
            f"  {idx:2d}. {c['hex']}  (rgb: {c['rgb']}) | {c['percentage']:5.2f}% | "
            f"sat: {c['saturation']:.2f} | contraste vs canvas: {c['contrast_vs_canvas']}:1"
        )


if __name__ == "__main__":
    main()
