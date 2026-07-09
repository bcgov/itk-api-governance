const { BaseSpectralTest, Severity } = require('./helpers/base-spectral-test');

class PathSegmentsNoVerbsProbable extends BaseSpectralTest {
  constructor() {
    super('spectral/basic-ruleset.yaml', `
rules:
  path-segments-no-verbs-probable: error
`);
  }

  async beforeAll() {
    await this.setup();
  }
}

const testInstance = new PathSegmentsNoVerbsProbable();

describe('Spectral Validation', () => {
  test('valid document should not trigger violation', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Mixed Verb Anti-Pattern Demo API - All Casing Styles
  version: 1.0.0
  description: |
    Example OpenAPI document containing both blacklisted and non-blacklisted verbs
    in realistic compound path segments using multiple casing conventions:
    • kebab-case (hyphenated)
    • camelCase
    • PascalCase
    • snake_case

    Every operation has a required description.
    Designed to test verb detection across all common path naming styles.

servers:
  - url: https://api.production.myapi.com/v1

# Global tags declaration – sorted alphabetically by name to satisfy openapi-tags-alphabetical
tags:
  - name: accounts
    description: Operations related to accounts
  - name: backups
    description: Backup management operations
  - name: caches
    description: Cache management operations
  - name: carts
    description: Shopping cart and checkout operations
  - name: documents
    description: Document retrieval and preview
  - name: invoices
    description: Invoice and PDF generation operations
  - name: jobs
    description: Background job processing
  - name: orders
    description: Order-related operations
  - name: profiles
    description: Operations related to user profiles
  - name: reports
    description: Report generation and export
  - name: reservations
    description: Reservation management
  - name: sessions
    description: Authentication and session management
  - name: tokens
    description: Token and cache refresh operations
  - name: uploads
    description: File upload and import operations
  - name: users
    description: Operations related to user accounts

paths:

  /users:               
    post:
      tags:
        - users
      summary: Create a user
      description: Creates a new user account.
      operationId: createUser
      responses:
        '201':
          description: User created

  /profiles/{id}: 
    put:
      tags:
        - profiles
      summary: Update profile
      description: Updates a user profile.
      operationId: updateProfile
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Profile updated

  /accounts/{id}: 
    delete:
      tags:
        - accounts
      summary: Delete account
      description: Permanently deletes an account.
      operationId: deleteAccount
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '204':
          description: Account deleted

  /sessions:
    post:
      tags:
        - sessions
      summary: User login 
      description: Authenticates a user.
      operationId: loginUser
      responses:
        '200':
          description: Login successful

  /carts/{id}/orders: 
    post:
      tags:
        - carts
      summary: Checkout cart
      description: Completes checkout for a cart.
      operationId: checkoutCart
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Checkout completed

  /backups/{id}:         # blacklisted "download"
    get:
      tags:
        - backups
      summary: Download backup
      description: Streams a backup archive.
      operationId: downloadBackup
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Download started

  /invoices/{id}/pdfs:
    post:
      tags:
        - invoices
      summary: Generate PDF
      description: Generates a PDF invoice.
      operationId: generatePdf
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: PDF generation started

  /jobs/{id}/executions:
    post:
      tags:
        - jobs
      summary: Start processing
      description: Initiates background processing.
      operationId: startProcessing
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: Processing started

  /caches/synchronization-requests:        
    post:
      tags:
        - caches
      summary: Force sync
      description: Forces immediate cache synchronization.
      operationId: forceSync
      responses:
        '200':
          description: Sync forced

  /reports/{id}/exports:
    post:
      tags:
        - reports
      summary: Trigger export
      description: Starts asynchronous report export.
      operationId: triggerExport
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: Export triggered

  /documents/{id}:
      get:
        tags:
          - documents        
        summary: Retrieve document or preview
        description: |
          Returns the document resource.
          Use the Accept header to request a preview representation:
          - image/png or image/jpeg → visual preview/thumbnail
          - application/pdf → PDF preview
          - application/json (default) → document metadata
        operationId: getDocument
        parameters:
          - $ref: '#/components/parameters/IdParam'
          - name: Accept
            in: header
            description: Desired representation format
            schema:
              type: string
              enum:
                - application/json
                - application/pdf
              default: application/json
        responses:
          '200':
            description: Document representation
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Document'
              application/pdf:
                schema:
                  type: string
                  format: binary

  # This is an example of a false positive.  'totals' is a valid plural noun but is being eroneously identified as a verb.
  # We could add 'totals' to the allowed list, the warning can just be ignored, or another variation like 'total' can be
  # used to avoid the warning.
  /orders/{id}/totals:        
    get:
      tags:
        - orders
      summary: Calculate totals
      description: Computes order totals.
      operationId: calculateTotals
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Totals calculated

  /tokens/cache-refreshes:
    post:
      tags:
        - tokens
      summary: Refresh cache
      description: Refreshes the token cache.
      operationId: refreshCache
      responses:
        '200':
          description: Cache refreshed

  # This is an example of a false negative.  The word 'book' is being used as a verb in this context but is not being identified as a verb 
  # because 'book' is also commonly used as a noun.  
  # We could add 'book' to the blacklist or the disallowed list but we may not want to prevent APIs from using it as a noun.
  /reservations/book:              
    post:
      tags:
        - reservations
      summary: Take a reservation
      description: Take a reservation.
      operationId: takeReservation
      responses:
        '200':
          description: Reservation taken.

  # This is an example of a false negative.  The word 'import' is being used as a verb in this context but is not being identified as a verb 
  # because 'import' is also commonly used as a noun.  
  # In this case we have added it to the disallowed list so that it can be flagged as a warning.
  /uploads/import-file:              
    post:
      tags:
        - uploads
      summary: Import file
      description: Imports data from an uploaded file.
      operationId: importFile
      responses:
        '202':
          description: Import started

components:
  schemas:
      Document:
        type: object
        required:
          - id
          - title
          - content
        properties:
          id:
            type: string
            description: Unique identifier of the document
            example: doc_3fa85f64-5717-4562-b3fc-2c963f66afa6
          title:
            type: string
            description: Human-readable title of the document
            example: Annual Financial Report 2025
          content:
            type: string
            description: Content of the document
            example: This is the document content.
  parameters:
    IdParam:
      name: id
      in: path
      description: Unique identifier of the resource
      required: true
      schema:
        type: string
        format: uuid
        example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
      `,
      expected: [
        // These are two false positives that have been detected because the words can be used as either verbs or nouns and there is no way to determin based on the context.
        // Although the function will be mostly acurate we will want to keep this rule as a warning do to the possiblity for false positives.
        // If we decide that specific words like 'import' and 'totals' should not be allowed we can add them to the blacklist.
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "import-file" is likely a verb or action (disallowed word: "import"). Prefer nouns for resources.', '/paths/~1uploads~1import-file'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "totals" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "totals"). Prefer nouns for resources.', '/paths/~1orders~1{id}~1totals'],
      ]
    });
  });

  test('test rule for OpenAPI 3.1.0 triggers for invalid document', async () => {
    await testInstance.validateOas({
      oasYaml: `
openapi: 3.1.0
info:
  title: Mixed Verb Anti-Pattern Demo API - All Casing Styles
  version: 1.0.0
  description: |
    Example OpenAPI document containing both blacklisted and non-blacklisted verbs
    in realistic compound path segments using multiple casing conventions:
    • kebab-case (hyphenated)
    • camelCase
    • PascalCase
    • snake_case

    Every operation has a required description.
    Designed to test verb detection across all common path naming styles.

servers:
  - url: https://api.production.myapi.com/v1

# Global tags – sorted alphabetically by name to satisfy openapi-tags-alphabetical
tags:
  - name: accounts
    description: Account-related operations demonstrating verb anti-patterns
  - name: backups
    description: Backup download operations in various casings
  - name: caches
    description: Cache synchronization operations
  - name: carts
    description: Cart checkout operations
  - name: documents
    description: Document preview rendering operations
  - name: invoices
    description: Invoice PDF generation operations
  - name: jobs
    description: Background job start operations
  - name: orders
    description: Order total calculation operations
  - name: profiles
    description: Profile update operations in various casings
  - name: reports
    description: Report export triggering operations
  - name: sessions
    description: Session login operations
  - name: tokens
    description: Token cache refresh operations
  - name: users
    description: User creation operations in various casings

paths:

  /users/create:                        #  blacklisted "create"
    post:
      tags:
        - users
      summary: Create a user
      description: Creates a new user account. The segment "create" is blacklisted.
      operationId: createUserKebab
      responses:
        '201':
          description: User created

  /users/createUser:                    #  blacklisted "create"
    post:
      tags:
        - users
      summary: Create user (camelCase)
      description: Creates a new user account. The compound camelCase segment "createUser" contains the blacklisted verb "create".
      operationId: createUserCamel
      responses:
        '201':
          description: User created

  /users/create_user:                   #  blacklisted "create"
    post:
      tags:
        - users
      summary: Create user (snake_case)
      description: Creates a new user account. The compound snake_case segment "create_user" contains the blacklisted verb "create".
      operationId: createUserSnake
      responses:
        '201':
          description: User created

  /profiles/{id}/update-profile:        # blacklisted "update"
    put:
      tags:
        - profiles
      summary: Update profile (kebab)
      description: Updates a user profile. The segment "update-profile" contains the blacklisted verb "update".
      operationId: updateProfileKebab
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Profile updated

  /profiles/{id}/updateProfile:         # blacklisted "update"
    put:
      tags:
        - profiles
      summary: Update profile (camelCase)
      description: Updates a user profile. The compound camelCase segment "updateProfile" contains the blacklisted verb "update".
      operationId: updateProfileCamel
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Profile updated

  /accounts/{id}/deleteAccount:         # blacklisted "delete"
    delete:
      tags:
        - accounts
      summary: Delete account (PascalCase)
      description: Permanently deletes an account. The compound PascalCase segment "deleteAccount" contains the blacklisted verb "delete".
      operationId: deleteAccountPascal
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '204':
          description: Account deleted

  /sessions/login_user:                 # blacklisted "login"
    post:
      tags:
        - sessions
      summary: User login (snake_case)
      description: Authenticates a user. The compound snake_case segment "login_user" contains the blacklisted verb "login".
      operationId: loginUserSnake
      responses:
        '200':
          description: Login successful

  /carts/{id}/checkout-cart:            # blacklisted "checkout"
    post:
      tags:
        - carts
      summary: Checkout cart (kebab)
      description: Completes checkout for a cart. The segment "checkout-cart" contains the blacklisted verb "checkout".
      operationId: checkoutCartKebab
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Checkout completed

  /backups/{id}/download-backup:         # blacklisted "download"
    get:
      tags:
        - backups
      summary: Download backup (kebab)
      description: Streams a backup archive. The compound kebab segment "download-backup" is verb-like and should trigger a warning.
      operationId: downloadBackupKebab
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Download started

  /backups/{id}/downloadBackup:         # blacklisted "download"
    get:
      tags:
        - backups
      summary: Download backup (camelCase)
      description: Streams a backup archive. The compound camelCase segment "downloadBackup" is verb-like and should trigger a warning.
      operationId: downloadBackupCamel
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Download started

  /backups/{id}/DownloadBackup:         # blacklisted "download"
    get:
      tags:
        - backups
      summary: Download backup (PascalCase)
      description: Streams a backup archive. The compound PascalCase segment "DownloadBackup" is verb-like and should trigger a warning.
      operationId: downloadBackupPascal
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Download started

  /invoices/{id}/generate_pdf:          # Likely verb "generate"
    post:
      tags:
        - invoices
      summary: Generate PDF (snake_case)
      description: Generates a PDF invoice. The compound snake_case segment "generate_pdf" is verb-like and should trigger a warning.
      operationId: generatePdfSnake
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: PDF generation started

  /jobs/{id}/start-processing:          # Likely verb "start"
    post:
      tags:
        - jobs
      summary: Start processing (kebab)
      description: Initiates background processing. The compound segment "start-processing" is verb-like and should trigger a warning.
      operationId: startProcessingKebab
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: Processing started

  /jobs/{id}/startProcessing:           # Likely verb "start"
    post:
      tags:
        - jobs
      summary: Start processing (camelCase)
      description: Initiates background processing. The compound camelCase segment "startProcessing" is verb-like and should trigger a warning.
      operationId: startProcessingCamel
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: Processing started

  /caches/force_sync:                   # blacklisted "sync"
    post:
      tags:
        - caches
      summary: Force sync (snake_case)
      description: Forces immediate cache synchronization. The compound snake_case segment "force_sync" is verb-like and should trigger a warning.
      operationId: forceSyncSnake
      responses:
        '200':
          description: Sync forced

  /caches/synchronize:                   # Likely verb "synchronize"
    post:
      tags:
        - caches
      summary: Force sync (snake_case)
      description: Forces immediate cache synchronization. The compound snake_case segment "force_sync" is verb-like and should trigger a warning.
      operationId: forceSynchronize
      responses:
        '200':
          description: Sync forced

  /reports/{id}/triggerExport:          # Likely verb "trigger"
    post:
      tags:
        - reports
      summary: Trigger export (camelCase)
      description: Starts asynchronous report export. The compound camelCase segment "triggerExport" is verb-like and should trigger a warning.
      operationId: triggerExportCamel
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '202':
          description: Export triggered

  /documents/{id}/renderPreview:        # Likely verb "render"
    get:
      tags:
        - documents
      summary: Render preview (camelCase)
      description: Generates a document preview. The compound camelCase segment "renderPreview" is verb-like and should trigger a warning.
      operationId: renderPreviewCamel
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Preview rendered

  /orders/{id}/calculate-total:        # Likely verb "calculate"
    get:
      tags:
        - orders
      summary: Calculate totals (kebab)
      description: Computes order totals. The compound kebab segment "calculate-totals" is verb-like and should trigger a warning.
      operationId: calculateTotalsKebab
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Totals calculated

  /tokens/refresh_cache:                # blacklisted "refresh"
    post:
      tags:
        - tokens
      summary: Refresh cache (snake_case)
      description: Refreshes the token cache. The compound snake_case segment "refresh_cache" is verb-like and should trigger a warning.
      operationId: refreshCacheSnake
      responses:
        '200':
          description: Cache refreshed

components:
  parameters:
    IdParam:
      name: id
      in: path
      description: Unique identifier of the resource
      required: true
      schema:
        type: string
        format: uuid
        example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
      `,
      expected: [
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "calculate-total" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "calculate"). Prefer nouns for resources.', '/paths/~1orders~1{id}~1calculate-total'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "generate_pdf" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "generate"). Prefer nouns for resources.', '/paths/~1invoices~1{id}~1generate_pdf'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "renderPreview" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "render"). Prefer nouns for resources.', '/paths/~1documents~1{id}~1renderPreview'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "start-processing" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "start"). Prefer nouns for resources.', '/paths/~1jobs~1{id}~1start-processing'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "startProcessing" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "start"). Prefer nouns for resources.', '/paths/~1jobs~1{id}~1startProcessing'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "synchronize" is likely a verb or action (verb-like suffix: "synchronize"). Prefer nouns for resources.', '/paths/~1caches~1synchronize'],
        ['path-segments-no-verbs-probable', Severity.Error, 'Path segment "triggerExport" is likely a verb or action (NLP tagged as active verb (VB/VBP/VBZ): "trigger"). Prefer nouns for resources.', '/paths/~1reports~1{id}~1triggerExport'],
       
      ],
    });
  });
});
