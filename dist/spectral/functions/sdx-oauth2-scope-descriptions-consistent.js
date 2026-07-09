const FLOW_NAMES = ['authorizationCode', 'clientCredentials', 'password', 'implicit'];

var sdxOauth2ScopeDescriptionsConsistent = (securitySchemes, _options, context) => {
  const results = [];

  if (!securitySchemes || typeof securitySchemes !== 'object') {
    return results;
  }

  for (const [schemeName, scheme] of Object.entries(securitySchemes)) {
    if (!scheme || scheme.type !== 'oauth2' || !scheme.flows || typeof scheme.flows !== 'object') {
      continue;
    }

    const descriptionsByScope = new Map();

    for (const flowName of FLOW_NAMES) {
      const flow = scheme.flows[flowName];
      if (!flow || !flow.scopes || typeof flow.scopes !== 'object') continue;

      for (const [scope, description] of Object.entries(flow.scopes)) {
        if (!descriptionsByScope.has(scope)) {
          descriptionsByScope.set(scope, { description, flowName });
          continue;
        }

        const first = descriptionsByScope.get(scope);
        if (description !== first.description) {
          results.push({
            message: `OAuth2 scope "${scope}" in security scheme "${schemeName}" has inconsistent descriptions across flows.`,
            path: [...context.path, schemeName, 'flows', flowName, 'scopes', scope],
          });
        }
      }
    }
  }

  return results;
};

export { sdxOauth2ScopeDescriptionsConsistent as default };
