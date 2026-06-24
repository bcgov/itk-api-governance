const FLOW_NAMES = ['authorizationCode', 'clientCredentials', 'password', 'implicit'];

export default (securitySchemes, _options, context) => {
  const results = [];

  if (!securitySchemes || typeof securitySchemes !== 'object') {
    return results;
  }

  let hasOauth2Scheme = false;
  const oauth2IdentityProviderOrigins = new Set();

  for (const [name, scheme] of Object.entries(securitySchemes)) {
    const schemePath = [...context.path, name];

    if (!scheme || typeof scheme !== 'object') continue;

    if (scheme.type !== 'oauth2') {
      continue;
    }

    hasOauth2Scheme = true;

    if (!scheme.flows || typeof scheme.flows !== 'object' || Object.keys(scheme.flows).length === 0) {
      results.push({
        message: `OAuth2 security scheme "${name}" must define at least one OAuth2 flow.`,
        path: [...schemePath, 'flows'],
      });
      continue;
    }

    for (const flowName of FLOW_NAMES) {
      const flow = scheme.flows[flowName];
      if (!flow || typeof flow !== 'object') continue;

      if (flowName === 'authorizationCode' || flowName === 'implicit') {
        if (!isNonEmptyString(flow.authorizationUrl)) {
          results.push({
            message: `OAuth2 flow "${flowName}" in security scheme "${name}" must define authorizationUrl.`,
            path: [...schemePath, 'flows', flowName, 'authorizationUrl'],
          });
        } else {
          addUrlOrigin(oauth2IdentityProviderOrigins, flow.authorizationUrl);
        }
      }

      if (flowName === 'authorizationCode' || flowName === 'clientCredentials' || flowName === 'password') {
        if (!isNonEmptyString(flow.tokenUrl)) {
          results.push({
            message: `OAuth2 flow "${flowName}" in security scheme "${name}" must define tokenUrl.`,
            path: [...schemePath, 'flows', flowName, 'tokenUrl'],
          });
        } else {
          addUrlOrigin(oauth2IdentityProviderOrigins, flow.tokenUrl);
        }
      }

      if (!flow.scopes || typeof flow.scopes !== 'object') continue;

      for (const [scope, description] of Object.entries(flow.scopes)) {
        if (!isNonEmptyString(description)) {
          results.push({
            message: `OAuth2 scope "${scope}" in security scheme "${name}" flow "${flowName}" must have a non-empty description.`,
            path: [...schemePath, 'flows', flowName, 'scopes', scope],
          });
        }
      }
    }
  }

  if (!hasOauth2Scheme) {
    results.push({
      message: 'At least one OAuth2 security scheme must be defined for SDX Gateway authorization.',
      path: context.path,
    });
  }

  if (oauth2IdentityProviderOrigins.size > 0) {
    for (const [name, scheme] of Object.entries(securitySchemes)) {
      const schemePath = [...context.path, name];

      if (!scheme || typeof scheme !== 'object' || scheme.type !== 'openIdConnect') {
        continue;
      }

      const openIdConnectUrl = scheme.openIdConnectUrl;
      if (!isNonEmptyString(openIdConnectUrl)) {
        continue;
      }

      const origin = getUrlOrigin(openIdConnectUrl);
      if (origin && !oauth2IdentityProviderOrigins.has(origin)) {
        results.push({
          message: `OpenID Connect security scheme "${name}" must use the same identity provider as an SDX OAuth2 security scheme.`,
          path: [...schemePath, 'openIdConnectUrl'],
        });
      }
    }
  }

  return results;
};

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addUrlOrigin(origins, value) {
  const origin = getUrlOrigin(value);
  if (origin) {
    origins.add(origin);
  }
}

function getUrlOrigin(value) {
  try {
    return new URL(value).origin;
  } catch (_error) {
    return null;
  }
}
