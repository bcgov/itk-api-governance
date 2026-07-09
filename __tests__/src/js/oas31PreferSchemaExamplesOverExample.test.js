const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class Oas31SchemaExampleRequiredTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  oas3_1-prefer-examples-over-example: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new Oas31SchemaExampleRequiredTest();

describe('Spectral Validation', () => {

  test('valid document should not trigger violation (examples)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /product:
    get:
      summary: Retrieve a single product
      description: Get Product
      operationId: getProduct
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  productId: { type: integer }
                examples:
                  - productId: 42531
                  - productId: 67890
          headers:
            X-Product-Header:
              schema:
                type: object
                properties:
                  headerValue: { type: string }
                examples:
                  - headerValue: "prod-meta-abc123"
                  - headerValue: "prod-meta-def456"

  /items:
    get:
      summary: List all items
      description: Get Items
      operationId: getItems
      parameters:
        - name: active
          in: query
          description: Filter to active items only
          schema:
            type: object
            properties:
              activeInd: { type: boolean }
            examples:
              - activeInd: true
              - activeInd: false
        - name: X-Auth-Token
          in: header
          description: Authentication token
          schema:
            type: object
            properties:
              tokenValue: { type: string }
            examples:
              - tokenValue: "eyJh...zI1NiJ9..."
              - tokenValue: "eyJh...abcDEF456"
        - name: sessionId
          in: cookie
          description: Session identifier
          schema:
            type: object
            properties:
              sessionValue: { type: string }
            examples:
              - sessionValue: "sess_abc123xyz"
              - sessionValue: "sess_def789uvw"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    itemId: { type: integer }
                examples:
                  - [ { itemId: 789 }, { itemId: 790 } ]
                  - [ { itemId: 100 }, { itemId: 101 } ]

  /items/{itemId}:
    get:
      summary: Get a single item by ID
      description: Get Item
      operationId: getItem
      parameters:
        - name: itemId
          in: path
          required: true
          description: Unique identifier of the item
          schema:
            type: object
            properties:
              parameterValue: { type: string }
            examples:
              - parameterValue: "item-2025-xyz"
              - parameterValue: "item-2026-abc"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: object
                  properties:
                    dynamicProp: { type: string }
                examples:
                  - someKey1: { dynamicProp: "value-1" }
                    someKey2: { dynamicProp: "value-2" }
                  - someKeyA: { dynamicProp: "alpha" }
                    someKeyB: { dynamicProp: "beta" }

  /upload:
    post:
      summary: Upload a new file
      description: Upload File
      operationId: uploadFile
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                fileName: { type: string }
              examples:
                - fileName: "invoice-2026-Q1.pdf"
                - fileName: "report-2026-annual.xlsx"
            encoding:
              fileName:
                headers:
                  X-File-Metadata:
                    schema:
                      type: object
                      properties:
                        metadataValue: { type: string }
                      examples:
                        - metadataValue: "confidential"
                        - metadataValue: "public"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RefSchema'

  /ref-test:
    get:
      summary: Test endpoint using schema references
      description: Reference Test
      operationId: refTest
      responses:
        '200':
          $ref: '#/components/responses/ReusableResponse'

components:
  schemas:
    ItemIdSchema:
      type: object
      properties:
        itemId: { type: integer }
      examples:
        - itemId: 9999
        - itemId: 10000

    RefSchema:
      type: object
      properties:
        refProp: { type: string }
      examples:
        - refProp: "example-reference-value"
        - refProp: "another-ref-example"

  parameters:
    SkipParam:
      name: skipItem
      in: query
      description: Number of items to skip
      schema:
        type: object
        properties:
          skipItem: { type: integer }
        examples:
          - skipItem: 50
          - skipItem: 100

  requestBodies:
    CreateBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              itemId: { type: integer }
            examples:
              - itemId: 3001
              - itemId: 4002

  responses:
    ReusableResponse:
      description: Reusable OK
      content:
        application/json:
          schema:
            type: object
            properties:
              reusableProp: { type: string }
            examples:
              - reusableProp: "operation-completed"
              - reusableProp: "success"
      headers:
        X-Reusable-Header:
          schema:
            type: object
            properties:
              reusableHeaderValue: { type: boolean }
            examples:
              - reusableHeaderValue: true
              - reusableHeaderValue: false

  headers:
    AuthHeader:
      schema:
        type: object
        properties:
          authValue: { type: string }
        examples:
          - authValue: "Bearer xyz789token"
          - authValue: "Bearer abc123token"
      `,
      notExpected: ["oas3_1-prefer-examples-over-example",]
    });
  });  

  test('valid document should not trigger violation (example and examples)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /product:
    get:
      summary: Retrieve a single product
      description: Get Product
      operationId: getProduct
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  productId: { type: integer }
                example:
                  productId: 42531
                examples:
                  - productId: 42531
                  - productId: 67890
          headers:
            X-Product-Header:
              schema:
                type: object
                properties:
                  headerValue: { type: string }
                example:
                  headerValue: "prod-meta-abc123"
                examples:
                  - headerValue: "prod-meta-abc123"
                  - headerValue: "prod-meta-def456"

  /items:
    get:
      summary: List all items
      description: Get Items
      operationId: getItems
      parameters:
        - name: active
          in: query
          description: Filter to active items only
          schema:
            type: object
            properties:
              activeInd: { type: boolean }
            example:
              activeInd: true
            examples:
              - activeInd: true
              - activeInd: false
        - name: X-Auth-Token
          in: header
          description: Authentication token
          schema:
            type: object
            properties:
              tokenValue: { type: string }
            example:
              tokenValue: "eyJh...zI1NiJ9..."
            examples:
              - tokenValue: "eyJh...zI1NiJ9..."
              - tokenValue: "eyJh...abcDEF456"
        - name: sessionId
          in: cookie
          description: Session identifier
          schema:
            type: object
            properties:
              sessionValue: { type: string }
            example:
              sessionValue: "sess_abc123xyz"
            examples:
              - sessionValue: "sess_abc123xyz"
              - sessionValue: "sess_def789uvw"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    itemId: { type: integer }
                example:
                  - itemId: 789
                  - itemId: 790
                examples:
                  - [ { itemId: 789 }, { itemId: 790 } ]
                  - [ { itemId: 100 }, { itemId: 101 } ]

  /items/{itemId}:
    get:
      summary: Get a single item by ID
      description: Get Item
      operationId: getItem
      parameters:
        - name: itemId
          in: path
          required: true
          description: Unique identifier of the item
          schema:
            type: object
            properties:
              parameterValue: { type: string }
            example:
              parameterValue: "item-2025-xyz"
            examples:
              - parameterValue: "item-2025-xyz"
              - parameterValue: "item-2026-abc"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: object
                  properties:
                    dynamicProp: { type: string }
                example:
                  someKey1: { dynamicProp: "value-1" }
                  someKey2: { dynamicProp: "value-2" }
                examples:
                  - someKey1: { dynamicProp: "value-1" }
                    someKey2: { dynamicProp: "value-2" }
                  - someKeyA: { dynamicProp: "alpha" }
                    someKeyB: { dynamicProp: "beta" }

  /upload:
    post:
      summary: Upload a new file
      description: Upload File
      operationId: uploadFile
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                fileName: { type: string }
              example:
                fileName: "invoice-2026-Q1.pdf"
              examples:
                - fileName: "invoice-2026-Q1.pdf"
                - fileName: "report-2026-annual.xlsx"
            encoding:
              fileName:
                headers:
                  X-File-Metadata:
                    schema:
                      type: object
                      properties:
                        metadataValue: { type: string }
                      example:
                        metadataValue: "confidential"
                      examples:
                        - metadataValue: "confidential"
                        - metadataValue: "public"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RefSchema'

  /ref-test:
    get:
      summary: Test endpoint using schema references
      description: Reference Test
      operationId: refTest
      responses:
        '200':
          $ref: '#/components/responses/ReusableResponse'

components:
  schemas:
    ItemIdSchema:
      type: object
      properties:
        itemId: { type: integer }
      example:
        itemId: 9999
      examples:
        - itemId: 9999
        - itemId: 10000

    RefSchema:
      type: object
      properties:
        refProp: { type: string }
      example:
        refProp: "reference-value"
      examples:
        - refProp: "reference-value"
        - refProp: "another-ref"

  parameters:
    SkipParam:
      name: skipItem
      in: query
      description: Number of items to skip
      schema:
        type: object
        properties:
          skipItem: { type: integer }
        example:
          skipItem: 50
        examples:
          - skipItem: 50
          - skipItem: 100

  requestBodies:
    CreateBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              itemId: { type: integer }
            example:
              itemId: 3001
            examples:
              - itemId: 3001
              - itemId: 4002

  responses:
    ReusableResponse:
      description: Reusable OK
      content:
        application/json:
          schema:
            type: object
            properties:
              reusableProp: { type: string }
            example:
              reusableProp: "operation-completed"
            examples:
              - reusableProp: "operation-completed"
              - reusableProp: "success"
      headers:
        X-Reusable-Header:
          schema:
            type: object
            properties:
              reusableHeaderValue: { type: boolean }
            example:
              reusableHeaderValue: true
            examples:
              - reusableHeaderValue: true
              - reusableHeaderValue: false

  headers:
    AuthHeader:
      schema:
        type: object
        properties:
          authValue: { type: string }
        example:
          authValue: "Bearer xyz789token"
        examples:
          - authValue: "Bearer xyz789token"
          - authValue: "Bearer abc123token"
      `,
      notExpected: ["oas3_1-prefer-examples-over-example",]
    });
  });  

  test('test rule for OpenAPI 3.1.0 triggers for invalid document (uses example)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

paths:
  /product:
    get:
      summary: Retrieve a single product
      description: Get Product
      operationId: getProduct
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  productId: { type: integer }
                example:
                  productId: 42531
          headers:
            X-Product-Header:
              schema:
                type: object
                properties:
                  headerValue: { type: string }
                example:
                  headerValue: "prod-meta-abc123"

  /items:
    get:
      summary: List all items
      description: Get Items
      operationId: getItems
      parameters:
        - name: active
          in: query
          description: Filter to active items only
          schema:
            type: object
            properties:
              activeInd: { type: boolean }
            example:
              activeInd: true
        - name: X-Auth-Token
          in: header
          description: Authentication token
          schema:
            type: object
            properties:
              tokenValue: { type: string }
            example:
              tokenValue: "eyJh...zI1NiJ9..."
        - name: sessionId
          in: cookie
          description: Session identifier
          schema:
            type: object
            properties:
              sessionValue: { type: string }
            example:
              sessionValue: "sess_abc123xyz"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    itemId: { type: integer }
                example:
                  - itemId: 789
                  - itemId: 790

  /items/{itemId}:
    get:
      summary: Get a single item by ID
      description: Get Item
      operationId: getItem
      parameters:
        - name: itemId
          in: path
          required: true
          description: Unique identifier of the item
          schema:
            type: object
            properties:
              parameterValue: { type: string }
            example:
              parameterValue: "item-2025-xyz"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: object
                  properties:
                    dynamicProp: { type: string }
                example:
                  someKey1: { dynamicProp: "value-1" }
                  someKey2: { dynamicProp: "value-2" }

  /upload:
    post:
      summary: Upload a new file
      description: Upload File
      operationId: uploadFile
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                fileName: { type: string }
              example:
                fileName: "invoice-2026-Q1.pdf"
            encoding:
              fileName:
                headers:
                  X-File-Metadata:
                    schema:
                      type: object
                      properties:
                        metadataValue: { type: string }
                      example:
                        metadataValue: "confidential"
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RefSchema'

  /ref-test:
    get:
      summary: Test endpoint using schema references
      description: Reference Test
      operationId: refTest
      responses:
        '200':
          $ref: '#/components/responses/ReusableResponse'

components:
  schemas:
    ItemIdSchema:
      type: object
      properties:
        itemId: { type: integer }
      example:
        itemId: 9999

    RefSchema:
      type: object
      properties:
        refProp: { type: string }
      example:
        refProp: "example-reference-value"

  parameters:
    SkipParam:
      name: skipItem
      in: query
      description: Number of items to skip
      schema:
        type: object
        properties:
          skipItem: { type: integer }
        example:
          skipItem: 50

  requestBodies:
    CreateBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              itemId: { type: integer }
            example:
              itemId: 3001

  responses:
    ReusableResponse:
      description: Reusable OK
      content:
        application/json:
          schema:
            type: object
            properties:
              reusableProp: { type: string }
            example:
              reusableProp: "operation-completed"
      headers:
        X-Reusable-Header:
          schema:
            type: object
            properties:
              reusableHeaderValue: { type: boolean }
            example:
              reusableHeaderValue: true

  headers:
    AuthHeader:
      schema:
        type: object
        properties:
          authValue: { type: string }
        example:
          authValue: "Bearer xyz789token"
      `,
      expected: [
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1product/get/responses/200/content/application~1json/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1product/get/responses/200/headers/X-Product-Header/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1items/get/parameters/0/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1items/get/parameters/1/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1items/get/parameters/2/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1items/get/responses/200/content/application~1json/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1items~1{itemId}/get/parameters/0/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1items~1{itemId}/get/responses/200/content/application~1json/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1upload/post/requestBody/content/multipart~1form-data/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/paths/~1upload/post/requestBody/content/multipart~1form-data/encoding/fileName/headers/X-File-Metadata/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/schemas/ItemIdSchema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/schemas/RefSchema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/parameters/SkipParam/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/requestBodies/CreateBody/content/application~1json/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/responses/ReusableResponse/content/application~1json/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/responses/ReusableResponse/headers/X-Reusable-Header/schema'],
        ['oas3_1-prefer-examples-over-example', Severity.Error, 'Schema uses deprecated \'example\' without \'examples\'. Use \'examples\' for OAS 3.1 schemas.', '/components/headers/AuthHeader/schema'],
      ]
    });
  });  
});