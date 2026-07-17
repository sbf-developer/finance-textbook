#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

mkdir -p output/pdf_final

python3 code/finance_models.py \
  --generate-data \
  --output-dir data \
  --figure-dir figures
python3 -m unittest discover -s code -p 'test_*.py' -v

pdflatex -interaction=nonstopmode -halt-on-error \
  -output-directory=output/pdf_final main.tex
makeindex -o output/pdf_final/main.ind output/pdf_final/main.idx
pdflatex -interaction=nonstopmode -halt-on-error \
  -output-directory=output/pdf_final main.tex
pdflatex -interaction=nonstopmode -halt-on-error \
  -output-directory=output/pdf_final main.tex

cp output/pdf_final/main.pdf output/pdf_final/finance_and_quantitative_markets.pdf
echo "Built output/pdf_final/finance_and_quantitative_markets.pdf"
