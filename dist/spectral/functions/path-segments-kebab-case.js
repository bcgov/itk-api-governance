/**
 * Spectral rule function: Enforces that all **static** path segments in OpenAPI paths
 * follow **kebab-case** naming convention (lowercase letters, numbers, and hyphens only).
 *
 * This rule checks path segments in the OpenAPI `paths` object (e.g. `/users/{id}/user-profile`).
 *
 * Rules:
 * - Only **static** segments are validated (parameters like `{id}` or `{userId}` are skipped)
 * - Valid format: lowercase letters (a-z), numbers (0-9), and hyphens (-)
 * - Hyphens must not appear at the start/end or consecutively
 * - Examples:
 *   - Valid: `users`, `user-profiles`, `v1-api`, `items-2024`
 *   - Invalid: `UserProfile`, `user_profile`, `userProfile`, `-start`, `end-`, `USER`, `items__v2`
 *
 * Purpose:
 * Promotes clean, consistent, URL-friendly paths that are easy to read, SEO-compatible,
 * and follow modern REST API naming conventions.
 *
 * @param {string} targetVal - The path string (e.g. "/users/{id}/user-profile")
 * @param {object} _ - Unused options object (Spectral convention)
 * @param {object} context - Spectral context object
 * @param {Array} context.path - JSON path to the current path item (e.g. ["paths", "/users/{id}/Profile"])
 * @returns {Array<{message: string, path: Array}>} Array of validation errors (empty if valid)
 */
var pathSegmentsKebabCase = (targetVal, _, context) => {
  const results = [];

  const fullPath = context.path[context.path.length - 1]; // The full path string, e.g. "/users/{id}/Profile"

  // Split the path into segments, remove leading/trailing empty strings
  const segments = fullPath.split('/').filter(Boolean);

  segments.forEach((segment, index) => {
    // Skip parameters (wrapped in {})
    if (segment.startsWith('{') && segment.endsWith('}')) {
      return;
    }

    // Check if static segment is valid kebab-case
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    if (!kebabRegex.test(segment)) {

      results.push({
        message: `Static path segment '${segment}' is not kebab-case (lowercase letters, numbers, hyphens only).`,
        path: context.path, // Keep logical path at the operation level
      });
    }
  });

  return results;
};

export { pathSegmentsKebabCase as default };
