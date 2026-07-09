const { Severity } = require('./helpers/base-spectral-test');
const { SdxRuleTest, validSdxOas } = require('./helpers/sdx-rule-test');

const testInstance = new SdxRuleTest('sdx-server-urls-http-only');

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas,
      notExpected: ['sdx-server-urls-http-only'],
    });
  });

  test('test rule triggers for non-HTTP server URLs', async () => {
    await testInstance.validateOas({
      oasYaml: validSdxOas.replace('https://api.example.gov.bc.ca/sdx', 'ftp://api.example.gov.bc.ca/sdx'),
      expected: [
        ['sdx-server-urls-http-only', Severity.Error, 'Server URL uses a scheme unsupported by SDX.', '/servers/0/url'],
      ],
    });
  });
});
