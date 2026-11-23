const { BaseSpectralTest } = require('./base-spectral-test');

class SdxR1RuleTest extends BaseSpectralTest {
  constructor(ruleName) {
    super('spectral/sdx-r1-ruleset.yaml', ruleName ? `
rules:
  ${ruleName}: error
` : '');
  }

  async beforeAll() {
    await this.setup();
  }
}

module.exports = {
  SdxR1RuleTest,
};
