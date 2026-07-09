const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-internal-headers');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-internal-headers'],
    });
  });

  test('test rule triggers for SDX internal transport headers', async () => {
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
        - oauth2:
            - loads:read
      parameters:
        - name: X-Edge-Token
          in: header
          schema:
            type: string
      responses:
        '200':
          description: Loads returned successfully.
          headers:
            X-Edge-Trace:
              description: Internal trace header.
              schema:
                type: string
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
      `,
      expected: [
        ['sdx-no-internal-headers', Severity.Error, 'Header "X-Edge-Token" exposes SDX internal transport details and must not be included in the external API contract.', '/paths/~1loads/get/parameters/0/name'],
        ['sdx-no-internal-headers', Severity.Error, 'Header "X-Edge-Trace" exposes SDX internal transport details and must not be included in the external API contract.', '/paths/~1loads/get/responses/200/headers/X-Edge-Trace'],
      ],
    });
  });
});
