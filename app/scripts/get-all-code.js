/* /app/scripts/get-all-code.js
   Reads all source code files under a project folder (recursively),
   ignoring the "/lib" folder, and writes the combined output to a single file.
*/

"use strict";

const fs = require("node:fs");
const path = require("node:path");

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function shouldIgnorePath(absolutePath, ignoreAbsolutePaths) {
  const resolved = path.resolve(absolutePath);
  return ignoreAbsolutePaths.some((ignored) => {
    const ignoredResolved = path.resolve(ignored);
    return resolved === ignoredResolved || resolved.startsWith(ignoredResolved + path.sep);
  });
}

function isProbablyTextFileByExtension(filePath, allowedExtensionsLowerCase) {
  const extension = path.extname(filePath).toLowerCase();
  return allowedExtensionsLowerCase.has(extension);
}

function readDirectoryRecursively(options) {
  const {
    rootDirectoryAbsolutePath,
    ignoreAbsolutePaths,
    allowedExtensionsLowerCase,
    maxFileSizeBytes,
  } = options;

  /** @type {string[]} */
  const collectedFilePaths = [];

  /** @type {string[]} */
  const directoriesToVisit = [rootDirectoryAbsolutePath];

  while (directoriesToVisit.length > 0) {
    const currentDirectory = directoriesToVisit.pop();

    if (!currentDirectory) continue;
    if (shouldIgnorePath(currentDirectory, ignoreAbsolutePaths)) continue;

    let dirEntries;
    try {
      dirEntries = fs.readdirSync(currentDirectory, { withFileTypes: true });
    } catch (error) {
      // If something is unreadable (permissions), skip it.
      continue;
    }

    for (const dirent of dirEntries) {
      const absoluteEntryPath = path.join(currentDirectory, dirent.name);

      if (shouldIgnorePath(absoluteEntryPath, ignoreAbsolutePaths)) {
        continue;
      }

      // Skip hidden folders/files (like .git, .DS_Store) by default.
      if (dirent.name.startsWith(".")) {
        continue;
      }

      if (dirent.isDirectory()) {
        directoriesToVisit.push(absoluteEntryPath);
        continue;
      }

      if (!dirent.isFile()) continue;

      if (!isProbablyTextFileByExtension(absoluteEntryPath, allowedExtensionsLowerCase)) {
        continue;
      }

      let fileStats;
      try {
        fileStats = fs.statSync(absoluteEntryPath);
      } catch (error) {
        continue;
      }

      if (fileStats.size > maxFileSizeBytes) {
        // Skip giant files so the output stays manageable.
        continue;
      }

      collectedFilePaths.push(absoluteEntryPath);
    }
  }

  collectedFilePaths.sort((a, b) => a.localeCompare(b));
  return collectedFilePaths;
}

function buildCombinedOutput(options) {
  const { rootDirectoryAbsolutePath, filePathsAbsolute, includeLineNumbers } = options;

  const chunks = [];
  chunks.push(
    [
      "/*",
      "  Combined project source export",
      `  Root: ${normalizePathForOutput(rootDirectoryAbsolutePath)}`,
      `  Generated: ${new Date().toISOString()}`,
      "*/",
      "",
    ].join("\n"),
  );

  for (const absoluteFilePath of filePathsAbsolute) {
    const relativeFilePath = path.relative(rootDirectoryAbsolutePath, absoluteFilePath);
    const relativeFilePathNormalized = normalizePathForOutput(relativeFilePath);

    let fileContents;
    try {
      fileContents = fs.readFileSync(absoluteFilePath, "utf8");
    } catch (error) {
      continue;
    }

    // Normalize newlines for consistent copy/paste.
    const normalizedContents = fileContents.replace(/\r\n/g, "\n");

    chunks.push(
      [
        "",
        "/* =====================================================================================",
        `   FILE: ${relativeFilePathNormalized}`,
        "   ===================================================================================== */",
        "",
      ].join("\n"),
    );

    if (!includeLineNumbers) {
      chunks.push(normalizedContents);
      continue;
    }

    const lines = normalizedContents.split("\n");
    const numberedLines = lines.map((line, index) => {
      const lineNumber = String(index + 1).padStart(5, " ");
      return `${lineNumber} | ${line}`;
    });
    chunks.push(numberedLines.join("\n"));
  }

  chunks.push("");
  return chunks.join("\n");
}

function parseCommandLineArguments() {
  const args = process.argv.slice(2);

  const parsed = {
    root: process.cwd(),
    out: path.join(process.cwd(), "ALL_CODE.txt"),
    includeLineNumbers: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--root") {
      parsed.root = args[index + 1] ? path.resolve(args[index + 1]) : parsed.root;
      index += 1;
      continue;
    }

    if (arg === "--out") {
      parsed.out = args[index + 1] ? path.resolve(args[index + 1]) : parsed.out;
      index += 1;
      continue;
    }

    if (arg === "--line-numbers") {
      parsed.includeLineNumbers = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      return { ...parsed, help: true };
    }
  }

  return parsed;
}

function main() {
  const parsedArguments = parseCommandLineArguments();

  if (parsedArguments.help) {
    console.log(`
Usage:
  node app/scripts/get-all-code.js [--root <path>] [--out <file>] [--line-numbers]

Examples:
  node app/scripts/get-all-code.js
  node app/scripts/get-all-code.js --root . --out ALL_CODE.txt
  node app/scripts/get-all-code.js --root ./app --out ./exports/ALL_CODE.txt --line-numbers

Notes:
  - Skips hidden folders/files (anything starting with ".")
  - Ignores the "/lib" folder at the root of --root (external libraries)
  - Skips files larger than 2 MB (adjust in script if needed)
`);
    process.exit(0);
  }

  const rootDirectoryAbsolutePath = path.resolve(parsedArguments.root);

  const ignoreAbsolutePaths = [
    path.join(rootDirectoryAbsolutePath, "lib"),
    path.join(rootDirectoryAbsolutePath, "node_modules"),
    path.join(rootDirectoryAbsolutePath, "dist"),
    path.join(rootDirectoryAbsolutePath, "build"),
    path.join(rootDirectoryAbsolutePath, "coverage"),
    path.join(rootDirectoryAbsolutePath, ".git"),
  ];

  const allowedExtensionsLowerCase = new Set([
    ".js",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".html",
    ".htm",
    ".md",
    ".yml",
    ".yaml",
    ".txt",
    ".glsl",
    ".frag",
    ".vert",
  ]);

  const maxFileSizeBytes = 2 * 1024 * 1024; // 2 MB

  const filePathsAbsolute = readDirectoryRecursively({
    rootDirectoryAbsolutePath,
    ignoreAbsolutePaths,
    allowedExtensionsLowerCase,
    maxFileSizeBytes,
  });

  const combinedOutput = buildCombinedOutput({
    rootDirectoryAbsolutePath,
    filePathsAbsolute,
    includeLineNumbers: parsedArguments.includeLineNumbers,
  });

  const outFileAbsolutePath = path.resolve(parsedArguments.out);
  const outDirectory = path.dirname(outFileAbsolutePath);

  fs.mkdirSync(outDirectory, { recursive: true });
  fs.writeFileSync(outFileAbsolutePath, combinedOutput, "utf8");

}

main();
