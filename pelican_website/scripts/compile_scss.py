#!/usr/bin/env python3
"""
SCSS compiler helper for the Pelican site.
Requires the `sass` (libsass) package but skips gracefully if it is missing.
"""
import sys
from pathlib import Path

try:
    import sass  # type: ignore
except ImportError:
    print('[scss] Skipping SCSS compilation (install the "libsass" package to enable it).')
    sys.exit(0)

ROOT = Path(__file__).resolve().parent.parent
SCSS_DIR = ROOT / 'scss'
OUTPUT_DIR = ROOT / 'content' / 'assets'
PARTIALS_DIR = SCSS_DIR / '_sass'

TARGETS = {
    'main.scss': 'main.css',
    'main_ar.scss': 'main_ar.css',
    'resume-style.scss': 'resume-style.css',
    'shortresume-style.scss': 'shortresume-style.css',
}

include_paths = [str(SCSS_DIR), str(PARTIALS_DIR)]

for src_name, dest_name in TARGETS.items():
    src = SCSS_DIR / src_name
    dest = OUTPUT_DIR / dest_name
    map_path = dest.with_suffix(dest.suffix + '.map')

    if not src.exists():
        print(f"[scss] Source not found: {src}")
        continue

    dest.parent.mkdir(parents=True, exist_ok=True)

    css, source_map = sass.compile(
        filename=str(src),
        include_paths=include_paths,
        output_style='expanded',
        source_map_filename=str(map_path)
    )

    dest.write_text(css, encoding='utf-8')
    map_path.write_text(source_map, encoding='utf-8')
    print(f"[scss] Compiled {src_name} -> {dest_name}")
