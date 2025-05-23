# Implementation Prompt for RFC-002: Sistema de Processamento de Linguagem Natural

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
This implementation covers RFC-002, which focuses on implementing the Natural Language Processing system that allows Brazilian users to interact with the Hotmart API using Portuguese commands. This builds directly on the MCP foundation established in RFC-001. Please refer to the following documents:

- @prd-improved.md for overall product requirements
- @features.md for detailed feature specifications  
- @RULES.md for project guidelines and standards
- @RFCs/RFC-002.md for the specific requirements being implemented
- @RFCs/RFC-001.md for the implemented foundation

## Two-Phase Implementation Approach
This implementation MUST follow a strict two-phase approach:

### Phase 1: Implementation Planning
1. Thoroughly analyze the requirements and existing codebase (including RFC-001 implementation)
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

## RFC-002 Specific Context

### Primary Objective
Implement a robust Natural Language Processing system that interprets Portuguese commands and converts them into structured intentions that can be mapped to Hotmart API operations. This system must handle the complexity and variations of natural language while maintaining high accuracy.

### Key Requirements
1. **Portuguese Command Parsing**: Interpret natural commands like "mostre as vendas do último mês"
2. **Parameter Extraction**: Extract temporal periods, monetary values, product references
3. **Intention Classification**: Determine resource (vendas, assinaturas) and action (consultar, cancelar)
4. **Confidence Scoring**: Provide confidence levels for interpretation accuracy
5. **Ambiguity Resolution**: Handle unclear commands with clarification prompts
6. **Context Integration**: Prepare for integration with RFC-004 context system

### Critical Success Factors
- **>85% Recognition Rate**: For common Portuguese business commands
- **<100ms Processing Time**: Per command interpretation
- **Cultural Accuracy**: Proper understanding of Brazilian Portuguese nuances
- **Extensibility**: Easy addition of new command patterns
- **Error Handling**: Graceful handling of unrecognized inputs

## Implementation Guidelines

### Before Writing Code
1. **Analyze Current Architecture**: Study how RFC-001 MCP foundation is implemented
   - How does the current node structure support MCP?
   - Where should NLP processing be integrated?
   - How will parsed intentions flow to operation mapping?

2. **Design NLP Architecture**:
   - What's the optimal pattern matching strategy for Portuguese?
   - How to handle temporal expressions in Portuguese?
   - How to extract monetary values with Brazilian formatting?
   - What's the best approach for confidence scoring?

3. **Plan Integration Points**:
   - How will NLP connect to the MCP system?
   - Where should the NLP processor be invoked in the execution flow?
   - How to structure the parsed intention data for RFC-003?

4. **Consider Performance**:
   - How to make pattern matching efficient?
   - Should regex patterns be compiled once and cached?
   - How to handle the performance requirement of <100ms?

### Implementation Standards
1. Follow all naming conventions and code organization principles in @RULES.md
2. **Portuguese-First Design**: All language processing optimized for Brazilian Portuguese
3. Use compiled regex patterns for performance
4. Implement proper input normalization (accents, case, spacing)
5. Design for extensibility - new command patterns should be easy to add
6. Include comprehensive error handling for malformed inputs
7. All functions must include proper TypeScript types and JSDoc comments

### Implementation Process
1. **Detailed Analysis Phase**:
   - Study the current codebase post-RFC-001
   - Research Portuguese NLP patterns and common temporal expressions
   - Analyze Brazilian monetary formatting requirements
   - Design the intention classification system

2. **Implementation Plan** (must include):
   - Directory structure for NLP components
   - Core classes and their responsibilities
   - Pattern matching strategies and regex compilation
   - Parameter extraction algorithms
   - Integration points with existing MCP system
   - Testing strategy for Portuguese commands
   - Performance optimization approach

3. **IMPORTANT**: DO NOT proceed with any coding until receiving explicit user approval

### Problem Solving
When facing implementation challenges:

1. **Portuguese Language Complexity**: 
   - Consider regional variations in Brazilian Portuguese
   - Handle casual vs formal language patterns
   - Account for business terminology variations

2. **Pattern Matching Performance**:
   - Evaluate regex vs other pattern matching approaches
   - Consider optimization strategies for multiple pattern checks
   - Balance accuracy vs performance requirements

3. **Ambiguity Resolution**:
   - Design clear disambiguation strategies
   - Create helpful clarification prompts in Portuguese
   - Handle partial matches intelligently

## Code Quality Assurance
As a senior developer, ensure your implementation meets these quality standards:

1. **Performance**: All command processing must complete within 100ms
2. **Accuracy**: Achieve >85% recognition rate for common commands  
3. **Maintainability**: Clear separation of concerns between parsing, extraction, and classification
4. **Extensibility**: New command patterns should be addable without core changes
5. **Cultural Accuracy**: Proper handling of Brazilian Portuguese nuances
6. **Error Resilience**: Graceful degradation for unrecognized or malformed inputs

## Critical Implementation Points

### 1. NLP Processor Architecture
```typescript
// Design the main processor interface:
interface NaturalLanguageProcessor {
  parseCommand(input: string): ParsedIntention;
  parseCommandWithContext(input: string, context: any): ParsedIntention;
  // How should confidence scoring work?
  // How should ambiguity detection be implemented?
}
```

### 2. Portuguese Pattern Matching
```typescript
// How to handle Portuguese temporal expressions:
// "último mês", "janeiro de 2024", "semana passada"
// How to normalize accents and variations?
// What's the optimal regex compilation strategy?
```

### 3. Parameter Extraction
```typescript
// Brazilian monetary format extraction:
// "R$ 1.500,00", "mil reais", "acima de 500"
// Date range extraction in Portuguese context
// Product reference extraction from natural language
```

### 4. Integration with MCP
```typescript
// How does this integrate with the MCP foundation from RFC-001?
// Where in the execution flow does NLP processing occur?
// How are parsed intentions passed to the next stage?
```

## Scope Limitation
**ONLY implement features specified in RFC-002:**
- Natural language command parsing in Portuguese
- Parameter extraction (temporal, monetary, product references)
- Intention classification and confidence scoring
- Basic ambiguity resolution
- Integration with RFC-001 MCP foundation

**DO NOT implement:**
- Operation mapping (RFC-003)
- Context management and conversation continuity (RFC-004)
- Response formatting (RFC-005)
- Monitoring and analytics (RFC-006)
- Comprehensive testing framework (RFC-007)

## Success Criteria for RFC-002
1. ✅ **Command Recognition**: >85% accuracy for common Portuguese business commands
2. ✅ **Processing Speed**: <100ms per command interpretation
3. ✅ **Parameter Extraction**: Accurate extraction of dates, values, and references
4. ✅ **Confidence Scoring**: Reliable confidence assessment for interpretations
5. ✅ **Ambiguity Handling**: Clear disambiguation prompts in Portuguese
6. ✅ **MCP Integration**: Seamless integration with RFC-001 foundation
7. ✅ **Extensibility**: Easy addition of new command patterns

## Test Cases for Validation
### Basic Commands (Must Work)
```
✅ "Mostre as vendas do último mês"
✅ "Assinaturas ativas"
✅ "Cancelar assinatura 123"
✅ "Produtos mais vendidos"
✅ "Vendas acima de R$ 1.500,00"
✅ "Cupons criados em janeiro"
```

### Complex Commands (Should Work)
```
✅ "Vendas do curso de marketing em dezembro"
✅ "Assinaturas canceladas na semana passada"
✅ "Reativar assinatura do cliente joão@email.com"
```

### Edge Cases (Must Handle Gracefully)
```
✅ "Mostre os dados" (ambiguous → ask for clarification)
✅ "Cancelar tudo" (destructive → confirm intent)
✅ Commands with typos or informal language
```

## Final Deliverables
1. **NLP Processing System** with all core components
2. **Pattern Libraries** for Portuguese command recognition
3. **Parameter Extractors** for temporal, monetary, and reference data
4. **Integration Points** with RFC-001 MCP system
5. **Test Suite** covering Portuguese command variations
6. **Performance Benchmarks** showing <100ms processing times
7. **Documentation** explaining the NLP architecture and patterns
8. **Senior Developer Assessment**:
   - Pattern matching strategy decisions
   - Performance optimization choices
   - Portuguese language handling approach
   - Integration architecture with MCP system
   - Scalability considerations for new command types

## Implementation Sequence (Once Approved)
1. **Architecture Design** - Design NLP component structure
2. **Pattern Library** - Create Portuguese command patterns
3. **Core Processor** - Implement main NLP processing engine
4. **Parameter Extractors** - Build temporal, monetary, reference extractors
5. **Integration Layer** - Connect with RFC-001 MCP foundation
6. **Confidence System** - Implement confidence scoring and ambiguity detection
7. **Performance Optimization** - Ensure <100ms processing requirement
8. **Testing & Validation** - Comprehensive testing with Portuguese commands

Remember: This NLP system is the **BRAIN** that interprets user intentions. The quality of this implementation directly impacts user experience and the success of the entire MCP system.