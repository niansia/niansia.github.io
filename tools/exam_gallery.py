"""Taiwan Exam gallery: check, clean and publish shared mock exams (PDF) to a Hugging Face dataset.

Files arrive through a Google Form (sign-in required) and are only published after a person has read them and this tool
has passed them. Nothing a visitor uploads is ever served from niansia.com: the cleaned PDFs live on huggingface.co, and
the site only shows a list plus a first-page preview that this tool renders itself.

Every file goes through, in order:
  1. size and signature  – a real PDF (%PDF- at byte 0), not encrypted, a sane size and page count
  2. antivirus           – Microsoft Defender scans the file as received; any finding or scan error stops the run
  3. structure           – files carrying JavaScript, launch actions, embedded files, rich media, XFA or form-submit
                           actions are refused outright (an exam has no reason to contain them)
  4. cleaning            – metadata, XMP, links, annotations, form fields, thumbnails and the open action are removed,
                           then the file is rewritten; the result is scanned again and must be clean
  5. personal data       – national IDs (with checksum), phone numbers, e-mail addresses, student numbers and filled-in
                           name/school/class fields stop the run unless --allow-pii is given after a manual check
  6. duplicates          – the SHA-256 of both the received and the cleaned file is compared with everything published
The file name the form gave (which carries the uploader's name) is dropped; published files get random ids.

Usage (run from the repository root):
  python tools/exam_gallery.py check FILE.pdf [...]                 # run steps 1-6, publish nothing
  python tools/exam_gallery.py add --subject math-a --questions Q.pdf [--solutions S.pdf]
                                   --ai Claude [--te-version 2026.09.22.25] [--credit NAME] [--allow-pii] [--yes]
  python tools/exam_gallery.py remove ID --reason "..." [--yes]    # takedown: delete and squash the dataset history
  python tools/exam_gallery.py list
  python tools/exam_gallery.py init                                 # write the dataset card (repo must exist)
After add/remove, rebuild the site (python tools/build_static.py --no-og, quarto render) and push.
"""
from __future__ import annotations

import argparse
import datetime as dt
import glob
import hashlib
import json
import re
import secrets
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "exam_src" / "gallery.json"
PREVIEWS = ROOT / "assets" / "exams"
SUBJECTS = {"chinese": "國綜", "writing": "國寫", "english": "英文", "math-a": "數A", "math-b": "數B", "social": "社會", "science": "自然"}
AIS = ("ChatGPT", "Claude", "Gemini", "其他")
MAX_BYTES, MAX_PAGES = 20 * 1024 * 1024, 80
# Refused outright: an exam PDF never needs these, and they are how PDFs run code, open files or phone home.
REFUSE = ("/JavaScript", "/JS", "/Launch", "/EmbeddedFile", "/EmbeddedFiles", "/RichMedia", "/XFA", "/SubmitForm",
          "/ImportData", "/GoToE", "/GoToR", "/AA", "/Sound", "/Movie")
# Removed by cleaning, and must be gone afterwards.
STRIP = ("/OpenAction", "/URI", "/Annots", "/AcroForm", "/Metadata")


class Refused(Exception):
    pass


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", data.get("dataset", "")):
        raise SystemExit("exam_src/gallery.json: dataset must look like owner/name")
    return data


def save_manifest(data: dict) -> None:
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


# ------------------------------------------------------------------------------------------------ 1. size and signature
def check_signature(path: Path) -> None:
    size = path.stat().st_size
    if not 0 < size <= MAX_BYTES:
        raise Refused(f"size {size:,} bytes is outside 1 B – {MAX_BYTES // (1 << 20)} MB")
    with open(path, "rb") as f:
        if f.read(5) != b"%PDF-":
            raise Refused("not a PDF (the file does not start with %PDF-)")


# ------------------------------------------------------------------------------------------------ 2. antivirus
def defender() -> str | None:
    found = sorted(glob.glob(r"C:\ProgramData\Microsoft\Windows Defender\Platform\*\MpCmdRun.exe"))
    if found:
        return found[-1]
    fixed = Path(r"C:\Program Files\Windows Defender\MpCmdRun.exe")
    return str(fixed) if fixed.exists() else None


def scan_av(path: Path, skip: bool) -> str:
    if skip:
        return "skipped (--skip-av)"
    exe = defender()
    if not exe:
        raise Refused("Microsoft Defender (MpCmdRun.exe) was not found; refusing to publish an unscanned file")
    run = subprocess.run([exe, "-Scan", "-ScanType", "3", "-File", str(path.resolve()), "-DisableRemediation"],
                         capture_output=True, text=True, errors="replace")
    if run.returncode == 2:
        raise Refused("Microsoft Defender reported a threat:\n" + run.stdout.strip()[-800:])
    if run.returncode != 0:
        raise Refused(f"the Defender scan did not complete (exit {run.returncode}); refusing to publish:\n{run.stdout.strip()[-400:]}")
    return "Microsoft Defender: no threats"


# ------------------------------------------------------------------------------------------------ 3/4. structure and cleaning
def pdf_tokens(doc) -> dict[str, int]:
    """How often each risky name appears as a key or value in any object dictionary, the catalog and the trailer."""
    text = [doc.xref_object(x, compressed=True) for x in range(1, doc.xref_length())]
    text.append(doc.pdf_trailer(compressed=True))
    blob = "\n".join(text)
    # "/Key null" is how a removed entry is written; by the PDF spec a null value is the same as no entry.
    return {t: n for t in REFUSE + STRIP if (n := len(re.findall(re.escape(t) + r"(?![A-Za-z])(?!\s*null\b)", blob)))}


def c2pa_only(doc) -> bool:
    """True when the only embedded files are C2PA "Content Credentials" manifests (ChatGPT adds one to every PDF it makes).
    They are provenance data, not active content; the cleaning step removes them like any other attachment."""
    names = doc.embfile_names()
    if not names or set(names) != {"Content Credentials"}:
        return False
    blob = "\n".join(doc.xref_object(x, compressed=True) for x in range(1, doc.xref_length()))
    if "/FileAttachment" in blob or len(re.findall(r"/EmbeddedFile(?![A-Za-z])", blob)) != len(names):
        return False
    for n in names:
        data = doc.embfile_get(n)
        if len(data) > 200_000 or data[4:8] != b"jumb" or b"c2pa" not in data[:512]:
            return False
    return True


def open_pdf(path: Path):
    import pymupdf as fitz
    try:
        doc = fitz.open(path)
    except Exception as err:
        raise Refused(f"the PDF could not be parsed: {err}")
    if not doc.is_pdf:
        raise Refused("not a PDF document")
    if doc.needs_pass or doc.is_encrypted:
        raise Refused("encrypted PDFs cannot be inspected and are refused")
    if not 1 <= doc.page_count <= MAX_PAGES:
        raise Refused(f"{doc.page_count} pages is outside 1–{MAX_PAGES}")
    return doc


def clean(src: Path, out: Path) -> dict:
    doc = open_pdf(src)
    found = pdf_tokens(doc)
    bad = sorted(t for t in found if t in REFUSE)
    c2pa = set(bad) <= {"/EmbeddedFile", "/EmbeddedFiles"} and bool(bad) and c2pa_only(doc)
    if c2pa:
        bad = []
    if bad:
        raise Refused("the PDF carries active or embedded content, which an exam never needs: " + ", ".join(bad))
    pages, text_before = doc.page_count, sum(len(p.get_text()) for p in doc)
    doc.scrub(attached_files=True, clean_pages=True, embedded_files=True, hidden_text=True, javascript=True, metadata=True,
              redactions=True, redact_images=0, remove_links=True, reset_fields=True, reset_responses=True, thumbnails=True, xml_metadata=True)
    for page in doc:
        for link in page.get_links():
            page.delete_link(link)
        for widget in list(page.widgets() or []):
            page.delete_widget(widget)
        for annot in list(page.annots() or []):
            page.delete_annot(annot)
        doc.xref_set_key(page.xref, "Annots", "null")
        doc.xref_set_key(page.xref, "AA", "null")
        doc.xref_set_key(page.xref, "AF", "null")
    cat = doc.pdf_catalog()
    # Outlines go too: a bookmark can carry an action. The structure tree stays, for screen readers.
    # AF (PDF 2.0 associated files) is where ChatGPT hangs its C2PA manifest; it can carry any attachment, so it goes.
    for key in ("OpenAction", "AA", "AcroForm", "Names", "Metadata", "Outlines", "PieceInfo", "AF"):
        doc.xref_set_key(cat, key, "null")
    doc.set_metadata({})
    doc.del_xml_metadata()
    doc.save(out, garbage=4, deflate=True, clean=True, no_new_id=False)
    doc.close()
    after = open_pdf(out)
    left = pdf_tokens(after)
    if left:
        raise Refused("cleaning did not remove: " + ", ".join(sorted(left)))
    if after.page_count != pages:
        raise Refused(f"cleaning changed the page count ({pages} → {after.page_count})")
    text_after = sum(len(p.get_text()) for p in after)
    if text_before and text_after < 0.9 * text_before:
        raise Refused(f"cleaning lost text ({text_before} → {text_after} characters); check the file by hand")
    meta = {k: v for k, v in (after.metadata or {}).items() if v and k not in ("format", "encryption")}
    if meta:
        raise Refused(f"metadata survived cleaning: {meta}")
    info = {"pages": pages, "removed": {t: n for t, n in found.items() if t in STRIP}}
    if c2pa:
        info["removed"]["C2PA Content Credentials"] = 1
    after.close()
    return info


# ------------------------------------------------------------------------------------------------ 5. personal data
def tw_id_ok(s: str) -> bool:
    """Checksum of a Taiwanese national ID or new-style resident certificate number (A123456789)."""
    letters = "ABCDEFGHJKLMNPQRSTUVXYWZIO"
    n = letters.index(s[0]) + 10
    digits = [n // 10, n % 10] + [int(c) for c in s[1:]]
    weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
    return sum(d * w for d, w in zip(digits, weights)) % 10 == 0


PII = [
    ("national ID", re.compile(r"(?<![A-Za-z0-9])[A-Z][1289]\d{8}(?!\d)"), tw_id_ok),
    ("mobile phone", re.compile(r"(?<!\d)09\d{2}[-\s]?\d{3}[-\s]?\d{3}(?!\d)"), None),
    ("phone number", re.compile(r"(?<!\d)\(?0\d{1,2}\)?[-\s]\d{3,4}[-\s]?\d{4}(?!\d)"), None),
    ("e-mail address", re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+"), None),
    ("student number", re.compile(r"(?<![A-Za-z0-9])[sSbBmMdD]\d{7,9}(?!\d)"), None),
    ("filled-in field", re.compile(r"(姓\s*名|學\s*號|座\s*號|班\s*級|學\s*校|身分證字?號?)\s*[:：]\s*([^\s_＿\-－.．…:：]{1,20})"), None),
]


def mask(s: str) -> str:
    return s[:2] + "…" + s[-1:] if len(s) > 4 else s[:1] + "…"


def scan_pii(path: Path) -> list[str]:
    doc = open_pdf(path)
    hits = []
    for i, page in enumerate(doc, 1):
        text = page.get_text()
        for label, rx, ok in PII:
            for m in rx.finditer(text):
                value = m.group(0)
                if ok and not ok(value):
                    continue
                hits.append(f"page {i}: {label} {mask(value)!r}")
    doc.close()
    return hits


# ------------------------------------------------------------------------------------------------ preview
def render_preview(pdf: Path, out: Path) -> None:
    import pymupdf as fitz
    from PIL import Image
    doc = fitz.open(pdf)
    page = doc[0]
    zoom = 520 / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    if img.height > 740:
        img = img.crop((0, 0, img.width, 740))
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=72, method=6)
    doc.close()


# ------------------------------------------------------------------------------------------------ the pipeline
def inspect(path: Path, work: Path, skip_av: bool, known: set[str]) -> dict:
    print(f"\n── {path.name}")
    check_signature(path)
    print("  ✓ PDF signature and size")
    print("  ✓ " + scan_av(path, skip_av))
    src_hash = sha256(path)
    if src_hash in known:
        raise Refused("this exact file has been published already")
    out = work / f"{secrets.token_hex(8)}.pdf"
    info = clean(path, out)
    removed = ", ".join(f"{k} ×{v}" for k, v in info["removed"].items()) or "nothing risky"
    print(f"  ✓ structure clean after rewriting ({info['pages']} pages; removed: {removed}; metadata stripped)")
    print("  ✓ cleaned copy: " + scan_av(out, skip_av))
    clean_hash = sha256(out)
    if clean_hash in known:
        raise Refused("an identical exam has been published already")
    pii = scan_pii(out)
    if pii:
        print("  ! possible personal data (check the file by hand):")
        for h in pii[:20]:
            print("      " + h)
    else:
        print("  ✓ no personal data patterns found (images and handwriting still need a look)")
    return {"clean": out, "pages": info["pages"], "bytes": out.stat().st_size, "sha256": clean_hash, "source_sha256": src_hash, "pii": pii}


def known_hashes(data: dict) -> set[str]:
    out = set()
    for ex in data["exams"]:
        for f in ex["files"]:
            out.update({f["sha256"], f.get("source_sha256", "")})
    return out - {""}


def confirm(msg: str, yes: bool) -> None:
    if yes:
        return
    if input(f"{msg} [y/N] ").strip().lower() != "y":
        raise SystemExit("stopped; nothing was published")


def hf():
    """Always the dedicated fine-grained token (write access to the gallery dataset only), never HF_TOKEN or the default login."""
    from huggingface_hub import HfApi
    from huggingface_hub.utils import get_stored_tokens
    token = get_stored_tokens().get("exam-gallery-upload")
    if not token:
        raise SystemExit("no stored Hugging Face token named exam-gallery-upload; run `hf auth login --force` with it first")
    return HfApi(token=token)


def cmd_check(args) -> None:
    data = load_manifest()
    with tempfile.TemporaryDirectory() as tmp:
        for p in args.files:
            try:
                r = inspect(Path(p), Path(tmp), args.skip_av, known_hashes(data))
                print(f"  → would publish {r['bytes'] / 1024:.0f} KB, sha256 {r['sha256'][:16]}…" + (" (after a manual personal-data check)" if r["pii"] else ""))
            except Refused as err:
                print(f"  ✗ REFUSED: {err}")


def clean_text(s: str, limit: int) -> str:
    s = re.sub(r"[\x00-\x1f\x7f<>\"'`\\]", "", s or "").strip()
    return s[:limit]


def cmd_add(args) -> None:
    data = load_manifest()
    if args.subject not in SUBJECTS:
        raise SystemExit(f"--subject must be one of: {', '.join(SUBJECTS)}")
    if args.ai not in AIS:
        raise SystemExit(f"--ai must be one of: {', '.join(AIS)}")
    if args.te_version and not re.fullmatch(r"\d{4}\.\d{2}\.\d{2}\.\d{1,3}", args.te_version):
        raise SystemExit("--te-version looks like 2026.09.22.25")
    credit = clean_text(args.credit, 20)
    ex_id = f"{dt.date.today():%Y%m%d}-{secrets.token_hex(3)}"
    with tempfile.TemporaryDirectory() as tmp:
        files = []
        try:
            for role, p in (("questions", args.questions), ("solutions", args.solutions)):
                if p:
                    r = inspect(Path(p), Path(tmp), args.skip_av, known_hashes(data))
                    r["role"] = role
                    files.append(r)
        except Refused as err:
            raise SystemExit(f"\n✗ REFUSED: {err}\nNothing was published.")
        if any(f["pii"] for f in files) and not args.allow_pii:
            raise SystemExit("\n✗ possible personal data found. Check the pages listed above; if they are false alarms, "
                             "run again with --allow-pii. Nothing was published.")
        folder = f"exams/{args.subject}/{ex_id}"
        entry = {"id": ex_id, "date": f"{dt.date.today():%Y-%m-%d}", "subject": args.subject, "ai": args.ai,
                 "te_version": args.te_version or "", "credit": credit, "preview": f"/assets/exams/{ex_id}.webp",
                 "files": [{"role": f["role"], "path": f"{folder}/{f['role']}.pdf", "sha256": f["sha256"],
                            "source_sha256": f["source_sha256"], "bytes": f["bytes"], "pages": f["pages"]} for f in files]}
        print(f"\nReady to publish {ex_id} ({SUBJECTS[args.subject]}, {args.ai}{', credit ' + credit if credit else ''}):")
        for f in entry["files"]:
            print(f"  {f['path']}  {f['pages']} pages  {f['bytes'] / 1024:.0f} KB")
        confirm("Publish to https://huggingface.co/datasets/" + data["dataset"] + " ?", args.yes)
        render_preview(files[0]["clean"], PREVIEWS / f"{ex_id}.webp")
        from huggingface_hub import CommitOperationAdd
        data["exams"].insert(0, entry)
        public = json.dumps({"license": "CC BY-NC 4.0", "exams": [{k: v for k, v in e.items() if k != "preview"} for e in data["exams"]]},
                            ensure_ascii=False, indent=1).encode()
        ops = [CommitOperationAdd(path_in_repo=f"{folder}/{f['role']}.pdf", path_or_fileobj=str(f["clean"])) for f in files]
        ops.append(CommitOperationAdd(path_in_repo="manifest.json", path_or_fileobj=public))
        try:
            hf().create_commit(repo_id=data["dataset"], repo_type="dataset", operations=ops, commit_message=f"Add {ex_id} ({args.subject})")
        except Exception:
            (PREVIEWS / f"{ex_id}.webp").unlink(missing_ok=True)
            raise
        save_manifest(data)
    print(f"\n✓ published {ex_id}. Rebuild the site and push to show it on /exams/.")


def cmd_remove(args) -> None:
    data = load_manifest()
    entry = next((x for x in data["exams"] if x["id"] == args.id), None)
    if not entry:
        raise SystemExit(f"no exam with id {args.id}")
    confirm(f"Remove {args.id} and squash the dataset history so old copies cannot be downloaded? (reason: {args.reason})", args.yes)
    from huggingface_hub import CommitOperationAdd, CommitOperationDelete
    data["exams"] = [x for x in data["exams"] if x["id"] != args.id]
    public = json.dumps({"license": "CC BY-NC 4.0", "exams": [{k: v for k, v in e.items() if k != "preview"} for e in data["exams"]]},
                        ensure_ascii=False, indent=1).encode()
    api = hf()
    api.create_commit(repo_id=data["dataset"], repo_type="dataset", commit_message=f"Remove {args.id}",
                      operations=[CommitOperationDelete(path_in_repo=f"exams/{entry['subject']}/{args.id}/"),
                                  CommitOperationAdd(path_in_repo="manifest.json", path_or_fileobj=public)])
    api.super_squash_history(repo_id=data["dataset"], repo_type="dataset", commit_message="Squash history after a takedown")
    (PREVIEWS / f"{args.id}.webp").unlink(missing_ok=True)
    save_manifest(data)
    log = ROOT / "exam_src" / "takedowns.log"
    with open(log, "a", encoding="utf-8") as f:
        f.write(f"{dt.datetime.now():%Y-%m-%d %H:%M} {args.id} {args.reason}\n")
    print(f"✓ removed {args.id} and squashed the history. Rebuild the site and push.")


def cmd_list(_args) -> None:
    data = load_manifest()
    for x in data["exams"]:
        print(f"{x['id']}  {SUBJECTS[x['subject']]}  {x['ai']:<8} {x['credit'] or '-':<10} " + " ".join(f"{f['role']}:{f['pages']}p" for f in x["files"]))
    print(f"{len(data['exams'])} exams in {data['dataset']}")


CARD = """---
license: cc-by-nc-4.0
language:
- zh
pretty_name: Taiwan Exam gallery
tags:
- education
- exam
- synthetic
- taiwan
size_categories:
- n<1K
---

# Taiwan Exam gallery

Original GSAT-style mock exams (題本與詳解, PDF) that people generated with [Taiwan Exam](https://github.com/niansia/taiwan-exam)
and shared so that others without a paid AI plan can practise with them. Browse them by subject at <https://niansia.com/exams/>.

## What is here

- `exams/<subject>/<id>/questions.pdf` and `solutions.pdf`
- `manifest.json`: subject, date, the AI used, the Taiwan Exam version, page counts and SHA-256 of every file

Subjects: chinese 國綜 · writing 國寫 · english 英文 · math-a 數A · math-b 數B · social 社會 · science 自然

## How files get here

Uploads come through a form that needs a Google sign-in and are published only after review. Every file is scanned for
malware, refused if it carries JavaScript, launch actions or embedded files, and rewritten with its metadata, links,
annotations and form fields removed. Files are checked for personal data before publication.

## Please note

- The questions and answers are generated by AI and **may contain mistakes**. Check them against your textbook and teachers.
- These are original mock exams, not past papers from the College Entrance Examination Center or material from any cram school or publisher.
- License: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Share and adapt with attribution; no commercial use.

## Takedown and reports

If a file infringes your rights, contains personal data or has a serious error, e-mail niansia930202@gmail.com with the
exam id. Removed files are deleted together with the repository history.
"""


def cmd_init(_args) -> None:
    data = load_manifest()
    from huggingface_hub import CommitOperationAdd
    public = json.dumps({"license": "CC BY-NC 4.0", "exams": []}, ensure_ascii=False, indent=1).encode()
    ops = [CommitOperationAdd(path_in_repo="README.md", path_or_fileobj=CARD.encode())]
    if not data["exams"]:
        ops.append(CommitOperationAdd(path_in_repo="manifest.json", path_or_fileobj=public))
    hf().create_commit(repo_id=data["dataset"], repo_type="dataset", operations=ops, commit_message="Describe the dataset")
    print(f"✓ dataset card written to https://huggingface.co/datasets/{data['dataset']}")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Check, clean and publish Taiwan Exam mock exams.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check"); c.add_argument("files", nargs="+"); c.add_argument("--skip-av", action="store_true")
    a = sub.add_parser("add")
    a.add_argument("--subject", required=True); a.add_argument("--questions", required=True); a.add_argument("--solutions")
    a.add_argument("--ai", required=True); a.add_argument("--te-version", default=""); a.add_argument("--credit", default="")
    a.add_argument("--allow-pii", action="store_true"); a.add_argument("--skip-av", action="store_true"); a.add_argument("--yes", action="store_true")
    r = sub.add_parser("remove"); r.add_argument("id"); r.add_argument("--reason", required=True); r.add_argument("--yes", action="store_true")
    sub.add_parser("list"); sub.add_parser("init")
    args = ap.parse_args()
    {"check": cmd_check, "add": cmd_add, "remove": cmd_remove, "list": cmd_list, "init": cmd_init}[args.cmd](args)


if __name__ == "__main__":
    main()
