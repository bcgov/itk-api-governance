const { Severity } = require('./helpers/base-spectral-test');
const { SdxR1RuleTest } = require('./helpers/sdx-r1-rule-test');
const { validSdxOas } = require('./helpers/sdx-rule-test');

const RULE = 'sdx-r1-operation-scopes';
const testInstance = new SdxR1RuleTest(RULE);

const message = (operation) =>
  `Security option for operation "${operation}" does not require an OAuth2 scope.`;

function oas({ rootSecurity = '', getSecurity = '', postSecurity = '' } = {}) {
  return `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
${rootSecurity}
paths:
  /permits:
    get:
      operationId: listPermits
${getSecurity}
      responses:
        '200':
          description: Permits returned successfully.
    post:
      operationId: createPermit
${postSecurity}
      responses:
        '201':
          description: Permit created.
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
            for:permit:write: Create permit records.
    providerApiKey:
      type: apiKey
      in: header
      name: X-Provider-Key
    oauth2Alias:
      $ref: '#/components/securitySchemes/oauth2'
`;
}

describe('SDX R1 operation scopes', () => {
  test('valid SDX document does not trigger violation', async () => {
    await testInstance.validateOas({ oasYaml: validSdxOas, notExpected: [RULE] });
  });

  test('accepts operations that inherit a scope from document-level security', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        rootSecurity: `security:
  - oauth2:
      - for:permit:read`,
      }),
      notExpected: [RULE],
    });
  });

  test('accepts a scope required through an OAuth2 security scheme that is a $ref', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        rootSecurity: `security:
  - oauth2Alias:
      - for:permit:read`,
      }),
      notExpected: [RULE],
    });
  });

  test('accepts an operation-level scope combined with another scheme', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        rootSecurity: `security:
  - oauth2:
      - for:permit:read`,
        postSecurity: `      security:
        - oauth2:
            - for:permit:write
          providerApiKey: []`,
      }),
      notExpected: [RULE],
    });
  });

  test('rejects document-level security without a scope for every inheriting operation', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        rootSecurity: `security:
  - oauth2: []`,
      }),
      expected: [
        [RULE, Severity.Error, message('GET /permits'), '/security/0'],
        [RULE, Severity.Error, message('POST /permits'), '/security/0'],
      ],
    });
  });

  test('rejects an operation-level override without a scope', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        rootSecurity: `security:
  - oauth2:
      - for:permit:read`,
        postSecurity: `      security:
        - oauth2: []`,
      }),
      expected: [
        [RULE, Severity.Error, message('POST /permits'), '/paths/~1permits/post/security/0'],
      ],
    });
  });

  test('rejects any security option that does not require a scope', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        rootSecurity: `security:
  - oauth2:
      - for:permit:read`,
        getSecurity: `      security:
        - oauth2:
            - for:permit:read
        - providerApiKey: []
        - oauth2: []`,
      }),
      expected: [
        [RULE, Severity.Error, message('GET /permits'), '/paths/~1permits/get/security/1'],
        [RULE, Severity.Error, message('GET /permits'), '/paths/~1permits/get/security/2'],
      ],
    });
  });

  test('leaves operations without any security to sdx-operation-security-scopes', async () => {
    await testInstance.validateOas({
      oasYaml: oas({
        getSecurity: `      security: []`,
      }),
      notExpected: [RULE],
    });
  });
});
