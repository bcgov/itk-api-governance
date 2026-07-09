/**
 * Spectral rule function: Enforces that OpenAPI operation `summary` fields are:
 *   1. Strictly single-line (no newline characters)
 *   2. Plain text only (no Markdown formatting or common Markdown patterns)
 *
 * The `summary` field in OpenAPI is intended to be a short, one-line description
 * of the operation (typically displayed in lists, tooltips, or UI overviews).
 * Allowing newlines or Markdown breaks rendering consistency in many tools,
 * documentation generators, and API consoles.
 *
 * Behavior:
 * - Skips non-string or empty values (no error)
 * - Flags if the summary contains any newline (`\n`, `\r`)
 * - Flags if the summary contains common Markdown patterns or HTML tags
 * - Reports violations at the location of the `summary` field
 *
 * Valid examples:
 *   summary: "Retrieve a list of users"
 *   summary: "Create new order (admin only)"
 *
 * Invalid examples:
 *   summary: "Retrieve a list\nof users"           → newline
 *   summary: "Retrieve a list of **users**"        → bold Markdown
 *   summary: "Get user by `id`"                    → code Markdown
 *   summary: "See [docs](https://example.com)"     → link Markdown
 *   summary: "# Important operation"               → heading Markdown
 *
 * @param {string} targetVal - The value of the `summary` field
 * @param {object} _ - Unused options object (Spectral convention)
 * @param {object} context - Spectral context (path, document, etc.)
 * @returns {Array<{message: string}>} Array of validation errors (empty if valid)
 */
export default (targetVal, _, context) => {
  const summary = targetVal; // targetVal is the value of .summary

  if (!summary || typeof summary !== 'string') {
    return [];
  }

  const errors = [];

  // Check for newlines / multi-line content
  if (summary.includes('\n') || summary.includes('\r')) {
    errors.push({
      message: 'Summary contains one or more line breaks.'
    });
  }

  // Basic Markdown detection (common patterns)
  const markdownPatterns = [
    /\*\*.*\*\*/,               // **bold**
    /\*.*\*/,                   // *italic*
    /`[^`]+`/,                  // `code`
    /\[.*?\]\(.*?\)/,           // [text](url)
    /^#{1,6}\s/,                // # Heading
    /^\s*[-*+]\s/,              // - list or * list
    /^\s*\d+\.\s/,              // 1. numbered list
    /^>\s/,                     // > quote
    /!\[.*?\]\(.*?\)/,          // images
    /<.*?>.*?<\/.*?>/           // HTML tags
  ];

  if (markdownPatterns.some(pattern => pattern.test(summary))) {
    errors.push({
      message: 'Summary contains Markdown formatting.'
    });
  }

  return errors;
};
