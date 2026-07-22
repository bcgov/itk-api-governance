const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-path-item-servers');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-path-item-servers'],
    });
  });

  test('test rule triggers for path-item-level servers', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    servers:
      - url: https://path.example.gov.bc.ca/sdx
    get:
      operationId: listLoads
      security:
        - oauth2: []
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
        ['sdx-no-path-item-servers', Severity.Error, 'Path item defines a server override unsupported by SDX.', '/paths/~1loads/servers'],
      ],
    });
  });
});
