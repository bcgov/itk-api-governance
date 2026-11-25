const { BaseSpectralTest } = require('./base-spectral-test');

class SdxRuleTest extends BaseSpectralTest {
  constructor(ruleName) {
    super('spectral/sdx-ruleset.yaml', `
rules:
  ${ruleName}: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const validSdxOas = `
openapi: 3.0.3
info:
  title: SDX API
  version: 1.0.0
  description: API published through Secure Data Exchange.
servers:
  - url: https://api.example.gov.bc.ca/sdx
paths:
  /permits:
    get:
      operationId: listPermits
      summary: List permits
      description: Returns permits available to the requesting client.
      security:
        - oauth2:
            - for:permit:read
      responses:
        '200':
          description: Permits returned successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                example:
                  id: permit-1
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            for:permit:read: Read permit records.
            for:permit:approve: Approve permit applications.
`;

module.exports = {
  SdxRuleTest,
  validSdxOas,
};
