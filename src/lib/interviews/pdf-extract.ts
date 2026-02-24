import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// PostgreSQL text fields reject NUL bytes (0x00).
// We also strip non-printable control chars to avoid malformed payloads.
function sanitizeExtractedText(value: string): string {
  return value
    .replace(/\u0000/g, " ")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function tryPdftotext(buffer: Buffer): Promise<string | null> {
  const baseDir = path.join(tmpdir(), "elearning-pdf");
  const workDir = path.join(baseDir, randomUUID());
  const inputPath = path.join(workDir, "input.pdf");
  const outputPath = path.join(workDir, "output.txt");

  await mkdir(workDir, { recursive: true });
  await writeFile(inputPath, buffer);

  try {
    await execFileAsync("pdftotext", [inputPath, outputPath]);
    if (!existsSync(outputPath)) return null;
    const content = await readFile(outputPath, "utf8");
    return content.trim();
  } catch {
    return null;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

function fallbackPdfHeuristic(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const chunks = raw.match(/\(([^()]{2,})\)/g) ?? [];
  const extracted = chunks
    .map((chunk) => chunk.slice(1, -1))
    .join(" ")
    .replace(/\\[nrt]/g, " ")
    .replace(/\\\d{3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return extracted;
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const pdftotextContent = await tryPdftotext(buffer);
  const sanitizedPdftotext = pdftotextContent ? sanitizeExtractedText(pdftotextContent) : "";
  if (sanitizedPdftotext.length > 20) {
    return sanitizedPdftotext;
  }

  const fallback = sanitizeExtractedText(fallbackPdfHeuristic(buffer));
  if (!fallback || fallback.length < 5) {
    throw new Error("Extraction PDF impossible. Installez `pdftotext` ou verifiez le fichier source.");
  }
  return fallback;
}

export { sanitizeExtractedText };
