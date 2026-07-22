const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class NoEmptyPropertyNamesTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  no-empty-property-names: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new NoEmptyPropertyNamesTest();

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
  /example:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string }
components:
  schemas:
    NestedObject:
      type: object
      properties:
        setting: 
          type: object
          properties:
            enabled: { type: boolean }
    AdditionalProps:
      type: object
      properties:
        known: { type: string }
      additionalProperties: true
    PropertyNamesExample:
      type: object
      propertyNames:
        pattern: ^[a-z]+$
      additionalProperties: true
    AllOfExample:
      allOf:
        - type: object
          properties:
            title: { type: string }
    OneOfExample:
      oneOf:
        - type: object
          properties:
            email: { type: string }
        - type: object
          properties:
            phone: { type: string }
    ArrayOfObjects:
      type: array
      items:
        type: object
        properties:
          city: { type: string }
    Discriminated:
      type: object
      discriminator:
        propertyName: type
      oneOf:
        - type: object
          properties:
            type: { const: admin }
            level: { type: integer }
        - type: object
          properties:
            type: { const: guest }
            expires: { type: string }
  headers:
    X-Info:
      schema:
        type: object
        properties:
          trace: { type: string }
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
  description: Test API definition with empty property name examples (Swagger 2.0)

paths:
  /example:
    post:
      consumes:
        - application/json
      produces:
        - application/json
      parameters:
        - in: body
          name: body
          required: true
          schema:
            type: object
            properties:
              '':
                type: string
      responses:
        '200':
          description: OK
          schema:
            type: object
            properties:
              '':
                type: string
          headers:
            X-Info:
              type: object
              properties:
                '':
                  type: string
              description: Example header with empty property name

definitions:
  NestedObject:
    type: object
    properties:
      setting:
        type: object
        properties:
          '':
            type: string

  AdditionalProps:
    type: object
    properties:
      '':
        type: string
    additionalProperties: true

  AllOfExample:
    allOf:
      - type: object
        properties:
          '':
            type: string

  OneOfExample:
    type: object
    properties:
      '':
        type: string
    description: In Swagger 2.0 this would normally be represented as separate schemas (no native oneOf)

  ArrayOfObjects:
    type: array
    items:
      type: object
      properties:
        '':
          type: string

  Discriminated:
    type: object
    required: [ "type" ]
    properties:
      type:
        type: string
        enum: [admin, guest]
      '':
        type: string
    discriminator: type
    description: Discriminator is supported, but no native oneOf → subtypes must be separate definitions
      `,
      expected: [
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/parameters/0/schema/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/responses/200/schema/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/responses/200/headers/X-Info/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/definitions/NestedObject/properties/setting/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/definitions/AdditionalProps/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/definitions/AllOfExample/allOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/definitions/OneOfExample/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/definitions/ArrayOfObjects/items/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/definitions/Discriminated/properties/'],
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
  description: Test API definition with empty property name examples (OpenAPI 3.0.3)

paths:
  /example:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                '':
                  type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  '':
                    type: string
components:
  schemas:
    NestedObject:
      type: object
      properties:
        setting:
          type: object
          properties:
            '':
              type: string
    AdditionalProps:
      type: object
      properties:
        '':
          type: string
      additionalProperties: true
    AllOfExample:
      allOf:
        - type: object
          properties:
            '':
              type: string
    OneOfExample:
      oneOf:
        - type: object
          properties:
            '':
              type: integer
        - type: object
          properties:
            '':
              type: string
    ArrayOfObjects:
      type: array
      items:
        type: object
        properties:
          '':
            type: string
    Discriminated:
      type: object
      discriminator:
        propertyName: type
      oneOf:
        - type: object
          properties:
            type:
              const: admin
            '':
              type: integer
        - type: object
          properties:
            type:
              const: guest
            '':
              type: string
  headers:
    X-Info:
      schema:
        type: object
        properties:
          '':
            type: string
      `,
      expected: [
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/headers/X-Info/schema/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/AdditionalProps/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/AllOfExample/allOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/ArrayOfObjects/items/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/Discriminated/oneOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/Discriminated/oneOf/1/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/NestedObject/properties/setting/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/OneOfExample/oneOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/OneOfExample/oneOf/1/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/requestBody/content/application~1json/schema/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/responses/200/content/application~1json/schema/properties/'],
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
  /example:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                '': { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  '': { type: string }
components:
  schemas:
    NestedObject:
      type: object
      properties:
        setting: 
          type: object
          properties:
            '': { type: string }
    AdditionalProps:
      type: object
      properties:
        '': { type: string }
      additionalProperties: true
    PropertyNamesExample:
      type: object
      propertyNames:
        pattern: ^[a-z]+$
      additionalProperties: true
    AllOfExample:
      allOf:
        - type: object
          properties:
            '': { type: string }
    OneOfExample:
      oneOf:
        - type: object
          properties:
            '': { type: integer }
        - type: object
          properties:
            '': { type: string }
    ArrayOfObjects:
      type: array
      items:
        type: object
        properties:
          '': { type: string }
    Discriminated:
      type: object
      discriminator:
        propertyName: type
      oneOf:
        - type: object
          properties:
            type: { const: admin }
            '': { type: integer }
        - type: object
          properties:
            type: { const: guest }
            '': { type: string }
  headers:
    X-Info:
      schema:
        type: object
        properties:
          '': { type: string }
      `,
      expected: [
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/headers/X-Info/schema/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/AdditionalProps/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/AllOfExample/allOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/ArrayOfObjects/items/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/Discriminated/oneOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/Discriminated/oneOf/1/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/NestedObject/properties/setting/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/OneOfExample/oneOf/0/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/components/schemas/OneOfExample/oneOf/1/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/requestBody/content/application~1json/schema/properties/'],
        ['no-empty-property-names', Severity.Error, "Schema contains an empty string property name. Use 'additionalProperties' for dynamic or arbitrary keys.", '/paths/~1example/post/responses/200/content/application~1json/schema/properties/'],
      ],
    });
  });
});