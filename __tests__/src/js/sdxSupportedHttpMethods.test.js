const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-supported-http-methods');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-supported-http-methods'],
    });
  });

  test('test rule triggers for unsupported HTTP methods', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    trace:
      operationId: traceLoads
      security:
        - oauth2: []
      responses:
        '204':
          description: Trace completed successfully.
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
        ['sdx-supported-http-methods', Severity.Error, 'SDX supports GET, POST, PUT, PATCH, and DELETE operations only.', '/paths/~1loads/trace'],
      ],
    });
  });
});
