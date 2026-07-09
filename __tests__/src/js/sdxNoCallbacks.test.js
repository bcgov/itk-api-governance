const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-callbacks');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-callbacks'],
    });
  });

  test('test rule triggers for operation-level callbacks', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - oauth2: []
      callbacks:
        onLoadChanged:
          '{$request.body#/callbackUrl}':
            post:
              operationId: onLoadChanged
              responses:
                '202':
                  description: Callback accepted.
      responses:
        '200':
          description: Loads returned successfully.
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
        ['sdx-no-callbacks', Severity.Error, 'SDX does not support OpenAPI callbacks.', '/paths/~1loads/get/callbacks'],
      ],
    });
  });
});
