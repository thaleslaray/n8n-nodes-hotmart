# Implementation Prompt for RFC-005: Interface de Linguagem Natural

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
This implementation covers RFC-005, which focuses on implementing the natural language interface that transforms technical API responses into fluent, culturally appropriate Portuguese responses with insights, actions, and business context. This is the final user-facing component that makes the system truly conversational. Please refer to the following documents:

- @prd-improved.md for overall product requirements
- @features.md for detailed feature specifications  
- @RULES.md for project guidelines and standards
- @RFCs/RFC-005.md for the specific requirements being implemented
- All previous RFCs (001-004) for the complete foundation

## Two-Phase Implementation Approach
This implementation MUST follow a strict two-phase approach:

### Phase 1: Implementation Planning
1. Thoroughly analyze the requirements and existing codebase (including all RFCs 001-004)
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

## RFC-005 Specific Context

### Primary Objective
Transform raw API data and technical results into natural, conversational Portuguese responses that include business insights, actionable recommendations, and culturally appropriate formatting. This system must adapt tone based on user profile, generate automatic insights, and provide clear next steps.

### Key Requirements
1. **Natural Language Generation**: Convert API data to fluent Portuguese responses
2. **Cultural Formatting**: Brazilian currency, dates, and number formatting
3. **Automatic Insights**: Generate business insights from data patterns
4. **Actionable Suggestions**: Provide prioritized next steps with executable commands
5. **Tone Adaptation**: Adjust language complexity based on user experience level
6. **Contextual Responses**: Use session context to personalize communication style

### Critical Success Factors
- **>95% Comprehensibility**: Responses easily understood by Brazilian business users
- **>80% Insight Relevance**: Generated insights considered useful by users
- **>90% Cultural Accuracy**: Proper Brazilian Portuguese formatting and expressions
- **<300ms Formatting Time**: Fast response generation without blocking
- **Adaptive Tone**: Appropriate language level for user expertise
- **Actionable Content**: Clear next steps that users can actually execute

## Implementation Guidelines

### Before Writing Code
1. **Analyze Current System**: Study complete pipeline from RFCs 001-004
   - How does data flow from RFC-003 mapping results?
   - What context is available from RFC-004 for personalization?
   - How should tone adaptation work with different user profiles?
   - What's the optimal template system for Brazilian Portuguese?

2. **Design Response Architecture**:
   - What's the best strategy for natural language generation in Portuguese?
   - How to implement automatic insight generation algorithms?
   - How should cultural formatting be handled comprehensively?
   - What's the optimal approach for tone adaptation?

3. **Plan Insight Generation**:
   - Which data patterns should trigger automatic insights?
   - How to generate actionable business recommendations?
   - What algorithms work best for trend detection and analysis?
   - How to prioritize suggestions by business impact?

4. **Consider Performance and Extensibility**:
   - How to make response generation fast and cacheable?
   - How to design templates for easy maintenance and expansion?
   - How to handle different business contexts (courses, ebooks, etc.)?

### Implementation Standards
1. Follow all naming conventions and code organization principles in @RULES.md
2. **Brazilian Portuguese First**: All text generation optimized for Brazilian culture
3. Use template-based approach for maintainability and consistency
4. Implement proper locale handling for all formatting operations
5. Design insight algorithms to be data-driven and extensible
6. Include comprehensive tone adaptation based on user profiles
7. All formatting operations must be fast (<300ms) and non-blocking

### Implementation Process
1. **Detailed Analysis Phase**:
   - Study Brazilian Portuguese business communication patterns
   - Research effective insight generation techniques for business data
   - Analyze cultural formatting requirements (currency, dates, numbers)
   - Design tone adaptation strategies for different user expertise levels

2. **Implementation Plan** (must include):
   - Response formatting architecture and template system
   - Brazilian cultural formatting implementation strategy
   - Automatic insight generation algorithms and pattern detection
   - Action suggestion engine with priority scoring
   - Tone adaptation system based on user profiles
   - Integration strategy with context from RFC-004
   - Performance optimization approach for response generation
   - Template management and extensibility design

3. **IMPORTANT**: DO NOT proceed with any coding until receiving explicit user approval

### Problem Solving
When facing implementation challenges:

1. **Natural Language Quality**:
   - Research Brazilian Portuguese business communication standards
   - Consider regional variations and business terminology
   - Balance formality with approachability

2. **Insight Generation Accuracy**:
   - Design algorithms that avoid obvious or irrelevant insights
   - Consider statistical significance in trend detection
   - Balance insight quantity with quality

3. **Performance vs Quality Trade-offs**:
   - Optimize template processing without sacrificing flexibility
   - Consider caching strategies for frequently generated content
   - Balance comprehensive insights with response speed

## Code Quality Assurance
As a senior developer, ensure your implementation meets these quality standards:

1. **Linguistic Quality**: Natural, fluent Portuguese appropriate for business users
2. **Cultural Accuracy**: Perfect Brazilian formatting (R$ 1.500,00, 15/01/2024)
3. **Insight Relevance**: Generated insights provide genuine business value
4. **Performance**: Response generation completes within 300ms
5. **Adaptability**: Tone and complexity adapt correctly to user profiles
6. **Actionability**: Suggested actions are clear, specific, and executable

## Critical Implementation Points

### 1. Response Formatting Architecture
```typescript
// Design the main formatter interface:
interface ResponseFormatter {
  formatResponse(data: any[], context: FormattingContext, preferences: UserPreferences): FormattedResponse;
  adaptTone(content: string, userProfile: UserProfile): string;
  generateInsights(data: any[], context: BusinessContext): Insight[];
}
```

### 2. Brazilian Cultural Formatting
```typescript
// How to implement comprehensive Brazilian formatting:
// Currency: R$ 1.500,00 (not $1500.00)
// Dates: 15/01/2024 (not 2024-01-15)
// Numbers: 1.500,75 (comma for decimal)
// Percentages: 15,5% (not 15.5%)
```

### 3. Insight Generation Engine
```typescript
// How to generate business insights automatically:
// Pattern detection (80/20 rule, seasonality, trends)
// Statistical analysis (growth rates, comparisons)
// Anomaly detection (unusual patterns, outliers)
// Business rule application (industry benchmarks)
```

### 4. Template System
```typescript
// How to design maintainable templates:
// Modular templates for different contexts
// Variable substitution with proper formatting
// Conditional content based on data characteristics
// Extensible template inheritance
```

## Scope Limitation
**ONLY implement features specified in RFC-005:**
- Natural language response generation in Portuguese
- Brazilian cultural formatting for all data types
- Automatic business insight generation
- Actionable suggestion system with prioritization
- Tone adaptation based on user profiles
- Integration with context from RFC-004

**DO NOT implement:**
- System monitoring and analytics collection (RFC-006)
- Comprehensive testing framework (RFC-007)

## Success Criteria for RFC-005
1. ✅ **Natural Portuguese**: >95% of responses sound natural to Brazilian users
2. ✅ **Cultural Formatting**: 100% correct Brazilian formatting (currency, dates, numbers)
3. ✅ **Insight Quality**: >80% of generated insights rated as useful
4. ✅ **Tone Adaptation**: Appropriate language level for user expertise (beginner/advanced)
5. ✅ **Actionable Content**: Clear, executable next steps in >90% of responses
6. ✅ **Performance**: Response formatting completed within 300ms
7. ✅ **Context Integration**: Personalized responses using session context
8. ✅ **Template Extensibility**: Easy addition of new response templates

## Response Quality Test Cases
### Sales Reports (Must Format Well)
```
✅ Positive results: "Excelente! Você teve 127 vendas totalizando R$ 45.890,00 em dezembro."
✅ Concerning results: "Atenção: apenas 23 vendas (R$ 3.450,00) em dezembro. Vamos analisar."
✅ Trend insights: "Suas vendas cresceram 34% comparado ao mês anterior."
```

### Subscription Analysis (Must Generate Insights)
```
✅ Health status: "Suas assinaturas estão saudáveis: 156 ativas gerando R$ 8.900,00/mês."
✅ Problems identified: "Atenção: 12 assinaturas precisam de cuidado (churn: 8,5%)."
✅ Actionable steps: "1. Contatar em atraso → 'enviar lembretes personalizados'"
```

### Tone Adaptation (Must Adapt Correctly)
```
✅ Beginner user: Simple language, explained terminology
✅ Advanced user: Technical metrics, detailed analysis
✅ Urgent situation: Appropriate urgency indicators
```

### Cultural Formatting (Must Be Perfect)
```
✅ Currency: R$ 1.500,00 (never $1500.00)
✅ Dates: 15/01/2024 (never 2024-01-15)
✅ Percentages: 15,5% (never 15.5%)
✅ Large numbers: 1.500.000 (never 1,500,000)
```

## Business Context Templates
### Different Business Types (Must Adapt)
```
✅ Online courses: "alunos", "matrículas", "módulos"
✅ Ebooks: "leitores", "downloads", "vendas"
✅ Subscriptions: "assinantes", "mensalidades", "retenção"
✅ Consulting: "clientes", "consultorias", "contratos"
```

## Final Deliverables
1. **Response Formatting System** with natural Portuguese generation
2. **Brazilian Cultural Formatter** for all data types (currency, dates, numbers)
3. **Automatic Insight Generator** with pattern detection and business analysis
4. **Action Suggestion Engine** with priority scoring and executable commands
5. **Tone Adaptation System** based on user profiles and expertise levels
6. **Template Management System** with extensible, maintainable templates
7. **Business Context Handler** for different types of products/services
8. **Performance-Optimized Pipeline** meeting 300ms requirement
9. **Integration Layer** using context from RFC-004 for personalization
10. **Senior Developer Assessment**:
    - Natural language generation strategy decisions
    - Cultural formatting implementation approach
    - Insight generation algorithm design and effectiveness
    - Template system architecture and extensibility
    - Tone adaptation mechanisms and user profiling
    - Performance optimization techniques
    - Integration quality with previous RFCs

## Implementation Sequence (Once Approved)
1. **Core Formatter** - Build main response formatting engine
2. **Cultural Formatting** - Implement comprehensive Brazilian formatting
3. **Template System** - Create extensible template management
4. **Insight Engine** - Build automatic business insight generation
5. **Action Suggestions** - Implement actionable recommendation system
6. **Tone Adaptation** - Build user profile-based tone adjustment
7. **Business Context** - Add business type-specific adaptations
8. **Context Integration** - Integrate with RFC-004 session context
9. **Performance Optimization** - Ensure 300ms response time requirement
10. **Template Population** - Create comprehensive templates for all scenarios

Remember: This formatting system is the **USER EXPERIENCE** that determines whether users love or abandon the tool. The quality of natural language responses directly impacts user satisfaction, adoption, and business success.