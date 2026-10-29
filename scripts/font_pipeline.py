#!/usr/bin/env python3
"""F1-2 Noto Sans SC variable subset pipeline (phase 3 signal field).

Design: shared/phase3-design-final-v2/03-title-typography.md (D-6 ruling seq=841)
  - variable axis wght 400-900 only (partial instancing drops 100-400 range)
  - glyph set = GB2312 level-1 (~3755 common hanzi, ~= universal standard table L1 3500)
    UNION every visible site copy char (literal-based extraction, double insurance)
  - output single woff2 <= 1.5MB, font-display swap handled in CSS

Master font is NOT committed (17.8MB). Provide local path via env:
  NOTO_MASTER_TTF=E:\\Jary\\github\\.qa-scratch\\phase3-f1\\NotoSansSC-var.ttf
Source of record: google/fonts repo ofl/notosanssc (SIL OFL 1.1),
  https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
  sha256 a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da
License + pipeline evidence archived at docs/asset-licenses/noto-sans-sc.md

Usage: python scripts/font_pipeline.py [--keep-tmp]
"""
import argparse
import hashlib
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.environ.get(
    "NOTO_MASTER_TTF",
    r"E:\Jary\github\.qa-scratch\phase3-f1\NotoSansSC-var.ttf",
)
OUT = os.path.join(ROOT, "src", "assets", "fonts", "noto-sans-sc-var.woff2")

CJK = re.compile(r"[一-鿿㐀-䶿]")

# CJK punctuation / symbol characters that live outside GB2312 level-1 hanzi zones
# but appear in site copy or are needed for safe fallback rendering.
EXTRA = "·×§¶±→←↑↓↗↘●○▲△▼▍▯□■★☆⌘✓✗（）《》〈〉【】〔〕、。，．：；？！％＂＇“”‘’—‥…･￥"


def extract_copy_chars():
    """All CJK chars from visible site sources (comments stripped first)."""
    chars = set()
    dirs = [
        os.path.join(ROOT, "src", "pages"),
        os.path.join(ROOT, "src", "components"),
        os.path.join(ROOT, "src", "layouts"),
        os.path.join(ROOT, "src", "data"),
        os.path.join(ROOT, "src", "scripts"),
        os.path.join(ROOT, "src", "lib"),
    ]
    for d in dirs:
        if not os.path.isdir(d):
            continue
        for name in os.listdir(d):
            p = os.path.join(d, name)
            if not os.path.isfile(p):
                continue
            if not name.endswith((".astro", ".ts", ".json")):
                continue
            try:
                txt = open(p, encoding="utf-8").read()
            except UnicodeDecodeError:
                continue
            if name.endswith(".astro"):
                # strip HTML comments and frontmatter JS comments
                txt = re.sub(r"<!--[\s\S]*?-->", "", txt)
                txt = re.sub(r"/\*[\s\S]*?\*/", "", txt)
                txt = re.sub(r"^\s*//.*$", "", txt, flags=re.M)
                # HTML attribute literals: only scan the string content for CJK
                for m in re.finditer(r'(?:title|desc|label|alt|aria-label|aria-labelledby)="([^"]*)"', txt):
                    chars.update(CJK.findall(m.group(1)))
                # tag text nodes + JSX-ish braces kept: remaining CJK after comment
                # strip in .astro files is body copy (regex above removed comment zones)
                chars.update(CJK.findall(txt))
            elif name.endswith(".ts"):
                txt = re.sub(r"/\*[\s\S]*?\*/", "", txt)
                txt = re.sub(r"//[^\n]*", "", txt)
                chars.update(CJK.findall(txt))
            elif name.endswith(".json"):
                chars.update(CJK.findall(txt))
    return chars


def gb2312_level1():
    """GB2312 level-1 hanzi zone (rows 16-55) ~= Universal Standard Chinese
    Character Table level 1 (3500). Decoded from byte pairs, offline and stable."""
    out = set()
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                c = bytes([hi, lo]).decode("gbk")
            except UnicodeDecodeError:
                continue
            if len(c) == 1 and "\u4e00" <= c <= "\u9fff":
                out.add(c)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keep-tmp", action="store_true")
    args = ap.parse_args()

    if not os.path.isfile(MASTER):
        sys.exit(f"master ttf not found: {MASTER}\nset NOTO_MASTER_TTF env")

    chars = extract_copy_chars() | gb2312_level1() | set(EXTRA)
    # also keep every CJK char that is in the master font's coverage for the
    # site copy ASCII-adjacent punctuation already handled by --unicodes below
    print(f"target chars: {len(chars)} (copy ∪ GB2312-L1 ∪ symbols)")

    tmp = tempfile.mkdtemp(prefix="noto-subset-")
    text_file = os.path.join(tmp, "chars.txt")
    with open(text_file, "w", encoding="utf-8") as f:
        f.write("".join(sorted(chars)))

    instanced = os.path.join(tmp, "NotoSansSC-wght400-900.ttf")
    print("1) partial instancing wght=400:900 ...")
    subprocess.run(
        [
            sys.executable, "-m", "fontTools.varLib.instancer",
            MASTER, "wght=400:900", "-o", instanced,
        ],
        check=True,
    )
    print("2) pyftsubset -> woff2 ...")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    cmd = [
        sys.executable, "-m", "fontTools.subset", instanced,
        f"--text-file={text_file}",
        "--unicodes=U+0020-007E,U+00A0-00FF,U+2000-206F,U+2190-21FF,U+25A0-25FF,U+2B00-2BFF",
        "--layout-features=kern,liga,ccmp,locl,mark,mkmk",
        "--ignore-missing-glyphs",
        "--ignore-missing-unicodes",
        "--name-IDs=1,2,3,4,5,6",
        "--no-hinting",
        "--drop-tables+=GSUB",  # note: subset re-adds needed features; keep GPOS
        "--flavor=woff2",
        f"--output-file={OUT}",
    ]
    # --drop-tables+=GSUB would kill locl/ccmp; drop that flag instead:
    cmd = [c for c in cmd if not c.startswith("--drop-tables")]
    subprocess.run(cmd, check=True)

    # normalize internal name: master default instance is "Thin" (wght 100);
    # after partial instancing the range 400-900 defaults at 400 -> Regular
    from fontTools.ttLib import TTFont

    font = TTFont(OUT)
    for nid, value in {
        1: "Noto Sans SC",
        2: "Regular",
        4: "Noto Sans SC RegularSubset",
        6: "NotoSansSC-RegularSubset",
    }.items():
        font["name"].setName(value, nid, 3, 1, 0x409)
    font.flavor = "woff2"
    font.save(OUT)
    data = open(OUT, "rb").read()
    print(f"3) result: {OUT}")
    print(f"   bytes: {len(data):,} ({len(data)/1024/1024:.3f} MiB)")
    print("   sha256:", hashlib.sha256(data).hexdigest())
    import fontTools.ttLib as _t
    font = _t.TTFont(OUT)
    axes = [(a.axisTag, a.minValue, a.maxValue) for a in font["fvar"].axes]
    print("   axes:", axes, "glyphs:", font["maxp"].numGlyphs)
    if not args.keep_tmp:
        import shutil

        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
