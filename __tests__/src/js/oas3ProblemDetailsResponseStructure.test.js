const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class Oas3ProblemDetailsResponseStructureTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  oas3_0-problem-details-response-structure: error
  oas3_1-problem-details-response-structure: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new Oas3ProblemDetailsResponseStructureTest();

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
        '400':
          description: Bad Request - validation errors
          content:
            application/json:
              schema:                           # Inline schema matches expected schema
                type: object
                required:
                  - type
                  - title
                  - status
                  - errors
                properties:
                  type:
                    type: string
                  title:
                    type: string
                  status:
                    type: integer
                  detail:
                    anyOf:
                      - type: string
                      - type: "null"
                  errors:
                    type: array
                    minItems: 1
                    items:
                      type: object
                      required:
                        - location
                        - code
                        - message
                        - type
                      properties:
                        location:
                          type: string
                          enum:
                            - body
                            - query
                            - header
                            - path
                            - cookie
                        code:
                          type: string
                        message:
                          type: string
                        type:
                          type: string
                        field:
                          anyOf:
                            - type: string
                            - type: "null"
                        detail:
                          anyOf:
                            - type: string
                            - type: "null"
                        received:
                          anyOf:
                            - type: string
                            - type: "null"
                        pointer:
                          anyOf:
                            - type: string
                            - type: "null"
                        constraints:
                          anyOf:
                            - type: object
                              additionalProperties: true
                            - type: "null"
        '422':
          description: Unprocessable Entity - semantic/validation failure
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestResponse'   # Referenced schema matches expected schema
components:
  schemas:
    BadRequestErrorLocation:                               # Schema names do not need to match expected schema, only structure
      type: string
      enum:
        - body
        - query
        - header
        - path
        - cookie
    BadRequestErrorItem:
      type: object
      required:
        - location
        - code
        - message
        - type
      properties:
        location:
          $ref: '#/components/schemas/BadRequestErrorLocation'
        code:
          type: string
        message:
          type: string
        type:
          type: string
        field:
          anyOf:
            - type: string
            - type: "null"
        detail:
          anyOf:
            - type: string
            - type: "null"
        received:
          anyOf:
            - type: string
            - type: "null"
        pointer:
          anyOf:
            - type: string
            - type: "null"
        constraints:
          anyOf:
            - type: object
              additionalProperties: true
            - type: "null"
    BadRequestResponse:
      type: object
      required:
        - type
        - title
        - status
        - errors
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          anyOf:
            - type: string
            - type: "null"
        errors:
          type: array
          minItems: 1
          items:
            $ref: '#/components/schemas/BadRequestErrorItem'
      `,
      notExpected: ['oas3_0-problem-details-response-structure', 'oas3_1-problem-details-response-structure'],
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
        '400':
          description: Bad Request - validation errors
          content:
            application/json:
              schema:                           # Inline schema matches expected schema
                type: object
                required:
                  - type
                  - title
                  - status
                  - detail          # additional properties can be required
                  - errors
                properties:
                  type:
                    type: string
                  title:
                    type: string
                  status:
                    type: integer
                  detail:                  # anyOf reduced to string
                    type: string
                  errors:
                    type: array
                    minItems: 1
                    items:
                      type: object
                      required:
                        - location
                        - code
                        - message
                        - type
                      properties:
                        location:
                          type: string
                          enum:
                            - body
                          #  - query          # enum values can be removed but not added
                            - header
                            - path
                            - cookie
                        code:
                          type: string
                        message:
                          type: string
                        type:
                          type: string
                        #field:                 # Optional properties can be removed
                        #  anyOf:
                        #    - type: string
                        #    - type: "null"
                        detail:                 # anyOf reduced to string
                          type: string
                        received:               # anyOf reduced to string
                          type: string
                        pointer:                # anyOf reduced to string
                          type: string
                        constraints:
                          anyOf:
                            - type: object          # additionalProperties restricted to spectific properties
                              properties:
                                min:
                                  type: integer
                                max:
                                  type: integer
      `,
      notExpected: ['oas3_0-problem-details-response-structure', 'oas3_1-problem-details-response-structure'],
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
        '400':
          description: Bad Request - validation errors
          content:
            application/json:
              schema:
                type: object
                required:
                  - type
                  - title
                  - status
                  - errors
                properties:
                  type:
                    type: string
                  title:
                    type: string
                  status:
                    type: integer
                  detail:
                    type: string
                    nullable: true
                  errors:
                    type: array
                    minItems: 1
                    items:
                      type: object
                      required:
                        - location
                        - code
                        - message
                        - type
                      properties:
                        location:
                          type: string
                          enum:
                            - body
                            - query
                            - header
                            - path
                            - cookie
                        code:
                          type: string
                        message:
                          type: string
                        type:
                          type: string
                        field:
                          type: string
                          nullable: true
                        detail:
                          type: string
                          nullable: true
                        received:
                          type: string
                          nullable: true
                        pointer:
                          type: string
                          nullable: true
                        constraints:
                          type: object
                          additionalProperties: true
                          nullable: true
        '422':
          description: Unprocessable Entity - semantic/validation failure
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestResponse'
components:
  schemas:
    BadRequestErrorLocation:
      type: string
      enum:
        - body
        - query
        - header
        - path
        - cookie
    BadRequestErrorItem:
      type: object
      required:
        - location
        - code
        - message
        - type
      properties:
        location:
          $ref: '#/components/schemas/BadRequestErrorLocation'
        code:
          type: string
        message:
          type: string
        type:
          type: string
        field:
          type: string
          nullable: true
        detail:
          type: string
          nullable: true
        received:
          type: string
          nullable: true
        pointer:
          type: string
          nullable: true
        constraints:
          type: object
          additionalProperties: true
          nullable: true
    BadRequestResponse:
      type: object
      required:
        - type
        - title
        - status
        - errors
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
          nullable: true
        errors:
          type: array
          minItems: 1
          items:
            $ref: '#/components/schemas/BadRequestErrorItem'
      `,
      notExpected: ['oas3_0-problem-details-response-structure', 'oas3_1-problem-details-response-structure'],
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
        '400':
          description: Bad Request - validation errors
          content:
            application/json:
              schema:
                type: object
                required:
                  - type
                #  - title    Missing required property 'title'
                  - status             
                  - errors
                properties:
                  type:
                    type: string
                  #title:                       Missing property 'title'
                  #  type: string
                  status:                 
                    type: string          # Property 'status' type mismatch in ProblemDetailResponse: expected 'integer', found 'string'
                  detail:
                    type: integer         # Property 'detail' type mismatch in ProblemDetailResponse: expected 'string or null', found 'integer'
                  errors:
                    type: array
                    minItems: 1
                    items:
                      type: object
                      required:
                        - location
                      #  - code             Missing required property 'code'
                        - message
                        - type
                      properties:
                        location:
                          type: string
                          enum:
                            - body
                            - query
                            - header
                            - path
                            - cookie
                            - extra            # Property \'location\' enum contains extra values not allowed
                        code:
                          type: string
                        message:
                          type: string
                        type:                 # Property 'type' type mismatch in ProblemDetailResponse.errors.items: expected 'string', found 'string or null'
                          anyOf:
                            - type: string
                            - type: "null"
                        field: 
                          anyOf:
                            - type: string
                            - type: "null"
                        detail:
                          anyOf:
                            - type: string
                            - type: "null"
                        received:
                          anyOf:
                            - type: string
                            - type: "null"
                        pointer:
                          anyOf:
                            - type: string
                            - type: "null"
                        constraints:
                          anyOf:
                            - type: object
                              additionalProperties: true
                            - type: "null"
      `,
      notExpected: ['oas3_0-problem-details-response-structure'],
      expected: [
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Missing required property \'title\' in ProblemDetailResponse', '/paths/~1users/post/responses/400/content/application~1json/schema/properties'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Property \'detail\' type mismatch in ProblemDetailResponse: expected \'string or null\', found \'integer\'', '/paths/~1users/post/responses/400/content/application~1json/schema/properties/detail'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Property \'location\' enum contains extra values not allowed in ProblemDetailResponse.errors.items: "extra"', '/paths/~1users/post/responses/400/content/application~1json/schema/properties/errors/items/properties/location'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Property \'status\' type mismatch in ProblemDetailResponse: expected \'integer\', found \'string\'', '/paths/~1users/post/responses/400/content/application~1json/schema/properties/status'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Property \'type\' type mismatch in ProblemDetailResponse.errors.items: expected \'string\', found \'string or null\'', '/paths/~1users/post/responses/400/content/application~1json/schema/properties/errors/items/properties/type'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Required property \'code\' in ProblemDetailResponse.errors.items changed from required to optional.', '/paths/~1users/post/responses/400/content/application~1json/schema/properties/errors/items/required'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Required property \'title\' in ProblemDetailResponse changed from required to optional.', '/paths/~1users/post/responses/400/content/application~1json/schema/required'],
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
        '400':
          description: Bad Request - validation errors
          content:
            application/json:
              schema:
                type: array
                minItems: 1
                items:
                  type: string
      `,
      notExpected: ['oas3_0-problem-details-response-structure'],
      expected: [
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Missing required property \'errors\' in ProblemDetailResponse', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Missing required property \'status\' in ProblemDetailResponse', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Missing required property \'title\' in ProblemDetailResponse', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Missing required property \'type\' in ProblemDetailResponse', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Required property \'errors\' in ProblemDetailResponse changed from required to optional.', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Required property \'status\' in ProblemDetailResponse changed from required to optional.', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Required property \'title\' in ProblemDetailResponse changed from required to optional.', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Required property \'type\' in ProblemDetailResponse changed from required to optional.', '/paths/~1users/post/responses/400/content/application~1json/schema'],
        ['oas3_1-problem-details-response-structure', Severity.Error, 'Schema type mismatch for ProblemDetailResponse: expected \'object\', found \'array\'', '/paths/~1users/post/responses/400/content/application~1json/schema'],
      ],
    });
  });
});
