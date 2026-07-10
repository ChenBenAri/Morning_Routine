#!/usr/bin/env python3
"""Render PWA icons from the rainbow SVG via Node + resvg."""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NODE = ROOT / ".tools" / "node" / "bin" / "node"


def main():
    script = """
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');
const svg = fs.readFileSync('public/icons/icon.svg');
const sizes = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 };
for (const [name, size] of Object.entries(sizes)) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  fs.writeFileSync(path.join('public/icons', name), resvg.render().asPng());
  console.log('Wrote', name);
}
"""
    subprocess.run([str(NODE), "-e", script], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
