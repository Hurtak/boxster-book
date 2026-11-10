#!/usr/bin/env python3
"""Build the numbered chapter directories into one standalone reading edition."""

import argparse
from html import escape
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent.parent
CHAPTER_NAME = re.compile(r"(\d{2,})-[a-z0-9]+(?:-[a-z0-9]+)*")


class DiagramReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.names = set()

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key == "data-diagram":
                if not value:
                    raise ValueError("Diagram references need a non-empty data-diagram name")
                self.names.add(value)


def compile_diagrams(chapters, temporary, edition):
    if not any((chapter.parent / "diagrams").is_dir() for chapter in chapters):
        return {"ids": [], "script": None, "css": None}
    node = shutil.which("node")
    if not node or not (ROOT / "node_modules" / "esbuild").is_dir():
        raise ValueError("Interactive diagrams require Node 22+ and npm dependencies. Run npm ci first.")
    result = subprocess.run(
        [node, str(ROOT / "scripts" / "build-diagrams.mjs"), edition, temporary, *map(str, chapters)],
        cwd=ROOT, check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)


def chapter_files(source: Path) -> list[Path]:
    chapters = {}
    for folder in source.iterdir():
        if not folder.is_dir() or not folder.name[0].isdigit():
            continue
        match = CHAPTER_NAME.fullmatch(folder.name)
        if not match:
            raise ValueError(f"Invalid chapter folder: {folder.name}. Use 01-chapter-name.")
        number = int(match[1])
        if number == 0 or number in chapters:
            raise ValueError(f"Chapter numbers must be positive and unique: {folder.name}")
        chapter = folder / "index.md"
        if not chapter.is_file():
            raise ValueError(f"Missing chapter file: {chapter}")
        first_line = chapter.read_text(encoding="utf-8").lstrip().splitlines()
        if not first_line or not first_line[0].startswith("# ") or not first_line[0][2:].strip():
            raise ValueError(f"Start {chapter} with a Markdown chapter title: # Chapter title")
        chapters[number] = chapter
    if not chapters:
        raise ValueError(f"No numbered chapter folders found in {source}")
    return [chapters[number] for number in sorted(chapters)]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "book", help="Chapter directory")
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "book.html", help="Output HTML file")
    parser.add_argument("--format", choices=("portable", "web"), default="portable", help="One offline HTML file, or HTML with lazy-loaded web assets")
    args = parser.parse_args()
    pandoc = shutil.which("pandoc")
    if not pandoc:
        parser.error("Pandoc is required. Install it from https://pandoc.org/installing.html")

    try:
        source = args.source.resolve()
        chapters = chapter_files(source)
        output = args.output.resolve()
        if output.suffix.lower() != ".html":
            raise ValueError("The output filename must end in .html")
        output.parent.mkdir(parents=True, exist_ok=True)
        # Keep an existing reading edition intact if a chapter or conversion fails.
        with tempfile.TemporaryDirectory(prefix=".book-build-", dir=output.parent) as temporary:
            built = Path(temporary) / "book.html"
            diagrams = compile_diagrams(chapters, temporary, args.format)
            styles = [f"--css={ROOT / 'scripts' / 'book.css'}"]
            if diagrams["css"]:
                styles.append(f"--css={diagrams['css']}")
            subprocess.run(
                [
                    pandoc,
                    "--from=markdown+rebase_relative_paths",
                    "--to=html5",
                    "--standalone",
                    "--file-scope",
                    "--shift-heading-level-by=1",
                    "--table-of-contents",
                    "--toc-depth=2",
                    "--section-divs",
                    "--embed-resources",
                    "--fail-if-warnings",
                    f"--template={ROOT / 'scripts' / 'book.html'}",
                    *styles,
                    "--metadata=title:Porsche Boxster 2.9",
                    "--metadata=subtitle:2010 · 987.2",
                    "--metadata=lang:en-GB",
                    f"--output={built}",
                    *[os.path.relpath(chapter, ROOT) for chapter in chapters],
                ],
                cwd=ROOT,
                check=True,
            )
            document = built.read_text(encoding="utf-8")
            references = DiagramReferences()
            references.feed(document)
            missing = references.names - set(diagrams["ids"])
            if missing:
                raise ValueError(f"Unknown diagram references: {', '.join(sorted(missing))}")
            if diagrams["script"]:
                script = Path(diagrams["script"])
                if args.format == "portable":
                    javascript = script.read_text(encoding="utf-8")
                    javascript = re.sub(r"</script", r"<\\/script", javascript, flags=re.IGNORECASE)
                    tag = f"<script>{javascript}</script>"
                else:
                    asset_name = f"{output.stem}-assets"
                    # Hashed filenames keep the previous edition working during a rebuild.
                    shutil.copytree(diagrams["assets"], output.parent / asset_name, dirs_exist_ok=True)
                    url = quote(f"{asset_name}/{script.name}")
                    tag = f'<script type="module" src="{escape(url, quote=True)}"></script>'
                notices = escape(Path(diagrams["notices"]).read_text(encoding="utf-8"))
                document = document.replace("</body>", f'<template id="third-party-notices"><pre>{notices}</pre></template>\n{tag}\n</body>')
                built.write_text(document, encoding="utf-8")
            built.replace(output)
        print(f"Built {len(chapters)} chapters → {output}")
        return 0
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        if isinstance(error, subprocess.CalledProcessError) and error.stderr:
            print(error.stderr, file=sys.stderr)
        print(f"Book build failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
