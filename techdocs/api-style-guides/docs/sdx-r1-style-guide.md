# SDX R1 API Standard Ruleset

This Spectral ruleset enforces the OpenAPI validation requirements for APIs
published through Secure Data Exchange (SDX) that use scoped access.

It extends the [SDX API Standard Ruleset](sdx-style-guide.md), so every SDX rule
applies unchanged, and adds rules for SDX resource scopes.

## SDX Resource Scopes

SDX resource scopes identify the organization that owns a resource, the
resource itself and the action allowed on it.

---

### sdx-r1-resource-scope-format
#### Severity: <span style="color:red">ERROR</span>

Every OAuth2 scope must be a resource scope with this structure (BCNF):

```text
scope           = namespace ":" resource { ":" resource } ":" action ;
namespace       = identifier ;
resource        = identifier ;
action          = identifier ;
identifier      = letter { letter | digit | "-" | "_" } ;
letter          = "a"…"z" ;
digit           = "0"…"9" ;
```

A scope has at least three parts: a namespace, one or more resources and an
action. Each part starts with a lowercase letter and contains only lowercase
letters, digits, `-` and `_`. The namespace is usually an organization's SDX
member ID in lowercase, for example `for` for the Ministry of Forests, and
must be a registered SDX scope namespace (see `sdx-r1-registered-scope-namespace`).


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
            for:permit:read: Read permit records.
            for:permit:amendment:approve: Approve permit amendments.
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
            permit:read: Missing the namespace.
            FOR:Permit:Read: Uses uppercase letters.
```

---

### sdx-r1-no-oidc-scopes-in-oauth2
#### Severity: <span style="color:red">ERROR</span>

OpenID Connect scopes (`openid`, `profile`, `email`, `address`, `phone` and
`offline_access`) describe what a client application learns about the
signed-in user, not access to the API. Do not declare them in an OAuth2
security scheme. If the API needs OpenID Connect, declare an
`openIdConnect` security scheme instead, and check that the access tokens
still carry any user claims the API reads.


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
            for:permit:read: Read permit records.
    sdxOidc:
      type: openIdConnect
      openIdConnectUrl: https://sso.example.gov.bc.ca/.well-known/openid-configuration
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
            openid: Sign in with OpenID Connect.
            profile: Read the user's profile.
            for:permit:read: Read permit records.
```

---

### sdx-r1-registered-scope-namespace
#### Severity: <span style="color:red">ERROR</span>

The namespace of every OAuth2 scope must be a registered SDX scope
namespace. The list is built from the lowercase member IDs of SDX
organizations plus namespaces added by hand, and is published in
[scope-namespaces.yaml](https://github.com/bcgov/itk-api-governance/blob/main/__main__/src/yaml/spectral/sdx-scope-namespaces/scope-namespaces.yaml).
Registering a namespace does not give an organization exclusive use of it;
the list stops teams from colliding by accident. To add a namespace, open a
pull request that adds it to
[managed-namespaces.yaml](https://github.com/bcgov/itk-api-governance/blob/main/__main__/src/yaml/spectral/sdx-scope-namespaces/managed-namespaces.yaml).

For early development, a scope can use the temporary namespace `tmp`, for
example `tmp:permit:read`. Before the service moves forward, switch its
scopes to the organization's namespace.


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
            for:permit:read: Read permit records.
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
            myteam:permit:read: Uses an unregistered namespace.
```

---
