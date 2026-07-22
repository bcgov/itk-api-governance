const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class OperationIdCamelCaseTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  operation-id-camel-case: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new OperationIdCamelCaseTest();

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
  /helloworld:
    get:
      description: Hello World
      operationId: helloWorld
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
  title: Test
  version: 1.0.0
  description: Test API definition
host: localhost
schemes: [http]

paths:
  /helloworld:
    get:
      description: Hello World
      operationId: hello-world
      responses:
        '200':
          description: OK
      `,
      expected: [
        ['operation-id-camel-case', Severity.Error, 'operationId is not camelCase (starts with lowercase letter, no separators)', '/paths/~1helloworld/get/operationId'],
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
  /helloworld:
    get:
      description: Hello World
      operationId: hello-world
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: string
      `,
      expected: [
        ['operation-id-camel-case', Severity.Error, 'operationId is not camelCase (starts with lowercase letter, no separators)', '/paths/~1helloworld/get/operationId'],
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
  /helloworld:
    get:
      description: Hello World
      operationId: hello-world
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: string
      `,
      expected: [
        ['operation-id-camel-case', Severity.Error, 'operationId is not camelCase (starts with lowercase letter, no separators)', '/paths/~1helloworld/get/operationId'],
      ],
    });
  });
});