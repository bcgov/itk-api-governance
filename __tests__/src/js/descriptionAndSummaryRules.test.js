const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class DescriptionAndSummaryRulesTest extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  operation-description-min-length: error
  info-description-min-length: error
  parameter-description-min-length: error
  response-description-min-length: error
  schema-description-min-length: error
  server-description-min-length: error
  tag-description-min-length: error
  header-description-min-length: error
  property-description-min-length: error
  security-scheme-description-min-length: error
  summary-no-markdown-single-line: error
  summary-shorter-than-description: error
  oas3-schema: error
  header-description: error
  info-description: error
  oas3_1_info-summary: error
  oas3-parameter-description: error
  operation-description: error
  operation-summary: error
  path-item-summary: error
  requestBody-description: error
  schema-description: error
  securityScheme-description: error
  tag-description: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new DescriptionAndSummaryRulesTest();

describe('Spectral Validation', () => {

  test('valid document should not trigger violation (3.1.0)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Comprehensive API
  version: 1.0.0
  summary: Full-featured REST API for demonstration of documentation rules
  description: This API demonstrates all possible locations for summary and description fields in OpenAPI 3.1. It includes info, servers, paths, operations, parameters, responses, schemas, components, and more. Designed for testing linting rules related to documentation quality.
servers:
  - url: https://api.example.com/v1
    description: Production environment server with TLS enabled for secure communication
  - url: https://staging.api.example.com/v1
    description: Staging environment server used for testing new features and integrations
tags:
  - name: users
    description: Operations related to user management, profile retrieval, updates, and account administration
paths:
  /users/{id}:
    summary: Individual user resource endpoints
    description: Group of operations for working with a single user identified by their unique ID, supporting retrieval, modification, and deletion of user profile data.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
        description: Unique user identifier in UUID format used to locate and operate on a specific user account
      - name: include
        in: query
        schema:
          type: string
        description: Comma-separated list of optional fields to include in the response (e.g., roles,preferences)
      - name: X-Request-ID
        in: header
        schema:
          type: string
        description: Optional client-provided identifier for tracing and correlating requests across services
    get:
      summary: Retrieve user profile
      description: Returns detailed information about a user including profile data, roles, status, preferences, registration date, and last activity timestamp.
      operationId: getUserProfile
      tags: [users]
      responses:
        '200':
          description: User profile successfully retrieved with all requested fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: The requested user was not found in the system according to the provided identifier (404 Not Found)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    User:
      type: object
      description: Represents a registered user account in the system, containing personal identification details, authentication-related metadata, assigned roles, user preferences, and various account status flags such as active, suspended, verified, or pending deletion.
      properties:
        id:
          type: string
          description: Universally unique identifier (UUID v4) assigned to this user account for reference across the system and external integrations.
        email:
          type: string
          format: email
          description: Primary email address associated with the user account, used for authentication, notifications, password recovery, and account-related communications.
        name:
          type: string
          description: Full legal or display name of the user as provided during registration or updated through profile management endpoints.
    Error:
      type: object
      description: Standardized structure for error responses returned by API endpoints when a request cannot be processed successfully, including both machine-readable error codes and human-readable messages suitable for logging, debugging, or user-facing display.
      properties:
        code:
          type: string
          description: Unique, stable machine-readable error identifier that client applications can use for programmatic handling, localization, or mapping to specific error-handling logic.
        message:
          type: string
          description: Human-readable description of what went wrong, written in clear language suitable for display to end-users, inclusion in logs, or support ticket generation.
  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      schema:
        type: string
      description: Reusable path parameter defining a user identifier in UUID format for operations that target a specific user account
  responses:
    NotFound:
      description: Standard response returned when the requested resource could not be located in the system
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  requestBodies:
    UpdateUserBody:
      description: Request body payload containing fields that are allowed to be updated for an existing user profile (partial updates supported)
      content:
        application/json:
          schema:
            type: object
            description: Schema defining the structure of partial updates to a user profile
            properties:
              name:
                type: string
                description: Optional new display name to set for the user account
  headers:
    RequestID:
      description: Client-provided unique identifier used for tracing and correlating requests across distributed systems and logs
      schema:
        type: string
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT-based bearer token authentication mechanism for securing API access with scoped permissions
      `,
      notExpected: [
        'operation-description-min-length',
        'info-description-min-length',
        'parameter-description-min-length',
        'response-description-min-length',
        'schema-description-min-length',
        'server-description-min-length',
        'tag-description-min-length',
        'header-description-min-length',
        'property-description-min-length',
        'security-scheme-description-min-length',
        'summary-no-markdown-single-line',
        'summary-shorter-than-description',
        'oas3-schema',
        'header-description',
        'info-description',
        'oas3_1_info-summary',
        'oas3-parameter-description',
        'operation-description',
        'operation-summary',
        'path-item-summary',
        'requestBody-description',
        'schema-description',
        'securityScheme-description',
        'tag-description'
      ],
    });
  });

  test('valid document should not trigger violation (3.0.3)', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.0.3
info:
  title: Comprehensive API
  version: 1.0.0
  description: This API demonstrates all possible locations for summary and description fields in OpenAPI 3.0.3. It includes info, servers, paths, operations, parameters, responses, schemas, components, and more. Designed for testing linting rules related to documentation quality.
servers:
  - url: https://api.example.com/v1
    description: Production environment server with TLS enabled for secure communication
  - url: https://staging.api.example.com/v1
    description: Staging environment server used for testing new features and integrations
tags:
  - name: users
    description: Operations related to user management, profile retrieval, updates, and account administration
paths:
  /users/{id}:
    summary: Individual user resource endpoints
    description: Group of operations for working with a single user identified by their unique ID, supporting retrieval, modification, and deletion of user profile data.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
        description: Unique user identifier in UUID format used to locate and operate on a specific user account
      - name: include
        in: query
        schema:
          type: string
        description: Comma-separated list of optional fields to include in the response (e.g., roles,preferences)
      - name: X-Request-ID
        in: header
        schema:
          type: string
        description: Optional client-provided identifier for tracing and correlating requests across services
    get:
      summary: Retrieve user profile
      description: Returns detailed information about a user including profile data, roles, status, preferences, registration date, and last activity timestamp.
      operationId: getUserProfile
      tags: [users]
      responses:
        '200':
          description: User profile successfully retrieved with all requested fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: The requested user was not found in the system according to the provided identifier (404 Not Found)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    User:
      type: object
      description: Represents a registered user account in the system, containing personal identification details, authentication-related metadata, assigned roles, user preferences, and various account status flags such as active, suspended, verified, or pending deletion.
      properties:
        id:
          type: string
          description: Universally unique identifier (UUID v4) assigned to this user account for reference across the system and external integrations.
        email:
          type: string
          format: email
          description: Primary email address associated with the user account, used for authentication, notifications, password recovery, and account-related communications.
        name:
          type: string
          description: Full legal or display name of the user as provided during registration or updated through profile management endpoints.
    Error:
      type: object
      description: Standardized structure for error responses returned by API endpoints when a request cannot be processed successfully, including both machine-readable error codes and human-readable messages suitable for logging, debugging, or user-facing display.
      properties:
        code:
          type: string
          description: Unique, stable machine-readable error identifier that client applications can use for programmatic handling, localization, or mapping to specific error-handling logic.
        message:
          type: string
          description: Human-readable description of what went wrong, written in clear language suitable for display to end-users, inclusion in logs, or support ticket generation.
  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      schema:
        type: string
      description: Reusable path parameter defining a user identifier in UUID format for operations that target a specific user account
  responses:
    NotFound:
      description: Standard response returned when the requested resource could not be located in the system
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  requestBodies:
    UpdateUserBody:
      description: Request body payload containing fields that are allowed to be updated for an existing user profile (partial updates supported)
      content:
        application/json:
          schema:
            type: object
            description: Schema defining the structure of partial updates to a user profile
            properties:
              name:
                type: string
                description: Optional new display name to set for the user account
  headers:
    RequestID:
      description: Client-provided unique identifier used for tracing and correlating requests across distributed systems and logs
      schema:
        type: string
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT-based bearer token authentication mechanism for securing API access with scoped permissions
      `,
      notExpected: [
        'operation-description-min-length',
        'info-description-min-length',
        'parameter-description-min-length',
        'response-description-min-length',
        'schema-description-min-length',
        'server-description-min-length',
        'tag-description-min-length',
        'header-description-min-length',
        'property-description-min-length',
        'security-scheme-description-min-length',
        'summary-no-markdown-single-line',
        'summary-shorter-than-description',
        'oas3-schema',
        'header-description',
        'info-description',
        'oas3_1_info-summary',
        'oas3-parameter-description',
        'operation-description',
        'operation-summary',
        'path-item-summary',
        'requestBody-description',
        'schema-description',
        'securityScheme-description',
        'tag-description'
      ],
    });
  });

  test('missing descriptions and summaries', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Comprehensive API
  version: 1.0.0
  #summary: Full-featured REST API for demonstration of documentation rules
  #description: This API demonstrates all possible locations for summary and description fields in OpenAPI 3.1. It includes info, servers, paths, operations, parameters, responses, schemas, components, and more. Designed for testing linting rules related to documentation quality.
servers:
  - url: https://api.example.com/v1
    #description: Production environment server with TLS enabled for secure communication
  - url: https://staging.api.example.com/v1
    #description: Staging environment server used for testing new features and integrations
tags:
  - name: users
    #description: Operations related to user management, profile retrieval, updates, and account administration
paths:
  /users/{id}:
    #summary: Individual user resource endpoints
    #description: Group of operations for working with a single user identified by their unique ID, supporting retrieval, modification, and deletion of user profile data.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
        #description: Unique user identifier in UUID format used to locate and operate on a specific user account
      - name: include
        in: query
        schema:
          type: string
        #description: Comma-separated list of optional fields to include in the response (e.g., roles,preferences)
      - name: X-Request-ID
        in: header
        schema:
          type: string
        #description: Optional client-provided identifier for tracing and correlating requests across services
    get:
      #summary: Retrieve user profile
      #description: Returns detailed information about a user including profile data, roles, status, preferences, registration date, and last activity timestamp.
      operationId: getUserProfile
      tags: [users]
      responses:
        '200':
          #description: User profile successfully retrieved with all requested fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          #description: The requested user was not found in the system according to the provided identifier (404 Not Found)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    User:
      type: object
      #description: Represents a registered user account in the system, containing personal identification details, authentication-related metadata, assigned roles, user preferences, and various account status flags such as active, suspended, verified, or pending deletion.
      properties:
        id:
          type: string
          #description: Universally unique identifier (UUID v4) assigned to this user account for reference across the system and external integrations.
        email:
          type: string
          format: email
          #description: Primary email address associated with the user account, used for authentication, notifications, password recovery, and account-related communications.
        name:
          type: string
          #description: Full legal or display name of the user as provided during registration or updated through profile management endpoints.
    Error:
      type: object
      #description: Standardized structure for error responses returned by API endpoints when a request cannot be processed successfully, including both machine-readable error codes and human-readable messages suitable for logging, debugging, or user-facing display.
      properties:
        code:
          type: string
          #description: Unique, stable machine-readable error identifier that client applications can use for programmatic handling, localization, or mapping to specific error-handling logic.
        message:
          type: string
          #description: Human-readable description of what went wrong, written in clear language suitable for display to end-users, inclusion in logs, or support ticket generation.
  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      schema:
        type: string
      #description: Reusable path parameter defining a user identifier in UUID format for operations that target a specific user account
  responses:
    NotFound:
      #description: Standard response returned when the requested resource could not be located in the system
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  requestBodies:
    UpdateUserBody:
      #description: Request body payload containing fields that are allowed to be updated for an existing user profile (partial updates supported)
      content:
        application/json:
          schema:
            type: object
            #description: Schema defining the structure of partial updates to a user profile
            properties:
              name:
                type: string
                #description: Optional new display name to set for the user account
  headers:
    RequestID:
      #description: Client-provided unique identifier used for tracing and correlating requests across distributed systems and logs
      schema:
        type: string
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      #description: JWT-based bearer token authentication mechanism for securing API access with scoped permissions
      `,
      expected: [
        ['header-description', Severity.Error, 'Header is missing a description.', '/components/headers/RequestID'],
        ['info-description', Severity.Error, 'Info "description" must be present and non-empty string.', '/info'],
        ['oas3_1_info-summary', Severity.Error, 'Info is missing a summary or it is empty.', '/info'],
        ['oas3-parameter-description', Severity.Error, 'Parameter objects must have "description".', '/paths/~1users~1{id}/parameters/0'],
        ['oas3-parameter-description', Severity.Error, 'Parameter objects must have "description".', '/paths/~1users~1{id}/parameters/1'],
        ['oas3-parameter-description', Severity.Error, 'Parameter objects must have "description".', '/paths/~1users~1{id}/parameters/2'],
        ['oas3-parameter-description', Severity.Error, 'Parameter objects must have "description".', '/components/parameters/UserIdParam'],
        ['oas3-schema', Severity.Error, '"200" property must have required property "description".', '/paths/~1users~1{id}/get/responses/200'],
        ['oas3-schema', Severity.Error, '"404" property must have required property "description".', '/paths/~1users~1{id}/get/responses/404'],
        ['oas3-schema', Severity.Error, '"NotFound" property must have required property "description".', '/components/responses/NotFound'],
        ['operation-description', Severity.Error, 'Operation "description" must be present and non-empty string.', '/paths/~1users~1{id}/get'],
        ['operation-summary', Severity.Error, 'Operation is missing a summary or it is empty.', '/paths/~1users~1{id}/get'],
        ['path-item-summary', Severity.Error, 'Path item is missing a summary.', '/paths/~1users~1{id}'],
        ['requestBody-description', Severity.Error, 'RequestBody is missing a description.', '/components/requestBodies/UpdateUserBody'],
        ['schema-description', Severity.Error, 'Schema is missing a description.', '/components/schemas/User'],
        ['schema-description', Severity.Error, 'Schema is missing a description.', '/components/schemas/Error'],
        ['securityScheme-description', Severity.Error, 'SecurityScheme is missing a description.', '/components/securitySchemes/BearerAuth'],
        ['tag-description', Severity.Error, 'Tag object must have "description".', '/tags/0'],
      ],
    });
  });

  test('minimum length violations in many locations', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Comprehensive API
  version: 1.0.0
  summary: Full-featured REST API for demonstration of documentation rules
  description: This is 27 characters long.
servers:
  - url: https://api.example.com/v1
    description: This is 22 characters.
  - url: https://staging.api.example.com/v1
    description: This is 22 characters.
tags:
  - name: users
    description: This is 22 characters.
paths:
  /users/{id}:
    summary: Individual user resource endpoints
    description: This is 27 characters long.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
        description: This is 22 characters.
      - name: include
        in: query
        schema:
          type: string
        description: This is 22 characters.
      - name: X-Request-ID
        in: header
        schema:
          type: string
        description: This is 22 characters.
    get:
      summary: Retrieve user profile
      description: This is 27 characters long.
      operationId: getUserProfile
      tags: [users]
      responses:
        '200':
          description: This is 11.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: This is 11.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    User:
      type: object
      description: This is 27 characters long.
      properties:
        id:
          type: string
          description: This is 22 characters.
        email:
          type: string
          format: email
          description: This is 22 characters.
        name:
          type: string
          description: This is 22 characters.
    Error:
      type: object
      description: This is 27 characters long.
      properties:
        code:
          type: string
          description: This is 22 characters.
        message:
          type: string
          description: This is 22 characters.
  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      schema:
        type: string
      description: This is 22 characters.
  responses:
    NotFound:
      description: This is 11.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
  requestBodies:
    UpdateUserBody:
      description: This is 27 characters long.
      content:
        application/json:
          schema:
            type: object
            description: This is 27 characters long.
            properties:
              name:
                type: string
                description: This is 22 characters.
  headers:
    RequestID:
      description: This is 22 characters.
      schema:
        type: string
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: This is 22 characters.
      `,
      expected: [
        ['header-description-min-length', Severity.Error, 'Header description is too short (minimum 25 characters recommended)', '/components/headers/RequestID/description'],
        ['info-description-min-length', Severity.Error, 'info.description is too short (minimum 50 characters recommended)', '/info/description'],
        ['operation-description-min-length', Severity.Error, 'Operation description is too short (minimum 40 characters recommended)', '/paths/~1users~1{id}/get/description'],
        ['parameter-description-min-length', Severity.Error, 'Parameter description is too short (minimum 25 characters recommended)', '/paths/~1users~1{id}/parameters/0/description'],
        ['parameter-description-min-length', Severity.Error, 'Parameter description is too short (minimum 25 characters recommended)', '/paths/~1users~1{id}/parameters/1/description'],
        ['parameter-description-min-length', Severity.Error, 'Parameter description is too short (minimum 25 characters recommended)', '/paths/~1users~1{id}/parameters/2/description'],
        ['parameter-description-min-length', Severity.Error, 'Parameter description is too short (minimum 25 characters recommended)', '/components/parameters/UserIdParam/description'],
        ['property-description-min-length', Severity.Error, 'Property description is too short (minimum 25 characters recommended)', '/components/schemas/User/properties/id/description'],
        ['property-description-min-length', Severity.Error, 'Property description is too short (minimum 25 characters recommended)', '/components/schemas/User/properties/email/description'],
        ['property-description-min-length', Severity.Error, 'Property description is too short (minimum 25 characters recommended)', '/components/schemas/User/properties/name/description'],
        ['property-description-min-length', Severity.Error, 'Property description is too short (minimum 25 characters recommended)', '/components/schemas/Error/properties/code/description'],
        ['property-description-min-length', Severity.Error, 'Property description is too short (minimum 25 characters recommended)', '/components/schemas/Error/properties/message/description'],
        ['property-description-min-length', Severity.Error, 'Property description is too short (minimum 25 characters recommended)', '/components/requestBodies/UpdateUserBody/content/application~1json/schema/properties/name/description'],
        ['response-description-min-length', Severity.Error, 'Response description is too short (minimum 20 characters recommended)', '/paths/~1users~1{id}/get/responses/200/description'],
        ['response-description-min-length', Severity.Error, 'Response description is too short (minimum 20 characters recommended)', '/paths/~1users~1{id}/get/responses/404/description'],
        ['response-description-min-length', Severity.Error, 'Response description is too short (minimum 20 characters recommended)', '/components/responses/NotFound/description'],
        ['schema-description-min-length', Severity.Error, 'Schema is missing description or it is too short (min 30 chars)', '/components/schemas/User/description'],
        ['schema-description-min-length', Severity.Error, 'Schema is missing description or it is too short (min 30 chars)', '/components/schemas/Error/description'],
        ['security-scheme-description-min-length', Severity.Error, 'Security Scheme description is too short (minimum 25 characters recommended)', '/components/securitySchemes/BearerAuth/description'],
        ['server-description-min-length', Severity.Error, 'Server description is too short (minimum 25 characters recommended)', '/servers/0/description'],
        ['server-description-min-length', Severity.Error, 'Server description is too short (minimum 25 characters recommended)', '/servers/1/description'],
        ['tag-description-min-length', Severity.Error, 'Tag description is too short (minimum 25 characters recommended)', '/tags/0/description'],
      ],
    });
  });

  test('summaries with markdown and/or newlines in multiple locations', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Comprehensive API
  version: 1.0.0
  summary: |
    **Comprehensive REST API**  
    Built to showcase best practices and documentation rules in OpenAPI 3.1
  description: This API demonstrates all possible locations for summary and description fields in OpenAPI 3.1. It includes info, servers, paths, operations, parameters, responses, schemas, components, and more. Designed for testing linting rules related to documentation quality.
paths:
  /users/{id}:
    summary: |
      **Single User Endpoints**  
      Get, update or delete an individual user profile
    description: Group of operations for working with a single user identified by their unique ID, supporting retrieval, modification, and deletion of user profile data.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
        description: Unique user identifier in UUID format used to locate and operate on a specific user account
    get:
      summary: |
        **Retrieve user profile**  
        Fetch detailed information for a specific user by their ID
      description: Returns detailed information about a user including profile data, roles, status, preferences, registration date, and last activity timestamp.
      operationId: getUserProfile
      tags: [users]
      responses:
        '200':
          description: User profile successfully retrieved with all requested fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      description: Represents a registered user account in the system, containing personal identification details, authentication-related metadata, assigned roles, user preferences, and various account status flags such as active, suspended, verified, or pending deletion.
      properties:
        id:
          type: string
          description: Universally unique identifier (UUID v4) assigned to this user account for reference across the system and external integrations.
        email:
          type: string
          format: email
          description: Primary email address associated with the user account, used for authentication, notifications, password recovery, and account-related communications.
        name:
          type: string
          description: Full legal or display name of the user as provided during registration or updated through profile management endpoints.
      `,
      expected: [
        ['summary-no-markdown-single-line', Severity.Error, 'Summary contains one or more line breaks.', '/info/summary'],
        ['summary-no-markdown-single-line', Severity.Error, 'Summary contains one or more line breaks.', '/paths/~1users~1{id}/summary'],
        ['summary-no-markdown-single-line', Severity.Error, 'Summary contains one or more line breaks.', '/paths/~1users~1{id}/get/summary'],
        ['summary-no-markdown-single-line', Severity.Error, 'Summary contains Markdown formatting.', '/info/summary'],
        ['summary-no-markdown-single-line', Severity.Error, 'Summary contains Markdown formatting.', '/paths/~1users~1{id}/summary'],
        ['summary-no-markdown-single-line', Severity.Error, 'Summary contains Markdown formatting.', '/paths/~1users~1{id}/get/summary'],
      ],
    });
  });

  test('summaries longer than descriptions in multiple locations', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Comprehensive API
  version: 1.0.0
  summary: Longer. This API demonstrates all possible locations for summary and description fields in OpenAPI 3.1. It includes info, servers, paths, operations, parameters, responses, schemas, components, and more. Designed for testing linting rules related to documentation quality.
  description: This API demonstrates all possible locations for summary and description fields in OpenAPI 3.1. It includes info, servers, paths, operations, parameters, responses, schemas, components, and more. Designed for testing linting rules related to documentation quality.
paths:
  /users/{id}:
    summary: Longer. Group of operations for working with a single user identified by their unique ID, supporting retrieval, modification, and deletion of user profile data.
    description: Group of operations for working with a single user identified by their unique ID, supporting retrieval, modification, and deletion of user profile data.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
        description: Unique user identifier in UUID format used to locate and operate on a specific user account
    get:
      summary: Longer. Returns detailed information about a user including profile data, roles, status, preferences, registration date, and last activity timestamp.
      description: Returns detailed information about a user including profile data, roles, status, preferences, registration date, and last activity timestamp.
      operationId: getUserProfile
      tags: [users]
      responses:
        '200':
          description: User profile successfully retrieved with all requested fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      description: Represents a registered user account in the system, containing personal identification details, authentication-related metadata, assigned roles, user preferences, and various account status flags such as active, suspended, verified, or pending deletion.
      properties:
        id:
          type: string
          description: Universally unique identifier (UUID v4) assigned to this user account for reference across the system and external integrations.
        email:
          type: string
          format: email
          description: Primary email address associated with the user account, used for authentication, notifications, password recovery, and account-related communications.
        name:
          type: string
          description: Full legal or display name of the user as provided during registration or updated through profile management endpoints.
      `,
      expected: [
        ['summary-shorter-than-description', Severity.Error, 'Summary (149 chars) is not shorter than description (141 chars)', '/paths/~1users~1{id}/get'],
        ['summary-shorter-than-description', Severity.Error, 'Summary (160 chars) is not shorter than description (152 chars)', '/paths/~1users~1{id}'],
        ['summary-shorter-than-description', Severity.Error, 'Summary (272 chars) is not shorter than description (264 chars)', '/info'],
      ],
    });
  });
});
