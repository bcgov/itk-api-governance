const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-operation-security-scopes');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-operation-security-scopes'],
    });
  });

  test('allows operations to inherit global SDX OAuth2 security', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
security:
  - oauth2: []
paths:
  /permits:
    get:
      operationId: listPermits
      responses:
        '200':
          description: Permits returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
      `,
      notExpected: ['sdx-operation-security-scopes'],
    });
  });

  test('allows an SDX OAuth2 security scheme that is a $ref', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
security:
  - oauth2Alias: []
paths:
  /permits:
    get:
      operationId: listPermits
      responses:
        '200':
          description: Permits returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
    oauth2Alias:
      $ref: '#/components/securitySchemes/oauth2'
      `,
      notExpected: ['sdx-operation-security-scopes'],
    });
  });

  test('test rule triggers for local security overrides that omit SDX OAuth2 security', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
security:
  - oauth2: []
paths:
  /permits:
    get:
      operationId: listPermits
      security:
        - providerApiKey: []
      responses:
        '200':
          description: Permits returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
    providerApiKey:
      type: apiKey
      in: header
      name: X-Provider-Key
      `,
      expected: [
        ['sdx-operation-security-scopes', Severity.Error, 'Security option for operation "GET /permits" is missing an SDX OAuth2 scheme.', '/paths/~1permits/get/security/0'],
      ],
    });
  });

  test('test rule triggers for local security overrides that explicitly disable security', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
security:
  - oauth2: []
paths:
  /health:
    get:
      operationId: getHealth
      security: []
      responses:
        '200':
          description: Health status returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
      `,
      expected: [
        ['sdx-operation-security-scopes', Severity.Error, 'Operation "GET /health" is missing security that includes an SDX OAuth2 scheme.', '/paths/~1health/get'],
      ],
    });
  });

  test('test rule triggers for undeclared operation scopes', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /permits:
    get:
      operationId: listPermits
      security:
        - oauth2:
            - for:permit:approve
      responses:
        '200':
          description: Permits returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            for:permit:read: Read permit records.
      `,
      expected: [
        ['sdx-operation-security-scopes', Severity.Error, 'Operation "GET /permits" uses OAuth2 scope "for:permit:approve" that is not declared by security scheme "oauth2".', '/paths/~1permits/get/security/0/oauth2/0'],
      ],
    });
  });
});
