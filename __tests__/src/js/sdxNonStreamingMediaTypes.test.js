const { BaseSpectralTest } = require('./helpers/base-spectral-test');

const testInstance = new BaseSpectralTest('spectral/sdx-ruleset.yaml');

describe('Spectral Validation', () => {
  test('allows non-streaming binary and XML payloads', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX File API
  version: 1.0.0
  description: API that transfers files through Secure Data Exchange.
paths:
  /files:
    post:
      operationId: uploadFile
      summary: Upload a file
      description: Uploads a file for storage.
      security:
        - oauth2: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - file
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '201':
          description: File uploaded successfully.
    get:
      operationId: downloadFile
      summary: Download a file
      description: Downloads the stored file.
      security:
        - oauth2: []
      responses:
        '200':
          description: File returned successfully.
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary
            application/pdf:
              schema:
                type: string
                format: byte
            application/xml:
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
      notExpected: [
        'sdx-supported-media-types',
        'sdx-no-binary-schemas',
        'sdx-no-streaming-media-types',
      ],
    });
  });
});
