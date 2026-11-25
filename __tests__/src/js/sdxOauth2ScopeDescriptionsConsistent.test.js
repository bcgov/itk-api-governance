const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-oauth2-scope-descriptions-consistent');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-oauth2-scope-descriptions-consistent'],
    });
  });

  test('test rule triggers for inconsistent scope descriptions across OAuth2 flows', async () => {
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
            - for:permit:read
      responses:
        '200':
          description: Permits returned successfully.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://sso.example.gov.bc.ca/oauth2/authorize
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            for:permit:read: Read permit records.
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            for:permit:read: Read permit records with a different description.
      `,
      expected: [
        ['sdx-oauth2-scope-descriptions-consistent', Severity.Error, 'OAuth2 scope "for:permit:read" in security scheme "oauth2" has inconsistent descriptions across flows.', '/components/securitySchemes/oauth2/flows/clientCredentials/scopes/for:permit:read'],
      ],
    });
  });
});
