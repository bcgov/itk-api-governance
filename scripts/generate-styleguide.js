import fs from 'fs';
import path from 'path';

class ExampleDoc {
  constructor(kind, label) {
    this.kind = kind;          // "valid" or "invalid"
    this.label = label ?? null;
    this.content = [];
  }
}

class RuleDoc {
  constructor(name, severity) {
    this.name = name;
    this.severity = severity;
    this.description = [];
    this.examples = [];
  }
}

class SectionDoc {
  constructor(name) {
    this.name = name;
    this.description = [];
    this.rules = [];
  }
}

function stripComment(line) {
  // Remove leading whitespace + # + optional single space after #, but preserve trailing whitespace
  return line.replace(/^\s*#\s?/, '');
}

function formatSeverity(severity) {
  const sev = severity.toUpperCase();
  const lower = severity.toLowerCase();
  if (lower === 'error') return `<span style="color:red">${sev}</span>`;
  if (lower === 'warn')  return `<span style="color:goldenrod">${sev}</span>`;
  return sev;
}

const EXAMPLE_HEADER_RE = /^(valid|invalid)\s+example(?:\s*\(([^)]+)\))?:$/i;
const RULE_HEADER_RE    = /^\s{2}([a-zA-Z0-9._\-$]+)\s*:\s*(\w+)?\s*$/;
const SEVERITY_RE       = /^\s{4}severity:\s*(\w+)\s*$/;

function emitSection(lines, section) {
  lines.push(`## ${section.name}`);
  lines.push('');
  section.description.forEach(l => lines.push(l));
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const rule of section.rules) {
    lines.push(`### ${rule.name}`);
    lines.push(`#### Severity: ${formatSeverity(rule.severity)}`);
    lines.push('');

    rule.description.forEach(d => lines.push(d));
    lines.push('');

    for (const ex of rule.examples) {
      const labelPart = ex.label ? ` (${ex.label})` : '';
      lines.push(`**${ex.kind.charAt(0).toUpperCase() + ex.kind.slice(1)} example${labelPart}:**`);
      ex.content.forEach(l => lines.push(l));
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }
}

function generateStyleguide(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');

  let title = null;
  const docDescription = [];

  const sections = [];
  let currentSection = null;

  let inRulesBlock = false;
  let collectingSectionDescription = false;
  let pendingComments = [];

  let i = 0;
  const totalLines = lines.length;

  while (i < totalLines) {
    let line = lines[i];
    let stripped = line.trim();

    if (stripped.startsWith('# Title:')) {
      title = stripped.replace('# Title:', '').trim();
      i++;
      continue;
    }

    if (stripped.startsWith('#') && sections.length === 0 && !stripped.startsWith('# Section:')) {
      docDescription.push(stripComment(line));
      i++;
      continue;
    }

    if (stripped.startsWith('# Section:')) {
      currentSection = new SectionDoc(stripped.replace('# Section:', '').trim());
      sections.push(currentSection);
      collectingSectionDescription = true;
      i++;
      continue;
    }

    if (collectingSectionDescription && stripped.startsWith('#')) {
      currentSection.description.push(stripComment(line));
      i++;
      continue;
    }

    if (collectingSectionDescription && !stripped.startsWith('#')) {
      collectingSectionDescription = false;
    }

    if (stripped === 'rules:') {
      inRulesBlock = true;
      pendingComments = [];
      i++;
      continue;
    }

    if (!inRulesBlock || !currentSection) {
      i++;
      continue;
    }

    if (stripped.startsWith('#')) {
      pendingComments.push(stripComment(line));
      i++;
      continue;
    }

    const ruleMatch = line.match(RULE_HEADER_RE);
    if (ruleMatch) {
      const name = ruleMatch[1];
      let severity = ruleMatch[2];

      if (severity === undefined) {
        let j = i + 1;
        while (j < totalLines && lines[j].startsWith('    ')) {
          const sevMatch = lines[j].match(SEVERITY_RE);
          if (sevMatch) {
            severity = sevMatch[1];
            break;
          }
          j++;
        }
      }

      severity ??= 'off';

      const rule = new RuleDoc(name, severity);
      let currentExample = null;

      for (const comment of pendingComments) {
        const exampleMatch = comment.match(EXAMPLE_HEADER_RE);
        if (exampleMatch) {
          const kind = exampleMatch[1].toLowerCase();
          const label = exampleMatch[2] ?? null;
          currentExample = new ExampleDoc(kind, label);
          rule.examples.push(currentExample);
          continue;
        }

        if (currentExample) {
          currentExample.content.push(comment);
        } else {
          rule.description.push(comment);
        }
      }

      currentSection.rules.push(rule);
      pendingComments = [];
      i++;
      continue;
    }

    pendingComments = [];
    i++;
  }

  const outputLines = [];

  if (title) {
    outputLines.push(`# ${title}`);
    outputLines.push('');
  }

  if (docDescription.length > 0) {
    docDescription.forEach(l => outputLines.push(l));
    outputLines.push('');
  }

  for (const section of sections) {
    emitSection(outputLines, section);
  }

  const finalContent = normalizeMarkdownAnchorLinks(outputLines.join('\n').trimEnd() + '\n');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, finalContent, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

function normalizeMarkdownAnchorLinks(content) {
  return content.replace(
    /(\[[^\]]+\]\([^)\s]+\.md#)([^)]+)(\))/g,
    (_match, prefix, anchor, suffix) => `${prefix}${anchor.toLowerCase().replace(/\./g, '')}${suffix}`
  );
}

function findRulesetFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findRulesetFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('-ruleset.yaml')) {
      files.push(fullPath);
    }
  }

  return files;
}

// ────────────────────────────────────────────────
// Main execution
// ────────────────────────────────────────────────

const projectRoot = process.cwd();                          // ← project root
const spectralDir = path.join(projectRoot, '__main__/src/yaml/spectral');

const rulesetFiles = findRulesetFiles(spectralDir);

if (rulesetFiles.length === 0) {
  console.log(`No *-ruleset.yaml files found in ${spectralDir}`);
  process.exit(0);
}

console.log(`Found ${rulesetFiles.length} ruleset file(s):`);

for (const filePath of rulesetFiles) {
  const baseName = path.basename(filePath, '-ruleset.yaml');
  const mdName = `${baseName}-style-guide.md`;
  const distOutputPath = path.join(projectRoot, 'dist', 'spectral', mdName);
  const techdocsOutputPath = path.join(projectRoot, 'techdocs', 'api-style-guides', 'docs', mdName);

  console.log(`  ${filePath} → ${mdName}`);
  generateStyleguide(filePath, distOutputPath);
  generateStyleguide(filePath, techdocsOutputPath);
}

console.log('Done.');
