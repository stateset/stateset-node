# Contributing to Stateset Node.js Library

Thank you for your interest in contributing to the Stateset Node.js library! This document provides guidelines and information for contributors.

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+
- Git knowledge
- TypeScript familiarity

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/stateset-node.git
   cd stateset-node
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up development environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   # Add your test API key
   ```

4. **Run tests to ensure everything works**
   ```bash
   npm test
   ```

## 🏗️ Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards (ESLint + Prettier)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

We follow [Conventional Commits](https://conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Style

- **ESLint**: Automatically enforced
- **Prettier**: Code formatting
- **TypeScript**: Strict typing required
- **Comments**: Use JSDoc for public APIs

Example:
```typescript
/**
 * Creates a new return request
 * @param returnData - The return request data
 * @returns Promise resolving to the created return
 * @throws StatesetInvalidRequestError when data is invalid
 */
async create(returnData: CreateReturnParams): Promise<Return> {
  // Implementation
}
```

## 🧪 Testing Guidelines

### Writing Tests

- **Unit tests**: Test individual functions/methods
- **Integration tests**: Test resource interactions
- **Coverage**: Aim for 80%+ coverage on new code

```typescript
describe('ReturnsResource', () => {
  describe('create', () => {
    it('should create a return successfully', async () => {
      // Arrange
      const returnData = { /* test data */ };
      
      // Act
      const result = await client.returns.create({ data: returnData });
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('REQUESTED');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- returns.test.ts

# Watch mode for development
npm run test:watch
```

## 📚 Documentation

### Adding New Features

When adding new features:

1. **Update type definitions** in `src/types/`
2. **Add JSDoc comments** to public methods
3. **Update README** with usage examples
4. **Add to IMPROVEMENTS.md** if significant

### Documentation Standards

- Use clear, concise language
- Provide code examples
- Include error handling examples
- Document all parameters and return values

## 🐛 Bug Reports

### Before Reporting

- Check existing issues
- Ensure you're using the latest version
- Test with minimal reproduction case

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Reproduction Steps**
1. Step one
2. Step two
3. Expected vs actual behavior

**Environment**
- Node.js version: 
- Package version:
- Operating system:

**Code Example**
```typescript
// Minimal reproduction code
```

## 🚀 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Implementation**
How should this work?

**Alternatives Considered**
Other approaches you've considered
```

## 📦 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

For maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run full test suite
4. Create release PR
5. Merge to main
6. Tag release
7. GitHub Actions handles NPM publish

## 🏆 Recognition

Contributors will be:

- Added to `CONTRIBUTORS.md`
- Mentioned in release notes
- Given attribution in documentation

## ❓ Questions?

- Create a GitHub issue with `question` label
- Join our Discord community
- Email: support@stateset.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Stateset! 🙏