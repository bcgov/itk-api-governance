# Strict OpenAPI Style Guide

This Spectral ruleset extends the [Basic OpenAPI Style Guide](basic-style-guide.md) and applies stricter enforcement 
by elevating many recommended best practices to errors, adding mandatory content requirements, 
and enforcing stricter structural and documentation standards.

Key conventions and enforcements (in addition to all rules from the [Basic OpenAPI Style Guide](basic-style-guide.md)):

- All built-in best-practice rules from spectral:oas that were warnings are now errors
- Mandatory descriptions required for: info, tags, operations, parameters, schemas, requestBodies, headers, securitySchemes
- Minimum length requirements for most description fields
- Mandatory summaries required for: info (3.1), path items, and every operation
- Summaries must be plain text, single-line, no Markdown
- Summary must be shorter than description when both are present
- Enforced camelCase for operationId, path/query parameters, and schema properties
- Strict validation of Problem Details (RFC 9457) and internal error response structures
- No OAS 2.0 (must use OpenAPI 3.x)
- Examples required on all top-level schemas (OAS 3.0 & 3.1)
- Prefer `examples` (plural) over deprecated `example` in OAS 3.1

This ruleset is intended for teams that want very high-quality, consistent, 
well-documented, and code-generation-friendly OpenAPI definitions.
It prioritizes developer experience, automated tooling compatibility, 
and long-term maintainability.

## Basic Warnings elevated to Errors


---

### no-eval-in-markdown
#### Severity: <span style="color:red">ERROR</span>

No injecting eval() JavaScript statements

See [Basic Style Guide](basic-style-guide.md#no-eval-in-markdown)

---

### no-script-tags-in-markdown
#### Severity: <span style="color:red">ERROR</span>

No injecting script tags

See [Basic Style Guide](basic-style-guide.md#no-script-tags-in-markdown)

---

### openapi-tags-alphabetical
#### Severity: <span style="color:red">ERROR</span>

OpenAPI object should have alphabetical tags. 

See [Basic Style Guide](basic-style-guide.md#openapi-tags-alphabetical)

---

### openapi-tags-uniqueness
#### Severity: <span style="color:red">ERROR</span>

OpenAPI object must not have duplicated tag names (identifiers).

See [Basic Style Guide](basic-style-guide.md#openapi-tags-uniqueness)

---

### operation-operationId
#### Severity: <span style="color:red">ERROR</span>

Operation must have an operationId

See [Basic Style Guide](basic-style-guide.md#operation-operationid)

---

### operation-success-response
#### Severity: <span style="color:red">ERROR</span>

Operation must have at least one 2xx or 3xx response.

See [Basic Style Guide](basic-style-guide.md#operation-success-response)

---

### path-keys-no-trailing-slash
#### Severity: <span style="color:red">ERROR</span>

Keep trailing slashes off of paths, as it can causes ambiguity.

See [Basic Style Guide](basic-style-guide.md#path-keys-no-trailing-slash)

---

### array-items
#### Severity: <span style="color:red">ERROR</span>

Schemas with type: array, require a sibling items field.

See [Basic Style Guide](basic-style-guide.md#array-items)

---

### oas2-api-host
#### Severity: <span style="color:red">ERROR</span>

OpenAPI host must be present and non-empty string.

See [Basic Style Guide](basic-style-guide.md#oas2-api-host)

---

### oas2-api-schemes
#### Severity: <span style="color:red">ERROR</span>

OpenAPI host schemes must be present and non-empty array.

See [Basic Style Guide](basic-style-guide.md#oas2-api-schemes)

---

### oas2-discriminator
#### Severity: <span style="color:red">ERROR</span>

The discriminator property MUST be defined at this schema and it MUST be in the required property list.

See [Basic Style Guide](basic-style-guide.md#oas2-discriminator)

---

### oas2-host-not-example
#### Severity: <span style="color:red">ERROR</span>

Server URL should not point to example.com.

See [Basic Style Guide](basic-style-guide.md#oas2-host-not-example)

---

### oas2-host-trailing-slash
#### Severity: <span style="color:red">ERROR</span>

Server URL should not have a trailing slash.

See [Basic Style Guide](basic-style-guide.md#oas2-host-trailing-slash)

---

### oas2-operation-formData-consume-check
#### Severity: <span style="color:red">ERROR</span>

Operations with an in: formData parameter must include application/x-www-form-urlencoded or multipart/form-data in their consumes property.

See [Basic Style Guide](basic-style-guide.md#oas2-operation-formdata-consume-check)

---

### oas2-operation-security-defined
#### Severity: <span style="color:red">ERROR</span>

Operation security values must match a scheme defined in the securityDefinitions object.

See [Basic Style Guide](basic-style-guide.md#oas2-operation-security-defined)

---

### oas2-unused-definition
#### Severity: <span style="color:red">ERROR</span>

Potential unused reusable definition entry has been detected.

See [Basic Style Guide](basic-style-guide.md#oas2-unused-definition)

---

### oas2-valid-media-example
#### Severity: <span style="color:red">ERROR</span>

Examples must be valid against their defined schema.  This rule is applied to Media Type objects.

See [Basic Style Guide](basic-style-guide.md#oas2-valid-media-example)

---

### oas2-valid-schema-example
#### Severity: <span style="color:red">ERROR</span>

Examples must be valid against their defined schema. This rule is applied to Schema objects.

See [Basic Style Guide](basic-style-guide.md#oas2-valid-schema-example)

---

### oas3-callbacks-in-callbacks
#### Severity: <span style="color:red">ERROR</span>

A callback should not be defined within another callback.

See [Basic Style Guide](basic-style-guide.md#oas3-callbacks-in-callbacks)

---

### oas3-server-not-example.com
#### Severity: <span style="color:red">ERROR</span>

Server URL should not point to example.com.

See [Basic Style Guide](basic-style-guide.md#oas3-server-not-examplecom)

---

### oas3-server-trailing-slash
#### Severity: <span style="color:red">ERROR</span>

Server URL should not have a trailing slash.

See [Basic Style Guide](basic-style-guide.md#oas3-server-trailing-slash)

---

### oas3-server-variables
#### Severity: <span style="color:red">ERROR</span>

This rule ensures that server variables defined in OpenAPI Specification 3 (OAS3) and 3.1 are valid, not unused, and result in a valid URL. 

See [Basic Style Guide](basic-style-guide.md#oas3-server-variables)

---

### oas3-unused-component
#### Severity: <span style="color:red">ERROR</span>

Potential unused reusable components entry has been detected.

See [Basic Style Guide](basic-style-guide.md#oas3-unused-component)

---

### oas3-valid-media-example
#### Severity: <span style="color:red">ERROR</span>

Examples must be valid against their defined schema. This rule is applied to Media Type objects.

See [Basic Style Guide](basic-style-guide.md#oas3-valid-media-example)

---

### oas3-valid-schema-example
#### Severity: <span style="color:red">ERROR</span>

Examples must be valid against their defined schema. This rule is applied to Schema objects.

See [Basic Style Guide](basic-style-guide.md#oas3-valid-schema-example)

---

### oas3_1-callbacks-in-webhook
#### Severity: <span style="color:red">ERROR</span>

Callbacks should not be defined in a webhook.

See [Basic Style Guide](basic-style-guide.md#oas3_1-callbacks-in-webhook)

---

### oas3_1-servers-in-webhook
#### Severity: <span style="color:red">ERROR</span>

Servers should not be defined in a webhook.

See [Basic Style Guide](basic-style-guide.md#oas3_1-servers-in-webhook)

---

### operation-id-camel-case
#### Severity: <span style="color:red">ERROR</span>

Operation Ids must use camelCase. 

See [Basic Style Guide](basic-style-guide.md#operation-id-camel-case)

---

### path-segments-kebab-case
#### Severity: <span style="color:red">ERROR</span>

Path segments mustuse kebab-case (lowercase with hyphens). 

See [Basic Style Guide](basic-style-guide.md#path-segments-kebab-case)

---

### path-param-camel-case
#### Severity: <span style="color:red">ERROR</span>

Path parameters must use camelCase.  

See [Basic Style Guide](basic-style-guide.md#path-param-camel-case)

---

### query-param-camel-case
#### Severity: <span style="color:red">ERROR</span>

Query parameters must use camelCase. 

See [Basic Style Guide](basic-style-guide.md#query-param-camel-case)

---

### schema-property-camel-case
#### Severity: <span style="color:red">ERROR</span>

Schema properties (JSON payload fields) must use camelCase.  

See [Basic Style Guide](basic-style-guide.md#schema-property-camel-case)

---

### no-empty-property-names
#### Severity: <span style="color:red">ERROR</span>

Empty strings cannot be used for Schema property names.  

See [Basic Style Guide](basic-style-guide.md#no-empty-property-names)

---

### oas3_0-schema-requires-example
#### Severity: <span style="color:red">ERROR</span>

Every top-level schema object in OpenAPI 3.0.x documents should include a non-empty
'example' to improve API documentation clarity, enable better code generation, and help
API consumers quickly understand the expected data shape and realistic values.

See [Basic Style Guide](basic-style-guide.md#oas3_0-schema-requires-example)

---

### oas3_1-schema-requires-example
#### Severity: <span style="color:red">ERROR</span>

Every top-level schema object in OpenAPI 3.1.x documents should include at least one
example to improve API documentation clarity, support better mocking/code generation,
and help consumers understand realistic data shapes and values.

See [Basic Style Guide](basic-style-guide.md#oas3_1-schema-requires-example)

---

### oas3_1-prefer-examples-over-example
#### Severity: <span style="color:red">ERROR</span>

In OpenAPI 3.1.x, the singular `example` keyword inside Schema Objects is deprecated
in favor of the standard JSON Schema `examples` (plural) keyword, which supports
multiple named or unnamed examples as an array.

See [Basic Style Guide](basic-style-guide.md#oas3_1-prefer-examples-over-example)

---

### oas2-require-openapi-3
#### Severity: <span style="color:red">ERROR</span>

Enforce OpenAPI 3.x only (no Swagger 2.0)

See [Basic Style Guide](basic-style-guide.md#oas2-require-openapi-3)

---

### path-segments-no-verbs-blacklist
#### Severity: <span style="color:red">ERROR</span>

Strict enforcement: known verb anti-patterns

See [Basic Style Guide](basic-style-guide.md#path-segments-no-verbs-blacklist)

---

### info-description
#### Severity: <span style="color:red">ERROR</span>

OpenAPI object info description must be present and non-empty string.

See [Basic Style Guide](basic-style-guide.md#info-description)

---

### tag-description
#### Severity: <span style="color:red">ERROR</span>

Ensures every tag defined in the API includes a clear description explaining the group 
of operations it represents. This helps API consumers understand the purpose and scope 
of each tag/category.
Requires a non-empty description string.

See [Basic Style Guide](basic-style-guide.md#tag-description)

---

### oas3-parameter-description
#### Severity: <span style="color:red">ERROR</span>

Parameter objects should have a description.

See [Basic Style Guide](basic-style-guide.md#oas3-parameter-description)

---

### oas2-parameter-description
#### Severity: <span style="color:red">ERROR</span>

Ensures that all parameters defined in an OpenAPI 2.0 document have a meaningful description.

See [Basic Style Guide](basic-style-guide.md#oas2-parameter-description)

---

### operation-description
#### Severity: <span style="color:red">ERROR</span>

Operation must have a description

See [Basic Style Guide](basic-style-guide.md#operation-description)

---

### schema-description
#### Severity: <span style="color:red">ERROR</span>

Ensures every schema defined in components has a description.

See [Basic Style Guide](basic-style-guide.md#schema-description)

---

### requestBody-description
#### Severity: <span style="color:red">ERROR</span>

Ensures every requestBody defined in components has a description.

See [Basic Style Guide](basic-style-guide.md#requestbody-description)

---

### header-description
#### Severity: <span style="color:red">ERROR</span>

Ensures every header defined in components has a description.

See [Basic Style Guide](basic-style-guide.md#header-description)

---

### securityScheme-description
#### Severity: <span style="color:red">ERROR</span>

Ensures every securityScheme defined in components has a description.

See [Basic Style Guide](basic-style-guide.md#securityscheme-description)

---

### operation-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Enforces that operation descriptions are meaningful and contain sufficient detail.

See [Basic Style Guide](basic-style-guide.md#operation-description-min-length)

---

### info-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures the top-level API info.description provides a meaningful overview of the entire API.

See [Basic Style Guide](basic-style-guide.md#info-description-min-length)

---

### server-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures each server entry includes a meaningful description explaining its purpose or environment.

See [Basic Style Guide](basic-style-guide.md#server-description-min-length)

---

### tag-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures each tag includes a clear description explaining the group of operations it represents.

See [Basic Style Guide](basic-style-guide.md#tag-description-min-length)

---

### header-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures reusable header parameters in components include meaningful descriptions.

See [Basic Style Guide](basic-style-guide.md#header-description-min-length)

---

### security-scheme-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures security scheme definitions include a clear description of how authentication works.

See [Basic Style Guide](basic-style-guide.md#security-scheme-description-min-length)

---

### property-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures schema property descriptions are detailed enough to explain their purpose and usage.

See [Basic Style Guide](basic-style-guide.md#property-description-min-length)

---

### parameter-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Requires parameter descriptions to be descriptive enough to explain purpose and usage.

See [Basic Style Guide](basic-style-guide.md#parameter-description-min-length)

---

### response-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Ensures response descriptions are informative and explain the meaning/conditions
of each response code. Minimum 20 characters to avoid meaningless entries.

See [Basic Style Guide](basic-style-guide.md#response-description-min-length)

---

### schema-description-min-length
#### Severity: <span style="color:red">ERROR</span>

Requires schema objects (reusable or inline) to have a meaningful description
See [Basic Style Guide](basic-style-guide.md#schema-description-min-length)

---

### oas3_1_info-summary
#### Severity: <span style="color:red">ERROR</span>

Ensures the top-level info object includes a concise summary of the entire API.

See [Basic Style Guide](basic-style-guide.md#oas3_1_info-summary)

---

### path-item-summary
#### Severity: <span style="color:red">ERROR</span>

Ensures every path item includes a summary describing the resource or group of operations
it represents.

See [Basic Style Guide](basic-style-guide.md#path-item-summary)

---

### operation-summary
#### Severity: <span style="color:red">ERROR</span>

Every operation must have a summary (short one-line overview)
Summary is ideal for list views and quick scanning in tools like Swagger UI.

See [Basic Style Guide](basic-style-guide.md#operation-summary)

---

### summary-no-markdown-single-line
#### Severity: <span style="color:red">ERROR</span>

Enforces that summaries (info, path-item, and operations) are plain text and single-line.

See [Basic Style Guide](basic-style-guide.md#summary-no-markdown-single-line)

---

### summary-shorter-than-description
#### Severity: <span style="color:red">ERROR</span>

Ensures that when both summary and description are present,
the summary is shorter than the description.

See [Basic Style Guide](basic-style-guide.md#summary-shorter-than-description)

---

### oas3_0-problem-details-response-structure
#### Severity: <span style="color:red">ERROR</span>

Enforces that 400 and 422 error responses in OpenAPI 3.0 documents follow the canonical
Problem Details structure as defined in RFC 9457 (application/problem+json style).
Uses a custom schema-matching function to verify that the response schema contains
the required fields (type, title, status, errors), correct types, and respects
nullable/optional fields as defined in the reference schema.
Allows additional properties for future extension but prevents breaking the core contract.

See [Basic Style Guide](basic-style-guide.md#oas3_0-problem-details-response-structure)

---

### oas3_1-problem-details-response-structure
#### Severity: <span style="color:red">ERROR</span>

Enforces that 400 and 422 error responses in OpenAPI 3.1 documents follow the canonical
Problem Details structure as defined in RFC 9457 (application/problem+json style).
Uses a custom schema-matching function to verify that the response schema contains
the required fields (type, title, status, errors), correct types, and respects
nullable/optional fields as defined in the reference schema.
Allows additional properties for future extension but prevents breaking the core contract.

See [Basic Style Guide](basic-style-guide.md#oas3_1-problem-details-response-structure)

---

### oas3_0-internal-error-response-structure
#### Severity: <span style="color:red">ERROR</span>

Enforces that 500 error responses in OpenAPI 3.0 documents follow the canonical
Error structure.
Uses a custom schema-matching function to verify that the response schema contains
the required fields (error, message), correct types, and respects
nullable/optional fields as defined in the reference schema.
Allows additional properties for future extension but prevents breaking the core contract.

See [Basic Style Guide](basic-style-guide.md#oas3_0-internal-error-response-structure)

---

### oas3_1-internal-error-response-structure
#### Severity: <span style="color:red">ERROR</span>

Enforces that 500 error responses in OpenAPI 3.1 documents follow the canonical
Error structure.
Uses a custom schema-matching function to verify that the response schema contains
the required fields (error, message), correct types, and respects
nullable/optional fields as defined in the reference schema.
Allows additional properties for future extension but prevents breaking the core contract.

See [Basic Style Guide](basic-style-guide.md#oas3_1-internal-error-response-structure)

---

## Recommended Content


---

### openapi-tags
#### Severity: <span style="color:goldenrod">WARN</span>

OpenAPI object should have non-empty tags array.

See [Basic Style Guide](basic-style-guide.md#openapi-tags)

---

### operation-singular-tag
#### Severity: <span style="color:goldenrod">WARN</span>

Use just one tag for an operation

See [Basic Style Guide](basic-style-guide.md#operation-singular-tag)

---

### operation-tag-defined
#### Severity: <span style="color:goldenrod">WARN</span>

Operation should have non-empty tags array.

See [Basic Style Guide](basic-style-guide.md#operation-tag-defined)

---

### operation-tags
#### Severity: <span style="color:goldenrod">WARN</span>

Operation tags should be defined in global tags.

See [Basic Style Guide](basic-style-guide.md#operation-tags)

---

### path-segments-no-verbs-probable
#### Severity: <span style="color:goldenrod">WARN</span>

Softer guidance: probable verbs detected by NLP 

See [Basic Style Guide](basic-style-guide.md#path-segments-no-verbs-probable)

---
