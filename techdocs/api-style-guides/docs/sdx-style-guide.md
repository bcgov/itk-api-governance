# SDX API Standard Ruleset

This Spectral ruleset enforces the mandatory OpenAPI validation requirements
for APIs published through Secure Data Exchange (SDX).

It extends the [Basic OpenAPI Style Guide](basic-style-guide.md), escalates SDX-mandatory Basic
warnings to errors, and adds SDX-specific gateway authorization and internal
transport rules.

## SDX Mandatory Basic Rules

SDX provisioning requires these Basic rules to pass with zero errors.

---

### oas2-require-openapi-3
#### Severity: <span style="color:red">ERROR</span>

SDX accepts OpenAPI 3.x contracts only. Swagger 2.0 is not supported.

See [Basic Style Guide](basic-style-guide.md#oas2-require-openapi-3)

---

### operation-operationId
#### Severity: <span style="color:red">ERROR</span>

Every operation must have an operationId.

See [Basic Style Guide](basic-style-guide.md#operation-operationid)

---

### no-eval-in-markdown
#### Severity: <span style="color:red">ERROR</span>

Descriptions and examples must not include unsafe eval() JavaScript.

See [Basic Style Guide](basic-style-guide.md#no-eval-in-markdown)

---

### no-script-tags-in-markdown
#### Severity: <span style="color:red">ERROR</span>

Descriptions and examples must not include script tags.

See [Basic Style Guide](basic-style-guide.md#no-script-tags-in-markdown)

---

### oas3-valid-media-example
#### Severity: <span style="color:red">ERROR</span>

OpenAPI 3 media examples must validate against their schemas.

See [Basic Style Guide](basic-style-guide.md#oas3-valid-media-example)

---

### oas3-valid-schema-example
#### Severity: <span style="color:red">ERROR</span>

OpenAPI 3 schema examples must validate against their schemas.

See [Basic Style Guide](basic-style-guide.md#oas3-valid-schema-example)

---

## SDX Gateway Authorization


---

### sdx-oauth2-security-schemes
#### Severity: <span style="color:red">ERROR</span>

SDX Gateway authorization must be documented with at least one OAuth2
security scheme because the API contract must explicitly define the relevant
gateway scopes. OpenID Connect schemes SHOULD NOT be used for SDX Gateway
authorization, but may be present when they use the same identity provider as
the SDX OAuth2 security scheme and do not conflict with the OAuth2 API
contract.


**Valid example:**
```yaml
components:
  securitySchemes:
    sdxOAuth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
    sdxOidc:
      type: openIdConnect
      openIdConnectUrl: https://sso.example.gov.bc.ca/.well-known/openid-configuration
```


**Invalid example:**
```yaml
components:
  securitySchemes:
    sdxOidc:
      type: openIdConnect
      openIdConnectUrl: https://other-sso.example.gov.bc.ca/.well-known/openid-configuration
    sdxOAuth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes: {}
```

---

### sdx-oauth2-scope-descriptions-consistent
#### Severity: <span style="color:red">ERROR</span>

A scope declared under more than one OAuth2 flow must use the same description
in each flow.


**Valid example:**
```yaml
components:
  securitySchemes:
    sdxOAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://sso.example.gov.bc.ca/oauth2/authorize
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
```


**Invalid example:**
```yaml
components:
  securitySchemes:
    sdxOAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://sso.example.gov.bc.ca/oauth2/authorize
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load summaries.
```

---

### sdx-operation-security-scopes
#### Severity: <span style="color:red">ERROR</span>

Each operation must have effective security that includes the SDX OAuth2
scheme. Operations may inherit global security from the document root. When
an operation declares local security, that local declaration overrides global
security and must still include SDX OAuth2.


**Valid example:**
```yaml
security:
  - sdxOAuth2:
      - loads:read
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    sdxOAuth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
```


**Invalid example:**
```yaml
security:
  - sdxOAuth2:
      - loads:read
paths:
  /loads:
    get:
      operationId: listLoads
      security:
        - providerApiKey: []
      responses:
        '200':
          description: Loads returned successfully.
components:
  securitySchemes:
    sdxOAuth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://sso.example.gov.bc.ca/oauth2/token
          scopes:
            loads:read: Read load records.
    providerApiKey:
      type: apiKey
      in: header
      name: X-Provider-Key
```

---

## SDX Internal Transport


---

### sdx-no-internal-headers
#### Severity: <span style="color:red">ERROR</span>

External API contracts must not expose SDX internal edge headers, including
X-Edge-Token and other X-Edge-* headers.


**Valid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      parameters:
        - name: X-Correlation-ID
          in: header
          schema:
            type: string
      responses:
        '200':
          description: Loads returned successfully.
```


**Invalid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      parameters:
        - name: X-Edge-Token
          in: header
          schema:
            type: string
      responses:
        '200':
          description: Loads returned successfully.
          headers:
            X-Edge-Trace:
              description: Internal trace header.
              schema:
                type: string
```

---

## SDX Unsupported OpenAPI Features


---

### sdx-no-webhooks
#### Severity: <span style="color:red">ERROR</span>

SDX does not support OpenAPI 3.1 webhooks.


**Valid example:**
```yaml
openapi: 3.1.0
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
```


**Invalid example:**
```yaml
openapi: 3.1.0
webhooks:
  loadChanged:
    post:
      operationId: loadChanged
      responses:
        '202':
          description: Load change accepted.
```

---

### sdx-no-callbacks
#### Severity: <span style="color:red">ERROR</span>

SDX does not support OpenAPI callbacks.


**Valid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
```


**Invalid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      callbacks:
        onLoadChanged:
          '{$request.body#/callbackUrl}':
            post:
              operationId: onLoadChanged
      responses:
        '200':
          description: Loads returned successfully.
```

---

### sdx-no-streaming-media-types
#### Severity: <span style="color:red">ERROR</span>

SDX does not support long-lived streaming media types.


**Valid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
          content:
            application/json:
              schema:
                type: object
```


**Invalid example:**
```yaml
paths:
  /loads:
    get:
      operationId: streamLoads
      responses:
        '200':
          description: Loads streamed successfully.
          content:
            text/event-stream:
              schema:
                type: string
```

---

### sdx-no-websocket-server-urls
#### Severity: <span style="color:red">ERROR</span>

SDX does not support WebSocket server URLs.


**Valid example:**
```yaml
servers:
  - url: https://api.example.gov.bc.ca/sdx
```


**Invalid example:**
```yaml
servers:
  - url: wss://api.example.gov.bc.ca/sdx
```

---

### sdx-server-urls-http-only
#### Severity: <span style="color:red">ERROR</span>

SDX can only proxy HTTP, HTTPS, or relative server URLs.


**Valid example:**
```yaml
servers:
  - url: /mass-haul
```


**Invalid example:**
```yaml
servers:
  - url: ftp://api.example.gov.bc.ca/mass-haul
```

---

### sdx-no-operation-servers
#### Severity: <span style="color:red">ERROR</span>

SDX routing is controlled centrally and does not support operation-level
server overrides.


**Valid example:**
```yaml
servers:
  - url: https://api.example.gov.bc.ca/sdx
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
```


**Invalid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      servers:
        - url: https://operation.example.gov.bc.ca/sdx
      responses:
        '200':
          description: Loads returned successfully.
```

---

### sdx-no-path-item-servers
#### Severity: <span style="color:red">ERROR</span>

SDX routing is controlled centrally and does not support path-item-level
server overrides.


**Valid example:**
```yaml
servers:
  - url: https://api.example.gov.bc.ca/sdx
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
```


**Invalid example:**
```yaml
paths:
  /loads:
    servers:
      - url: https://path.example.gov.bc.ca/sdx
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
```

---

### sdx-supported-http-methods
#### Severity: <span style="color:red">ERROR</span>

SDX does not support TRACE, OPTIONS, or HEAD operations.


**Valid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
```


**Invalid example:**
```yaml
paths:
  /loads:
    trace:
      operationId: traceLoads
      responses:
        '204':
          description: Trace completed successfully.
```

---

### sdx-supported-media-types
#### Severity: <span style="color:red">ERROR</span>

SDX does not support XML, binary, multipart, or other non-JSON-style
request and response media types.


**Valid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
          content:
            application/json:
              schema:
                type: object
```


**Invalid example:**
```yaml
paths:
  /loads:
    get:
      operationId: listLoads
      responses:
        '200':
          description: Loads returned successfully.
          content:
            application/xml:
              schema:
                type: string
```

---

### sdx-no-binary-schemas
#### Severity: <span style="color:red">ERROR</span>

SDX does not support binary string schemas.


**Valid example:**
```yaml
schema:
  type: object
  properties:
    documentId:
      type: string
```


**Invalid example:**
```yaml
schema:
  type: object
  properties:
    file:
      type: string
      format: binary
```

---

### sdx-no-cookie-parameters
#### Severity: <span style="color:red">ERROR</span>

SDX does not support cookie-based API contracts.


**Valid example:**
```yaml
parameters:
  - name: requestId
    in: header
    schema:
      type: string
```


**Invalid example:**
```yaml
parameters:
  - name: session
    in: cookie
    schema:
      type: string
```

---
