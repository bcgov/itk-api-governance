// Reports each security option that lets an operation be called without an
// OAuth2 scope. Security options are alternatives, so every option an operation
// accepts must require at least one scope from an OAuth2 security scheme.
//
// An operation's security is its own `security` when it declares one, otherwise
// the document-level `security`. Operations without any security, and scopes
// that are not an array, are reported by sdx-operation-security-scopes instead.
const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

var sdxR1OperationScopes = (paths, _options, context) => {
  const results = [];
  const root = context.document?.data ?? {};

  if (!paths || typeof paths !== 'object') return results;

  const oauth2Schemes = new Set(
    Object.entries(root.components?.securitySchemes ?? {})
      .filter(([, scheme]) => scheme?.type === 'oauth2')
      .map(([name]) => name),
  );

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method) || !operation || typeof operation !== 'object') continue;

      const operationHasSecurity = Object.prototype.hasOwnProperty.call(operation, 'security');
      const security = operationHasSecurity ? operation.security : root.security;
      const securityPath = operationHasSecurity
        ? [...context.path, pathKey, method, 'security']
        : ['security'];

      if (!Array.isArray(security)) continue;

      security.forEach((requirement, index) => {
        if (!requirement || typeof requirement !== 'object') return;

        const requiresScope = Object.entries(requirement).some(
          ([schemeName, scopes]) => oauth2Schemes.has(schemeName) && Array.isArray(scopes) && scopes.length > 0,
        );

        if (!requiresScope) {
          results.push({
            message: `Security option for operation "${method.toUpperCase()} ${pathKey}" does not require an OAuth2 scope.`,
            path: [...securityPath, index],
          });
        }
      });
    }
  }

  return results;
};

export { sdxR1OperationScopes as default };
