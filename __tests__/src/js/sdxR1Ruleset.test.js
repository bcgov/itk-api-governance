const { Severity } = require('./helpers/base-spectral-test');
const { SdxR1RuleTest } = require('./helpers/sdx-r1-rule-test');
const { validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxR1RuleTest();

describe('SDX R1 ruleset', () => {
  test('valid SDX document passes the SDX rules inherited by SDX R1', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: [
        'sdx-oauth2-security-schemes',
        'sdx-operation-security-scopes',
        'sdx-no-webhooks',
        'operation-operationId',
      ],
    });
  });

  test('inherits SDX rules at SDX severity', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
webhooks:
  permitChanged:
    post:
      operationId: permitChanged
      responses:
        '202':
          description: Permit change accepted.
paths: {}
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
      `,
      expected: [
        ['sdx-no-webhooks', Severity.Error, 'Document defines OpenAPI webhooks unsupported by SDX.', '/webhooks'],
      ],
    });
  });
});
