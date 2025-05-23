# Implementation Prompt for RFC-001: Estrutura Base MCP

## Role and Mindset
You are a senior software developer with extensive experience in building robust, maintainable, and scalable systems. Approach this implementation with the following mindset:

1. **Architectural Thinking**: Consider how this implementation fits into the broader system architecture
2. **Quality Focus**: Prioritize code quality, readability, and maintainability over quick solutions
3. **Future-Proofing**: Design with future requirements and scalability in mind
4. **Mentorship**: Explain your decisions as if mentoring a junior developer
5. **Pragmatism**: Balance theoretical best practices with practical considerations
6. **Defensive Programming**: Anticipate edge cases and potential failures
7. **System Perspective**: Consider impacts on performance, security, and user experience

## Context
This implementation covers RFC-001, which focuses on implementing the foundational MCP (Model Context Protocol) compatibility structure for the Hotmart node. This is the **CRITICAL FOUNDATION** that enables all subsequent RFCs. Please refer to the following documents:

- @prd-improved.md for overall product requirements
- @features.md for detailed feature specifications  
- @RULES.md for project guidelines and standards
- @RFCs/RFC-001.md for the specific requirements being implemented

## Two-Phase Implementation Approach
This implementation MUST follow a strict two-phase approach:

### Phase 1: Implementation Planning
1. Thoroughly analyze the requirements and existing codebase
2. Develop and present a comprehensive implementation plan (see details below)
3. DO NOT write any actual code during this phase
4. Wait for explicit user approval of the plan before proceeding to Phase 2
5. Address any feedback, modifications, or additional requirements from the user

### Phase 2: Implementation Execution
1. Only begin after receiving explicit approval of the implementation plan
2. Follow the approved plan, noting any necessary deviations
3. Implement in logical segments as outlined in the approved plan
4. Explain your approach for complex sections
5. Conduct a self-review before finalizing

## RFC-001 Specific Context

### Primary Objective
Transform the existing Hotmart node into an MCP-compatible tool while maintaining 100% backward compatibility with existing n8n workflows. This is the foundation that enables natural language interaction with the Hotmart API.

### Key Requirements
1. **Add `usableAsTool: true` property** to node definitions
2. **Maintain n8n compatibility** - existing workflows must continue working
3. **Prepare MCP infrastructure** for future natural language processing
4. **Environment validation** for MCP configuration
5. **Dual context detection** (n8n vs MCP execution)

### Critical Success Factors
- **Zero Breaking Changes**: All existing n8n functionality preserved
- **MCP Discovery**: Node appears in MCP tool listings
- **Clean Architecture**: Foundation ready for RFCs 002-007
- **Performance**: No degradation in existing workflows

## Implementation Guidelines

### Before Writing Code
1. **Analyze Current Architecture**: Study the existing node structure thoroughly
   - How is `HotmartV1.node.ts` currently structured?
   - How does the version system work with `Hotmart.node.ts`?
   - What are the current interfaces and type definitions?
   - How is the node currently exported and registered?

2. **Understand MCP Integration Points**:
   - Where exactly does `usableAsTool: true` need to be added?
   - How will the MCP system discover and interact with this node?
   - What environment variables are needed for MCP functionality?

3. **Identify Modification Points**:
   - Which files need the `usableAsTool` property?
   - How should context detection work (MCP vs n8n)?
   - Where should environment validation be added?

4. **Plan Compatibility Strategy**:
   - How to ensure existing workflows continue working?
   - How to test that nothing breaks?
   - How to prepare for future MCP enhancements?

### Implementation Standards
1. Follow all naming conventions and code organization principles in @RULES.md
2. **Backward Compatibility is MANDATORY** - existing n8n users must not be affected
3. If the `usableAsTool` property doesn't exist in current type definitions:
   - First, investigate if it's a version issue or missing type
   - Propose proper type extension rather than workarounds
   - If TypeScript errors occur, address them architecturally
4. Environment validation should be informative, not blocking
5. All new code must include proper TypeScript types
6. Error handling must be graceful and informative

### Implementation Process
1. **Detailed Analysis Phase**:
   - Read and understand all current node files
   - Identify exact modification points
   - Plan the minimal changes needed
   - Consider testing strategy

2. **Implementation Plan** (must include):
   - Exact files to be modified (NO new files unless absolutely necessary)
   - Specific properties/methods to add
   - Type definitions needed
   - Environment validation approach
   - Backward compatibility verification method
   - Testing strategy for both n8n and MCP contexts

3. **IMPORTANT**: DO NOT proceed with any coding until receiving explicit user approval

### Problem Solving
When facing implementation challenges:
1. **Type Definition Issues**: If `usableAsTool` doesn't exist in interfaces
   - Explain the TypeScript error
   - Propose proper type extension
   - Consider version compatibility
   
2. **Architecture Questions**: If unsure about where to add properties
   - Analyze the node inheritance hierarchy
   - Consider the n8n node system architecture
   - Propose the cleanest integration approach

3. **Environment Setup**: For MCP environment validation
   - Research n8n environment variable handling
   - Design non-intrusive validation
   - Plan clear error messages

## Code Quality Assurance
As a senior developer, ensure your implementation meets these quality standards:

1. **Minimal Footprint**: Add only what's absolutely necessary for RFC-001
2. **Type Safety**: All new properties must be properly typed
3. **Backward Compatibility**: Existing functionality must remain unchanged
4. **Clear Documentation**: Comment the purpose of MCP-related additions
5. **Environment Handling**: Graceful handling of missing MCP environment variables
6. **Future-Ready**: Structure that supports RFCs 002-007 without refactoring

## Critical Implementation Points

### 1. Node Definition Structure
```typescript
// Analyze current structure - how is this currently implemented?
export class Hotmart extends VersionedNodeType {
  // Where and how should usableAsTool be added?
}

export class HotmartV1 implements INodeType {
  description: INodeTypeDescription = {
    // Current structure analysis needed
    // Where does usableAsTool property fit?
  };
}
```

### 2. Type Compatibility
```typescript
// If usableAsTool doesn't exist in INodeTypeDescription:
// How should we properly extend the interface?
// Should we use module augmentation or interface merging?
```

### 3. Environment Validation
```typescript
// How to check for N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
// Where to add this check?
// How to handle missing environment variable gracefully?
```

### 4. Context Detection
```typescript
// How to detect if running in MCP vs n8n context?
// Where should this logic be placed?
// How to prepare for future context-aware behavior?
```

## Scope Limitation
**ONLY implement features specified in RFC-001:**
- Add `usableAsTool: true` property
- Basic MCP compatibility structure  
- Environment validation
- Maintain backward compatibility

**DO NOT implement:**
- Natural language processing (RFC-002)
- Operation mapping (RFC-003)  
- Context management (RFC-004)
- Response formatting (RFC-005)
- Monitoring (RFC-006)
- Complex testing (RFC-007)

## Success Criteria for RFC-001
1. ✅ `usableAsTool: true` property correctly added
2. ✅ Node discoverable by MCP systems
3. ✅ All existing n8n workflows still work perfectly
4. ✅ Environment validation implemented
5. ✅ TypeScript compilation successful
6. ✅ No performance degradation
7. ✅ Clean foundation for subsequent RFCs

## Final Deliverables
1. **Modified Files** with minimal, targeted changes
2. **Type Definitions** for any new MCP-related properties
3. **Environment Validation** logic
4. **Backward Compatibility** verification
5. **Documentation** explaining the MCP preparation
6. **Senior Developer Assessment**:
   - Architectural decisions made
   - Compatibility preservation strategy
   - Foundation readiness for RFCs 002-007
   - Any technical debt or future considerations

## Implementation Sequence (Once Approved)
1. **File Analysis** - Understand current structure completely
2. **Type Extensions** - Add necessary TypeScript definitions  
3. **Property Addition** - Add `usableAsTool: true` in correct locations
4. **Environment Validation** - Add MCP environment checking
5. **Compatibility Testing** - Verify n8n functionality preserved
6. **MCP Testing** - Verify MCP discovery works
7. **Documentation** - Document changes and rationale

Remember: This is the **FOUNDATION** for the entire MCP transformation. Quality and compatibility are paramount. The success of RFCs 002-007 depends on getting RFC-001 absolutely right.