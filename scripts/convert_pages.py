#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JEKYLL_ROOT = ROOT.parent

PAGES_SRC = JEKYLL_ROOT / 'pages'
PAGES_AR_SRC = JEKYLL_ROOT / 'pages_ar'
DEST_EN = ROOT / 'content' / 'pages'
DEST_AR = ROOT / 'content' / 'pages' / 'ar'
DEST_EN.mkdir(parents=True, exist_ok=True)
DEST_AR.mkdir(parents=True, exist_ok=True)

TEMPLATE_BY_LAYOUT = {
    'home': 'blog',
    'technical': 'technical',
    'home_ar': 'ar_index',
    'custom_page_1': 'course',
}


def split_front_matter(text: str):
    if not text.startswith('---'):
        return {}, text
    lines = text.splitlines()
    fm_lines = []
    body_start = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == '---':
            body_start = idx + 1
            break
        fm_lines.append(lines[idx])
    if body_start is None:
        return {}, text
    body = '\n'.join(lines[body_start:])
    return parse_simple_yaml(fm_lines), body


def parse_simple_yaml(lines):
    data = {}
    current_key = None
    for raw_line in lines:
        line = raw_line.rstrip()
        if not line:
            continue
        if line.startswith(' ') and current_key and isinstance(data.get(current_key), list):
            stripped = line.strip()
            if stripped.startswith('- '):
                data[current_key].append(strip_quotes(stripped[2:].strip()))
            continue
        if ':' not in line:
            continue
        key, value = line.split(':', 1)
        key = key.strip()
        value = value.strip()
        if value == '' or value in ('|', '>'):
            data[key] = []
            current_key = key
            continue
        if value.startswith('[') and value.endswith(']'):
            inner = value[1:-1]
            items = []
            for part in inner.split(','):
                part = part.strip()
                if not part:
                    continue
                items.append(strip_quotes(part))
            data[key] = items
            current_key = key
            continue
        if value.startswith('-'):
            data[key] = [strip_quotes(value[1:].strip())]
            current_key = key
            continue
        data[key] = strip_quotes(value)
        current_key = key
    return data


def strip_quotes(value: str) -> str:
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def extract_slug(permalink, filename):
    if permalink:
        perma = permalink.strip('/')
        if not perma:
            return ''
        return perma.split('/')[-1]
    return Path(filename).stem


def build_url(permalink):
    if not permalink:
        return ''
    return permalink.strip('/')


def build_save_as(url):
    if not url:
        return 'index.html'
    if url.endswith('.html'):
        return url
    return f"{url}/index.html"


def convert_page(src_path: Path, dest_dir: Path, default_lang: str):
    text = src_path.read_text(encoding='utf-8')
    meta, body = split_front_matter(text)

    title = meta.get('title') or meta.get('Title') or src_path.stem.title()
    permalink = meta.get('permalink')
    slug = extract_slug(permalink, src_path.name)
    url = build_url(permalink)
    save_as = build_save_as(url)
    layout = meta.get('layout')
    lang_value = meta.get('lang') or default_lang
    lang_lower = str(lang_value).lower()
    if lang_lower.startswith('ar'):
        lang = 'ar'
    elif lang_lower.startswith('en'):
        lang = 'en'
    else:
        lang = lang_value
    order = meta.get('order') or meta.get('Order')
    exclude_nav = meta.get('exclude_nav') or meta.get('exclude-nav') or meta.get('exclude nav')
    template = meta.get('template') or TEMPLATE_BY_LAYOUT.get(layout)

    filename = f"{slug or src_path.stem}.md"
    dest_path = dest_dir / filename

    metadata_lines = [
        f"Title: {title}",
        f"Slug: {slug or src_path.stem}",
        f"Lang: {lang}",
    ]

    if url != '':
        metadata_lines.append(f"URL: {url}")
    else:
        metadata_lines.append('URL: ')
    metadata_lines.append(f"Save_as: {save_as}")

    if template:
        metadata_lines.append(f"Template: {template}")
    if order:
        metadata_lines.append(f"nav_order: {order}")
    if exclude_nav:
        metadata_lines.append(f"exclude_nav: {exclude_nav}")

    metadata_lines.append('')
    metadata_lines.append(body.lstrip('\n'))

    dest_path.write_text('\n'.join(metadata_lines).rstrip() + '\n', encoding='utf-8')


def main():
    for path in PAGES_SRC.glob('*'):
        if path.suffix.lower() in {'.md', '.markdown'}:
            convert_page(path, DEST_EN, 'en')

    for path in PAGES_AR_SRC.glob('*'):
        if path.suffix.lower() in {'.md', '.markdown'}:
            convert_page(path, DEST_AR, 'ar')


if __name__ == '__main__':
    main()
