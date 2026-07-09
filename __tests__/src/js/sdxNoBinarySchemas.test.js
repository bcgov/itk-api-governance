const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-binary-schemas');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-binary-schemas'],
    });
  });

  test('test rule triggers for binary schemas', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    post:
      operationId: createLoad
      security:
        - oauth2: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '201':
          description: Load created successfully.
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
        ['sdx-no-binary-schemas', Severity.Error, 'Schema uses a binary string format unsupported by SDX.', '/paths/~1loads/post/requestBody/content/application~1json/schema/properties/file/format'],
      ],
    });
  });
});
