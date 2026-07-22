const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class Oas2RequireOpenapi3Test extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  oas2-require-openapi-3: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new Oas2RequireOpenapi3Test();

describe('Spectral Validation', () => {
  
  test('valid document should not trigger violation (3.1.0)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Test API
  version: 1.0.0
  description: Test API definition
      `,
      notExpected: [
        'oas2-require-openapi-3'
      ],
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
      `,
      notExpected: [
        'oas2-require-openapi-3'
      ],
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
      `,
      expected: [
        ['oas2-require-openapi-3', Severity.Error, 'Document uses Swagger 2.0 through the \'swagger\' key. Use \'openapi: 3.x.x\' for OpenAPI 3.x.', '/swagger'],
      ],
    });
  });
});
