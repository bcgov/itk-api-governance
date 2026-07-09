---
title: SDX API Standard
---
# Secure Data Exchange (SDX) API Standard

The Secure Data Exchange (SDX) provides a secure, standard platform for exchanging data between
organizations. This documentation summarizes the SDX API Standard for published HTTP APIs.

This page describes the current release of the SDX API Standard. Older releases can be accessed from
tagged commits in the repository.

The API Standard is a living standard with named releases. Requirements use the keywords **MUST**,
**MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**,
**RECOMMENDED**, **MAY**, and **OPTIONAL** as defined by
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Scope

This standard applies to HTTP APIs. Standards for other API types, such as RESTful APIs or GraphQL
APIs, may be defined later.

The SDX API Standard currently does not define requirements for:

- API versioning
- URL parameters
- Resource naming
- Service responses
- Standard units of measure
- Standard data items
- Standard error payloads
- Sorting
- Searching and filtering
- Pagination and continuation
- Bulk operations
- Caching

## Service Catalog Requirements

All services published to the Service Catalog MUST conform to a version of the SDX API Standard.

## Authoritative Data Registries

APIs that are planned as Authoritative Data Registries MUST conform to the ADR API Standard when it
is available. The ADR API Standard is expected to cover much of the API design scope that is excluded
from this standard.

## Security Requirements

Every request to an SDX API MUST include an OpenID Connect (OIDC) JWT access token issued by the
Common Hosted Single Sign-On (CSS) Standard Realm. SDX uses the tokens **client_id** or **azp**
claims to identify the requesting client.

SDX Gateway authorization is based on scopes. SDX inspects the access token for the scopes required
by the requested operation before allowing the request to pass through the gateway.

The provider service MAY require other authentication or authorization mechanisms, but those
mechanisms are outside the scope of SDX. The provider service MAY also implement additional
authorization based on roles, data context, or other provider-owned access rules.

Every operation:

- MUST require a JWT access token issued by the CSS Standard Realm to access the operation.
- MAY require one or more scopes to access the operation.
- MAY be further restricted by provider-owned authentication or authorization controls outside the scope of SDX.

## API Documentation Requirements

### OpenAPI Description

SDX APIs are documented with OpenAPI Descriptions (OADs). The OAD is the contract SDX uses to
understand the API's operations, security requirements, scopes, and server information.

An OAD with environment-specific URLs will need to be uploaded for each SDX environment provisioned.

!!! note
    Operations, security requirements, and scopes are expected to remain consistent across
    environments for the same OAD version; changes to those parts of the contract should typically be
    published as a different OAD version.

### OAuth2 Security Scheme

SDX Gateway authorization MUST be documented with an OpenAPI OAuth2 security scheme. OpenID Connect
security schemes SHOULD NOT be used for SDX Gateway authorization. OpenID Connect security schemes
MAY be present when they use the same identity provider as the SDX OAuth2 security scheme and do not
conflict with the OAuth2 API contract. OpenID Connect security schemes can derive scopes from the
identity provider's well-known configuration. In the CSS Standard Realm, that configuration can
include many scopes that are unrelated to a specific API. An OAuth2 security scheme lets the API
specification explicitly define only the scopes that are part of the API contract, which makes the
OAD clearer for consumers and easier for SDX and downstream tooling to process consistently.

The OAuth2 security scheme MUST include the supported flows, token URLs, and authorization URLs
required by those flows. OAuth2 scopes MAY be omitted when the API does not require scopes. When
scopes are declared, each scope MUST include a description. When the same scope is declared under
multiple OAuth2 flows, the description MUST be consistent.

APIs MUST use OpenAPI `security` declarations to identify the SDX Gateway OAuth2 scheme and any
scopes required to access operations. This can be declared globally at the OpenAPI document root, or
locally on each operation. When an operation declares its own `security`, that local declaration
overrides the global declaration and MUST still include the SDX OAuth2 scheme.

### Well-Formed API Contract

The OAD must use OpenAPI 3.x or newer. Swagger 2.0 is not supported for SDX because the validation
and provisioning process depends on OpenAPI 3.x security, server, schema, and component structures.

The OAD must be well formed and valid. This includes valid OpenAPI structure, references, path
declarations, path parameters, operation parameters, schemas, examples, enum values, and operation
security definitions. References must not have invalid siblings, enum entries must not be duplicated,
and enum values must match their declared types.

Operations and paths must be unambiguous. Operation IDs must be present for all operations, and
operation IDs must be unique when provided. Path keys must not include query strings because query
parameters must be documented as OpenAPI parameters.

Descriptions and examples must be safe to render in SDX and downstream catalogues. Markdown content
must not include unsafe script tags or `eval` expressions.

The external API contract must not expose SDX internal transport details. Internal edge headers and
`X-Edge-Token` must not be included in the OAD.

### Unsupported OpenAPI Features

SDX supports HTTP request and response API contracts that can be proxied and published consistently
through the SDX Gateway and downstream catalogues.

The OAD MUST NOT define asynchronous callback or event-driven API features:

- OpenAPI 3.1 top-level `webhooks`.
- Operation-level `callbacks`.
- Streaming media types, including `text/event-stream`, `application/x-ndjson`,
  `application/stream+json`, and `application/json-seq`.

The OAD MUST use SDX-supported server and routing declarations:

- Server URLs MUST use HTTP, HTTPS, or relative URLs.
- Server URLs MUST NOT use WebSocket schemes such as `ws://` or `wss://`.
- Server URLs MUST NOT use non-HTTP schemes such as `ftp://`, `sftp://`, `mqtt://`, or `amqp://`.
- The OAD MUST NOT define path-item-level or operation-level `servers`.

The OAD MUST only define `get`, `post`, `put`, `patch`, and `delete` operations. The OAD MUST NOT
define `trace`, `options`, or `head` operations.

The OAD MUST NOT define unsupported request or response media types. Unsupported media types include
XML, `application/octet-stream`, `multipart/*`, image, audio, video, PDF, and ZIP media types.

The OAD MUST NOT define large or binary file transfer contracts, including `type: string` schemas
with `format: binary` or `format: byte`.

The OAD MUST NOT define cookie parameters.

### Validation Rules

The OAD will be validated against the SDX OpenAPI validation rules before the API is provisioned. The
OAD MUST pass with zero errors. The validation may produce warnings that can be used to further
improve the OAD, but warnings alone will not prevent the API from being provisioned.

The SDX ruleset will validate the following mandatory rules:

- OpenAPI 3.x or newer, rather than Swagger 2.0.
- Valid OpenAPI structure, references, path declarations, path parameters, operation parameters,
  schemas, examples, enum values, and operation security definitions.
- Unique operation IDs where operation IDs are provided.
- No query strings in path keys.
- No invalid `$ref` siblings.
- No duplicated enum entries.
- Typed enum values.
- Operation IDs for all operations.
- No unsafe Markdown such as script tags or `eval`.
- Use of an OpenAPI OAuth2 security scheme for SDX Gateway authorization. OpenID Connect security
  schemes SHOULD NOT be used for SDX Gateway authorization, but MAY be present when they use the same
  identity provider as the SDX OAuth2 security scheme and do not conflict with the OAuth2 API
  contract.
- OAuth2 flows, token URLs, authorization URLs, and scope descriptions when scopes are declared.
- Consistent descriptions when the same scope is declared under multiple OAuth2 flows.
- Global or operation-level `security` declarations for the SDX Gateway OAuth2 scheme and scopes.
  Operation-level declarations override global declarations and must still include the SDX OAuth2
  scheme.
- Exclusion of internal edge headers and `X-Edge-Token` from the external API contract.
- Exclusion of unsupported OpenAPI features, including webhooks, callbacks, streaming media types,
  unsupported server URL schemes, path-item and operation-level servers, unsupported HTTP methods,
  unsupported media types, binary schemas, and cookie parameters.

Refer to the [SDX API Style Guide](/docs/default/component/api-style-guides/sdx-style-guide/) for greater detail.

### API Standard Release

API specifications MAY include the custom OAD property `x-csbc-api-standard` within the OAD `info`
object to indicate which API Standard release the OAD document conforms to.

OAD documents that omit `x-csbc-api-standard` will be tested against the latest API Standard linting
rules. If the `x-csbc-api-standard` refers to an older, out of support version then the API will have
to be updated to conform to a currently supported version.

### Example OAD

Example OAD:

```yaml
openapi: 3.0
info:
  title: Mass Haul API
  version: 1.2.0
  description: Manage and track the excavation of earth materials.
  x-csbc-api-standard: "R2026.1"
servers:
  - url: /mass-haul
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.gov.bc.ca/oauth2/authorize
          tokenUrl: https://example.gov.bc.ca/oauth2/token
          scopes:
            mass-haul:read: Read mass haul records.
            mass-haul:write: Create and update mass haul records.
paths:
  /loads:
    get:
      summary: List mass haul loads.
      security:
        - oauth2:
            - mass-haul:read
      responses:
        "200":
          description: Mass haul loads returned.
    post:
      summary: Create a mass haul load.
      security:
        - oauth2:
            - mass-haul:write
      responses:
        "201":
          description: Mass haul load created.
```

## SDX Processing

When SDX loads or imports a provided OAD, SDX will update and add SDX-specific metadata so that the
API can be published consistently through SDX and downstream catalogues.

SDX will update:

- OAuth token endpoint details, where applicable.
- The `servers` section.

SDX will add:

- SDX documentation in the OAD description.
- An external reference to these SDX TechDocs.
- SDX-related external API headers.

SDX will remove:

- The `info.contact` section because this contact information source may become stale. Contact
  information will be published in the ITK API catalogue where it can be kept up-to-date.

SDX will not modify provider-owned `info.termsOfService` or `info.license` values. Except for the
SDX-managed metadata listed above, SDX will not modify provider-owned API contract content before
publication.

Example SDX metadata:

```yaml
externalDocs:
  description: Secure Data Exchange API Standard
  url: https://developer.gov.bc.ca/docs/default/component/secure-data-exchange-tech-docs/
```

SDX-related external API header handling:

- `Content-Digest` will be added as an optional request or response header.
- `DPoP` will be added when enabled by SDX configuration.

Example SDX-added header parameters:

```yaml
components:
  parameters:
    ContentDigest:
      name: Content-Digest
      in: header
      required: false
      schema:
        type: string
      description: Digest of the request or response content.
    DPoP:
      name: DPoP
      in: header
      required: true
      schema:
        type: string
      description: Demonstration of Proof-of-Possession token required when enabled by SDX configuration.
paths:
  /loads:
    post:
      parameters:
        - $ref: "#/components/parameters/ContentDigest"
        - $ref: "#/components/parameters/DPoP"
```
