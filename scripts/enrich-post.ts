import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, basename } from "path";

const POSTS_DIR = resolve(import.meta.dirname!, "../content/posts");
const OLLAMA_URL = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "llama3";

function parseMdoc(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Could not parse frontmatter");
  return { frontmatter: match[1], body: match[2] };
}

function parseFrontmatterFields(fm: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const lines = fm.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const kvMatch = line.match(/^(\w[\w-]*?):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      // Check if next lines are array items
      if (
        value === "" &&
        i + 1 < lines.length &&
        lines[i + 1].startsWith("  - ")
      ) {
        const arr: string[] = [];
        i++;
        while (i < lines.length && lines[i].startsWith("  - ")) {
          arr.push(lines[i].replace(/^\s+-\s+/, ""));
          i++;
        }
        fields[key] = arr;
        continue;
      }
      // Multi-line scalar (>- syntax)
      if (value === ">-") {
        let scalar = "";
        i++;
        while (i < lines.length && lines[i].startsWith("  ")) {
          scalar += (scalar ? " " : "") + lines[i].trim();
          i++;
        }
        fields[key] = scalar;
        continue;
      }
      fields[key] = value;
    }
    i++;
  }
  return fields;
}

function buildFrontmatter(
  original: string,
  tags: string[],
  excerpt: string
): string {
  const lines = original.split("\n");
  const result: string[] = [];
  let i = 0;

  let tagsReplaced = false;
  let excerptReplaced = false;

  while (i < lines.length) {
    const line = lines[i];

    // Replace tags
    if (line.startsWith("tags:")) {
      result.push("tags:");
      for (const tag of tags) {
        result.push(`  - ${tag}`);
      }
      tagsReplaced = true;
      i++;
      // Skip old tag items
      while (i < lines.length && lines[i].startsWith("  - ")) i++;
      continue;
    }

    // Replace excerpt
    if (line.startsWith("excerpt:")) {
      if (excerpt.length > 60) {
        result.push("excerpt: >-");
        // Wrap at ~78 chars with 2-space indent
        const words = excerpt.split(" ");
        let current = "";
        for (const word of words) {
          if (current && current.length + word.length + 1 > 76) {
            result.push(`  ${current}`);
            current = word;
          } else {
            current = current ? `${current} ${word}` : word;
          }
        }
        if (current) result.push(`  ${current}`);
      } else {
        result.push(`excerpt: ${excerpt}`);
      }
      excerptReplaced = true;
      i++;
      // Skip old multi-line excerpt
      if (lines[i - 1].includes(">-")) {
        while (i < lines.length && lines[i].startsWith("  ")) i++;
      }
      continue;
    }

    result.push(line);
    i++;
  }

  // Add fields if they didn't exist
  if (!tagsReplaced) {
    result.push("tags:");
    for (const tag of tags) result.push(`  - ${tag}`);
  }
  if (!excerptReplaced) {
    if (excerpt.length > 60) {
      result.push("excerpt: >-");
      const words = excerpt.split(" ");
      let current = "";
      for (const word of words) {
        if (current && current.length + word.length + 1 > 76) {
          result.push(`  ${current}`);
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
      if (current) result.push(`  ${current}`);
    } else {
      result.push(`excerpt: ${excerpt}`);
    }
  }

  return result.join("\n");
}

async function callOllama(
  body: string,
  model: string
): Promise<{ tags: string[]; excerpt: string }> {
  const prompt = `You are a blog metadata assistant. Given the following blog post content, generate:
1. "tags" — an array of 3-6 lowercase, hyphenated tags relevant to the post topics (e.g. "system-design", "nextjs", "devops")
2. "excerpt" — a 1-2 sentence summary of the post (under 160 characters ideally)

Respond ONLY with valid JSON, no markdown fences, no explanation. Example:
{"tags": ["react", "web-dev"], "excerpt": "A short summary of the post."}

Blog post content:
${body.slice(0, 4000)}`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama API error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { response: string };
  const raw = data.response.trim();

  // Extract JSON from response (handle possible markdown fences)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Could not parse JSON from Ollama response:\n${raw}`);

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.tags) || typeof parsed.excerpt !== "string") {
    throw new Error(`Unexpected shape from Ollama:\n${JSON.stringify(parsed)}`);
  }

  return { tags: parsed.tags, excerpt: parsed.excerpt };
}

function resolvePostPath(input: string): string {
  if (input.endsWith(".mdoc")) return resolve(input);
  return resolve(POSTS_DIR, `${input}.mdoc`);
}

async function processPost(
  filePath: string,
  model: string,
  dryRun: boolean
): Promise<void> {
  const slug = basename(filePath, ".mdoc");
  console.log(`\n--- Processing: ${slug} ---`);

  const raw = readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseMdoc(raw);
  const existing = parseFrontmatterFields(frontmatter);

  console.log(`  Current tags: ${JSON.stringify(existing.tags || [])}`);
  console.log(`  Current excerpt: ${existing.excerpt || "(none)"}`);
  console.log(`  Calling Ollama (${model})...`);

  const { tags, excerpt } = await callOllama(body, model);

  console.log(`  Generated tags: ${JSON.stringify(tags)}`);
  console.log(`  Generated excerpt: ${excerpt}`);

  const newFrontmatter = buildFrontmatter(frontmatter, tags, excerpt);
  const newFile = `---\n${newFrontmatter}\n---\n${body}`;

  if (raw === newFile) {
    console.log("  No changes needed.");
    return;
  }

  if (dryRun) {
    console.log("\n  [DRY RUN] Would update frontmatter to:");
    console.log(
      newFrontmatter
        .split("\n")
        .map((l) => `    ${l}`)
        .join("\n")
    );
  } else {
    writeFileSync(filePath, newFile, "utf-8");
    console.log("  Updated!");
  }
}

// --- CLI ---
const args = process.argv.slice(2);

const dryRun = args.includes("--dry-run");
const modelIdx = args.indexOf("--model");
const model = modelIdx !== -1 ? args[modelIdx + 1] : DEFAULT_MODEL;
const positional = args.filter(
  (a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1] === "--model")
);

if (positional.length === 0 && !args.includes("--all")) {
  console.log(`Usage:
  npm run enrich -- <slug>              # enrich a single post
  npm run enrich -- <path.mdoc>         # enrich by file path
  npm run enrich -- --all               # enrich all posts

Options:
  --dry-run      Preview changes without saving
  --model <name> Ollama model to use (default: ${DEFAULT_MODEL})`);
  process.exit(0);
}

const filesToProcess: string[] = [];

if (args.includes("--all")) {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdoc"));
  filesToProcess.push(...files.map((f) => resolve(POSTS_DIR, f)));
} else {
  for (const input of positional) {
    filesToProcess.push(resolvePostPath(input));
  }
}

for (const file of filesToProcess) {
  try {
    await processPost(file, model, dryRun);
  } catch (err) {
    console.error(`  Error processing ${basename(file)}: ${err}`);
  }
}
