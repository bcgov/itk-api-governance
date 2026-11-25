const { Severity } = require('./helpers/base-spectral-test');
const { SdxR1RuleTest } = require('./helpers/sdx-r1-rule-test');
const { validSdxOas } = require('./helpers/sdx-rule-test');

const RULE = 'sdx-r1-no-oidc-scopes-in-oauth2';
const FORMAT_RULE = 'sdx-r1-resource-scope-format';
const testInstance = new SdxR1RuleTest(RULE);

const OIDC_SCOPES = ['openid', 'profile', 'email', 'address', 'phone', 'offline_access'];

const message = (scope) =>
  `OAuth2 scope "${scope}" is an OpenID Connect scope. Declare it in an openIdConnect security scheme instead.`;

function oas(flow, scopes, extraSchemes = '') {
  const urls = flow === 'authorizationCode'
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
        ${flow}:${urls}
          scopes:
${scopes.map((s) => `            '${s}': Scope description.`).join('\n')}
${extraSchemes}`;
}

describe('SDX R1 no OIDC scopes in OAuth2 schemes', () => {
  test('valid SDX document does not trigger violation', async () => {
    await testInstance.validateOas({ oasYaml: validSdxOas, notExpected: [RULE] });
  });

  test('accepts an openIdConnect scheme alongside resource scopes', async () => {
    await testInstance.validateOas({
      oasYaml: oas('authorizationCode', ['sdpr:case:read'], `
    oidc:
      type: openIdConnect
      openIdConnectUrl: https://sso.example.gov.bc.ca/.well-known/openid-configuration`),
      notExpected: [RULE],
    });
  });

  test('rejects OIDC scopes in any OAuth2 flow', async () => {
    for (const flow of ['authorizationCode', 'clientCredentials']) {
      // eslint-disable-next-line no-await-in-loop
      await testInstance.validateOas({
        oasYaml: oas(flow, OIDC_SCOPES),
        expected: OIDC_SCOPES.map((scope) => [
          RULE, Severity.Error, message(scope),
          `/components/securitySchemes/oauth2/flows/${flow}/scopes/${scope}`,
        ]),
      });
    }
  });
});

describe('SDX R1 resource scope format with OIDC scopes', () => {
  const formatTest = new SdxR1RuleTest(FORMAT_RULE);

  test('also reports OIDC scopes as malformed resource scopes', async () => {
    await formatTest.validateOas({
      oasYaml: oas('authorizationCode', OIDC_SCOPES),
      expected: OIDC_SCOPES.map((scope) => [
        FORMAT_RULE, Severity.Error,
        `OAuth2 scope "${scope}" must use the format namespace:resource{:resource}:action, with lowercase identifiers.`,
        `/components/securitySchemes/oauth2/flows/authorizationCode/scopes/${scope}`,
      ]),
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
