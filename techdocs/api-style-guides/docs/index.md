# API Style Guides

These style guides document the shared Spectral rulesets used to review OpenAPI descriptions for API governance. Each guide is generated from the ruleset source, so the rule descriptions, severity levels, and examples stay aligned with the linting behaviour used by automated tooling.

Use these pages when you need to understand why a lint result was raised, decide which ruleset is appropriate for an API, or review the examples for valid and invalid OpenAPI patterns.

## Available Guides

### Basic Style Guide

The [Basic Style Guide](basic-style-guide.md) is the common baseline for OpenAPI quality. It combines Spectral's built-in OpenAPI rules with B.C. API governance conventions for structure, naming, examples, descriptions, path design, and safe Markdown.

Use this ruleset for general API projects that need consistent OpenAPI validation and practical guidance without treating every recommendation as a release blocker.

### Strict Style Guide

The [Strict Style Guide](strict-style-guide.md) extends the Basic Style Guide and promotes many recommendations to errors. It is intended for teams that want a higher enforcement bar for complete, well-documented, code-generation-friendly API contracts.

Use this ruleset when an API program wants warnings to be treated as required work before publication or release.

### SDX Style Guide

The [SDX Style Guide](sdx-style-guide.md) extends the Basic Style Guide with the mandatory validation rules for APIs published through Secure Data Exchange. It focuses on SDX Gateway authorization, OAuth2 security declarations, operation security requirements, and exclusion of SDX internal transport details from external API contracts.

Use this ruleset for OpenAPI descriptions that will be provisioned or published through SDX.

## Reading A Rule

Each rule page includes:

- the rule name used by Spectral
- the severity applied by the ruleset
- a short explanation of the requirement
- valid and invalid examples where the source ruleset provides them
- links back to the Basic Style Guide for rules inherited from another ruleset

## Choosing A Ruleset

Choose the lowest ruleset that matches the API's governance context:

- Use **Basic** for broad OpenAPI quality and shared API governance conventions.
- Use **Strict** when documentation completeness and stronger enforcement are required.
- Use **SDX** when the API must satisfy Secure Data Exchange provisioning requirements.

## Using The Rulesets

Most API projects use Spectral through a local `.spectral.yaml` file. The local file can extend one of the generated shared rulesets, and teams can still add project-specific rules or overrides in the same file.

### Project Ruleset

Use the generated ruleset URL that matches your governance context:

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dev-ruleset-v1.0.0/dist/spectral/basic-ruleset.yaml
```

For stricter validation, extend the Strict ruleset instead:

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dev-ruleset-v1.0.0/dist/spectral/strict-ruleset.yaml
```

For APIs published through SDX, extend the SDX ruleset:

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dev-ruleset-v1.0.0/dist/spectral/sdx-ruleset.yaml
```

### Ruleset Versions

Ruleset versions are published as Git tags in this repository. Each validation API environment is
configured with the tag prefix it should discover. The validation API only exposes tags that use the
configured prefix followed by a semantic version.

For example, the dev validation API discovers tags with the `dev-ruleset-` prefix. This repository
tag:

```text
dev-ruleset-v1.0.0
```

is exposed by the dev validation API as version:

```text
v1.0.0
```

Tags that do not use the environment's configured prefix or do not contain a valid semantic version
are ignored by that validation API.

Ruleset releases are promoted through environments by creating the corresponding environment tag:

| Environment | Tag prefix | Example tag |
| ----------- | ---------- | ----------- |
| Dev | `dev-ruleset-` | `dev-ruleset-v1.0.0` |
| Test | `test-ruleset-` | `test-ruleset-v1.0.0` |
| Prod | `prod-ruleset-` | `prod-ruleset-v1.0.0` |

Using different tag prefixes allows a new ruleset version to move through development and testing
before it becomes available in production.

Each environment exposes the version without the environment prefix. For example, the dev, test, and
prod tags above are all exposed as version `v1.0.0` by their corresponding validation API
environment.

Use the validation API discovery endpoints to find the currently available versions and rulesets:

```text
GET /versions
GET /versions/{version}/rulesets
```

Validation requests identify both the ruleset version and the ruleset name:

```text
POST /versions/{version}/rulesets/{ruleset}/validations
```

For example:

```text
/versions/v1.0.0/rulesets/basic-ruleset/validations
```

When validating APIs through SDX tooling, use a published ruleset version rather than `main`. The
`main` branch may change as rules are developed, while an environment ruleset tag represents a
stable ruleset release for that environment.

### Editor Integration

In VS Code, install the Spectral extension and point `spectral.rulesetFile` at the project's local `.spectral.yaml` file. You can also point it directly at a generated ruleset URL, but using a local file gives the project a place to document which shared ruleset it uses.

```json
{
  "spectral.rulesetFile": ".spectral.yaml"
}
```

In IntelliJ or other JetBrains IDEs, install the Spectral plugin and configure the ruleset file under the Spectral tool settings. Use the project's `.spectral.yaml` file when one exists.

### Command Line

Run Spectral from the command line when you want the same validation in scripts or CI jobs:

```bash
npx @stoplight/spectral-cli lint openapi.yaml --ruleset .spectral.yaml
```

You can also lint directly against one of the generated rulesets:

```bash
npx @stoplight/spectral-cli lint openapi.yaml --ruleset https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/dev-ruleset-v1.0.0/dist/spectral/basic-ruleset.yaml
```

### Generated Files

The generated rulesets in `dist/spectral/` are the versions intended for tooling. They are built from the source rulesets under `__main__/src/yaml/spectral/` so references and custom functions are bundled into files Spectral can consume consistently.
