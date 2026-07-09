const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-cookie-parameters');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-cookie-parameters'],
    });
  });

  test('test rule triggers for cookie parameters', async () => {
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
      parameters:
        - name: tracking
          in: cookie
          schema:
            type: string
      responses:
        '200':
          description: Loads returned successfully.
components:
  parameters:
    locale:
      name: locale
      in: cookie
      schema:
        type: string
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
      `,
      expected: [
        ['sdx-no-cookie-parameters', Severity.Error, 'SDX does not support cookie parameters.', '/paths/~1loads/get/parameters/0/in'],
        ['sdx-no-cookie-parameters', Severity.Error, 'SDX does not support cookie parameters.', '/components/parameters/locale/in'],
      ],
    });
  });
});
