# itk-api-governance

This repository provides **style guides** for developing REST APIs and corresponding Spectral
rulesets that can be used to provide guidance and enforce adherence.

Markdown formatted versions of the style guide can be found for each ruleset in the spectral
directory.

See [basic-style-guide.md](/dist/spectral/basic-style-guide.md),
[strict-style-guide.md](/dist/spectral/strict-style-guide.md),
[sdx-style-guide.md](/dist/spectral/sdx-style-guide.md) and
[sdx-r1-style-guide.md](/dist/spectral/sdx-r1-style-guide.md)

## TechDocs

This repository includes a root Backstage `Location` in [catalog-info.yaml](catalog-info.yaml) that
can reference one or more TechDocs components. Each TechDocs component should live in its own
directory under `techdocs/` with its own `catalog-info.yaml`, `mkdocs.yml`, and `docs/` folder.

Current TechDocs components:

| Component                                       | Description                                            |
| ----------------------------------------------- | ------------------------------------------------------ |
| [api-style-guides](techdocs/api-style-guides)   | Generated API Governance Spectral style guides         |
| [sdx-api-standards](techdocs/sdx-api-standards) | Secure Data Exchange (SDX) API standards documentation |

## Using the rulesets

The generated rulesets in `dist/spectral/` are intended to be reused across API projects and tooling
to ensure consistent API governance and linting behavior.

For guidance on choosing a ruleset, configuring Spectral, and using the generated ruleset URLs, see
[API Style Guides](techdocs/api-style-guides/docs/index.md).

## Development

### Adding new Spectral rulesets

New Spectral rulesets must be added to the `__main__/src/yaml/spectral` directory.

Spectral is unable to resolve $ref properties in the rulesets in all contexts.
The project build will create an in-lined version of the rulesets in the spectral directory where it
will be self-contained and available for use by Spectral.

```bash
npm run build
```

The script should be rerun after any updates to the rulesets are made and the updated spectral
directory must be committed to Git.

### Adding new Spectral functions

New Spectral functions must be added to the `__main__/src/js/spectral/functions` directory.
Spectral functions should use ESM rather than CJS.

Spectral runs the JavaScript in an internal sandbox which prevents it from resolving any external
dependencies.
The project build will create an in-lined version of the file in the spectral/functions directory
where it will be self-contained and available for use by Spectral.

```bash
npm run build
```

The script should be rerun after any updates to the functions are made and the updated spectral
directory must be committed to Git.

### Managing SDX scope namespaces

The SDX R1 ruleset only accepts OAuth2 scopes whose namespace is in
[scope-namespaces.yaml](__main__/src/yaml/spectral/sdx-scope-namespaces/scope-namespaces.yaml).
That file is generated. Do not edit it by hand. It combines:

- the lowercase SDX member ID of every organization in api-serv-infra
  `.sdx/org-onboarding/organizations.yaml`
- the namespaces in
  [managed-namespaces.yaml](__main__/src/yaml/spectral/sdx-scope-namespaces/managed-namespaces.yaml),
  which are namespaces that are not member IDs, such as test service namespaces and the temporary
  `tmp` namespace

Registering a namespace gives no ownership of it. The list only stops teams from colliding by
accident.

To add a namespace that is not a member ID, add it with a description to
`managed-namespaces.yaml`. To pick up new or changed organizations, update your
local api-serv-infra checkout. Then regenerate the list and rebuild:

```bash
npm run generate-scope-namespaces
npm run build
```

The generator reads `../api-serv-infra/.sdx/org-onboarding/organizations.yaml` by default. Pass
another path as an argument (`npm run generate-scope-namespaces -- <path>`) or set
`SDX_ORGANIZATIONS_FILE`. It fails if a member ID is not a valid namespace, or if a managed
namespace is already a member ID.

Commit the updated `scope-namespaces.yaml` and `dist/spectral/` files. The change reaches API teams
with the next ruleset release.

### Generating the Style Guides

A style guide for each ruleset file will be generated as part of the project build. Markup can be
added to the comments in the ruleset file to add descriptions and examples for each rule.

```bash
npm run build
```

### Running the unit tests

To run all of the tests:

```bash
npm test
```

To run all of the tests in files with a name matching the provided string:

```bash
npm test --- operationIdCamelCase
```

### Running Spectral on the CLI

```bash
npx @stoplight/spectral-cli lint __tests__/src/resources/registry/business-spec.yaml --ruleset dist/spectral/strict-ruleset.yaml --verbose
```
