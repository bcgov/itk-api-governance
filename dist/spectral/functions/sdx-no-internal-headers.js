const INTERNAL_HEADER_PATTERN = /^x-edge-/i;

var sdxNoInternalHeaders = (value, _options, context) => {
  const results = [];
  scan(value, context.path, results);
  return results;
};

function scan(value, path, results) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scan(item, [...path, index], results));
    return;
  }

  if (!value || typeof value !== 'object') return;

  if (typeof value.name === 'string' && isInternalHeaderName(value.name) && value.in === 'header') {
    results.push({
      message: `Header "${value.name}" exposes SDX internal transport details in the external API contract.`,
      path: [...path, 'name'],
    });
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'headers' && child && typeof child === 'object') {
      for (const headerName of Object.keys(child)) {
        if (isInternalHeaderName(headerName)) {
          results.push({
            message: `Header "${headerName}" exposes SDX internal transport details in the external API contract.`,
            path: [...path, key, headerName],
          });
        }
      }
    }

    scan(child, [...path, key], results);
  }
}

function isInternalHeaderName(name) {
  const normalized = name.toLowerCase();
  return INTERNAL_HEADER_PATTERN.test(normalized);
}

export { sdxNoInternalHeaders as default };
