const validatedRefs = new Set();

/**
 * Spectral rule function: Validates that a schema is a **narrowed** (more restrictive or equal) version
 * of an expected base schema. Used to enforce backward compatibility or schema evolution rules in OpenAPI.
 *
 * This function implements a **narrowing-only** validation strategy:
 * - Allowed: making things more specific (adding enum, reducing minLength → shorter strings, etc.)
 * - Forbidden: relaxing constraints (removing required, adding extra enum values, making nullable → non-nullable, etc.)
 * - Allowed: adding extra optional properties (unless allowAdditionalProperties = false)
 *
 * Main use cases:
 * - Ensuring request/response schemas in new API versions are compatible with previous versions
 * - Enforcing that derived schemas (e.g. in examples, mocks, or clients) do not widen types
 *
 * @param {object} schema - The actual schema to validate (from the document being linted)
 * @param {object} options - Configuration for the rule
 * @param {object} options.expectedSchema - The base/expected schema to compare against (required)
 * @param {string} [options.schemaName="expected schema"] - Human-readable name for error messages
 * @param {boolean} [options.debug=false] - Enable debug logging to console
 * @param {boolean} [options.allowAdditionalProperties=true] - Whether extra properties in actual schema are allowed
 * @param {object} context - Spectral context object
 * @param {object} context.document - The full resolved OpenAPI document
 * @param {Array<string|number>} context.path - JSON path to the current schema
 * @returns {Array<{message: string, path?: Array}>} Array of validation errors (empty if valid)
 */
var oas3SchemaMatchesSchema = (schema, options, context) => {
  const {
    expectedSchema,
    schemaName = "expected schema",
    debug = false,
    allowAdditionalProperties = true
  } = options;

  const { document, path } = context;

  const log = (...args) => {
    if (debug) console.debug("[oas3-schema-matches-schema]", ...args);
  };

  log("Invoked");
  log("Path:", path);
  log("Schema input:", JSON.stringify(schema, null, 2));

  if (!expectedSchema) {
    return [{ message: "Function misconfigured: expectedSchema is required" }];
  }

  // Reject complex composed schemas
  if (schema?.allOf || schema?.oneOf || (schema?.anyOf && !isSimpleNullUnion(schema.anyOf))) {
    return [{
      message: `Composed schemas (allOf/oneOf/complex anyOf) are not supported for ${schemaName}`,
      path
    }];
  }

  // Handle $ref
  if (schema?.$ref) {
    const ref = schema.$ref;
    log("Detected $ref:", ref);

    if (validatedRefs.has(ref)) {
      log("Reference already validated, skipping:", ref);
      return [];
    }

    validatedRefs.add(ref);

    const resolved = resolveJsonPointer(document.data, ref);
    if (!resolved) {
      return [{ message: `Unable to resolve schema reference: ${ref}`, path }];
    }

    log("Resolved referenced schema:", JSON.stringify(resolved, null, 2));

    return validateObject(
      resolved,
      expectedSchema,
      refPathToArray(ref),
      schemaName,
      log,
      allowAdditionalProperties,
      document.data
    );
  }

  log("Validating inline schema");

  return validateObject(
    schema,
    expectedSchema,
    path,
    schemaName,
    log,
    allowAdditionalProperties,
    document.data
  );
};

/* -------------------------------------------------- */
/* Recursive validation core                          */
/* -------------------------------------------------- */

function validateObject(actual, expected, basePath, schemaName, log, allowAdditionalProperties, rootDocument) {
  const violations = [];

  log(`Validating object at ${basePath.join('/') || '(root)'} against ${schemaName}`);

  // Type compatibility (narrowing only)
  const expectedTypeInfo = getTypeInfo(expected);
  const actualTypeInfo = getTypeInfo(actual);

  if (!isTypeCompatible(actualTypeInfo, expectedTypeInfo)) {
    violations.push({
      message: `Schema type mismatch for ${schemaName}: expected '${expectedTypeInfo.types.join(" or ")}', found '${actualTypeInfo.types.join(" or ")}'`,
      path: basePath
    });
  }

  // Required properties: expected must be subset of actual (cannot make required → optional)
  const expectedRequired = expected.required || [];
  const actualRequired = actual.required || [];

  for (const prop of expectedRequired) {
    if (!actualRequired.includes(prop)) {
      violations.push({
        message: `Required property '${prop}' in ${schemaName} changed from required to optional.`,
        path: [...basePath, "required"]
      });
    }
  }
  // Allow actual to have extra required fields (narrowing)

  const expectedProps = expected.properties || {};
  const actualProps = actual.properties || {};

  // Validate expected properties + recurse
  for (const [propName, expectedProp] of Object.entries(expectedProps)) {
    const actualProp = actualProps[propName];

  if (!actualProp) {
    if (expectedRequired.includes(propName)) {
      violations.push({
        message: `Missing required property '${propName}' in ${schemaName}`,
        path: [...basePath, "properties"]
      });
    } else {
      log(`Optional property '${propName}' is missing → allowed (narrowing)`);
    }
    continue;
  }

    const propPath = [...basePath, "properties", propName];

    const expectedPropTypeInfo = getTypeInfo(expectedProp);
    const actualPropTypeInfo = getTypeInfo(actualProp);

    if (!isTypeCompatible(actualPropTypeInfo, expectedPropTypeInfo)) {
      violations.push({
        message: `Property '${propName}' type mismatch in ${schemaName}: expected '${expectedPropTypeInfo.types.join(" or ")}', found '${actualPropTypeInfo.types.join(" or ")}'`,
        path: propPath
      });
    }

    // Nullable: narrowing allowed, widening forbidden
    if (expectedPropTypeInfo.isNullable && !actualPropTypeInfo.isNullable) {
      log(`Property '${propName}' narrowing nullable → allowed`);
    } else if (!expectedPropTypeInfo.isNullable && actualPropTypeInfo.isNullable) {
      violations.push({
        message: `Property '${propName}' cannot be made nullable in ${schemaName} (widening forbidden)`,
        path: propPath
      });
    }

    // Enum: actual must be subset or equal
    if (expectedProp.enum) {
      if (!actualProp.enum || !Array.isArray(actualProp.enum)) {
        violations.push({
          message: `Property '${propName}' in ${schemaName} is missing enum values (expected: ${expectedProp.enum.map(v => JSON.stringify(v)).join(', ')})`,
          path: propPath
        });
      } else {
        const extra = actualProp.enum.filter(v => !expectedProp.enum.includes(v));
        if (extra.length > 0) {
          violations.push({
            message: `Property '${propName}' enum contains extra values not allowed in ${schemaName}: ${extra.map(v => JSON.stringify(v)).join(', ')}`,
            path: propPath
          });
        }
      }
    } else if (actualProp.enum) {
      log(`Property '${propName}' adds enum restriction → allowed (narrowing)`);
    }

    // Numeric / length constraints (stricter or equal)
    validateConstraint(actualProp, expectedProp, propPath, "minLength", "minLength", violations, schemaName, (a, e) => a >= e);
    validateConstraint(actualProp, expectedProp, propPath, "maxLength", "maxLength", violations, schemaName, (a, e) => a <= e);
    validateConstraint(actualProp, expectedProp, propPath, "minimum", "minimum", violations, schemaName, (a, e) => a >= e);
    validateConstraint(actualProp, expectedProp, propPath, "maximum", "maximum", violations, schemaName, (a, e) => a <= e);
    validateConstraint(actualProp, expectedProp, propPath, "minItems", "minItems", violations, schemaName, (a, e) => a >= e);
    validateConstraint(actualProp, expectedProp, propPath, "maxItems", "maxItems", violations, schemaName, (a, e) => a <= e);

    // Pattern
    if (expectedProp.pattern && !actualProp.pattern) {
      violations.push({
        message: `Property '${propName}' in ${schemaName} does not match expected pattern ${expectedProp.pattern}`,
        path: propPath
      });
    } else if (expectedProp.pattern && actualProp.pattern && actualProp.pattern !== expectedProp.pattern) {
      violations.push({
        message: `Property '${propName}' pattern mismatch in ${schemaName}: expected ${expectedProp.pattern}, found ${actualProp.pattern}`,
        path: propPath
      });
    }

    // Recurse into object
    if (actualProp.type === 'object' && expectedProp.type === 'object') {
      violations.push(...validateObject(
        actualProp,
        expectedProp,
        propPath,
        `${schemaName}.${propName}`,
        log,
        allowAdditionalProperties));
    }

    // Recurse into array items
    if (actualProp.type === 'array' && expectedProp.items && typeof expectedProp.items === 'object') {
      violations.push(...validateObject(
        actualProp.items || {},
        expectedProp.items,
        [...propPath, "items"],
        `${schemaName}.${propName}.items`,
        log,
        allowAdditionalProperties));
    }
  }

  // Additional properties check
  if (!allowAdditionalProperties) {
    for (const actualPropName of Object.keys(actualProps)) {
      if (!expectedProps[actualPropName]) {
        violations.push({
          message: `Unexpected property '${actualPropName}' is not allowed in ${schemaName}`,
          path: [...basePath, "properties", actualPropName]
        });
      }
    }
  }

  log(`Validation at ${basePath.join('/') || '(root)'} completed. Violations:`, violations.length);
  return violations;
}

/* -------------------------------------------------- */
/* Constraint helper                                  */
/* -------------------------------------------------- */

function validateConstraint(actual, expected, path, actualKey, expectedKey, violations, schemaName, compareFn) {
  if (expected[expectedKey] !== undefined) {
    if (actual[actualKey] === undefined) {
      violations.push({
        message: `Property at ${path.join('/')} is missing ${actualKey} (expected at least ${expected[expectedKey]})`,
        path
      });
    } else if (!compareFn(actual[actualKey], expected[expectedKey])) {
      violations.push({
        message: `Property at ${path.join('/')} has ${actualKey} ${actual[actualKey]} which is less restrictive than expected ${expected[expectedKey]}`,
        path
      });
    }
  }
}

/* -------------------------------------------------- */
/* Existing helpers (unchanged)                       */
/* -------------------------------------------------- */

function getTypeInfo(schema) {
  const info = { types: [], isNullable: false, combiner: null };

  if (schema.type) {
    if (typeof schema.type === 'string') info.types.push(schema.type);
    else if (Array.isArray(schema.type)) {
      info.types = [...schema.type];
      info.isNullable = info.types.includes('null');
      info.types = info.types.filter(t => t !== 'null');
    }
  }

  if (schema.nullable === true) info.isNullable = true;

  if (schema.anyOf) {
    info.combiner = 'anyOf';
    schema.anyOf.forEach(sub => {
      const subInfo = getTypeInfo(sub);
      info.types.push(...subInfo.types);
      if (subInfo.isNullable) info.isNullable = true;
    });
  } else if (schema.oneOf) {
    info.combiner = 'oneOf';
    schema.oneOf.forEach(sub => {
      const subInfo = getTypeInfo(sub);
      info.types.push(...subInfo.types);
      if (subInfo.isNullable) info.isNullable = true;
    });
  }

  info.types = [...new Set(info.types)];
  return info;
}

function isTypeCompatible(actualInfo, expectedInfo) {
  if (actualInfo.combiner && expectedInfo.combiner && actualInfo.combiner !== expectedInfo.combiner) {
    return false;
  }

  for (const t of actualInfo.types) {
    if (!expectedInfo.types.includes(t)) return false;
  }

  if (actualInfo.types.length > expectedInfo.types.length) return false;

  return true;
}

function isSimpleNullUnion(anyOf) {
  if (anyOf.length !== 2) return false;
  const types = anyOf.map(s => s.type).filter(Boolean);
  return types.length === 1 && anyOf.some(s => s.type === 'null' || s.type === null);
}

function resolveJsonPointer(document, ref) {
  if (!ref.startsWith("#/")) return null;

  const parts = ref.replace(/^#\//, "").split("/").map(p => p.replace(/~1/g, "/").replace(/~0/g, "~"));

  let current = document;
  for (const part of parts) {
    if (current && typeof current === "object") current = current[part];
    else return null;
  }
  return current;
}

function refPathToArray(ref) {
  return ref.replace(/^#\//, "").split("/").map(p => p.replace(/~1/g, "/").replace(/~0/g, "~"));
}

export { oas3SchemaMatchesSchema as default };
