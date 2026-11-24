const { Severity } = require('./helpers/base-spectral-test');
const { SdxR1RuleTest } = require('./helpers/sdx-r1-rule-test');
const { validSdxOas } = require('./helpers/sdx-rule-test');

const RULE = 'sdx-r1-resource-scope-format';
const testInstance = new SdxR1RuleTest(RULE);

const message = (scope) =>
  `OAuth2 scope "${scope}" must use the format namespace:resource{:resource}:action, with lowercase identifiers.`;

const scopePath = (flow, scope) =>
  `/components/securitySchemes/oauth2/flows/${flow}/scopes/${scope}`;

function oasWithScopes(scopes, flow = 'authorizationCode') {
  const flowUrls = flow === 'authorizationCode'
    ? `
          authorizationUrl: https://sso.example.gov.bc.ca/oauth2/authorize
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token`
    : `
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token`;

  return `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths: {}
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        ${flow}:${flowUrls}
          scopes:
${scopes.map((s) => `            '${s}': Scope description.`).join('\n')}
`;
}

describe('SDX R1 resource scope format', () => {
  test('valid SDX document does not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: [RULE],
    });
  });

  test('accepts namespace, one or more resources and an action', async () => {
    await testInstance.validateOas({
      oasYaml: oasWithScopes([
        'sdpr:case:read',
        'sdpr:case:note:write',
        'for:permit:amendment:approve',
        'citz:resource_1:read-all',
      ]),
      notExpected: [RULE],
    });
  });

  test('rejects scopes that do not match the format', async () => {
    const invalid = [
      'case:read',
      'sdpr',
      'SDPR:case:read',
      'sdpr:Case:read',
      'sdpr:case:READ',
      '1sdpr:case:read',
      'sdpr:-case:read',
      'sdpr::read',
      'sdpr:case:read:',
      'sdpr:case read:read',
      'sdpr.case.read',
    ];

    await testInstance.validateOas({
      oasYaml: oasWithScopes(invalid),
      expected: invalid.map((scope) => [
        RULE, Severity.Error, message(scope), scopePath('authorizationCode', scope),
      ]),
    });
  });

  test('checks scopes in every OAuth2 flow', async () => {
    await testInstance.validateOas({
      oasYaml: oasWithScopes(['case:read'], 'clientCredentials'),
      expected: [
        [RULE, Severity.Error, message('case:read'), scopePath('clientCredentials', 'case:read')],
      ],
    });
  });

  test('ignores x- extension properties of the OAuth flows object', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths: {}
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            for:permit:read: Read permit records.
        x-provider-metadata:
          scopes:
            openid: Not an OAuth2 scope.
            BadScope: Not an OAuth2 scope.
            unknown:permit:read: Not an OAuth2 scope.
`,
      notExpected: [RULE],
    });
  });
});
