const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class SdxRulesetTest extends BaseSpectralTest {
  constructor() {
    super('spectral/sdx-ruleset.yaml');
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new SdxRulesetTest();

const validSdxOas = `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
servers:
  - url: https://api.example.gov.bc.ca/sdx
paths:
  /loads:
    get:
      operationId: listLoads
      summary: List loads
      description: Returns loads available to the requesting client.
      security:
        - oauth2:
            - loads:read
      responses:
        '200':
          description: Loads returned successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                example:
                  id: load-1
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
            protected-c: Access operations that exchange Protected-C data.
`;

describe('SDX Spectral ruleset', () => {
  test('valid SDX OpenAPI contract passes SDX-specific rules', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: [
        'sdx-oauth2-security-schemes',
        'sdx-oauth2-scope-descriptions-consistent',
        'sdx-operation-security-scopes',
        'sdx-no-internal-headers',
      ],
    });
  });

  test('allows OAuth2 flows and operations with no scopes', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /health:
    get:
      operationId: getHealth
      security:
        - oauth2: []
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
      notExpected: [
        'sdx-oauth2-security-schemes',
        'sdx-operation-security-scopes',
      ],
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
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
      `,
      notExpected: [
        'sdx-operation-security-scopes',
      ],
    });
  });

  test('rejects local security overrides that omit SDX OAuth2 security', async () => {
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
  /loads:
    get:
      operationId: listLoads
      security:
        - providerApiKey: []
      responses:
        '200':
          description: Loads returned successfully.
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
        ['sdx-operation-security-scopes', Severity.Error, 'Every security option for operation "GET /loads" must include an SDX OAuth2 scheme.', '/paths/~1loads/get/security/0'],
      ],
    });
  });

  test('rejects local security overrides that explicitly disable security', async () => {
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
        ['sdx-operation-security-scopes', Severity.Error, 'Operation "GET /health" must define security that includes an SDX OAuth2 scheme.', '/paths/~1health/get'],
      ],
    });
  });

  test('allows OpenID Connect but rejects incomplete OAuth2 flows, inconsistent scope descriptions, and undeclared operation scopes', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - oauth2:
            - loads:write
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    oidc:
      type: openIdConnect
      openIdConnectUrl: https://sso.example.gov.bc.ca/.well-known/openid-configuration
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://sso.example.gov.bc.ca/oauth2/authorize
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records with a different description.
            protected-c: ""
      `,
      expected: [
        ['sdx-oauth2-security-schemes', Severity.Error, 'OAuth2 scope "protected-c" in security scheme "oauth2" flow "clientCredentials" must have a non-empty description.', '/components/securitySchemes/oauth2/flows/clientCredentials/scopes/protected-c'],
        ['sdx-oauth2-scope-descriptions-consistent', Severity.Error, 'OAuth2 scope "loads:read" in security scheme "oauth2" must use the same description in every flow.', '/components/securitySchemes/oauth2/flows/clientCredentials/scopes/loads:read'],
        ['sdx-operation-security-scopes', Severity.Error, 'Operation "GET /loads" uses OAuth2 scope "loads:write" that is not declared by security scheme "oauth2".', '/paths/~1loads/get/security/0/oauth2/0'],
      ],
    });
  });

  test('requires at least one OAuth2 security scheme even when OpenID Connect is present', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - oidc:
            - loads:read
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    oidc:
      type: openIdConnect
      openIdConnectUrl: https://sso.example.gov.bc.ca/.well-known/openid-configuration
      `,
      expected: [
        ['sdx-oauth2-security-schemes', Severity.Error, 'At least one OAuth2 security scheme must be defined for SDX Gateway authorization.', '/components/securitySchemes'],
        ['sdx-operation-security-scopes', Severity.Error, 'Every security option for operation "GET /loads" must include an SDX OAuth2 scheme.', '/paths/~1loads/get/security/0'],
      ],
    });
  });

  test('rejects OpenID Connect schemes from a different OAuth2 identity provider', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - oauth2: []
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    oidc:
      type: openIdConnect
      openIdConnectUrl: https://other-sso.example.gov.bc.ca/.well-known/openid-configuration
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
      `,
      expected: [
        ['sdx-oauth2-security-schemes', Severity.Error, 'OpenID Connect security scheme "oidc" must use the same identity provider as an SDX OAuth2 security scheme.', '/components/securitySchemes/oidc/openIdConnectUrl'],
      ],
    });
  });

  test('rejects security alternatives that omit SDX OAuth2 scopes', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - oauth2:
            - loads:read
          providerApiKey: []
        - providerApiKey: []
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
    providerApiKey:
      type: apiKey
      in: header
      name: X-Provider-Key
      `,
      expected: [
        ['sdx-operation-security-scopes', Severity.Error, 'Every security option for operation "GET /loads" must include an SDX OAuth2 scheme.', '/paths/~1loads/get/security/1'],
      ],
    });
  });

  test('requires effective OAuth2 security for operations', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      summary: List loads
      description: Returns loads available to the requesting client.
      security:
        - oauth2:
            - loads:read
      responses:
        '200':
          description: Loads returned successfully.
  /loads/{id}:
    get:
      operationId: getLoad
      responses:
        '200':
          description: Load returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
      `,
      expected: [
        ['sdx-operation-security-scopes', Severity.Error, 'Operation "GET /loads/{id}" must define security that includes an SDX OAuth2 scheme.', '<root>'],
      ],
    });
  });

  test('rejects SDX internal transport headers', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - oauth2:
            - loads:read
      parameters:
        - name: X-Edge-Token
          in: header
          schema:
            type: string
      responses:
        '200':
          description: Loads returned successfully.
          headers:
            X-Edge-Trace:
              description: Internal trace header.
              schema:
                type: string
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
      `,
      expected: [
        ['sdx-no-internal-headers', Severity.Error, 'Header "X-Edge-Token" exposes SDX internal transport details and must not be included in the external API contract.', '/paths/~1loads/get/parameters/0/name'],
        ['sdx-no-internal-headers', Severity.Error, 'Header "X-Edge-Trace" exposes SDX internal transport details and must not be included in the external API contract.', '/paths/~1loads/get/responses/200/headers/X-Edge-Trace'],
      ],
    });
  });

  test('promotes SDX-mandatory Basic warnings to errors', async () => {
    await testInstance.validateOas({
      oasYaml: `
swagger: '2.0'
info:
  title: SDX API
  version: 1.0.0
  description: "Use eval('dangerous')"
paths:
  /loads:
    get:
      responses:
        '200':
          description: Loads returned successfully.
      `,
      expected: [
        ['oas2-require-openapi-3', Severity.Error, 'Swagger 2.0 detected (uses \'swagger\' key). Use \'openapi: 3.x.x\' instead.', '/swagger'],
        ['operation-operationId', Severity.Error, 'Operation must have "operationId".', '/paths/~1loads/get'],
        ['no-eval-in-markdown', Severity.Error, 'Markdown descriptions must not have "eval(".', '/info/description'],
      ],
    });
  });
});
