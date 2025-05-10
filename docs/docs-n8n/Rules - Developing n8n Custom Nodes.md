Rules for Cursor: Developing n8n Custom Nodes
I. General Principles & Project Setup

Adhere to n8n Standards: All generated code must align with n8n's architecture, interfaces, and conventions as outlined in the official documentation and demonstrated in the n8n-nodes-starter template.
Use TypeScript: All node and credential files must be written in TypeScript.
Environment: Assume development occurs within a Devcontainer environment, leveraging pnpm as the package manager, as this is the recommended approach for consistency and avoiding linking issues.
File Structure: Follow the standard n8n-nodes-starter structure:
Node logic: nodes/<NodeName>/<NodeName>.node.ts
Credentials: credentials/<CredentialsName>.credentials.ts (if needed)
Metadata: nodes/<NodeName>/<NodeName>.node.json
Icon: nodes/<NodeName>/<icon>.(svg|png) (Prefer SVG)
Package Config: package.json
TypeScript Config: tsconfig.json
Version Control: All development must use Git, with frequent, descriptive commits.
II. Node Definition (<NodeName>.node.ts)

Implement INodeType: The main node class must implement the INodeType interface from n8n-workflow.
Define description: Populate the description property (type INodeTypeDescription) with accurate metadata: displayName, name (unique identifier), icon (file path), group, version, subtitle, description (tooltip), defaults, inputs, outputs, credentials (array of required credential names).
Define properties Array: Structure the node's UI fields within the description.properties array. Each property object must include:
displayName: Label shown in the UI.
name: Internal key used to retrieve the value (e.g., via getNodeParameter).
type: UI field type (e.g., string, number, boolean, options, collection, resourceLocator, dateTime, json, notice).
default: Default value for the field.
Optional: required, description (help text), placeholder, displayOptions (for conditional visibility), typeOptions (e.g., for loadOptionsMethod).
Resource/Operation Pattern: For nodes interacting with APIs, typically define a resource property (type: 'options') and subsequent operation properties (type: 'options') with displayOptions linked to the selected resource.
Expressions: For string type properties that should support n8n expressions (drag-and-drop), add requiresDataPath: 'single' or requiresDataPath: 'multiple'. Avoid noDataExpression: true unless the field should never evaluate expressions.
III. Programmatic Logic (execute Method)

Implement async execute: Define the core logic within async execute(this: IExecuteFunctions): Promise<INodeExecutionData>.
Get Input Data: Retrieve incoming data using const items = this.getInputData();.
Iterate Over Items: Process data item by item. Use a for loop (for (let i = 0; i < items.length; i++)) to access the index i.
Get Node Parameters: Retrieve parameter values using this.getNodeParameter('parameterName', i, defaultValue). Crucially, always pass the current item index (i) to correctly evaluate expressions within the context of each item.
Use httpRequestWithAuthentication: For authenticated API calls, always use await this.helpers.httpRequestWithAuthentication.call(this, 'credentialName', options);. The 'credentialName' must match the name defined in the corresponding *.credentials.ts file. Use .call(this,...) to pass the correct execution context.
Use httpRequest: For unauthenticated calls, use await this.helpers.httpRequest(options);.
Construct Request options: Define the request details (method, url, body, qs, headers, etc.) within the options object passed to the helper functions.
Format Output Data: Use this.helpers.returnJsonArray(returnData) to format the results (an array of JS objects) into the structure n8n expects (INodeExecutionData) before returning.
Implement Error Handling: Wrap API calls and potentially failing logic in try...catch blocks. Use NodeApiError for API-related errors and NodeOperationError for internal node logic errors where appropriate. Log errors effectively.
IV. Credentials (<CredentialsName>.credentials.ts)

Implement ICredentialType: The credentials class must implement ICredentialType from n8n-workflow.
Define name and displayName: Set the internal name (used by the node) and the user-facing displayName.
Define properties: Define the UI fields for the user to input credential details (API Key, Client ID, etc.) using INodeProperties.
Configure Authentication:
Generic (authenticate): For API Keys, Basic Auth, Header Auth. Use authenticate: IAuthenticateGeneric = { type: 'generic', properties: {... } };. Specify header, qs, or auth within properties, using ={{ $credentials.fieldName }} expressions to reference values from the properties array.
OAuth2 (extends): For standard OAuth2 flows, use extends = ['oAuth2Api'];. Define necessary OAuth parameters (authUrl, accessTokenUrl, scope, etc.) as hidden properties with default values in the properties array. Client ID/Secret should be user-input fields. Note: Customizing OAuth2 beyond the standard (e.g., extra body params , custom headers , editable scopes ) might require using the Generic Credential type configured via the UI or face limitations.
Implement test Request: Define a test: ICredentialTestRequest = { request: {... } }; property. Provide a simple API endpoint (baseURL, url) that n8n can call using the provided credentials to verify their validity upon saving.
V. Metadata (*.node.json, package.json)

Codex File (*.node.json): Populate with node metadata: node (path to class), nodeVersion, codexVersion, categories, resources (documentation links).
package.json:
Ensure standard fields (name, version, description, author, repository, license) are correct.
Node name must start with n8n-nodes-.
Include "n8n-community-node-package" in keywords if intended for public sharing.
Crucially, define the "n8n" object, mapping the compiled .js file paths in the dist directory for both nodes and credentials.
VI. Code Quality & Best Practices

Simplicity & DRY: Prioritize the simplest solution. Avoid code duplication; refactor repeated logic into helper functions.
Comments: Add clear comments explaining complex logic, API interactions, or design decisions, especially within the execute method.
Linting: Use the provided n8n Node Linter (eslint-plugin-n8n-nodes-base) via pnpm lint to enforce standards and catch errors early.
API Design:
Balance abstraction (simplifying complex multi-step API calls into one node operation) with fidelity (exposing powerful API features like query languages directly via text inputs). Make deliberate design choices based on the target user.
Consider a "Simplify Output" option for complex API responses.
Pagination: If an API endpoint is paginated, include a returnAll boolean parameter (default false). If true, implement logic in execute to loop through API calls, adjusting pagination parameters (limit, offset, page, cursor) until all results are fetched and concatenated.
Security:
Never hardcode secrets (API keys, passwords). Always use the n8n credentials system.
Validate user input from node parameters before using it in API calls or logic.
VII. Prompting Strategy for Cursor

Be Specific: Use precise n8n terminology (e.g., "Use this.helpers.httpRequestWithAuthentication.call", "Get parameter using this.getNodeParameter with index i", "Format output with this.helpers.returnJsonArray").
Provide Context: Include snippets of relevant n8n interfaces (INodeType, IExecuteFunctions, ICredentialType), helper function signatures, or expected data structures (items, item.json). Reference the target API's documentation if necessary.
Decompose Tasks: Break down node creation into smaller, sequential steps (e.g., generate class structure, add properties, implement loop, add API call, add error handling, format return).
Specify Inputs/Outputs: Clearly define the expected input data structure and the desired output format for the execute method.
Iterate and Refine: Review generated code meticulously. Ask for explanations, refactoring, or corrections. Use prompts like "Refactor this to handle errors" or "Ensure this loop correctly uses the item index i when getting parameters."
