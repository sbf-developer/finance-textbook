import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("../output/spreadsheets/", import.meta.url).pathname;
const previewDir = new URL("../output/spreadsheet_previews/", import.meta.url).pathname;
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = Workbook.create();
const cover = workbook.worksheets.add("Cover");
const assumptions = workbook.worksheets.add("Assumptions");
const dcf = workbook.worksheets.add("DCF");
const bond = workbook.worksheets.add("Bond");
const portfolio = workbook.worksheets.add("Portfolio");
const options = workbook.worksheets.add("Options");
const checks = workbook.worksheets.add("Checks");
const sources = workbook.worksheets.add("Sources");

const navy = "#0B1F33";
const slate = "#334155";
const muted = "#64748B";
const pale = "#EFF6FF";
const inputFill = "#FFF7CC";
const greenFill = "#DCFCE7";
const redFill = "#FEE2E2";
const line = "#CBD5E1";

function title(sheet, range, textValue) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[textValue]];
  r.format = { fill: navy, font: { color: "#FFFFFF", bold: true, size: 16 }, horizontalAlignment: "left", verticalAlignment: "center" };
  r.format.rowHeight = 28;
}

function section(sheet, range, textValue) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[textValue]];
  r.format = { fill: slate, font: { color: "#FFFFFF", bold: true }, horizontalAlignment: "left" };
}

function header(range) {
  range.format = { fill: pale, font: { bold: true, color: navy }, borders: { preset: "all", style: "thin", color: line }, horizontalAlignment: "center" };
}

function grid(range) {
  range.format.borders = { preset: "all", style: "thin", color: line };
}

function inputs(range) {
  range.format = { fill: inputFill, font: { color: "#0000FF" } };
}

function total(range) {
  range.format = { font: { bold: true }, borders: { top: { style: "thin", color: navy } } };
}

function note(range) {
  range.format = { font: { color: muted, italic: true, size: 9 }, wrapText: true };
}

for (const sheet of [cover, assumptions, dcf, bond, portfolio, options, checks, sources]) {
  sheet.showGridLines = false;
}

// Cover
title(cover, "A1:H1", "FINANCE AND QUANTITATIVE MARKETS | LAB WORKBOOK");
cover.getRange("A3:B7").values = [
  ["Purpose", "Auditable classroom models accompanying the textbook"],
  ["As of", "2026-07-17"],
  ["Currency", "Generic currency units unless labelled otherwise"],
  ["Data status", "Simulated illustrative inputs; not investment advice"],
  ["Model status", "See Checks sheet"],
];
cover.getRange("A3:A7").format = { font: { bold: true, color: navy } };
cover.getRange("B3:B7").format.wrapText = true;
section(cover, "A9:H9", "Workbook map");
cover.getRange("A10:C17").values = [
  ["Sheet", "Use", "Editable inputs"],
  ["Assumptions", "Central DCF assumptions and forecast drivers", "Blue text / yellow fill"],
  ["DCF", "Unlevered cash flow valuation", "Linked from Assumptions"],
  ["Bond", "Plain fixed-coupon bond price and duration", "Blue text / yellow fill"],
  ["Portfolio", "Two-asset mean-variance calculation", "Blue text / yellow fill"],
  ["Options", "Black-Scholes-Merton European call", "Blue text / yellow fill"],
  ["Checks", "Formula-driven tie-outs and status", "No"],
  ["Sources", "Source and convention log", "No"],
];
header(cover.getRange("A10:C10"));
grid(cover.getRange("A10:C17"));
note(cover.getRange("A19:H21"));
cover.getRange("A19:H21").merge();
cover.getRange("A19:H21").values = [["Workbook conventions: blue text with yellow fill denotes editable assumptions; black text denotes calculations; green text denotes same-workbook links. Formulas are deliberately simple and bounded. Review the Sources sheet before replacing simulated inputs with official data."]];
cover.getRange("A:A").format.columnWidth = 18;
cover.getRange("B:B").format.columnWidth = 42;
cover.getRange("C:C").format.columnWidth = 25;
cover.freezePanes.freezeRows(1);

// Assumptions
title(assumptions, "A1:H1", "ASSUMPTIONS | SIMULATED NORTHSTAR CASE");
assumptions.getRange("A3:C10").values = [
  ["Assumption", "Value", "Units / note"],
  ["Revenue at t=0", 100, "$mm"],
  ["Tax rate", 0.25, "fraction"],
  ["Discount rate", 0.09, "annual effective"],
  ["Terminal growth", 0.025, "annual"],
  ["Net debt", 25, "$mm"],
  ["Shares outstanding", 10, "mm shares"],
  ["NWC / revenue", 0.10, "fraction"],
];
header(assumptions.getRange("A3:C3"));
grid(assumptions.getRange("A3:C10"));
inputs(assumptions.getRange("B4:B10"));
assumptions.getRange("B5:B7").format.numberFormat = "0.0%";
assumptions.getRange("B10").format.numberFormat = "0.0%";
section(assumptions, "A12:H12", "Forecast drivers");
assumptions.getRange("A13:F15").values = [
  ["Driver", "2026E", "2027E", "2028E", "2029E", "2030E"],
  ["Revenue growth", 0.08, 0.07, 0.06, 0.05, 0.04],
  ["EBIT margin", 0.15, 0.155, 0.16, 0.165, 0.17],
];
header(assumptions.getRange("A13:F13"));
grid(assumptions.getRange("A13:F15"));
inputs(assumptions.getRange("B14:F15"));
assumptions.getRange("B14:F15").format.numberFormat = "0.0%";
note(assumptions.getRange("A18:H20"));
assumptions.getRange("A18:H20").merge();
assumptions.getRange("A18:H20").values = [["All inputs on this sheet are illustrative and simulated. Replace them only after recording source, retrieval date, unit, currency, accounting basis, and revision policy. Terminal value uses a Gordon-growth convention and is highly sensitive to the spread between discount rate and terminal growth."]];
assumptions.getRange("A:A").format.columnWidth = 23;
assumptions.getRange("B:F").format.columnWidth = 14;
assumptions.getRange("C:C").format.columnWidth = 20;
assumptions.freezePanes.freezeRows(3);

// DCF
title(dcf, "A1:H1", "DCF | UNLEVERED FREE CASH FLOW");
dcf.getRange("A3:F3").values = [["Line item", "2026E", "2027E", "2028E", "2029E", "2030E"]];
header(dcf.getRange("A3:F3"));
dcf.getRange("A4:A15").values = [
  ["Revenue ($mm)"], ["Growth"], ["EBIT margin"], ["EBIT ($mm)"], ["Cash taxes ($mm)"],
  ["D&A ($mm)"], ["Capex ($mm)"], ["NWC ($mm)"], ["Change in NWC ($mm)"], ["UFCF ($mm)"], ["Discount factor"], ["PV of UFCF ($mm)"],
];
dcf.getRange("B4:F4").formulas = [["='Assumptions'!B4*(1+'Assumptions'!B14)", "=B4*(1+'Assumptions'!C14)", "=C4*(1+'Assumptions'!D14)", "=D4*(1+'Assumptions'!E14)", "=E4*(1+'Assumptions'!F14)"]];
dcf.getRange("B5:F6").formulas = [["='Assumptions'!B14", "='Assumptions'!C14", "='Assumptions'!D14", "='Assumptions'!E14", "='Assumptions'!F14"], ["='Assumptions'!B15", "='Assumptions'!C15", "='Assumptions'!D15", "='Assumptions'!E15", "='Assumptions'!F15"]];
dcf.getRange("B7:F15").formulas = [
  ["=B4*B6", "=C4*C6", "=D4*D6", "=E4*E6", "=F4*F6"],
  ["=B7*'Assumptions'!B5", "=C7*'Assumptions'!B5", "=D7*'Assumptions'!B5", "=E7*'Assumptions'!B5", "=F7*'Assumptions'!B5"],
  ["=3", "=3", "=3", "=3", "=3"],
  ["=4", "=4", "=4", "=4", "=4"],
  ["=B4*'Assumptions'!B10", "=C4*'Assumptions'!B10", "=D4*'Assumptions'!B10", "=E4*'Assumptions'!B10", "=F4*'Assumptions'!B10"],
  ["=B11-'Assumptions'!B4*'Assumptions'!B10", "=C11-B11", "=D11-C11", "=E11-D11", "=F11-E11"],
  ["=B7-B8+B9-B10-B12", "=C7-C8+C9-C10-C12", "=D7-D8+D9-D10-D12", "=E7-E8+E9-E10-E12", "=F7-F8+F9-F10-F12"],
  ["=1/(1+'Assumptions'!B6)^1", "=1/(1+'Assumptions'!B6)^2", "=1/(1+'Assumptions'!B6)^3", "=1/(1+'Assumptions'!B6)^4", "=1/(1+'Assumptions'!B6)^5"],
  ["=B13*B14", "=C13*C14", "=D13*D14", "=E13*E14", "=F13*F14"],
];
grid(dcf.getRange("A3:F15"));
dcf.getRange("B5:F6").format.numberFormat = "0.0%";
dcf.getRange("B14:F14").format.numberFormat = "0.000x";
dcf.getRange("B4:F4").format.numberFormat = "0.00";
dcf.getRange("B7:F13").format.numberFormat = "0.00";
dcf.getRange("B15:F15").format.numberFormat = "0.00";
dcf.getRange("B18:B23").format.numberFormat = "0.00";
total(dcf.getRange("A13:F15"));
section(dcf, "A17:F17", "Valuation bridge");
dcf.getRange("A18:B23").values = [["PV forecast UFCF ($mm)", null], ["Terminal value ($mm)", null], ["PV terminal value ($mm)", null], ["Enterprise value ($mm)", null], ["Equity value ($mm)", null], ["Value per share", null]];
dcf.getRange("B18:B23").formulas = [["=SUM(B15:F15)"], ["=F13*(1+'Assumptions'!B7)/('Assumptions'!B6-'Assumptions'!B7)"], ["=B19*F14"], ["=B18+B20"], ["=B21-'Assumptions'!B8"], ["=B22/'Assumptions'!B9"]];
grid(dcf.getRange("A18:B23"));
total(dcf.getRange("A21:B23"));
note(dcf.getRange("A25:F27"));
dcf.getRange("A25:F27").merge();
dcf.getRange("A25:F27").values = [["D&A and Capex are simple illustrative constants in this compact workbook. A professional model should source each driver explicitly and include a sensitivity table, financing schedule, scenario cases, and an audit trail. The workbook's checks show whether the bridge is internally consistent, not whether the valuation is correct."]];
dcf.getRange("A:A").format.columnWidth = 27;
dcf.getRange("B:F").format.columnWidth = 14;
dcf.freezePanes.freezeRows(3);

// Bond
title(bond, "A1:F1", "BOND | PRICE, DURATION, AND CONVEXITY INPUTS");
bond.getRange("A3:C9").values = [
  ["Input", "Value", "Units"], ["Face value", 1000, "currency"], ["Coupon rate", 0.05, "annual"], ["Yield to maturity", 0.04, "annual"], ["Maturity", 2, "years"], ["Payments per year", 1, "frequency"], ["Price", null, "currency"],
];
header(bond.getRange("A3:C3"));
grid(bond.getRange("A3:C9"));
inputs(bond.getRange("B4:B8"));
bond.getRange("B5:B6").format.numberFormat = "0.00%";
bond.getRange("B9").formulas = [["=SUM(D13:D18)"]];
section(bond, "A11:F11", "Cash-flow schedule");
bond.getRange("A12:D12").values = [["Period", "Time (years)", "Cash flow", "PV cash flow"]];
header(bond.getRange("A12:D12"));
bond.getRange("A13:A18").values = [[1], [2], [3], [4], [5], [6]];
bond.getRange("B13:B18").formulas = [["=A13/$B$8"], ["=A14/$B$8"], ["=A15/$B$8"], ["=A16/$B$8"], ["=A17/$B$8"], ["=A18/$B$8"]];
bond.getRange("C13:C18").formulas = [["=IF(A13<=$B$7,$B$4*$B$5/$B$8+IF(A13=$B$7*$B$8,$B$4,0),0)"], ["=IF(A14<=$B$7,$B$4*$B$5/$B$8+IF(A14=$B$7*$B$8,$B$4,0),0)"], ["=IF(A15<=$B$7,$B$4*$B$5/$B$8+IF(A15=$B$7*$B$8,$B$4,0),0)"], ["=IF(A16<=$B$7,$B$4*$B$5/$B$8+IF(A16=$B$7*$B$8,$B$4,0),0)"], ["=IF(A17<=$B$7,$B$4*$B$5/$B$8+IF(A17=$B$7*$B$8,$B$4,0),0)"], ["=IF(A18<=$B$7,$B$4*$B$5/$B$8+IF(A18=$B$7*$B$8,$B$4,0),0)"]];
bond.getRange("D13:D18").formulas = [["=C13/(1+$B$6/$B$8)^A13"], ["=C14/(1+$B$6/$B$8)^A14"], ["=C15/(1+$B$6/$B$8)^A15"], ["=C16/(1+$B$6/$B$8)^A16"], ["=C17/(1+$B$6/$B$8)^A17"], ["=C18/(1+$B$6/$B$8)^A18"]];
grid(bond.getRange("A12:D18"));
bond.getRange("B13:D18").format.numberFormat = "0.00";
section(bond, "A20:C20", "Sensitivity measures");
bond.getRange("A21:B23").values = [["Macaulay duration", null], ["Modified duration", null], ["Convexity (annual periods)", null]];
bond.getRange("B21:B23").formulas = [["=SUMPRODUCT(B13:B18,D13:D18)/B9"], ["=B21/(1+B6)"], ["=SUMPRODUCT(C13:C18,B13:B18,B13:B18+1)/(B9*(1+B6)^2)"]];
grid(bond.getRange("A21:B23"));
total(bond.getRange("A21:B23"));
bond.getRange("B9:B23").format.numberFormat = "0.00";
bond.getRange("A:A").format.columnWidth = 27;
bond.getRange("B:D").format.columnWidth = 16;
bond.freezePanes.freezeRows(3);

// Portfolio
title(portfolio, "A1:F1", "PORTFOLIO | TWO-ASSET MEAN-VARIANCE LAB");
portfolio.getRange("A3:E6").values = [
  ["Asset", "Weight", "Expected return", "Volatility", "Source"],
  ["Equity_Sim", 0.60, 0.08, 0.15, "Simulated classroom input"],
  ["Bond_Sim", 0.40, 0.05, 0.08, "Simulated classroom input"],
  ["Correlation", null, null, 0.20, "Illustrative dependence"],
];
header(portfolio.getRange("A3:E3"));
grid(portfolio.getRange("A3:E6"));
inputs(portfolio.getRange("B4:D6"));
portfolio.getRange("B4:D6").format.numberFormat = "0.0%";
section(portfolio, "A8:D8", "Portfolio calculation");
portfolio.getRange("A9:B12").values = [["Weight check", null], ["Expected return", null], ["Variance", null], ["Volatility", null]];
portfolio.getRange("B9:B12").formulas = [["=SUM(B4:B5)"], ["=SUMPRODUCT(B4:B5,C4:C5)"], ["=B4^2*D4^2+B5^2*D5^2+2*B4*B5*D6*D4*D5"], ["=SQRT(B11)"]];
grid(portfolio.getRange("A9:B12"));
total(portfolio.getRange("A10:B12"));
portfolio.getRange("B9:B10").format.numberFormat = "0.0%";
portfolio.getRange("B11").format.numberFormat = "0.0000";
portfolio.getRange("B12").format.numberFormat = "0.0%";
note(portfolio.getRange("A14:E16"));
portfolio.getRange("A14:E16").merge();
portfolio.getRange("A14:E16").values = [["Expected returns and volatilities are illustrative inputs, not historical estimates. The covariance term uses the correlation in D6. In applied work, estimate uncertainty, regime changes, liquidity, taxes, and constraints matter."]];
portfolio.getRange("A:A").format.columnWidth = 22;
portfolio.getRange("B:D").format.columnWidth = 16;
portfolio.getRange("E:E").format.columnWidth = 30;

// Options
title(options, "A1:F1", "OPTIONS | BLACK-SCHOLES-MERTON EUROPEAN CALL");
options.getRange("A3:C9").values = [
  ["Input", "Value", "Units"], ["Spot price", 100, "currency"], ["Strike", 100, "currency"], ["Rate", 0.05, "continuous"], ["Volatility", 0.20, "annual"], ["Maturity", 1, "years"], ["Dividend yield", 0, "continuous"],
];
header(options.getRange("A3:C3"));
grid(options.getRange("A3:C9"));
inputs(options.getRange("B4:B9"));
options.getRange("B6:B7").format.numberFormat = "0.00%";
options.getRange("B9").format.numberFormat = "0.00%";
section(options, "A11:C11", "Model calculation");
options.getRange("A12:B16").values = [["d1", null], ["d2", null], ["N(d1)", null], ["N(d2)", null], ["Call value", null]];
options.getRange("B12:B16").formulas = [
  ["=(LN(B4/B5)+(B6-B9+B7^2/2)*B8)/(B7*SQRT(B8))"],
  ["=B12-B7*SQRT(B8)"],
  ["=NORM.S.DIST(B12,TRUE)"],
  ["=NORM.S.DIST(B13,TRUE)"],
  ["=B4*EXP(-B9*B8)*B14-B5*EXP(-B6*B8)*B15"],
];
grid(options.getRange("A12:B16"));
total(options.getRange("A16:B16"));
options.getRange("B12:B13").format.numberFormat = "0.00";
options.getRange("B14:B15").format.numberFormat = "0.0000";
options.getRange("B16").format.numberFormat = "0.00";
note(options.getRange("A18:F20"));
options.getRange("A18:F20").merge();
options.getRange("A18:F20").values = [["This is a model value for a European call under constant-rate, constant-volatility, continuous-trading assumptions. It is not a quote, an investment recommendation, or a guarantee that the model describes an observed options market."]];
options.getRange("A:A").format.columnWidth = 22;
options.getRange("B:B").format.columnWidth = 17;
options.getRange("C:C").format.columnWidth = 18;

// Checks
title(checks, "A1:F1", "CHECKS | FORMULA-DRIVEN CONTROL PANEL");
checks.getRange("A3:F3").values = [["Check", "Actual", "Expected", "Difference", "Tolerance", "Status"]];
header(checks.getRange("A3:F3"));
checks.getRange("A4:A8").values = [["DCF bridge"], ["Portfolio weights"], ["Portfolio variance non-negative"], ["Bond price positive"], ["Option value non-negative"]];
checks.getRange("B4:F8").formulas = [
  ["='DCF'!B21", "='DCF'!B18+'DCF'!B20", "=B4-C4", "=0.01", "=IF(ABS(D4)<=E4,\"OK\",\"CHECK\")"],
  ["='Portfolio'!B9", "=1", "=B5-C5", "=0.0001", "=IF(ABS(D5)<=E5,\"OK\",\"CHECK\")"],
  ["='Portfolio'!B11", "=0", "=B6-C6", "=0", "=IF(B6>=C6,\"OK\",\"CHECK\")"],
  ["='Bond'!B9", "=0", "=B7-C7", "=0", "=IF(B7>C7,\"OK\",\"CHECK\")"],
  ["='Options'!B16", "=0", "=B8-C8", "=0", "=IF(B8>=C8,\"OK\",\"CHECK\")"],
];
grid(checks.getRange("A3:F8"));
checks.getRange("F4:F8").conditionalFormats.add("containsText", { text: "OK", format: { fill: greenFill, font: { color: "#166534", bold: true } } });
checks.getRange("F4:F8").conditionalFormats.add("containsText", { text: "CHECK", format: { fill: redFill, font: { color: "#991B1B", bold: true } } });
section(checks, "A10:F10", "Model status");
checks.getRange("A11:B11").values = [["Overall", null]];
checks.getRange("B11").formulas = [["=IF(COUNTIF(F4:F8,\"CHECK\")=0,\"OK\",\"CHECK\")"]];
grid(checks.getRange("A11:B11"));
total(checks.getRange("A11:B11"));
checks.getRange("A:A").format.columnWidth = 34;
checks.getRange("B:E").format.columnWidth = 15;
checks.getRange("F:F").format.columnWidth = 14;
checks.freezePanes.freezeRows(3);

// Sources
title(sources, "A1:E1", "SOURCES | CONVENTIONS AND AUDIT NOTES");
sources.getRange("A3:E9").values = [
  ["ID", "Use", "Source / convention", "URL", "Status"],
  ["SIM", "All numerical inputs", "Simulated classroom inputs generated in the source package", "Local data/README.md", "Simulated"],
  ["SEC-FS", "Financial statements", "SEC beginner's guide to financial statements", "https://www.sec.gov/about/reports-publications/investorpubsbegfinstmtguide", "Official"],
  ["SEC-XBRL", "Replace simulated accounting data", "SEC financial statement data sets", "https://www.sec.gov/data-research/sec-markets-data/financial-statement-data-sets", "Official"],
  ["BIS", "Prudential context", "Basel Framework / market risk standards", "https://www.bis.org/bcbs/publ/d457.htm", "Official"],
  ["CFTC", "Futures conventions", "Futures market basics", "https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/FuturesMarketBasics/index.htm", "Official"],
  ["ECB", "Financial stability context", "Financial Stability Review, May 2026", "https://www.ecb.europa.eu/press/financial-stability-publications/fsr/html/ecb.fsr202605~50566915a7.en.html", "Official"],
];
header(sources.getRange("A3:E3"));
grid(sources.getRange("A3:E9"));
sources.getRange("A4:E9").format.wrapText = true;
sources.getRange("A:A").format.columnWidth = 14;
sources.getRange("B:B").format.columnWidth = 24;
sources.getRange("C:C").format.columnWidth = 42;
sources.getRange("D:D").format.columnWidth = 55;
sources.getRange("E:E").format.columnWidth = 14;
sources.freezePanes.freezeRows(3);

// Broad number formatting and alignment.
for (const sheet of [assumptions, dcf, bond, portfolio, options, checks]) {
  const used = sheet.getUsedRange();
  used.format.verticalAlignment = "center";
}

const rangesToRender = [
  ["Cover", "A1:H21"], ["Assumptions", "A1:H20"], ["DCF", "A1:H27"],
  ["Bond", "A1:F23"], ["Portfolio", "A1:F16"], ["Options", "A1:F20"],
  ["Checks", "A1:F11"], ["Sources", "A1:E9"],
];
for (const [sheetName, range] of rangesToRender) {
  const preview = await workbook.render({ sheetName, range, scale: 1.4, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(`${previewDir}/${sheetName}.png`, bytes);
}

const inspect = await workbook.inspect({ kind: "table", range: "Checks!A1:F11", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 8 });
await fs.writeFile(`${previewDir}/checks_inspect.ndjson`, inspect.ndjson ?? String(inspect));
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
await fs.writeFile(`${previewDir}/formula_errors.ndjson`, errors.ndjson ?? String(errors));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/finance_quantitative_markets_lab.xlsx`);
