const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class SchemaPropertyCamelCaseTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  schema-property-camel-case: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new SchemaPropertyCamelCaseTest();

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
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
      description: Get Product
      operationId: getProduct

      responses:
        '200':
          description: OK
          content:
            application/json:
              # 1. Schema directly in response content - inline
              schema:
                type: object
                properties:
                  productId: { type: integer }
  /items:
    get:
      description: Get Items
      operationId: getItems
      parameters:
        - name: active
          in: query
          # 2. Inline schema in operation parameter (query)
          schema:
            type: object
            properties:
              activeInd: { type: boolean }

      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  # 3. Schema in array items - inline
                  type: object
                  properties:
                    itemId: { type: integer }

  /items/{itemId}:
    get:
      description: Get Item
      operationId: getItem
      parameters:
        # 4. Schema directly in path parameter - inline
        - name: itemId
          in: path
          required: true
          schema:
            type: object
            properties:
              parameterValue: { type: string }

      responses:
        '200':
          description: OK
          content:
            application/json:
              # 5. Schema using oneOf in response - inline
              schema:
                oneOf:
                  - type: object
                    properties:
                      itemId: { type: integer }
                  - type: object
                    properties:
                      errorMessage: { type: string }

  /upload:
    post:
      description: Upload File
      operationId: uploadFile
      requestBody:
        required: true
        content:
          application/json:
            # 6. Schema directly in request body content - inline
            schema:
              type: object
              properties:
                fileName: { type: string }

components:
  schemas:
    # 7. Reusable schema (components/schemas) - inline
    ItemIdSchema:
      type: object
      properties:
        itemId: { type: integer }

  parameters:
    # 8. Schema inside reusable parameter - inline
    SkipParam:
      name: skipItem
      in: query
      schema:
        type: object
        properties:
          skipItem: { type: integer }
  requestBodies:
    # 9. Schema inside reusable request body - inline
    CreateBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              itemId: { type: integer }
      `,
      expected: [],
    });
  });

  test('test rule for Swagger 2.0 triggers for invalid document', async () => {
    await testInstance.validateOas({
      oasYaml: `
swagger: '2.0'
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

host: localhost
schemes:
  - http

paths:

  /items:
    get:
      description: Get Items
      operationId: getItems

      produces:
        - application/json
      responses:
        '200':
          description: OK
          schema:
            type: array
            items:
              # 1. Schema in array items - inline
              type: object
              properties:
                item-id:
                  type: integer

  /items/{itemId}:
    get:
      description: Get Item
      operationId: getItem
      parameters:
        - name: itemId
          in: path
          required: true
          type: string  # ← 2.0 uses type directly

      produces:
        - application/json
      responses:
        '200':
          description: OK
          schema:
            # 2. Schema in response - inline
            type: object
            properties:
              item-id:
                type: integer

  /upload:
    post:
      description: Upload File
      operationId: uploadFile
      consumes:
        - application/json
      parameters:
        - name: body
          in: body
          required: true
          # 3. Schema directly in request body content - inline
          schema:
            type: object
            properties:
              file-name:
                type: string

      responses:
        '200':
          description: OK

# 4. Reusable schema (definitions) - inline
definitions:
  ItemIdSchema:
    type: object
    properties:
      item-id:
        type: integer

  # 5. Schema inside reusable parameter - inline
  SkipParam:
    type: object
    properties:
      skip-item:
        type: integer
      `,
      expected: [
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items/get/responses/200/schema/items/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/responses/200/schema/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1upload/post/parameters/0/schema/properties/file-name'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/definitions/ItemIdSchema/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/definitions/SkipParam/properties/skip-item'],
      ],
    });
  });

  test('test rule for OpenAPI 3.0.3 triggers for invalid document', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
  description: Test API definition

servers:
  - url: http://localhost

paths:
  /product:
    get:
      description: Get Product
      operationId: getProduct

      responses:
        '200':
          description: OK
          content:
            application/json:
              # 1. Schema directly in response content - inline
              schema:
                type: object
                properties:
                  product-id: { type: integer }

  /items:
    get:
      description: Get Items
      operationId: getItems
      parameters:
        - name: active
          in: query
          # 2. Inline schema in operation parameter (query)
          schema:
            type: object
            properties:
              active-ind: { type: boolean }

      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  # 3. Schema in array items - inline
                  type: object
                  properties:
                    item-id: { type: integer }

  /items/{itemId}:
    get:
      description: Get Item
      operationId: getItem
      parameters:
        # 4. Schema directly in path parameter - inline
        - name: itemId
          in: path
          required: true
          schema:
            type: object
            properties:
              parameter-value: { type: string }

      responses:
        '200':
          description: OK
          content:
            application/json:
              # 5. Schema using oneOf in response - inline
              schema:
                oneOf:
                  - type: object
                    properties:
                      item-id: { type: integer }
                  - type: object
                    properties:
                      error-message: { type: string }

  /upload:
    post:
      description: Upload File
      operationId: uploadFile
      requestBody:
        required: true
        content:
          application/json:
            # 6. Schema directly in request body content - inline
            schema:
              type: object
              properties:
                file-name: { type: string }

      responses:
        '200':
          description: OK

components:
  schemas:
    # 7. Reusable schema (components/schemas) - inline
    ItemIdSchema:
      type: object
      properties:
        item-id: { type: integer }

  parameters:
    # 8. Schema inside reusable parameter - inline
    SkipParam:
      name: skipItem
      in: query
      schema:
        type: object
        properties:
          skip-item: { type: integer }

  requestBodies:
    # 9. Schema inside reusable request body - inline
    CreateBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              item-id: { type: integer }
      `,
      expected: [
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1product/get/responses/200/content/application~1json/schema/properties/product-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items/get/parameters/0/schema/properties/active-ind'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items/get/responses/200/content/application~1json/schema/items/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/parameters/0/schema/properties/parameter-value'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/responses/200/content/application~1json/schema/oneOf/0/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/responses/200/content/application~1json/schema/oneOf/1/properties/error-message'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1upload/post/requestBody/content/application~1json/schema/properties/file-name'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/components/schemas/ItemIdSchema/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/components/parameters/SkipParam/schema/properties/skip-item'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/components/requestBodies/CreateBody/content/application~1json/schema/properties/item-id'],
      ],
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
  /product:
    get:
      description: Get Product
      operationId: getProduct

      responses:
        '200':
          description: OK
          content:
            application/json:
              # 1. Schema directly in response content - inline
              schema:
                type: object
                properties:
                  product-id: { type: integer }
  /items:
    get:
      description: Get Items
      operationId: getItems
      parameters:
        - name: active
          in: query
          # 2. Inline schema in operation parameter (query)
          schema:
            type: object
            properties:
              active-ind: { type: boolean }

      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  # 3. Schema in array items - inline
                  type: object
                  properties:
                    item-id: { type: integer }

  /items/{itemId}:
    get:
      description: Get Item
      operationId: getItem
      parameters:
        # 4. Schema directly in path parameter - inline
        - name: itemId
          in: path
          required: true
          schema:
            type: object
            properties:
              parameter-value: { type: string }

      responses:
        '200':
          description: OK
          content:
            application/json:
              # 5. Schema using oneOf in response - inline
              schema:
                oneOf:
                  - type: object
                    properties:
                      item-id: { type: integer }
                  - type: object
                    properties:
                      error-message: { type: string }

  /upload:
    post:
      description: Upload File
      operationId: uploadFile
      requestBody:
        required: true
        content:
          application/json:
            # 6. Schema directly in request body content - inline
            schema:
              type: object
              properties:
                file-name: { type: string }

components:
  schemas:
    # 7. Reusable schema (components/schemas) - inline
    ItemIdSchema:
      type: object
      properties:
        item-id: { type: integer }

  parameters:
    # 8. Schema inside reusable parameter - inline
    SkipParam:
      name: skipItem
      in: query
      schema:
        type: object
        properties:
          skip-item: { type: integer }
  requestBodies:
    # 9. Schema inside reusable request body - inline
    CreateBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              item-id: { type: integer }
      `,
      expected: [
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1product/get/responses/200/content/application~1json/schema/properties/product-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items/get/parameters/0/schema/properties/active-ind'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items/get/responses/200/content/application~1json/schema/items/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/parameters/0/schema/properties/parameter-value'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/responses/200/content/application~1json/schema/oneOf/0/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{itemId}/get/responses/200/content/application~1json/schema/oneOf/1/properties/error-message'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1upload/post/requestBody/content/application~1json/schema/properties/file-name'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/components/schemas/ItemIdSchema/properties/item-id'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/components/parameters/SkipParam/schema/properties/skip-item'],
        ['schema-property-camel-case', Severity.Error, 'Schema property name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/components/requestBodies/CreateBody/content/application~1json/schema/properties/item-id'],
      ],
    });
  });
});