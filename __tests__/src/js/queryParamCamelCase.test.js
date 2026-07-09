const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class QueryParamCamelCaseTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  query-param-camel-case: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new QueryParamCamelCaseTest();

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
  /search:
    get:
      description: Search for items by name
      operationId: searchItems
      parameters:
        - name: itemName
          in: query
          required: true
          description: The name (or partial name) of the item to search for
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
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
  /search:
    get:
      description: Search for items by name
      operationId: searchItems
      produces:
        - application/json
      parameters:
        - name: item-name
          in: query
          required: true
          description: The name (or partial name) of the item to search for
          type: string
      responses:
        '200':
          description: OK
          schema:
            type: array
            items:
              type: string
      `,
      expected: [
        ['query-param-camel-case', Severity.Error, 'Query parameter name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1search/get/parameters/0/name'],
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
  /search:
    get:
      description: Search for items by name
      operationId: searchItems
      parameters:
        - name: item-name
          in: query
          required: true
          description: The name (or partial name) of the item to search for
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: string
      `,
      expected: [
        ['query-param-camel-case', Severity.Error, 'Query parameter name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1search/get/parameters/0/name'],
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
  /search:
    get:
      description: Search for items by name
      operationId: searchItems
      parameters:
        - name: item-name
          in: query
          required: true
          description: The name (or partial name) of the item to search for
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: string
      `,
      expected: [
        ['query-param-camel-case', Severity.Error, 'Query parameter name is not camelCase (starts with lowercase letter, no special characters except letters and numbers)', '/paths/~1search/get/parameters/0/name'],
      ],
    });
  });
});