"""Safety layer for everything the static builder publishes (notes, research log, statement).

- process_image(): re-encodes every image with metadata removed (EXIF, GPS, XMP, device info, embedded thumbnails),
  bakes in the camera orientation, converts to sRGB, resizes, and names the output by a hash of its pixels so the
  original file name never ships.
- privacy_lint(): refuses to build when a source text, file name or generated page contains something that must not
  be public (student ID, school e-mail, API keys, private keys, passwords).
- sanitize_html(): rebuilds rendered HTML from an allowlist of tags and attributes, so raw HTML in a source file
  cannot inject scripts, event handlers, iframes or javascript: links.
"""
from __future__ import annotations

import hashlib
import html
import io
import re
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

MEDIA_URL = "/assets/media/"
ALLOWED_IMAGES = {".jpg", ".jpeg", ".png", ".webp"}
MAX_INPUT_BYTES = 25 * 1024 * 1024
MAX_SIDE, THUMB_SIDE = 1600, 520

# (label, pattern). Labels are what gets printed, never the matched text.
FORBIDDEN = [
    ("school e-mail domain", re.compile(r"mail\.yzu\.edu\.tw", re.I)),
    ("Google API key", re.compile(r"AIza[0-9A-Za-z_\-]{35}")),
    ("OpenAI-style secret key", re.compile(r"\bsk-[A-Za-z0-9_\-]{20,}")),
    ("GitHub token", re.compile(r"\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}")),
    ("private key block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("password assignment", re.compile(r"(?i)\b(?:password|passwd|pwd|secret[_ ]?key|access[_ ]?token)\s*[:=]\s*\S+")),
]


class UnsafeContent(Exception):
    pass


# The student ID itself must not appear in this public file, so it is matched by hash.
_ID_HASHES = {"8b75c6d46690409e5ea771ba"}


def privacy_lint(label: str, text: str) -> None:
    for m in re.finditer(r"(?<!\d)\d{7}(?!\d)", text):
        if hashlib.sha256(m.group().encode()).hexdigest()[:24] in _ID_HASHES:
            raise UnsafeContent(f"{label}: contains the student ID; remove it before publishing")
    for name, pat in FORBIDDEN:
        if pat.search(text):
            raise UnsafeContent(f"{label}: contains a {name}; remove it before publishing")


# ------------------------------------------------------------------------------------------------ images
def _to_srgb(im: Image.Image) -> Image.Image:
    icc = im.info.get("icc_profile")
    if icc:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            im = ImageCms.profileToProfile(im, src, ImageCms.createProfile("sRGB"), outputMode="RGBA" if im.mode == "RGBA" else "RGB")
        except Exception:
            pass
    return im


def _clean(im: Image.Image) -> Image.Image:
    """A fresh image holding only pixels: no EXIF, GPS, XMP, ICC, comments or embedded thumbnails."""
    mode = "RGBA" if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info) else "RGB"
    im = im.convert(mode)
    return Image.frombytes(mode, im.size, im.tobytes())


def process_image(src: Path, out_dir: Path) -> dict:
    privacy_lint(f"image file name {src.name}", src.name)
    if src.suffix.lower() not in ALLOWED_IMAGES:
        raise UnsafeContent(f"{src.name}: only {', '.join(sorted(ALLOWED_IMAGES))} images are allowed (no SVG/HTML/GIF)")
    if src.stat().st_size > MAX_INPUT_BYTES:
        raise UnsafeContent(f"{src.name}: larger than 25 MB")
    with Image.open(src) as raw:
        raw.load()
        im = ImageOps.exif_transpose(raw)          # keep the photo upright once the orientation tag is gone
        im = _clean(_to_srgb(im))
    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    name = hashlib.sha256(im.tobytes()).hexdigest()[:16]
    out_dir.mkdir(parents=True, exist_ok=True)
    full_webp, full_jpg, thumb_webp = out_dir / f"{name}.webp", out_dir / f"{name}.jpg", out_dir / f"{name}-t.webp"
    im.save(full_webp, "WEBP", quality=82, method=6)
    im.convert("RGB").save(full_jpg, "JPEG", quality=85, optimize=True, progressive=True)
    th = im.copy(); th.thumbnail((THUMB_SIDE, THUMB_SIDE), Image.LANCZOS); th.save(thumb_webp, "WEBP", quality=80, method=6)
    for f in (full_webp, full_jpg, thumb_webp):                     # verify: nothing but pixels left
        with Image.open(f) as chk:
            if chk.getexif() or chk.info.get("exif") or chk.info.get("xmp") or chk.info.get("icc_profile"):
                raise UnsafeContent(f"{f.name}: metadata survived re-encoding")
    return {"name": name, "w": im.width, "h": im.height, "tw": th.width, "th": th.height}


def figure_html(meta: dict, alt: str) -> str:
    n, a = meta["name"], html.escape(alt, quote=True)
    return (f'<figure class="fig"><a class="fig-link" href="{MEDIA_URL}{n}.webp" data-lightbox="1">'
            f'<picture><source srcset="{MEDIA_URL}{n}.webp" type="image/webp">'
            f'<img src="{MEDIA_URL}{n}.jpg" alt="{a}" width="{meta["w"]}" height="{meta["h"]}" loading="lazy" decoding="async"></picture></a>'
            + (f"<figcaption>{html.escape(alt)}</figcaption>" if alt else "") + "</figure>")


# ------------------------------------------------------------------------------------------------ html allowlist
SAFE_TAGS = {"p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "b", "i", "code", "pre", "blockquote", "table", "thead", "tbody",
             "tr", "th", "td", "a", "img", "picture", "source", "figure", "figcaption", "br", "hr", "sup", "sub", "del", "kbd"}
VOID = {"img", "source", "br", "hr"}
SAFE_ATTRS = {"a": {"href", "title", "class", "data-lightbox"}, "img": {"src", "alt", "width", "height", "loading", "decoding"},
              "source": {"srcset", "type"}, "figure": {"class"}, "th": {"align", "style"}, "td": {"align", "style"}, "code": {"class"}}
SAFE_CLASSES = {"fig", "fig-link"}


def _safe_url(v: str, *, media_only: bool = False) -> bool:
    v = v.strip()
    if media_only:
        return v.startswith(MEDIA_URL) and ".." not in v
    return bool(re.match(r"^(https?://|/(?!/)|#|mailto:|\?|[A-Za-z0-9._-]+(/|$))", v)) and not re.match(r"^\s*(javascript|data|vbscript):", v, re.I)


class _Sanitizer(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "iframe", "object", "embed", "svg", "math", "template"):
            self.skip += 1
            return
        if self.skip or tag not in SAFE_TAGS:
            return
        keep = []
        for k, v in attrs:
            v = v or ""
            if k not in SAFE_ATTRS.get(tag, set()):
                continue
            if k == "href" and not _safe_url(v):
                continue
            if k in ("src", "srcset") and not _safe_url(v, media_only=True):
                continue
            if k == "class" and not set(v.split()) <= SAFE_CLASSES | {c for c in v.split() if c.startswith("language-")}:
                continue
            if k == "style" and not re.fullmatch(r"text-align:\s*(left|right|center);?", v):
                continue
            keep.append(f' {k}="{html.escape(v, quote=True)}"')
        if tag == "a" and any(" href=" in a for a in keep) and re.search(r' href="https?://', "".join(keep)):
            keep.append(' rel="noopener noreferrer"')
        self.out.append(f"<{tag}{''.join(keep)}>")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "iframe", "object", "embed", "svg", "math", "template"):
            self.skip = max(0, self.skip - 1)
            return
        if not self.skip and tag in SAFE_TAGS and tag not in VOID:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(html.escape(data, quote=False))


def sanitize_html(markup: str) -> str:
    s = _Sanitizer()
    s.feed(markup)
    s.close()
    return "".join(s.out)


# ------------------------------------------------------------------------------------------------ markdown with images
IMG_MD = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)\)")


def render_markdown(text: str, *, src_dir: Path, media_dir: Path, md) -> tuple[str, list[dict]]:
    """Markdown -> sanitized HTML. Local images are processed through process_image(); remote images are refused."""
    figures = []

    def repl(m):
        alt, ref = m.group(1).strip(), m.group(2).strip()
        if re.match(r"^[a-z]+:", ref, re.I):
            raise UnsafeContent(f"remote image {ref!r}: download it and reference a local file instead")
        path = (src_dir / ref).resolve()
        if src_dir.resolve() not in path.parents:
            raise UnsafeContent(f"image {ref!r} is outside {src_dir.name}/")
        meta = process_image(path, media_dir)
        figures.append(meta | {"alt": alt})
        return "\n\n" + figure_html(meta, alt) + "\n\n"

    body = IMG_MD.sub(repl, text)
    return sanitize_html(md(body)), figures
