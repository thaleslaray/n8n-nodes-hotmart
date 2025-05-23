# Implementation Prompt for RFC-006: Sistema de Monitoramento e Analytics

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
This implementation covers RFC-006, which focuses on implementing a comprehensive monitoring and analytics system that tracks usage patterns, performance metrics, system health, and user satisfaction. This system provides the observability needed to ensure quality, detect issues proactively, and optimize the MCP Hotmart tool continuously. Please refer to the following documents:

- @prd-improved.md for overall product requirements
- @features.md for detailed feature specifications  
- @RULES.md for project guidelines and standards
- @RFCs/RFC-006.md for the specific requirements being implemented
- All previous RFCs (001-005) for the complete system to monitor

## Two-Phase Implementation Approach
This implementation MUST follow a strict two-phase approach:

### Phase 1: Implementation Planning
1. Thoroughly analyze the requirements and existing codebase (including all RFCs 001-005)
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

## RFC-006 Specific Context

### Primary Objective
Implement a comprehensive monitoring and analytics system that provides complete observability into the MCP Hotmart tool's performance, usage patterns, system health, and user experience. This system must collect meaningful metrics without impacting performance, detect issues proactively, and provide actionable insights for continuous improvement.

### Key Requirements
1. **Performance Monitoring**: Track response times, throughput, and system resource usage
2. **Usage Analytics**: Monitor command patterns, user journeys, and feature adoption
3. **Quality Metrics**: Measure NLP accuracy, operation success rates, and user satisfaction
4. **Health Monitoring**: Monitor API availability, system status, and error rates
5. **Intelligent Alerting**: Proactive alerts for performance degradation and system issues
6. **Privacy Compliance**: Collect analytics while protecting user privacy and sensitive data

### Critical Success Factors
- **<5ms Monitoring Overhead**: Analytics collection must not impact user experience
- **>99.5% System Uptime**: Reliable monitoring without system disruption
- **>95% Alert Accuracy**: Minimize false positives while catching real issues
- **Privacy Compliant**: Zero exposure of sensitive user or business data
- **Actionable Insights**: Metrics that drive meaningful optimization decisions
- **Real-time Visibility**: Critical metrics available with minimal delay

## Implementation Guidelines

### Before Writing Code
1. **Analyze Current System**: Study complete MCP pipeline from RFCs 001-005
   - What are the critical performance bottlenecks to monitor?
   - Where should monitoring hooks be placed for minimal impact?
   - What user behavior patterns would be most valuable to track?
   - How can system health be measured comprehensively?

2. **Design Monitoring Architecture**:
   - What's the optimal strategy for non-intrusive data collection?
   - How to implement real-time alerting without overwhelming users?
   - What metrics aggregation approach provides best insights?
   - How to handle monitoring data storage and retention?

3. **Plan Analytics Strategy**:
   - Which user behavior patterns indicate success or problems?
   - What NLP quality metrics are most meaningful?
   - How to measure business impact of optimizations?
   - What dashboard design serves different stakeholder needs?

4. **Consider Privacy and Performance**:
   - How to collect useful data while protecting privacy?
   - What sampling strategies balance insight quality with performance?
   - How to make monitoring infrastructure resilient and self-healing?

### Implementation Standards
1. Follow all naming conventions and code organization principles in @RULES.md
2. **Performance First**: Monitoring must add <5ms overhead to any operation
3. **Privacy by Design**: All sensitive data must be masked or aggregated
4. Use asynchronous collection patterns to avoid blocking main operations
5. Implement proper error handling - monitoring failures must not break functionality
6. Design for scalability - system should handle increased usage gracefully
7. All metrics must be actionable and tied to specific optimization opportunities

### Implementation Process
1. **Detailed Analysis Phase**:
   - Study current system architecture and identify monitoring insertion points
   - Research effective monitoring patterns for similar systems
   - Design privacy-compliant data collection strategies
   - Plan alerting thresholds and escalation procedures

2. **Implementation Plan** (must include):
   - Monitoring architecture with data collection and storage strategy
   - Performance monitoring implementation with minimal overhead approach
   - Usage analytics system with privacy protection mechanisms
   - Quality metrics collection for NLP, operations, and user satisfaction
   - Health monitoring for APIs, system components, and overall status
   - Intelligent alerting system with configurable rules and thresholds
   - Dashboard and reporting system for different stakeholder needs
   - Data retention, cleanup, and privacy compliance procedures

3. **IMPORTANT**: DO NOT proceed with any coding until receiving explicit user approval

### Problem Solving
When facing implementation challenges:

1. **Performance vs Insight Trade-offs**:
   - Design sampling strategies that maintain statistical significance
   - Consider batching and buffering for high-frequency events
   - Evaluate async vs sync data collection approaches

2. **Privacy vs Utility Balance**:
   - Implement data aggregation that preserves insights while protecting privacy
   - Design anonymization techniques that maintain analytical value
   - Consider opt-out mechanisms for privacy-sensitive users

3. **Alert Accuracy vs Coverage**:
   - Tune thresholds based on historical data and business impact
   - Implement alert suppression for known maintenance windows
   - Design escalation policies that balance urgency with practicality

## Code Quality Assurance
As a senior developer, ensure your implementation meets these quality standards:

1. **Performance**: Monitoring overhead must be imperceptible (<5ms)
2. **Reliability**: Monitoring system more reliable than the system being monitored
3. **Privacy**: Complete protection of sensitive user and business data
4. **Actionability**: Every metric should drive specific optimization decisions
5. **Scalability**: System handles growth in users and data volume gracefully
6. **Maintainability**: Clear separation between collection, processing, and presentation

## Critical Implementation Points

### 1. Performance Monitoring Architecture
```typescript
// Design the performance collection interface:
interface PerformanceCollector {
  startTimer(operationId: string): string;
  endTimer(timerId: string, operation: string): number;
  recordMetric(metric: string, value: number, tags?: Record<string, string>): void;
}
```

### 2. Privacy-Compliant Analytics
```typescript
// How to collect usage data while protecting privacy:
// Command patterns without exposing actual business data
// User behavior analysis without personal identification
// Error tracking without sensitive context information
```

### 3. Intelligent Alerting System
```typescript
// How to implement smart alerting:
// Dynamic thresholds based on historical patterns
// Alert suppression to prevent notification fatigue
// Escalation policies for different severity levels
// Context-aware alerting based on business hours/patterns
```

### 4. Health Monitoring Integration
```typescript
// How to monitor system health comprehensively:
// API availability and response time monitoring
// Resource usage tracking (memory, CPU)
// Error rate monitoring with pattern detection
// Dependency health checks (Hotmart API, storage systems)
```

## Scope Limitation
**ONLY implement features specified in RFC-006:**
- Performance monitoring with minimal overhead
- Usage analytics with privacy protection
- Quality metrics for NLP and operations
- System health monitoring and alerting
- Dashboard and reporting capabilities
- Integration hooks in all previous RFCs (001-005)

**DO NOT implement:**
- Comprehensive testing framework (RFC-007)
- User interface for monitoring (unless basic dashboard specified)

## Success Criteria for RFC-006
1. ✅ **Performance Impact**: <5ms additional overhead for monitoring
2. ✅ **System Reliability**: >99.5% uptime for monitoring infrastructure
3. ✅ **Alert Accuracy**: >95% of alerts represent actual issues requiring attention
4. ✅ **Privacy Compliance**: Zero exposure of sensitive user or business data
5. ✅ **Coverage Completeness**: All critical system components and user flows monitored
6. ✅ **Insight Quality**: Monitoring data drives measurable system improvements
7. ✅ **Real-time Visibility**: Critical metrics available within seconds of events
8. ✅ **Scalability**: System handles 10x usage growth without degradation

## Monitoring Coverage Test Cases
### Performance Monitoring (Must Track)
```
✅ NLP processing time per command
✅ Operation mapping and optimization execution time
✅ API call latency and success rates
✅ Response formatting duration
✅ End-to-end request processing time
✅ Cache hit/miss rates and performance impact
```

### Usage Analytics (Must Collect Safely)
```
✅ Most frequently used command patterns
✅ User journey analysis (command sequences)
✅ Feature adoption rates
✅ Session duration and interaction patterns
✅ Error patterns and recovery success rates
```

### Quality Metrics (Must Measure)
```
✅ NLP confidence scores and accuracy rates
✅ Operation success rates by type
✅ User satisfaction indicators
✅ Context resolution accuracy
✅ Response relevance and usefulness
```

### Health Monitoring (Must Alert On)
```
✅ Hotmart API availability and response times
✅ System resource usage (memory, CPU)
✅ Error rates and anomaly detection
✅ Dependency health (OAuth, storage, etc.)
✅ Performance degradation trends
```

## Privacy Protection Requirements
### Data Masking (Must Implement)
```
✅ Email addresses → [EMAIL_MASKED]
✅ Payment information → [PAYMENT_MASKED]
✅ Personal identifiers → [ID_MASKED]
✅ Business-sensitive data → [BUSINESS_DATA_MASKED]
✅ Command content → pattern-based anonymization
```

## Final Deliverables
1. **Performance Monitoring System** with <5ms overhead requirement
2. **Usage Analytics Engine** with comprehensive privacy protection
3. **Quality Metrics Collection** for NLP, operations, and user experience
4. **System Health Monitor** with proactive issue detection
5. **Intelligent Alerting System** with configurable rules and thresholds
6. **Privacy Protection Module** with comprehensive data masking
7. **Dashboard and Reporting Interface** for system insights
8. **Data Management System** with retention policies and cleanup
9. **Integration Hooks** in all previous RFCs for seamless monitoring
10. **Senior Developer Assessment**:
    - Monitoring architecture decisions and performance optimization
    - Privacy protection strategy and compliance approach
    - Alerting system design and threshold determination methodology
    - Data collection and aggregation strategy rationale
    - Performance impact minimization techniques
    - Scalability considerations and growth planning
    - Integration quality with existing system components

## Implementation Sequence (Once Approved)
1. **Core Monitoring Infrastructure** - Build foundational data collection and storage
2. **Performance Collectors** - Implement lightweight performance monitoring hooks
3. **Usage Analytics Engine** - Build privacy-compliant user behavior tracking
4. **Quality Metrics System** - Implement NLP and operation quality measurement
5. **Health Monitoring** - Build comprehensive system health tracking
6. **Alerting System** - Implement intelligent alerting with configurable rules
7. **Privacy Protection** - Build comprehensive data masking and anonymization
8. **Integration Hooks** - Add monitoring points to all existing RFCs
9. **Dashboard Interface** - Create basic monitoring dashboard and reporting
10. **System Testing** - Validate monitoring accuracy and performance impact

## Alert Configuration Examples
### Performance Alerts (Must Configure)
```
✅ Average response time > 3 seconds (WARNING)
✅ P95 response time > 5 seconds (CRITICAL)
✅ Cache hit rate < 60% (WARNING)
✅ API error rate > 5% (CRITICAL)
```

### Health Alerts (Must Configure)
```
✅ Hotmart API down for > 5 minutes (CRITICAL)
✅ Memory usage > 80% for > 10 minutes (WARNING)
✅ Error rate increase > 200% over baseline (WARNING)
✅ NLP accuracy drop > 10% from baseline (WARNING)
```

Remember: This monitoring system is the **OBSERVABILITY FOUNDATION** that ensures the MCP Hotmart tool remains reliable, performant, and continuously improving. The quality of monitoring directly impacts the system's ability to deliver consistent user experience and business value.