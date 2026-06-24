# csit-api-governance-spectral-style-guide

This repository provides **style guides** for developing REST APIs and corresponding Spectral rulesets that can be used to provide guidance and enforce 
adherence.

A markdown formatted versions of the style guide can be found for each ruleset in the spectral directory.

See [BASIC_STYLE_GUIDE.md](/dist/spectral/BASIC_STYLE_GUIDE.md) and [STRICT_STYLE_GUIDE.md](/dist/spectral/STRICT_STYLE_GUIDE.md)

## TechDocs

This repository includes a root Backstage `Location` in [catalog-info.yaml](catalog-info.yaml) that can reference one or more TechDocs components.
Each TechDocs component should live in its own directory under `techdocs/` with its own `catalog-info.yaml`, `mkdocs.yml`, and `docs/` folder.

Current TechDocs components:

| Component | Description |
| --------- | ----------- |
| [sdx-api-standards](techdocs/sdx-api-standards) | Secure Data Exchange (SDX) API standards documentation |


The **style guide** builds on Spectral's built-in OAS ruleset which can be found here:
```
https://docs.stoplight.io/docs/spectral/4dec24461f3af-open-api-rules
```

The basic Spectral ruleset file can be found here:

```
https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dist/spectral/basic-ruleset.yaml
```

This ruleset is intended to be reused across API projects and tooling to ensure consistent API governance and linting behavior.

Below are the supported ways to reference and consume this ruleset.  Additional information can be found by referencing [Stoplight Spectral documentation](https://stoplight.io/open-source/spectral).

---

## 1. Referencing the Ruleset from an API’s Default Ruleset File

Most API projects define a local Spectral ruleset (for example `.spectral.yaml`) that can extend one or more shared rulesets.

You can reference the shared ruleset using Spectral’s `extends` mechanism.

### Example: `.spectral.yaml`

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dist/spectral/basic-ruleset.yaml
```

### Notes

* Multiple rulesets can be combined by adding additional entries under `extends`.
* Local rules can still be added or overridden in the API-specific ruleset file.

---

## 2. Using the Ruleset with the VS Code Spectral Plugin

The VS Code Spectral extension can be configured to use a custom ruleset file.

### Steps

1. Install the **Spectral** extension from the VS Code Marketplace.
2. Open your workspace containing this repository.
3. Configure the Spectral ruleset path in your workspace settings.

### Example: `.vscode/settings.json`

```json
{
  "spectral.rulesetFile": "https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dist/spectral/basic-ruleset.yaml"
}
```

### Notes

* If your API project has its own `.spectral.yaml`, that file can `extends` the shared ruleset instead.
* Changes to the ruleset are picked up automatically when the file is saved.

---

## 3. Using the Ruleset with the IntelliJ Spectral Plugin

The IntelliJ Spectral plugin (for IntelliJ IDEA and other JetBrains IDEs) also supports custom ruleset files.

### Steps

1. Install the **Spectral** plugin from *Settings → Plugins*.
2. Open the project containing this repository.
3. Open *Settings → Tools → Spectral*.
4. Set the **Ruleset file** to point to the shared ruleset:

```
https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dist/spectral/basic-ruleset.yaml
```

### Alternative: Project Ruleset

If your project already uses a local `.spectral.yaml`, configure that file in IntelliJ instead, and have it extend the shared ruleset:

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dist/spectral/basic-ruleset.yaml
```

### Notes

* IntelliJ will re-run Spectral automatically when supported API files change.

---

## Summary

| Use Case                      | Recommended Approach                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| Shared governance across APIs | Extend `basic-ruleset.yaml` from a local ruleset                 |
| VS Code users                 | Configure `spectral.rulesetFile` or extend from `.spectral.yaml` |
| IntelliJ users                | Point plugin to the ruleset or extend from a project ruleset     |

By centralizing common rules in `/dist/spectral/basic-ruleset.yaml`, teams can enforce consistent API standards while still allowing project-specific customization.

## Development

### Adding new Spectral rulesets

New Spectral rulesets must be added to the `__main__/src/yaml/spectral` directory.

Spectral is unable to resolve $ref properties in the rulesets in all contexts.  
The project build will create an in-lined version of the rulesets in the spectral directory where it
will be self contained and available for use by Spectral.

```bash
npm run build
```

The script should be rerun after any updates to the rulesets are made and the updated spectral directory must be committed to Git.

### Adding new Spectral functions

New Spectral functions must be added to the `__main__/src/js/spectral/functions` directory.
Spectral functions should use ESM rather than CJS.

Spectral runs the Javascript in an internal sandbox which prevents it from resolving any extenal dependencies.  
The project build will create an in-lined version of the file in the spectral/functions directory where it
will be self contained and available for use by Spectral.

```bash
npm run build
```

The script should be rerun after any updates to the functions are made and the updated spectral directory must be committed to Git.

### Generating the Style Guides

A style guide for each ruleset file will be generated as part of the project build.  Markup can be added
to the comments in the ruleset file to add descriptions and examples for each rule.

```bash
npm run build
```

### Running the unit tests

To run all of the tests:

```bash
npm test
```

To run run all of the tests in files with a name matching the provided string:

```bash
npm test --- operationIdCamelCase
```

### Running Spectral on the CLI

```bash
npx @stoplight/spectral-cli lint __tests__/src/resources/registry/business-spec.yaml --ruleset dist/spectral/strict-ruleset.yaml --verbose
```
