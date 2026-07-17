# Finance and Quantitative Markets

**Value, Risk, Decisions, and Financial Systems**  
Scott Brodie Forsyth

This directory is the complete editable source package for the textbook and its companion laboratory. The manuscript is written for a reader who knows basic arithmetic and develops finance, probability, statistics, derivatives, risk, empirical work, and quantitative implementation in sequence.

## Package map

- `main.tex` — book driver, design system, bibliography, and index.
- `chapters/` — 18 chapters and six appendices covering the manuscript, formulas, Python lab, data notes, glossary, exercises, and solutions.
- `code/` — tested NumPy/pandas/Matplotlib implementations for time value, bonds, DCF, portfolios, options, Monte Carlo, and risk statistics.
- `data/` — fixed-seed simulated prices and returns. These are not historical performance data.
- `figures/` — reproducible teaching figures generated from the simulated data.
- `spreadsheets/finance_workbook_builder.mjs` — builder for the companion workbook using the available artifact-tool runtime.
- `output/` — generated PDF, workbook, previews, and the source archive when built.

## Reproduce the code and data

From this directory, use Python 3 with NumPy, pandas, and Matplotlib:

```bash
python3 code/finance_models.py --generate-data --output-dir data --figure-dir figures
python3 -m unittest discover -s code -p 'test_*.py' -v
```

The generator records the seed and parameters in `data/README.md`. Changing the seed changes the sample and all derived figures. No supplied data file is an investment return claim.

## Build the PDF

The source uses a standard TeX installation with `pdflatex`, `makeindex`, and the packages listed in `main.tex`:

```bash
./build.sh
```

The script writes the PDF and TeX intermediates to `output/pdf_final/`. The final PDF is A4, single-sided, 74 pages in the supplied build, and includes the contents, figures list, bibliography, glossary, exercises and solutions, and index.

## Build the spreadsheet

The workbook builder expects the runtime-provided `@oai/artifact-tool` package. In the Codex environment:

```bash
node spreadsheets/finance_workbook_builder.mjs
```

It writes `output/spreadsheets/finance_quantitative_markets_lab.xlsx`. The workbook contains assumptions, DCF, bond, portfolio, option, checks, and source sheets. Formula errors are scanned and the check sheet must report `OK`.

## Evidence and scope

The edition is dated **17 July 2026**. Timeless identities and derivations are separated from empirical findings and date-sensitive institutional descriptions. The bibliography includes primary research and official material from the SEC, BIS, CFTC, TreasuryDirect, IOSCO/BIS, and ECB. Current law, market conventions, data availability, licensing terms, and professional obligations must be rechecked for the relevant jurisdiction before real-world use.

The manuscript is educational material, not investment, tax, accounting, legal, regulatory, or medical advice. Historical performance does not guarantee future returns.
