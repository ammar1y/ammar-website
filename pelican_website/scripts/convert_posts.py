#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JEKYLL_ROOT = ROOT.parent

POSTS_ROOT = JEKYLL_ROOT / "_posts"
DEST_EN = ROOT / "content" / "blog" / "en"
DEST_AR = ROOT / "content" / "blog" / "ar"

DEST_EN.mkdir(parents=True, exist_ok=True)
DEST_AR.mkdir(parents=True, exist_ok=True)

for dest in (DEST_EN, DEST_AR):
    for child in dest.glob("*"):
        if child.is_file():
            child.unlink()


def split_front_matter(text: str):
    if not text.startswith("---"):
        return {}, text
    lines = text.splitlines()
    fm_lines = []
    body_start = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            body_start = idx + 1
            break
        fm_lines.append(lines[idx])
    if body_start is None:
        return {}, text
    body = "\n".join(lines[body_start:])
    return parse_simple_yaml(fm_lines), body


def parse_simple_yaml(lines):
    data = {}
    current_key = None
    for raw_line in lines:
        line = raw_line.rstrip()
        if not line:
            continue
        if line.startswith(" ") and current_key and isinstance(data.get(current_key), list):
            stripped = line.strip()
            if stripped.startswith("- "):
                item = stripped[2:].strip()
                data[current_key].append(strip_quotes(item))
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value == "" or value in ("|", ">"):
            data[key] = []
            current_key = key
            continue
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1]
            items = []
            for part in inner.split(","):
                part = part.strip()
                if not part:
                    continue
                items.append(strip_quotes(part))
            data[key] = items
            current_key = key
            continue
        if value.startswith("-"):
            data[key] = [strip_quotes(value[1:].strip())]
            current_key = key
            continue
        data[key] = strip_quotes(value)
        current_key = key
    return data


def strip_quotes(value: str) -> str:
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def normalise_bool(value):
    if isinstance(value, str):
        lower = value.lower()
        if lower in ("true", "yes", "on", "1"):
            return "true"
        if lower in ("false", "no", "off", "0"):
            return "false"
    if isinstance(value, (int, float)):
        return "true" if value else "false"
    return None


def ensure_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        if value == "":
            return []
        return [v.strip() for v in value.split(",") if v.strip()]
    return [str(value)]


def slug_from_filename(path: Path):
    name = path.stem
    match = re.match(r"\d{4}-\d{2}-\d{2}-(.+)", name)
    if match:
        return match.group(1)
    return name


def slug_from_permalink(permalink):
    if not permalink:
        return None
    slug = permalink.strip("/").split("/")[-1]
    return slug or None


def write_post(src_path: Path, lang: str):
    try:
        text = src_path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        print(f'Skipping non-utf8 file {src_path}')
        return
    meta, body = split_front_matter(text)

    title = meta.get("title") or meta.get("Title")
    if not title:
        title = slug_from_filename(src_path).replace("-", " ").title()

    date = meta.get("date") or src_path.name[:10]

    categories = ensure_list(meta.get("categories"))
    category = categories[0] if categories else "misc"

    tags = ", ".join(ensure_list(meta.get("tags")))

    slug = slug_from_permalink(meta.get("permalink")) or slug_from_filename(src_path)

    post_lang = meta.get("postlang") or meta.get("lang") or ("arabic" if lang == "ar" else "en")
    lang_code = "ar" if str(post_lang).lower().startswith("arab") else "en"

    author = meta.get("author")

    featured = normalise_bool(meta.get("featured-post"))
    technical = normalise_bool(meta.get("technicalEn"))

    og_image = meta.get("sharing-img") or meta.get("image")

    comments = meta.get("comments")
    comments_flag = normalise_bool(comments) if comments is not None else None

    css_list = ensure_list(meta.get("custom-css-list"))
    js_list = ensure_list(meta.get("custom-javascript-list"))

    summary = meta.get("summary") or meta.get("description")

    destination = DEST_AR if lang_code == "ar" else DEST_EN

    ext = ".md"
    outfile = destination / (slug_from_filename(src_path) + ext)

    metadata_lines = []
    metadata_lines.append(f"Title: {title}")
    metadata_lines.append(f"Date: {date}")
    metadata_lines.append(f"Category: {category}")
    if tags:
        metadata_lines.append(f"Tags: {tags}")
    metadata_lines.append(f"Slug: {slug}")
    metadata_lines.append(f"Lang: {lang_code}")
    if author:
        metadata_lines.append(f"Author: {author}")
    if summary:
        metadata_lines.append(f"Summary: {summary}")
    if og_image:
        metadata_lines.append(f"og_image: {og_image}")
    if featured:
        metadata_lines.append(f"featured: {featured}")
    if technical:
        metadata_lines.append(f"technical: {technical}")
    if comments_flag:
        metadata_lines.append(f"comments: {comments_flag}")
    if css_list:
        metadata_lines.append(f"css_overrides: {', '.join(css_list)}")
    if js_list:
        metadata_lines.append(f"js_overrides: {', '.join(js_list)}")

    metadata_lines.append("")
    metadata_lines.append(body.lstrip("\n"))

    outfile.write_text("\n".join(metadata_lines).rstrip() + "\n", encoding="utf-8")


def collect_files(base: Path):
    for path in sorted(base.rglob("*")):
        if path.is_file():
            yield path


def main():
    english_root = POSTS_ROOT / "English"
    arabic_root = POSTS_ROOT / "Arabic"

    for path in collect_files(english_root):
        write_post(path, "en")

    for path in collect_files(arabic_root):
        write_post(path, "ar")


if __name__ == "__main__":
    main()
