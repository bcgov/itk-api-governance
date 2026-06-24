const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

export default (paths, _options, context) => {
  const results = [];
  const root = context.document?.data ?? {};
  const oauth2Schemes = getOauth2SecuritySchemes(root);

  if (!paths || typeof paths !== 'object') return results;

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method) || !operation || typeof operation !== 'object') continue;

      const operationPath = [...context.path, pathKey, method];
      const operationHasSecurity = Object.prototype.hasOwnProperty.call(operation, 'security');
      const effectiveSecurity = operationHasSecurity ? operation.security : root.security;
      const effectiveSecurityPath = operationHasSecurity ? [...operationPath, 'security'] : ['security'];

      if (!Array.isArray(effectiveSecurity) || effectiveSecurity.length === 0) {
        results.push({
          message: `Operation "${method.toUpperCase()} ${pathKey}" must define security that includes an SDX OAuth2 scheme.`,
          path: operationHasSecurity ? operationPath : [],
        });
        continue;
      }

      for (let index = 0; index < effectiveSecurity.length; index += 1) {
        const requirement = effectiveSecurity[index];
        if (!requirement || typeof requirement !== 'object') continue;

        let requirementHasOauth2 = false;

        for (const [schemeName, scopes] of Object.entries(requirement)) {
          if (!oauth2Schemes.has(schemeName)) continue;

          if (Array.isArray(scopes)) {
            requirementHasOauth2 = true;
            const declaredScopes = oauth2Schemes.get(schemeName);
            for (let scopeIndex = 0; scopeIndex < scopes.length; scopeIndex += 1) {
              const scope = scopes[scopeIndex];
              if (!declaredScopes.has(scope)) {
                results.push({
                  message: `Operation "${method.toUpperCase()} ${pathKey}" uses OAuth2 scope "${scope}" that is not declared by security scheme "${schemeName}".`,
                  path: [...operationPath, 'security', index, schemeName, scopeIndex],
                });
              }
            }
          } else {
            results.push({
              message: `Operation "${method.toUpperCase()} ${pathKey}" must declare OAuth2 scopes as an array for security scheme "${schemeName}".`,
              path: [...operationPath, 'security', index, schemeName],
            });
          }
        }

        if (!requirementHasOauth2) {
          results.push({
            message: `Every security option for operation "${method.toUpperCase()} ${pathKey}" must include an SDX OAuth2 scheme.`,
            path: [...effectiveSecurityPath, index],
          });
        }
      }
    }
  }

  return results;
};

function getOauth2SecuritySchemes(root) {
  const schemes = root.components?.securitySchemes ?? {};
  const oauth2Schemes = new Map();

  for (const [name, scheme] of Object.entries(schemes)) {
    if (scheme?.type !== 'oauth2') continue;

    const scopes = new Set();
    const flows = scheme.flows ?? {};
    for (const flow of Object.values(flows)) {
      for (const scope of Object.keys(flow?.scopes ?? {})) {
        scopes.add(scope);
      }
    }

    oauth2Schemes.set(name, scopes);
  }

  return oauth2Schemes;
}
