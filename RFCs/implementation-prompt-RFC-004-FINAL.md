# Implementation Prompt for RFC-004: Sistema de Contexto e Memória

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
This implementation covers RFC-004, which focuses on implementing the context and memory system that enables natural conversation flow, reference resolution, and user preference learning. This system builds on the NLP (RFC-002) and mapping (RFC-003) foundations to provide continuity and intelligence. Please refer to the following documents:

- @prd-improved.md for overall product requirements
- @features.md for detailed feature specifications  
- @RULES.md for project guidelines and standards
- @RFCs/RFC-004.md for the specific requirements being implemented
- @RFCs/RFC-001.md, @RFCs/RFC-002.md, and @RFCs/RFC-003.md for implemented foundations

## Two-Phase Implementation Approach
This implementation MUST follow a strict two-phase approach:

### Phase 1: Implementation Planning
1. Thoroughly analyze the requirements and existing codebase (including RFC-001, RFC-002, RFC-003)
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

## RFC-004 Specific Context

### Primary Objective
Implement a comprehensive context and memory system that enables natural conversation flow, maintains session state, resolves references ("isso", "mesmo produto"), learns user preferences, and provides intelligent conversation continuity. This system transforms the tool from stateless commands to intelligent conversations.

### Key Requirements
1. **Session Management**: Create, maintain, and clean up user sessions
2. **Reference Resolution**: Resolve pronouns and contextual references in Portuguese
3. **Conversation Continuity**: Handle follow-up commands like "mostre mais detalhes"
4. **User Preferences**: Learn and apply formatting, behavior, and content preferences
5. **Intelligent Caching**: Context-aware result caching with session scope
6. **State Persistence**: Maintain context across interactions within session lifetime

### Critical Success Factors
- **>90% Reference Resolution**: Accurate interpretation of contextual references
- **>70% Cache Hit Rate**: For context-aware caching system
- **Natural Conversation Flow**: Seamless follow-up command handling
- **Preference Learning**: Automatic adaptation to user patterns
- **Memory Efficiency**: Optimal context storage and cleanup
- **Session Isolation**: Complete isolation between different user sessions

## Implementation Guidelines

### Before Writing Code
1. **Analyze Current System**: Study implemented RFCs 001-003
   - How do parsed intentions flow from RFC-002?
   - How are operations executed through RFC-003?
   - Where should context be injected into this flow?
   - How will context influence both parsing and mapping?

2. **Design Context Architecture**:
   - What's the optimal session storage strategy?
   - How should reference resolution integrate with NLP?
   - What's the best approach for conversation state management?
   - How to implement efficient preference learning?

3. **Plan Memory Management**:
   - How to handle session lifecycle and cleanup?
   - What's the optimal strategy for context compression?
   - How to balance memory usage vs functionality?
   - What persistence strategy works best?

4. **Consider Integration Points**:
   - How does context enhance RFC-002 NLP processing?
   - How does context influence RFC-003 operation mapping?
   - How will context data be used by RFC-005 formatting?

### Implementation Standards
1. Follow all naming conventions and code organization principles in @RULES.md
2. **Memory-Efficient Design**: Context data must be optimized for storage and retrieval
3. Use proper TypeScript interfaces for all context data structures
4. Implement automatic cleanup of expired sessions
5. Design for thread-safety if multiple requests per session possible
6. Include comprehensive data sanitization for privacy
7. All context operations must be fast (<200ms additional overhead)

### Implementation Process
1. **Detailed Analysis Phase**:
   - Study Portuguese reference patterns and pronouns
   - Design session data structures and lifecycle management
   - Plan integration points with existing RFC implementations
   - Design preference learning algorithms and storage

2. **Implementation Plan** (must include):
   - Session management architecture and storage strategy
   - Reference resolution algorithm and integration with NLP
   - Conversation continuity handling mechanisms
   - User preference learning and application system
   - Context-aware caching implementation
   - Memory management and cleanup strategies
   - Privacy and data sanitization approach
   - Integration points with RFCs 002, 003, and 005

3. **IMPORTANT**: DO NOT proceed with any coding until receiving explicit user approval

### Problem Solving
When facing implementation challenges:

1. **Reference Resolution Complexity**:
   - Handle ambiguous references intelligently
   - Consider temporal context for reference validity
   - Design fallback strategies for unclear references

2. **Memory Management**:
   - Balance context richness vs memory efficiency
   - Consider strategies for context compression
   - Handle session cleanup without data loss

3. **Preference Learning**:
   - Design algorithms that learn without being intrusive
   - Balance explicit vs implicit preference detection
   - Consider privacy implications of preference storage

## Code Quality Assurance
As a senior developer, ensure your implementation meets these quality standards:

1. **Performance**: Context operations add <200ms to request processing
2. **Accuracy**: >90% success rate for reference resolution
3. **Privacy**: All sensitive data properly sanitized and secured
4. **Efficiency**: Context caching provides >70% hit rate improvement
5. **Reliability**: Robust session management with automatic cleanup
6. **Integration**: Seamless enhancement of existing RFC functionality

## Critical Implementation Points

### 1. Session Management Architecture
```typescript
// Design the session management interface:
interface SessionManager {
  createSession(userId: string): SessionContext;
  getSession(sessionId: string): SessionContext | null;
  updateSession(sessionId: string, updates: Partial<SessionContext>): void;
  cleanupExpiredSessions(): void;
}
```

### 2. Reference Resolution System
```typescript
// How to resolve Portuguese references:
// "isso" → last mentioned item
// "mesmo produto" → product from previous query
// "igual período" → same date range as before
// How to handle ambiguous references?
```

### 3. Conversation Continuity
```typescript
// How to handle follow-up commands:
// "Mostre mais detalhes" → expand last result
// "Compare com mês anterior" → use same filters with different period
// "Filtrar por X" → apply additional filter to last result
```

### 4. Preference Learning
```typescript
// How to learn and apply user preferences:
// Formatting preferences (currency, date format)
// Behavior preferences (verbosity, default periods)
// Content preferences (favorite products, common filters)
```

## Scope Limitation
**ONLY implement features specified in RFC-004:**
- Session management and lifecycle
- Reference resolution for Portuguese pronouns and context
- Conversation continuity for follow-up commands
- User preference learning and application
- Context-aware caching system
- Integration with RFCs 001-003

**DO NOT implement:**
- Natural language response formatting (RFC-005)
- System monitoring and analytics (RFC-006)
- Comprehensive testing framework (RFC-007)

## Success Criteria for RFC-004
1. ✅ **Reference Resolution**: >90% accuracy for common Portuguese references
2. ✅ **Session Management**: Robust creation, maintenance, and cleanup
3. ✅ **Conversation Flow**: Natural handling of follow-up commands
4. ✅ **Preference Learning**: Automatic detection and application of user patterns
5. ✅ **Context Caching**: >70% cache hit rate for context-aware requests
6. ✅ **Performance**: <200ms additional overhead for context operations
7. ✅ **Privacy**: Complete sanitization of sensitive context data
8. ✅ **Integration**: Enhanced functionality for RFCs 002 and 003

## Context Test Cases
### Reference Resolution (Must Work)
```
✅ "Vendas de dezembro" → "Mostre mais detalhes disso"
✅ "Produto X" → "Qual a receita desse produto?"
✅ "Assinaturas ativas" → "Cancele as que estão em atraso"
✅ "Vendas de janeiro" → "Compare com o mesmo período do ano passado"
```

### Conversation Continuity (Must Work)
```
✅ "Vendas do último mês" → "Mostre mais detalhes"
✅ "Produtos populares" → "Compare com mês anterior"
✅ "Assinaturas" → "Filtre apenas as ativas"
✅ "Relatório de vendas" → "Exporte em PDF"
```

### Preference Learning (Should Work)
```
✅ User always asks for detailed reports → auto-apply detailed verbosity
✅ User consistently uses specific date ranges → suggest as defaults
�✅ User frequently queries specific products → prioritize in results
```

### Session Management (Must Work)
```
✅ Session creation and unique ID generation
✅ Context preservation across multiple commands
✅ Automatic cleanup of expired sessions
✅ Memory usage optimization and compression
```

## Privacy and Security Considerations
### Data Sanitization (Must Implement)
```
✅ Email addresses masked in context storage
✅ Payment information never stored in context
✅ Personal identifiers properly anonymized
✅ Automatic cleanup of sensitive references
```

## Final Deliverables
1. **Session Management System** with lifecycle handling
2. **Reference Resolution Engine** for Portuguese contextual references
3. **Conversation Continuity Handler** for follow-up commands
4. **User Preference Learning System** with implicit and explicit detection
5. **Context-Aware Caching Layer** with session scope
6. **Privacy and Sanitization Module** for sensitive data handling
7. **Integration Layer** enhancing RFCs 002 and 003 with context
8. **Context Storage Solution** (file-based or memory-based)
9. **Performance Monitoring** for context operation timing
10. **Senior Developer Assessment**:
    - Session architecture and storage decisions
    - Reference resolution algorithm design
    - Preference learning strategy and privacy balance
    - Context caching optimization approach
    - Memory management and cleanup strategies
    - Integration enhancement rationale
    - Performance optimization techniques

## Implementation Sequence (Once Approved)
1. **Session Management Core** - Build session creation, storage, and cleanup
2. **Context Data Structures** - Design and implement context storage formats
3. **Reference Resolution** - Build Portuguese reference interpretation system
4. **Conversation Continuity** - Implement follow-up command handling
5. **Preference Learning** - Build implicit and explicit preference detection
6. **Context-Aware Caching** - Integrate context into caching decisions
7. **Privacy Module** - Implement data sanitization and security measures
8. **NLP Integration** - Enhance RFC-002 with context awareness
9. **Mapping Integration** - Enhance RFC-003 with contextual optimization
10. **Performance Optimization** - Ensure context operations meet speed requirements

Remember: This context system is the **INTELLIGENCE** that transforms isolated commands into natural conversations. The quality of context management directly determines how natural and intuitive the user experience feels.