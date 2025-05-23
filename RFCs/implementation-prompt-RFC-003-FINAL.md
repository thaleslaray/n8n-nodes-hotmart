# Implementation Prompt for RFC-003: Mapeamento Inteligente de Operações

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
This implementation covers RFC-003, which focuses on implementing the intelligent operation mapping system that transforms parsed intentions from RFC-002 into optimized Hotmart API operations. This includes automatic batching, permission validation, and data aggregation. Please refer to the following documents:

- @prd-improved.md for overall product requirements
- @features.md for detailed feature specifications  
- @RULES.md for project guidelines and standards
- @RFCs/RFC-003.md for the specific requirements being implemented
- @RFCs/RFC-001.md and @RFCs/RFC-002.md for implemented foundations

## Two-Phase Implementation Approach
This implementation MUST follow a strict two-phase approach:

### Phase 1: Implementation Planning
1. Thoroughly analyze the requirements and existing codebase (including RFC-001 and RFC-002)
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

## RFC-003 Specific Context

### Primary Objective
Transform the parsed intentions from RFC-002 into optimized, executable Hotmart API operations. This system must intelligently decide between single operations, batch operations, and complex multi-step processes while validating permissions and aggregating results when needed.

### Key Requirements
1. **Intelligent Mapping**: Map parsed intentions to optimal Hotmart operations
2. **Automatic Optimization**: Batch similar operations, parallelize independent ones
3. **Permission Validation**: Check OAuth2 permissions before execution
4. **Data Aggregation**: Combine multiple API calls for complex analysis requests
5. **Cache Intelligence**: Implement smart caching with operation-specific TTL
6. **Fallback Strategies**: Provide alternatives when preferred operations aren't available

### Critical Success Factors
- **>30% Performance Improvement**: Through optimization for complex operations
- **100% Permission Compliance**: No unauthorized operations executed
- **>60% Cache Hit Rate**: For repeated or similar operations
- **Graceful Degradation**: When operations fail or permissions insufficient
- **Extensibility**: Easy addition of new mapping rules and optimizations

## Implementation Guidelines

### Before Writing Code
1. **Analyze Current System**: Study RFC-001 MCP foundation and RFC-002 NLP implementation
   - How are parsed intentions structured from RFC-002?
   - What's the current Hotmart API integration architecture?
   - How should optimized operations be executed?

2. **Design Mapping Architecture**:
   - What's the best strategy for intention-to-operation mapping?
   - How to implement automatic batching detection?
   - How should permission validation be integrated?
   - What's the optimal caching strategy per operation type?

3. **Plan Optimization Strategies**:
   - Which operations benefit most from batching?
   - How to detect parallelizable operations?
   - What aggregation patterns are most valuable?
   - How to implement intelligent fallbacks?

4. **Consider Integration**:
   - How does this connect to RFC-002 intentions?
   - How will results be passed to RFC-005 formatting?
   - What performance metrics should be collected for RFC-006?

### Implementation Standards
1. Follow all naming conventions and code organization principles in @RULES.md
2. **Performance-First Design**: All optimizations must provide measurable benefits
3. Use strategy pattern for different mapping approaches
4. Implement proper async/await patterns for parallel operations
5. Design for extensibility - new mapping rules should be declarative
6. Include comprehensive error handling and permission validation
7. All optimizations must be testable and measurable

### Implementation Process
1. **Detailed Analysis Phase**:
   - Study current Hotmart API operations and their characteristics
   - Analyze which operations can be batched or parallelized
   - Research permission requirements for each operation type
   - Design the caching strategy architecture

2. **Implementation Plan** (must include):
   - Mapping engine architecture and rule definition format
   - Optimization algorithms for batching and parallelization
   - Permission validation integration strategy
   - Caching implementation with TTL management
   - Performance measurement and monitoring hooks
   - Error handling and fallback mechanisms
   - Integration points with RFC-002 and future RFCs

3. **IMPORTANT**: DO NOT proceed with any coding until receiving explicit user approval

### Problem Solving
When facing implementation challenges:

1. **Complex Mapping Scenarios**:
   - Design flexible rule systems for different command types
   - Consider edge cases where multiple mapping strategies apply
   - Handle ambiguous intentions that could map to multiple operations

2. **Optimization Trade-offs**:
   - Balance between optimization complexity and benefit
   - Consider memory usage vs performance gains
   - Evaluate caching strategies vs API rate limits

3. **Permission Complexity**:
   - Handle different permission levels gracefully
   - Design clear fallback strategies for insufficient permissions
   - Consider OAuth token refresh scenarios

## Code Quality Assurance
As a senior developer, ensure your implementation meets these quality standards:

1. **Performance**: Demonstrable improvement (>30%) for complex operations
2. **Reliability**: Robust error handling and fallback mechanisms
3. **Maintainability**: Clear separation between mapping rules and execution logic
4. **Extensibility**: New operations and optimizations easily added
5. **Security**: Strict permission validation before any API calls
6. **Observability**: Comprehensive logging and metrics for optimization analysis

## Critical Implementation Points

### 1. Operation Mapping Engine
```typescript
// Design the core mapping interface:
interface OperationMapper {
  mapToOperation(intention: ParsedIntention, context: ExecutionContext): MappedOperation[];
  optimizeExecution(operations: MappedOperation[]): OptimizedExecutionPlan;
  validatePermissions(operations: MappedOperation[], credentials: OAuth2Credentials): ValidationResult;
}
```

### 2. Optimization Strategies
```typescript
// How to implement intelligent batching:
// When should multiple subscription queries become a single getAll?
// How to detect parallelizable operations?
// What's the algorithm for dependency resolution?
```

### 3. Caching Architecture
```typescript
// How to implement operation-specific caching:
// What are the optimal TTL values for different data types?
// How should cache invalidation work after write operations?
// How to handle cache memory management?
```

### 4. Permission Integration
```typescript
// How to integrate with Hotmart OAuth2:
// How to validate permissions before execution?
// How to handle token refresh scenarios?
// What fallback strategies for insufficient permissions?
```

## Scope Limitation
**ONLY implement features specified in RFC-003:**
- Intention-to-operation mapping system
- Automatic optimization (batching, parallelization)
- Permission validation and fallback strategies
- Intelligent caching with operation-specific TTL
- Data aggregation for complex requests
- Integration with RFC-001 and RFC-002

**DO NOT implement:**
- Context management and session state (RFC-004)
- Response formatting and natural language output (RFC-005)
- Monitoring and analytics collection (RFC-006)
- Comprehensive testing framework (RFC-007)

## Success Criteria for RFC-003
1. ✅ **Mapping Accuracy**: 100% correct mapping for all supported intentions
2. ✅ **Performance Optimization**: >30% improvement for complex operations
3. ✅ **Permission Compliance**: 100% validation before execution
4. ✅ **Cache Efficiency**: >60% hit rate for repeated operations
5. ✅ **Batch Optimization**: Automatic detection and batching of similar operations
6. ✅ **Error Resilience**: Graceful handling of API failures and permission issues
7. ✅ **Integration Quality**: Seamless flow from RFC-002 to RFC-005

## Optimization Test Cases
### Batching Scenarios (Must Optimize)
```
✅ Multiple subscription status queries → single getAll with filtering
✅ Multiple subscription cancellations → cancelList operation
✅ Similar product queries in short timeframe → cached results
```

### Parallelization Scenarios (Must Parallelize)
```
✅ Sales data + product data (independent) → parallel execution
✅ Multiple independent subscription operations → concurrent processing
```

### Aggregation Scenarios (Must Aggregate)
```
✅ "Best product analysis" → sales + performance + metrics aggregation
✅ "Complete sales report" → multiple API calls combined intelligently
```

### Permission Scenarios (Must Handle)
```
✅ Write operation without permission → suggest read alternatives
✅ Bulk operation without permission → suggest individual operations
✅ Invalid credentials → clear error with resolution steps
```

## Final Deliverables
1. **Operation Mapping Engine** with rule-based architecture
2. **Optimization Algorithms** for batching and parallelization
3. **Permission Validation System** with OAuth2 integration
4. **Intelligent Caching Layer** with operation-specific TTL
5. **Data Aggregation Framework** for complex analysis requests
6. **Performance Monitoring** hooks for optimization metrics
7. **Comprehensive Error Handling** with fallback strategies
8. **Integration Tests** with RFC-002 intention processing
9. **Performance Benchmarks** showing optimization gains
10. **Senior Developer Assessment**:
    - Mapping strategy architectural decisions
    - Optimization algorithm choices and trade-offs
    - Caching strategy and TTL determination rationale
    - Permission validation architecture
    - Performance improvement analysis
    - Scalability considerations for new operation types

## Implementation Sequence (Once Approved)
1. **Mapping Engine Core** - Build the intention-to-operation mapping system
2. **Rule Definition System** - Create declarative mapping rules for Hotmart operations
3. **Optimization Engine** - Implement batching and parallelization algorithms
4. **Permission Validator** - Build OAuth2 permission checking system
5. **Caching Layer** - Implement intelligent caching with TTL management
6. **Aggregation Framework** - Build system for complex multi-operation requests
7. **Performance Monitoring** - Add hooks for optimization metrics collection
8. **Integration Testing** - Validate complete RFC-002 → RFC-003 flow
9. **Optimization Tuning** - Fine-tune algorithms based on performance data

Remember: This mapping system is the **OPTIMIZATION ENGINE** that makes the difference between a functional tool and a performant, intelligent assistant. The quality of optimizations directly impacts user satisfaction and system scalability.