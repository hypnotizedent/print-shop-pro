# Mint Prints - Documentation Index

**Welcome to Mint Prints!** This is your central hub for all documentation.

---

## 🚀 Quick Start Guides

### New Developers
**Start here if you're new to the codebase**

1. **[Developer Guide](./DEVELOPER_GUIDE.md)** - Complete onboarding guide (60 min)
   - Quick start (5 min)
   - Core concepts (15 min)
   - Common tasks (30 min)
   - Testing and pitfalls (10 min)

2. **[Architecture Overview](./ARCHITECTURE.md)** - System architecture (30 min)
   - Directory structure
   - Layer architecture
   - Core features
   - Service integrations

3. **[Feature Reference](./FEATURE_REFERENCE.md)** - Find any feature (reference)
   - All features with locations
   - Component relationships
   - Data flow diagrams

### Product Managers & Stakeholders
**Start here to understand what the app does**

1. **[PRD (Product Requirements)](./PRD.md)** - Product vision and requirements
2. **[Feature Reference](./FEATURE_REFERENCE.md)** - Complete feature list
3. **[Documentation](./DOCUMENTATION.md)** - Feature documentation

---

## 📚 Core Documentation

### Architecture & Organization

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, layers, patterns | 30 min |
| [COMPONENT_MAP.md](./COMPONENT_MAP.md) | Future code organization plan | 20 min |
| [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) | All features with file locations | Reference |

### Developer Resources

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Complete developer onboarding | 60 min |
| [src/lib/README.md](./src/lib/README.md) | Library utilities documentation | 20 min |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions | Reference |
| [AUDIT.md](./AUDIT.md) | Code audit and improvements | Reference |

### Product Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [PRD.md](./PRD.md) | Product requirements document | 20 min |
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Feature documentation | 30 min |

### API & Integration

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API guide | 45 min |
| [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) | Quick API reference | 10 min |
| [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) | Setup instructions | 15 min |
| [API_ARCHITECTURE.md](./API_ARCHITECTURE.md) | API architecture details | 20 min |
| [API_DOCS_INDEX.md](./API_DOCS_INDEX.md) | API documentation index | 5 min |

### Security & Operations

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [SECURITY.md](./SECURITY.md) | Security best practices | 15 min |

---

## 🎯 Documentation by Role

### I'm a Frontend Developer
**Your reading path:**
1. [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Start here
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the structure
3. [src/lib/README.md](./src/lib/README.md) - Know your utilities
4. [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) - Reference when needed

**Key files to know**:
- `src/App.tsx` - Root component
- `src/lib/types.ts` - All TypeScript types
- `src/lib/constants.ts` - All constants
- `src/index.css` - Theme and styles

### I'm a Backend/Integration Developer
**Your reading path:**
1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API guide
2. [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) - Setup instructions
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Service layer
4. [SECURITY.md](./SECURITY.md) - Security practices

**Key files to know**:
- `src/lib/ssactivewear-api.ts` - S&S API client
- `src/lib/sanmar-api.ts` - SanMar API client
- `src/lib/webhook-processor.ts` - Webhook handling
- `src/lib/email-notifications.ts` - Email system

### I'm a Product Manager
**Your reading path:**
1. [PRD.md](./PRD.md) - Product vision
2. [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) - All features
3. [DOCUMENTATION.md](./DOCUMENTATION.md) - Feature details
4. [ROADMAP.md](#roadmap) - Future plans (if exists)

### I'm a Designer
**Your reading path:**
1. [PRD.md](./PRD.md) - Design direction
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Component structure
3. Review `src/index.css` - Theme system
4. Review `src/components/ui/` - Base components

### I'm a QA/Tester
**Your reading path:**
1. [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) - All features
2. [DOCUMENTATION.md](./DOCUMENTATION.md) - Feature details
3. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Known issues
4. [AUDIT.md](./AUDIT.md) - Quality checks

---

## 🔍 Find What You Need

### Common Questions

**Q: How do I add a new field to quotes?**
→ [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#task-1-adding-a-new-field-to-a-quote)

**Q: Where is the quote builder component?**
→ [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md#quote-builder)

**Q: How do I integrate a new supplier API?**
→ [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) + [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#task-4-adding-a-supplier-api-integration)

**Q: What are all the keyboard shortcuts?**
→ [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md#keyboard-shortcuts)

**Q: How does data persistence work?**
→ [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#data-persistence-with-kv-store)

**Q: Where are the types defined?**
→ `src/lib/types.ts` + [src/lib/README.md](./src/lib/README.md)

**Q: How do I customize the theme?**
→ `src/index.css` + [ARCHITECTURE.md](./ARCHITECTURE.md#styling-system)

**Q: What's the recommended code organization?**
→ [COMPONENT_MAP.md](./COMPONENT_MAP.md)

**Q: How do I fix a common error?**
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Q: What are the security best practices?**
→ [SECURITY.md](./SECURITY.md)

---

## 📖 Learning Paths

### Path 1: Quick Start (30 minutes)
Perfect for: Getting the app running and making a small change

1. Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) Quick Start (5 min)
2. Explore `src/App.tsx` (10 min)
3. Browse `src/lib/types.ts` (5 min)
4. Make a small change using [Task Examples](./DEVELOPER_GUIDE.md#common-tasks) (10 min)

### Path 2: Feature Development (2 hours)
Perfect for: Building a new feature

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) (30 min)
2. Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) (60 min)
3. Review [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) (20 min)
4. Plan your feature using existing patterns (10 min)

### Path 3: API Integration (1.5 hours)
Perfect for: Integrating external services

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (45 min)
2. Read [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) (15 min)
3. Review existing integrations in `src/lib/` (20 min)
4. Implement following the pattern (10 min)

### Path 4: Full Codebase Understanding (4 hours)
Perfect for: Becoming a codebase expert

1. Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) (60 min)
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) (30 min)
3. Read [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) (30 min)
4. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (45 min)
5. Explore all components (60 min)
6. Review all lib utilities (30 min)
7. Test all major workflows (30 min)

---

## 🗂️ Documentation Structure

```
Documentation (Root Level)
├── Index & Guides
│   ├── README.md (this file)
│   ├── DEVELOPER_GUIDE.md
│   └── TROUBLESHOOTING.md
├── Architecture
│   ├── ARCHITECTURE.md
│   ├── COMPONENT_MAP.md
│   └── FEATURE_REFERENCE.md
├── Product
│   ├── PRD.md
│   └── DOCUMENTATION.md
├── API
│   ├── API_DOCUMENTATION.md
│   ├── API_QUICK_REFERENCE.md
│   ├── API_SETUP_GUIDE.md
│   ├── API_ARCHITECTURE.md
│   └── API_DOCS_INDEX.md
├── Quality
│   ├── AUDIT.md
│   ├── AUDIT_SUMMARY.md
│   └── SECURITY.md
└── src/lib/
    └── README.md (Library documentation)
```

---

## 🛠️ Code Organization

### Current Structure
```
src/
├── components/          # All UI components (flat structure)
│   ├── ui/             # shadcn components (DO NOT MODIFY)
│   ├── skeletons/      # Loading skeletons
│   └── *.tsx           # 69 component files
├── lib/                # Utilities, types, services
│   ├── types.ts        # All TypeScript types
│   ├── constants.ts    # All constants
│   ├── data.ts         # Sample data & generators
│   ├── utils.ts        # Utility functions
│   └── *-api.ts        # API integrations
├── hooks/              # Custom React hooks
├── styles/             # Global styles
└── App.tsx             # Root component
```

### Future Structure (See COMPONENT_MAP.md)
```
src/
├── components/
│   ├── quotes/         # Quote domain
│   ├── jobs/           # Job domain
│   ├── customers/      # Customer domain
│   ├── catalog/        # Catalog domain
│   ├── inventory/      # Inventory domain
│   ├── settings/       # Settings domain
│   ├── reports/        # Reports domain
│   ├── shared/         # Shared components
│   └── ui/             # shadcn components
├── features/           # Business logic modules
├── services/           # External integrations
│   ├── suppliers/      # Supplier APIs
│   ├── email/          # Email service
│   └── webhooks/       # Webhook handling
├── lib/
│   ├── types/          # Type definitions by domain
│   ├── data/           # Data generators & samples
│   └── utils/          # Utility functions
└── contexts/           # React contexts
```

---

## 🎨 Design System

### Theme
- **Base**: `src/index.css`
- **Colors**: OKLCH color space
- **Aesthetic**: Dark-mode first, Apple Pro App inspired
- **Typography**: Inter font family

### Component Library
- **Framework**: shadcn/ui v4
- **Location**: `src/components/ui/`
- **DO NOT MODIFY**: These are third-party components
- **Extend**: Create wrappers in other directories

---

## 🔑 Key Concepts

### Data Persistence
**All data uses Spark KV store** (persistent key-value storage)

```typescript
import { useKV } from '@github/spark/hooks'

// Persistent data
const [quotes, setQuotes] = useKV('quotes', [])

// ALWAYS use functional updates
setQuotes((current) => [...current, newQuote]) // ✅ CORRECT
setQuotes([...quotes, newQuote])              // ❌ WRONG
```

### Type Safety
**TypeScript everywhere**

```typescript
import type { Quote, Customer } from '@/lib/types'
```

### Constants
**No magic strings**

```typescript
import { KV_KEYS, QUOTE_STATUSES } from '@/lib/constants'
```

---

## 📞 Getting Help

### Troubleshooting
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Search this documentation
3. Review similar code in the codebase
4. Ask team members

### Contributing
1. Follow patterns in [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
2. Use existing components and utilities
3. Write TypeScript
4. Test your changes
5. Update documentation

---

## 📋 Quick Reference

### Important Files
| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, global state |
| `src/lib/types.ts` | All TypeScript types |
| `src/lib/constants.ts` | All constants |
| `src/lib/data.ts` | Data generators & calculations |
| `src/index.css` | Theme & custom styles |
| `package.json` | Dependencies |

### Important Directories
| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | shadcn components (DO NOT MODIFY) |
| `src/components/` | All other components |
| `src/lib/` | Utilities, types, services |
| `src/hooks/` | Custom React hooks |
| `src/styles/` | Global styles |

### KV Store Keys
See `src/lib/constants.ts` → `KV_KEYS`

### Status Values
See `src/lib/constants.ts` → `QUOTE_STATUSES`, `JOB_STATUSES`, etc.

---

## 🚦 Next Steps

### If you're new:
1. ✅ You're here! (Reading the index)
2. → Go to [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
3. → Explore `src/App.tsx`
4. → Make a small change

### If you're building a feature:
1. → Review [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md)
2. → Plan using [ARCHITECTURE.md](./ARCHITECTURE.md)
3. → Code following [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) patterns
4. → Test and document

### If you're integrating an API:
1. → Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. → Follow [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)
3. → Use existing integrations as templates
4. → Test thoroughly

---

## 📝 Documentation Maintenance

### Keeping Docs Updated
When you make changes, update:
- This index if adding new docs
- [FEATURE_REFERENCE.md](./FEATURE_REFERENCE.md) if adding features
- [ARCHITECTURE.md](./ARCHITECTURE.md) if changing structure
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) if changing APIs
- [src/lib/README.md](./src/lib/README.md) if changing libraries

### Documentation Standards
- Use Markdown
- Include code examples
- Add table of contents for long docs
- Cross-reference related docs
- Update "last modified" date

---

**Last Updated**: January 2025

**Version**: 1.0.0

**Maintainers**: Development Team

---

## 🎉 Welcome!

You now have a complete map of the Mint Prints documentation. Choose your path above and start exploring!

For questions or improvements to this documentation, please reach out to the development team.

Happy coding! 🚀
