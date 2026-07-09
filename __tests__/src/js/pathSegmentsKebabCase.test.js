const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class PathSegmentsKebabCaseTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  path-segments-kebab-case: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new PathSegmentsKebabCaseTest();

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
  /hello-world:
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
  /helloWorld:
    get:
      description: Hello World
      operationId: helloWorld
      responses:
        '200':
          description: OK
      `,
      expected: [
        ['path-segments-kebab-case', Severity.Error, "Static path segment 'helloWorld' is not kebab-case (lowercase letters, numbers, hyphens only).", '/paths/~1helloWorld'],
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
  /helloWorld:
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
      expected: [
        ['path-segments-kebab-case', Severity.Error, "Static path segment 'helloWorld' is not kebab-case (lowercase letters, numbers, hyphens only).", '/paths/~1helloWorld'],
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
  /helloWorld:
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
      expected: [
        ['path-segments-kebab-case', Severity.Error, "Static path segment 'helloWorld' is not kebab-case (lowercase letters, numbers, hyphens only).", '/paths/~1helloWorld'],
      ],
    });
  });
});
