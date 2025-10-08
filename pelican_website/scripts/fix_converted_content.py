#!/usr/bin/env python3
"""Utility to clean up migrated Markdown posts after Jekyll -> Pelican conversion."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT_ROOT = ROOT / "content" / "blog"

COMMENT_PATTERN = re.compile(r"\{\%\s*comment\s*\%\}(.*?)\{\%\s*endcomment\s*\%\}", re.DOTALL)
TOC_PATTERN = re.compile(r"(^\s*\*\s*TOC\s*\n\s*\{\:toc\}\s*)(?=\n|$)", re.MULTILINE)
POST_URL_PATTERN = re.compile(r"\{\%\s*post_url\s+([^\s\%]+)\s*\%\}")


def iter_markdown_files():
    for lang_dir in CONTENT_ROOT.iterdir():
        if not lang_dir.is_dir():
            continue
        yield from lang_dir.glob("*.md")


def parse_metadata(lines):
    meta = {}
    for line in lines:
        if ':' not in line:
            continue
        key, value = line.split(':', 1)
        meta[key.strip()] = value.strip()
    return meta


def build_article_index():
    index = {}
    for path in iter_markdown_files():
        text = path.read_text(encoding='utf-8')
        parts = text.split('\n\n', 1)
        header = parts[0].splitlines()
        meta = parse_metadata(header)
        slug = meta.get('Slug')
        date = meta.get('Date')
        lang = (meta.get('Lang') or 'en').strip().lower()
        if not slug or not date:
            continue
        year = date.strip()[:4]
        if not year.isdigit():
            continue
        slug_lower = slug.strip().lower()
        if lang.startswith('ar'):
            url = f"{lang}/{year}/{slug}.html"
        else:
            url = f"{year}/{slug}.html"
        index[slug_lower] = url
    return index


def convert_comments(text):
    def repl(match):
        inner = match.group(1)
        if not inner:
            return ""
        safe_inner = inner.replace('<!--', '&lt;!--').replace('-->', '--&gt;')
        if safe_inner.startswith('\n'):
            safe_inner = safe_inner.rstrip('\n')
            return f"<!--{safe_inner}\n-->"
        return f"<!-- {safe_inner.strip()} -->"

    return COMMENT_PATTERN.sub(repl, text)


def convert_toc_markers(text):
    def repl(match):
        return "\n\n[TOC]\n\n"

    text = TOC_PATTERN.sub(repl, text)
    text = re.sub(r"([^\n])\n\[TOC\]", r"\1\n\n[TOC]", text)
    text = re.sub(r"\[TOC\]\n([^\n])", r"[TOC]\n\n\1", text)
    return text


def replace_post_urls(text, article_map):
    def repl(match):
        raw_path = match.group(1).strip().strip('"\'')
        slug_part = raw_path.split('/')[-1]
        slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', slug_part).lower()
        url = article_map.get(slug)
        if not url:
            print(f"Warning: could not resolve post_url '{raw_path}' (slug '{slug}')")
            return match.group(0)
        return f"/{url}"
    return POST_URL_PATTERN.sub(repl, text)


def process_metadata_lines(meta_lines):
    updated = []
    for line in meta_lines:
        if ':' not in line:
            updated.append(line)
            continue
        key, value = line.split(':', 1)
        key = key.strip()
        val = value.strip()
        if key in {"css_overrides", "js_overrides"}:
            entries = [item.strip() for item in val.split(', ')] if val else []
            if key == "js_overrides":
                entries = [item for item in entries if not item.startswith('https://polyfill.io/')]
            val = ' | '.join(filter(None, entries))
        updated.append(f"{key}: {val}")
    return updated


def apply_fixes(path, article_map):
    original_text = path.read_text(encoding='utf-8')
    text = original_text

    if '\n\n' in text:
        meta_part, body_part = text.split('\n\n', 1)
        meta_lines = meta_part.split('\n')
        fixed_meta = process_metadata_lines(meta_lines)
        text = '\n'.join(fixed_meta) + '\n\n' + body_part
    else:
        text = '\n'.join(process_metadata_lines(text.split('\n')))

    text = convert_comments(text)
    text = convert_toc_markers(text)
    text = replace_post_urls(text, article_map)

    if text != original_text:
        path.write_text(text, encoding='utf-8')
        return True
    return False


def main():
    article_map = build_article_index()
    changed = []
    for path in iter_markdown_files():
        if apply_fixes(path, article_map):
            changed.append(path)
    if changed:
        print("Updated:")
        for p in changed:
            print(f" - {p.relative_to(ROOT)}")
    else:
        print("No changes needed.")


if __name__ == "__main__":
    main()
