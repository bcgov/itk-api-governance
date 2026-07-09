const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-oauth2-security-schemes');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-oauth2-security-schemes'],
    });
  });

  test('allows OAuth2 flows with no scopes', async () => {
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
      notExpected: ['sdx-oauth2-security-schemes'],
    });
  });

  test('test rule triggers when OAuth2 is missing', async () => {
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
      ],
    });
  });

  test('test rule triggers for incomplete OAuth2 scope descriptions', async () => {
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
            - protected-c
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
            protected-c: ""
      `,
      expected: [
        ['sdx-oauth2-security-schemes', Severity.Error, 'OAuth2 scope "protected-c" in security scheme "oauth2" flow "clientCredentials" must have a non-empty description.', '/components/securitySchemes/oauth2/flows/clientCredentials/scopes/protected-c'],
      ],
    });
  });

  test('test rule triggers for OpenID Connect schemes from a different OAuth2 identity provider', async () => {
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
});
