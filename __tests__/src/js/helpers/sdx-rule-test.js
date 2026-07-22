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

module.exports = {
  SdxRuleTest,
  validSdxOas,
};
