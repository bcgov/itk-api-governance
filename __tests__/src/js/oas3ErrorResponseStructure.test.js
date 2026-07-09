const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class Oas3ErrorResponseStructureTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  oas3_0-internal-error-response-structure: error
  oas3_1-internal-error-response-structure: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new Oas3ErrorResponseStructureTest();

describe('Spectral Validation', () => {
  
  test('valid document should not trigger violation (3.1.0)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /users:
    post:
      summary: Create a user
      operationId: createUser
      responses:
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:                           # Inline schema matches expected schema
                type: object
                required:
                  - error
                  - message
                properties:
                  error:
                    type: string
                  message:
                    type: string
                  details:
                    anyOf:
                      - type: object
                        additionalProperties: true
      `,
      notExpected: ['oas3_0-internal-error-response-structure', 'oas3_1-internal-error-response-structure'],
    });
  });
  
  test('valid document should not trigger violation (3.1.0 allowable subset)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /users:
    post:
      summary: Create a user
      operationId: createUser
      responses:
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: object
                required:
                  - error
                  - message
                  - detail          # additional properties can be required
                properties:
                  error:
                    type: string
                  message:
                    type: string
                  details:          # additionalProperties restricted to spectific properties
                    type: object
                    properties:
                      code:
                        type: integer
                      exceptionMessage:
                        type: string
      `,
      notExpected: ['oas3_0-internal-error-response-structure', 'oas3_1-internal-error-response-structure'],
    });
  });

  test('valid document should not trigger violation (3.0.3)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3

info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /users:
    post:
      summary: Create a user
      operationId: createUser
      responses:
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:                           # Inline schema matches expected schema
                type: object
                required:
                  - error
                  - message
                properties:
                  error:
                    type: string
                  message:
                    type: string
                  details:
                    type: object
                    additionalProperties: true
                    nullable: true
      `,
      notExpected: ['oas3_0-internal-error-response-structure', 'oas3_1-internal-error-response-structure'],
    });
  });

  test('test rule for OpenAPI 3.1.0 triggers for invalid document', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /users:
    post:
      summary: Create a user
      operationId: createUser
      responses:
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:       
                type: object
                required:
                  - error
                  # - message        Missing required property 'message'
                properties:
                  error:
                    type: string
                  #message:
                  #  type: string             Missing property 'message'
                  details:
                    anyOf:
                      - type: string          # Property 'details' type mismatch in ErrorResponse: expected 'object', found 'string or object'
                      - type: object
                        additionalProperties: true
      `,
      notExpected: ['oas3_0-internal-error-response-structure'],
      expected: [
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Missing required property \'message\' in ErrorResponse', '/paths/~1users/post/responses/500/content/application~1json/schema/properties'],
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Property \'details\' type mismatch in ErrorResponse: expected \'object\', found \'string or object\'', '/paths/~1users/post/responses/500/content/application~1json/schema/properties/details'],
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Required property \'message\' in ErrorResponse changed from required to optional.', '/paths/~1users/post/responses/500/content/application~1json/schema/required'],
      ],
    });
  });

  test('test rule for OpenAPI 3.1.0 triggers for invalid document (not even close)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /users:
    post:
      summary: Create a user
      operationId: createUser
      responses:
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:      
                type: string
      `,
      notExpected: ['oas3_0-error-response-structure'],
      expected: [
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Missing required property \'error\' in ErrorResponse', '/paths/~1users/post/responses/500/content/application~1json/schema'],
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Missing required property \'message\' in ErrorResponse', '/paths/~1users/post/responses/500/content/application~1json/schema'],
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Required property \'error\' in ErrorResponse changed from required to optional.', '/paths/~1users/post/responses/500/content/application~1json/schema'],
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Required property \'message\' in ErrorResponse changed from required to optional.', '/paths/~1users/post/responses/500/content/application~1json/schema'],
        ['oas3_1-internal-error-response-structure', Severity.Error, 'Schema type mismatch for ErrorResponse: expected \'object\', found \'string\'', '/paths/~1users/post/responses/500/content/application~1json/schema'],
      ],
    });
  });
});
