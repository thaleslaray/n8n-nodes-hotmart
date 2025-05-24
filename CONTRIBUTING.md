# Contributing to n8n-nodes-hotmart

First off, thanks for taking the time to contribute! 🎉

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

1. **Clear title and description**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Screenshots** (if applicable)
5. **Environment details**:
   - n8n version
   - Node.js version
   - OS

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

1. **Use case**: Why is this needed?
2. **Current workaround** (if any)
3. **Proposed solution**
4. **Alternative solutions**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Follow the coding standards
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit PR with clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/n8n-nodes-hotmart.git
cd n8n-nodes-hotmart

# Install dependencies
pnpm install

# Create branch
git checkout -b feature/your-feature

# Make changes and test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Coding Standards

### TypeScript
- Use strict mode
- Avoid `any` types
- Document complex functions
- Use meaningful variable names

### Testing
- Write tests for new features
- Maintain > 80% coverage
- Test edge cases
- Use descriptive test names

### Commits
- Use conventional commits
- Keep commits atomic
- Write clear commit messages

Examples:
```
feat: add cancel subscription endpoint
fix: webhook validation for event type 0
docs: update API examples
test: add coverage for error cases
refactor: simplify event processing logic
```

## Project Structure

```
n8n-nodes-hotmart/
├── nodes/           # Node implementations
├── credentials/     # Credential types
├── __tests__/      # Test files
├── docs/           # Documentation
└── scripts/        # Build/utility scripts
```

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test -- HotmartTrigger

# Watch mode
pnpm test:watch
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for functions
- Update CHANGELOG.md
- Include examples

## Review Process

### What we look for:

1. **Code quality**
   - Clean, readable code
   - Proper error handling
   - No over-engineering

2. **Tests**
   - Good coverage
   - Edge cases handled
   - Tests pass

3. **Documentation**
   - Clear descriptions
   - Examples included
   - API documented

4. **Performance**
   - No unnecessary loops
   - Efficient algorithms
   - Memory considerations

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create PR with changes
4. After merge, tag release
5. Publish to npm

## Questions?

Feel free to open an issue for:
- Questions about the codebase
- Clarification on requirements
- Help with development setup

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- README.md contributors section
- GitHub contributors page

Thank you for contributing! 🙏