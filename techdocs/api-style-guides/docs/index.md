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
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/main/dist/spectral/basic-ruleset.yaml
```

For stricter validation, extend the Strict ruleset instead:

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/main/dist/spectral/strict-ruleset.yaml
```

For APIs published through SDX, extend the SDX ruleset:

```yaml
extends:
  - https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/main/dist/spectral/sdx-ruleset.yaml
```

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
npx @stoplight/spectral-cli lint openapi.yaml --ruleset https://raw.githubusercontent.com/bcgov/csit-api-governance-spectral-style-guide/main/dist/spectral/basic-ruleset.yaml
```

### Generated Files

The generated rulesets in `dist/spectral/` are the versions intended for tooling. They are built from the source rulesets under `__main__/src/yaml/spectral/` so references and custom functions are bundled into files Spectral can consume consistently.
