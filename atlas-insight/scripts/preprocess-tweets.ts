/**
 * Preprocesses the Global Disaster Tweets dataset (id, keyword, location, text, target).
 *
 * Usage:
 *   npx tsx scripts/preprocess-tweets.ts [path-to-csv]
 *
 * Defaults to data/global-disaster-tweets/sample.csv, the bundled sample.
 * Swap in the real Kaggle "Global Disaster Tweets" CSV at the same path
 * (same column names) to preprocess the full dataset — no code changes needed.
 *
 * Writes data/processed/{train,validation,test}.csv and prints a report:
 * class distribution, missing values, duplicates, text length, samples.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface Row {
  id: string;
  keyword: string;
  location: string;
  text: string;
  target: string;
}

const REQUIRED_COLUMNS = ["id", "keyword", "location", "text", "target"];

function parseCsv(raw: string): Row[] {
  const lines = raw
    .replace(/^\uFEFF/, "") // strip UTF-8 BOM some exports (e.g. Excel/Kaggle) prepend
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]!);
  for (const col of REQUIRED_COLUMNS) {
    if (!header.includes(col)) {
      throw new Error(
        `Missing expected column "${col}". Found columns: ${header.join(", ")}. ` +
          `The dataset must match the Global Disaster Tweets schema.`,
      );
    }
  }
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!);
    if (cells.length < header.length) continue;
    const row: Record<string, string> = {};
    header.forEach((h, idx) => (row[h] = cells[idx] ?? ""));
    rows.push(row as unknown as Row);
  }
  return rows;
}

// Minimal CSV line splitter that respects double-quoted fields.
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function toCsv(rows: Row[]): string {
  const header = REQUIRED_COLUMNS.join(",");
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const body = rows
    .map((r) =>
      REQUIRED_COLUMNS.map((c) => escape((r as unknown as Record<string, string>)[c] ?? "")).join(
        ",",
      ),
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function main() {
  const inputPath = process.argv[2] ?? join(ROOT, "data/global-disaster-tweets/sample.csv");
  const raw = readFileSync(inputPath, "utf-8");
  const parsed = parseCsv(raw);

  const missingValues = parsed.filter((r) => !r.text || r.text.trim() === "").length;
  const beforeDedupe = parsed.length;

  // 1. remove null/empty text
  let rows = parsed.filter((r) => r.text && r.text.trim().length > 0);

  // 2. normalize whitespace (preserve disaster terms — no stopword stripping)
  rows = rows.map((r) => ({ ...r, text: normalizeWhitespace(r.text) }));

  // 3. remove duplicates (by normalized text)
  const seen = new Set<string>();
  const deduped: Row[] = [];
  for (const r of rows) {
    const key = r.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }
  const duplicatesRemoved = rows.length - deduped.length;
  rows = deduped;

  // 4. class balance
  const disaster = rows.filter((r) => r.target === "1");
  const nonDisaster = rows.filter((r) => r.target === "0");

  // 5. stratified train/validation/test split (70/15/15)
  const splitOne = (list: Row[]) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const trainEnd = Math.round(shuffled.length * 0.7);
    const valEnd = trainEnd + Math.round(shuffled.length * 0.15);
    return {
      train: shuffled.slice(0, trainEnd),
      validation: shuffled.slice(trainEnd, valEnd),
      test: shuffled.slice(valEnd),
    };
  };
  const dSplit = splitOne(disaster);
  const nSplit = splitOne(nonDisaster);
  const train = [...dSplit.train, ...nSplit.train];
  const validation = [...dSplit.validation, ...nSplit.validation];
  const test = [...dSplit.test, ...nSplit.test];

  const outDir = join(ROOT, "data/processed");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "train.csv"), toCsv(train));
  writeFileSync(join(outDir, "validation.csv"), toCsv(validation));
  writeFileSync(join(outDir, "test.csv"), toCsv(test));

  // text length stats
  const lengths = rows.map((r) => r.text.length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const maxLen = Math.max(0, ...lengths);
  const minLen = Math.min(...(lengths.length ? lengths : [0]));

  console.log("=== Global Disaster Tweets — preprocessing report ===");
  console.log(`Source file: ${inputPath}`);
  console.log(`Rows read: ${beforeDedupe}`);
  console.log(`Rows with missing/empty text removed: ${missingValues}`);
  console.log(`Duplicate rows removed: ${duplicatesRemoved}`);
  console.log(`Rows remaining: ${rows.length}`);
  console.log("");
  console.log("Class distribution:");
  console.log(
    `  disaster (1):     ${disaster.length} (${((disaster.length / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  non-disaster (0): ${nonDisaster.length} (${((nonDisaster.length / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log("");
  console.log("Text length (characters):");
  console.log(`  min: ${minLen}  avg: ${avgLen.toFixed(1)}  max: ${maxLen}`);
  console.log("");
  console.log(
    `Split (stratified 70/15/15): train=${train.length} validation=${validation.length} test=${test.length}`,
  );
  console.log(`Written to ${outDir}/{train,validation,test}.csv`);
  console.log("");
  console.log("Sample records:");
  for (const r of rows.slice(0, 3)) {
    console.log(`  [${r.target}] ${r.text}`);
  }
}

main();
