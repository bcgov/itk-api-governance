const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-webhooks');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-webhooks'],
    });
  });

  test('test rule triggers for top-level webhooks', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
webhooks:
  loadChanged:
    post:
      operationId: loadChanged
      responses:
        '202':
          description: Load change accepted.
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
