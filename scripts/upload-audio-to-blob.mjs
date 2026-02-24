import { put } from "@vercel/blob";
import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const envPaths = [".env.local", ".env"];
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const AUDIO_DIR = path.resolve("Audio_elearning");
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN. Set it in your environment before running this script.");
  process.exit(1);
}

let entries = [];
try {
  entries = await readdir(AUDIO_DIR, { withFileTypes: true });
} catch {
  console.error(`Audio directory not found at: ${AUDIO_DIR}`);
  process.exit(1);
}

const mp3Files = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
  .map((entry) => entry.name);

if (mp3Files.length === 0) {
  console.log("No MP3 files found in Audio_elearning.");
  process.exit(0);
}

for (const filename of mp3Files) {
  const fullPath = path.join(AUDIO_DIR, filename);
  const buffer = await readFile(fullPath);
  const blob = await put(`audio/${filename}`, new Blob([buffer], { type: "audio/mpeg" }), {
    access: "public",
    token: TOKEN,
  });
  console.log(`${filename} -> ${blob.url}`);
}
