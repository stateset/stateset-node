# Changelog

All notable changes to the Stateset Node.js library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### 🚨 BREAKING CHANGES

- **Minimum Node.js version**: Now requires Node.js 18+ (was 12+)
- **New client architecture**: `StatesetClient` is now the main export
- **TypeScript strict mode**: Enhanced type checking may catch previously ignored errors

### ✨ Added

#### New Client Architecture
- **New `StatesetClient`** class with dependency injection and modular design
- **Base resource pattern** providing consistent CRUD operations across all resources
- **Enhanced HTTP client** with retry logic, circuit breaker, and proper error handling
- **Comprehensive TypeScript types** for all API operations and responses

#### Developer Experience
- **Structured logging system** with configurable levels and context
- **Health check endpoints** for monitoring API connectivity
- **Circuit breaker pattern** for resilience against API failures
- **Request/response interceptors** for debugging and monitoring

#### Enhanced Resources
- **Enhanced Returns resource** with specialized methods:
  - `updateStatus()` - Update return status with notes
  - `generateShippingLabel()` - Generate return shipping labels
  - `processRefund()` - Process refunds with different methods
  - `getAnalytics()` - Get return analytics and insights
  - `validateEligibility()` - Check return eligibility

#### Testing & Quality
- **Comprehensive test suite** with 24+ passing tests
- **Code coverage reporting** with Jest
- **ESLint configuration** with TypeScript-specific rules
- **Prettier integration** for consistent code formatting
- **GitHub Actions CI/CD** pipeline

### 🔒 Security

- **Updated axios** from 0.27.2 to 1.7.7+ (fixes CSRF and SSRF vulnerabilities)
- **Updated all dependencies** to latest secure versions
- **Zero security vulnerabilities** after updates
- **Secure error handling** that doesn't expose sensitive information

### 🚀 Performance

- **Retry logic** with exponential backoff and jitter
- **Circuit breaker** prevents cascading failures
- **Connection pooling** and timeout management
- **Request deduplication** and optimization

### 🔧 Technical Improvements

- **ES2022 target** for modern JavaScript features
- **Strict TypeScript configuration** with comprehensive type checking
- **Modular architecture** with separation of concerns
- **Dependency injection** for better testability

### 📚 Documentation

- **Enhanced README** with comprehensive examples
- **API documentation** with JSDoc comments
- **Contributing guidelines** for open source collaboration
- **Migration guide** for upgrading from v0.0.x

### 🔄 Migration

#### Before (v0.0.x)
```typescript
import stateset from 'stateset-node';
const client = new stateset({ apiKey: 'key' });
```

#### After (v0.1.x)
```typescript
import StatesetClient from 'stateset-node';
const client = new StatesetClient({ apiKey: 'key' });

// Legacy client still available
import { stateset } from 'stateset-node';
const legacyClient = new stateset({ apiKey: 'key' });
```

### 📦 Dependencies

#### Updated
- `axios`: 0.27.2 → 1.7.7
- `qs`: 6.11.1 → 6.13.0
- `typescript`: 4.7.4 → 5.6.3
- `jest`: 28.1.3 → 29.7.0
- `@types/node`: 16.11.7 → 18.19.54

#### Added
- `uuid`: 10.0.0 (for request tracking)
- `eslint-config-prettier`: 9.1.0
- `eslint-plugin-prettier`: 5.2.1
- `prettier`: 3.3.3
- `rimraf`: 6.0.1

### 🐛 Fixed

- **Error handling**: Proper error types instead of generic errors
- **Memory leaks**: Better resource cleanup and management
- **Type safety**: Fixed numerous TypeScript type issues
- **Request lifecycle**: Proper request/response handling

### ⚠️ Deprecated

- **Legacy `stateset` client**: Still available but deprecated in favor of `StatesetClient`
- **Direct `console.error` usage**: Replaced with structured logging

---

## [0.0.92] - 2023-XX-XX

### Added
- Basic Stateset API client
- Core resource operations
- OpenAI integration
- Basic error handling

### Dependencies
- axios: 0.27.2
- qs: 6.11.1
- Node.js 12+ support

---

## Migration Notes

### From v0.0.x to v0.1.x

1. **Update Node.js**: Ensure you're running Node.js 18+
2. **Update imports**: Use `StatesetClient` instead of `stateset`
3. **Update error handling**: Catch specific error types
4. **Review configuration**: New configuration options available
5. **Test thoroughly**: Enhanced type checking may reveal hidden issues

### Compatibility

- **Backward compatible**: Legacy client still works
- **Gradual migration**: Update at your own pace
- **Type improvements**: Better IntelliSense and error detection

---

For detailed migration instructions, see [IMPROVEMENTS.md](./IMPROVEMENTS.md).