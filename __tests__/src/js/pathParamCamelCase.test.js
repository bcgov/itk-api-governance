const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class PathParamCamelCaseTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  path-param-camel-case: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new PathParamCamelCaseTest();

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition
servers:
  - url: http://localhost
paths:
  /items/{itemId}:
    get:
      description: Retrieves an item by its ID
      operationId: getItem
      parameters:
        - name: itemId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: string
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
  /items/{item-id}:
    get:
      description: Retrieves an item by its ID
      operationId: getItem
      produces:
        - application/json
      parameters:
        - name: item-id
          in: path
          required: true
          type: string
      responses:
        '200':
          description: OK
          schema:
            type: string
      `,
      expected: [
        ['path-param-camel-case', Severity.Error, 'Path parameter name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{item-id}/get/parameters/0/name'],
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
  /items/{item-id}:
    get:
      description: Retrieves an item by its ID
      operationId: getItem
      parameters:
        - name: item-id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: string
      `,
      expected: [
        ['path-param-camel-case', Severity.Error, 'Path parameter name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{item-id}/get/parameters/0/name'],
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
servers:
  - url: http://localhost
paths:
  /items/{item-id}:
    get:
      description: Retrieves an item by its ID
      operationId: getItem
      parameters:
        - name: item-id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: string
      `,
      expected: [
        ['path-param-camel-case', Severity.Error, 'Path parameter name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1items~1{item-id}/get/parameters/0/name'],
      ],
    });
  });
});