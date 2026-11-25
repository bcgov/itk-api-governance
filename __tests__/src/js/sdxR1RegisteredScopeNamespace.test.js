const { Severity } = require('./helpers/base-spectral-test');
const { SdxR1RuleTest } = require('./helpers/sdx-r1-rule-test');
const { validSdxOas } = require('./helpers/sdx-rule-test');

const RULE = 'sdx-r1-registered-scope-namespace';
const testInstance = new SdxR1RuleTest(RULE);

const message = (scope, namespace) =>
  `OAuth2 scope "${scope}" uses namespace "${namespace}", which is not a registered SDX scope namespace.`;

function oasWithScopes(scopes, flow = 'authorizationCode') {
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
`;
}

describe('SDX R1 registered scope namespace', () => {
  test('valid SDX document does not trigger violation', async () => {
    await testInstance.validateOas({ oasYaml: validSdxOas, notExpected: [RULE] });
  });

  test('accepts organization member IDs and managed namespaces', async () => {
    await testInstance.validateOas({
      oasYaml: oasWithScopes([
        'sdpr:case:read',
        'for:permit:amendment:approve',
        'citz:resource:read',
        'puki:toys:read',
        'ajc:vehicles:write',
        'nrs:widgets:create',
      ]),
      notExpected: [RULE],
    });
  });

  test('rejects unregistered namespaces in any flow', async () => {
    for (const flow of ['authorizationCode', 'clientCredentials']) {
      // eslint-disable-next-line no-await-in-loop
      await testInstance.validateOas({
        oasYaml: oasWithScopes(['myteam:case:read', 'sdpr2:case:read'], flow),
        expected: [
          [RULE, Severity.Error, message('myteam:case:read', 'myteam'),
            `/components/securitySchemes/oauth2/flows/${flow}/scopes/myteam:case:read`],
          [RULE, Severity.Error, message('sdpr2:case:read', 'sdpr2'),
            `/components/securitySchemes/oauth2/flows/${flow}/scopes/sdpr2:case:read`],
        ],
      });
    }
  });

  test('accepts the temporary tmp namespace', async () => {
    await testInstance.validateOas({
      oasYaml: oasWithScopes(['tmp:permit:read', 'tmp:permit:amendment:approve']),
      notExpected: [RULE],
    });
  });

  test('rejects namespaces that only start with tmp', async () => {
    const scopes = ['tmp-permits:permit:read', 'tmpfoo:permit:read', 'tmp_foo:permit:read', 'xtmp:permit:read'];
    await testInstance.validateOas({
      oasYaml: oasWithScopes(scopes),
      expected: scopes.map((scope) => [
        RULE, Severity.Error, message(scope, scope.split(':')[0]),
        `/components/securitySchemes/oauth2/flows/authorizationCode/scopes/${scope}`,
      ]),
    });
  });

  test('skips scopes without a namespace', async () => {
    await testInstance.validateOas({
      oasYaml: oasWithScopes(['openid', 'case']),
      notExpected: [RULE],
    });
  });

  test('checks the namespace of malformed scopes too', async () => {
    await testInstance.validateOas({
      oasYaml: oasWithScopes(['SDPR:case:read', 'case:read']),
      expected: [
        [RULE, Severity.Error, message('SDPR:case:read', 'SDPR'),
          '/components/securitySchemes/oauth2/flows/authorizationCode/scopes/SDPR:case:read'],
        [RULE, Severity.Error, message('case:read', 'case'),
          '/components/securitySchemes/oauth2/flows/authorizationCode/scopes/case:read'],
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
