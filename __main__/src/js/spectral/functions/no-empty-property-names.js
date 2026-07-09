/**
 * Spectral rule function: Forbids empty string ("") property names in schema objects.
 *
 * In OpenAPI schemas, defining a property with an empty string name (e.g. `properties: { "": { type: "string" } }`)
 * is invalid and ambiguous. It usually indicates a misunderstanding of how to model dynamic/arbitrary keys.
 * The correct approach is to use `additionalProperties` (for truly arbitrary keys) or `patternProperties`
 * (for keys matching a regex pattern).
 *
 * This rule:
 * - Checks every key in the `properties` object (or any object treated as a schema with keys)
 * - Reports a violation if any key is an empty string `""`
 * - Points the error precisely at the empty key using Spectral's path mechanism for better editor highlighting
 * - Skips non-object inputs and invalid schema structures
 *
 * Example violations:
 * ```yaml
 * properties:
 *   "":           # ← flagged here
 *     type: string
 *   name:
 *     type: string
 * ```
 *
 * Correct alternatives:
 * ```yaml
 * # For arbitrary keys
 * additionalProperties:
 *   type: string
 *
 * # For keys matching a pattern
 * patternProperties:
 *   "^x-": 
 *     type: string
 * ```
 *
 * @param {object} schema - The schema object (or properties object) being evaluated
 * @param {object} _ - Unused options object (Spectral convention)
 * @param {object} context - Spectral context, including `path` for reporting precise locations
 * @returns {Array<{message: string, path: Array}>} Array of validation errors (empty if valid)
 */
export default (schema, _, context) => {
  
  const results = [];

  if (!schema || typeof schema !== 'object') {
    return results;
  }

  const { path: propertiesPath } = context;

  Object.keys(schema).forEach((key) => {
    if (key === '') {

      // Point the violation directly at the empty key for precise highlighting
      const violationPath = [...propertiesPath, ''];

      results.push({
        message: `Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.`,
        path: violationPath,
      });
    }
  });

  return results;
}
