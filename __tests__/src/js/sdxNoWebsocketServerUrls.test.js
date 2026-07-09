const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-no-websocket-server-urls');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-no-websocket-server-urls'],
    });
  });

  test('test rule triggers for WebSocket server URLs', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas.replace('https://api.example.gov.bc.ca/sdx', 'wss://api.example.gov.bc.ca/sdx'),
      expected: [
        ['sdx-no-websocket-server-urls', Severity.Error, 'SDX does not support WebSocket server URLs.', '/servers/0/url'],
      ],
    });
  });
});
