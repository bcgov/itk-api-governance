const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const NAMESPACE_DIR = path.resolve(__dirname, '../../../__main__/src/yaml/spectral/sdx-scope-namespaces');

const load = (file) => yaml.load(fs.readFileSync(path.join(NAMESPACE_DIR, file), 'utf8'));

describe('SDX scope namespace lists', () => {
  test('every generated namespace is a string identifier', () => {
    const { namespaces } = load('scope-namespaces.yaml');

    expect(namespaces.length).toBeGreaterThan(0);
    // A bare YAML scalar such as true, false or null would load as a boolean or null,
    // and the namespace rule compares strings.
    for (const namespace of namespaces) {
      expect(typeof namespace).toBe('string');
      expect(namespace).toMatch(/^[a-z][a-z0-9_-]*$/);
    }
  });

  test('every managed namespace is in the generated list', () => {
    const { namespaces } = load('scope-namespaces.yaml');
    const managed = load('managed-namespaces.yaml').namespaces.map((item) => item.namespace);

    expect(managed).toContain('tmp');
    for (const namespace of managed) {
      expect(namespaces).toContain(namespace);
    }
  });
});
