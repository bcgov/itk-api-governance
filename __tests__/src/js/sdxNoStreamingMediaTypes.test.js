const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-streaming-media-types');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-streaming-media-types'],
    });
  });

  test('test rule triggers for streaming media types', async () => {
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
      operationId: streamLoads
      security:
        - oauth2: []
      responses:
        '200':
          description: Loads streamed successfully.
          content:
            text/event-stream:
              schema:
                type: string
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
        ['sdx-no-streaming-media-types', Severity.Error, 'Request or response defines a streaming media type unsupported by SDX.', '/paths/~1loads/get/responses/200/content'],
      ],
    });
  });
});
