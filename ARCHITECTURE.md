# Mint Prints - Architecture Documentation

## Overview
Mint Prints is a comprehensive print shop management SaaS application built with React, TypeScript, and Tailwind CSS. This document outlines the architecture, code organization, and extensibility patterns.

---

## Directory Structure

```
src/
├── components/          # UI Components (organized by domain)
│   ├── ui/             # shadcn/ui base components (DO NOT MODIFY)
│   ├── quotes/         # Quote-related components
│   ├── jobs/           # Job-related components
│   ├── customers/      # Customer-related components
│   ├── catalog/        # Product catalog components
│   ├── reports/        # Reporting components
│   ├── settings/       # Settings components
│   ├── shared/         # Shared/common components
│   └── *.tsx           # Legacy root-level components (to be migrated)
├── features/           # Feature modules (business logic + state)
│   ├── quotes/         # Quote management feature
│   ├── jobs/           # Job management feature
│   ├── customers/      # Customer management feature
│   ├── catalog/        # Product catalog feature
│   ├── inventory/      # Inventory management feature
│   ├── reporting/      # Reporting feature
│   └── settings/       # Settings feature
├── services/           # External service integrations
│   ├── api/            # API clients
│   ├── suppliers/      # Supplier integrations (S&S, SanMar)
│   ├── email/          # Email service layer
│   ├── sms/            # SMS service layer
│   └── webhooks/       # Webhook handlers
├── hooks/              # Reusable React hooks
│   ├── use-mobile.ts
│   ├── use-keyboard-shortcuts.ts
│   ├── use-loading-state.ts
│   └── ...
├── lib/                # Utility libraries and helpers
│   ├── utils.ts        # General utilities
│   ├── types.ts        # Global TypeScript types
│   ├── constants.ts    # Application constants
│   └── validators.ts   # Validation schemas
├── contexts/           # React context providers
│   ├── AuthContext.tsx
│   ├── DataContext.tsx
│   └── ThemeContext.tsx
├── layouts/            # Page layouts
│   ├── AppLayout.tsx
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
├── styles/             # Global styles
│   ├── theme.css
│   └── animations.css
├── assets/             # Static assets
│   ├── images/
│   ├── video/
│   ├── audio/
│   └── documents/
├── App.tsx             # Root application component
├── main.tsx            # Application entry point (DO NOT MODIFY)
├── main.css            # Main CSS file (DO NOT MODIFY)
└── index.css           # Custom styles and theme

```

---

## Layer Architecture

### 1. **Presentation Layer** (`components/`)
- Pure UI components organized by domain
- Focus on rendering and user interaction
- Minimal business logic
- Uses hooks for state management

### 2. **Feature Layer** (`features/`)
- Business logic and state management
- Feature-specific hooks
- Data transformation and validation
- Integration with services

### 3. **Service Layer** (`services/`)
- External API integrations
- Third-party service wrappers
- Webhook handling
- Email/SMS services

### 4. **Data Layer** (`lib/`)
- Type definitions
- Data utilities
- Sample data generators
- Export/import utilities

---

## Key Concepts

### Data Persistence
All data is persisted using the Spark KV store:
```typescript
import { useKV } from '@github/spark/hooks'

const [quotes, setQuotes] = useKV<Quote[]>('quotes', [])
```

**Important**: Always use functional updates to avoid stale closures:
```typescript
// ✅ CORRECT
setQuotes((current) => [...current, newQuote])

// ❌ WRONG - Can cause data loss
setQuotes([...quotes, newQuote])
```

### State Management
- **Persistent State**: Use `useKV` for data that survives page refresh
- **Ephemeral State**: Use `useState` for UI state (modals, form inputs, etc.)
- **Global State**: Managed in `App.tsx` and passed down via props

### Component Organization
Components should be organized by domain, not by type:

```
components/
├── quotes/
│   ├── QuotesList.tsx
│   ├── QuoteCard.tsx
│   ├── QuoteBuilder.tsx
│   └── QuoteFilters.tsx
├── jobs/
│   ├── JobsBoard.tsx
│   ├── JobCard.tsx
│   └── JobDetail.tsx
└── customers/
    ├── CustomersList.tsx
    ├── CustomerCard.tsx
    └── CustomerDetail.tsx
```

---

## Core Features

### 1. Quote Management
**Components**: `QuotesList`, `QuoteBuilder`, `QuoteCard`
**Data**: `quotes` (KV store)
**Key Operations**: Create, Edit, Send, Approve, Convert to Job

### 2. Job Management
**Components**: `JobsBoard`, `JobCard`, `JobDetail`
**Data**: `jobs` (KV store)
**Key Operations**: Create, Update Status, Artwork Approval, Production Tracking

### 3. Customer Management
**Components**: `CustomersList`, `CustomerDetail`, `CustomerCard`
**Data**: `customers` (KV store)
**Key Operations**: Create, Edit, Artwork Library, Tax Certificates, Email Preferences

### 4. Product Catalog
**Components**: `ProductCatalog`
**Services**: S&S Activewear API, SanMar API
**Features**: Product search, favorites, templates, stock tracking

### 5. Purchase Orders
**Components**: `PurchaseOrderManager`
**Data**: `purchaseOrders` (KV store)
**Features**: Create POs, receive inventory, track supplier performance

### 6. Reporting
**Components**: `Reports`
**Features**: Sales analytics, job tracking, customer insights

---

## Service Integrations

### Supplier APIs
- **S&S Activewear**: Product catalog, pricing, inventory
- **SanMar**: Product catalog, pricing, inventory

Both use credential-based authentication stored in KV:
```typescript
const [ssActivewearCreds] = useKV<SSActivewearCredentials>('ssactivewear-credentials', {
  accountNumber: '',
  apiKey: ''
})
```

### Email System
- Template-based notifications
- Customer preference management
- History tracking in `emailNotifications`

### Webhooks
- Real-time supplier inventory updates
- Webhook analytics and reliability tracking
- Event processing and logging

---

## Styling System

### Theme Architecture
- **Base Theme**: Defined in `index.css` using CSS variables
- **Color System**: OKLCH color space for perceptual uniformity
- **Component Library**: shadcn/ui v4 components in `components/ui/`

### Design Principles
- Dark-mode first aesthetic
- High contrast for readability
- Apple Pro App inspiration (Final Cut, Logic Pro)
- Refined, polished interactions

### Color Variables
```css
:root {
  --background: oklch(0.15 0.01 249);
  --foreground: oklch(0.96 0.003 249);
  --primary: oklch(0.7 0.17 166);
  --accent: oklch(0.78 0.15 166);
  /* ... */
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘+N | New quote/job/customer (context-aware) |
| ⌘+K | Focus global search |
| ⌘+1-7 | Navigate between sections |
| ⌘+? | Show keyboard shortcuts help |
| Esc | Close modal/dialog |

---

## Adding New Features

### 1. Create Feature Module
```typescript
// features/my-feature/useMyFeature.ts
export const useMyFeature = () => {
  const [data, setData] = useKV('my-feature-data', [])
  
  const addItem = (item) => {
    setData((current) => [...current, item])
  }
  
  return { data, addItem }
}
```

### 2. Create Components
```typescript
// components/my-feature/MyFeatureList.tsx
export const MyFeatureList = ({ items, onSelect }) => {
  return (
    <div>
      {items.map(item => (
        <Card key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </Card>
      ))}
    </div>
  )
}
```

### 3. Integrate in App.tsx
```typescript
const [myFeatureData, setMyFeatureData] = useKV('my-feature-data', [])

// Add to navigation, handlers, etc.
```

---

## Performance Considerations

### Data Loading
- Use loading skeletons for better perceived performance
- Lazy load heavy components
- Optimize list rendering with virtualization for large datasets

### State Updates
- Always use functional updates with `useKV`
- Batch related state updates
- Debounce search/filter operations

---

## Testing Strategy

### Unit Tests
- Test utility functions in `lib/`
- Test service integrations with mocked APIs
- Test hooks in isolation

### Integration Tests
- Test feature workflows end-to-end
- Test data persistence and retrieval
- Test component interactions

### E2E Tests
- Test critical user journeys (create quote → convert to job → complete)
- Test multi-step workflows (artwork approval, payment tracking)

---

## Security Best Practices

1. **Never log or expose API credentials**
2. **Store credentials in KV store, never in code**
3. **Validate user input before processing**
4. **Sanitize data before rendering**
5. **Use HTTPS for all external API calls**

---

## Migration Guide (Current → New Structure)

### Phase 1: Organize Components
Move root-level components into domain folders:
- `QuotesList.tsx` → `components/quotes/QuotesList.tsx`
- `JobsBoard.tsx` → `components/jobs/JobsBoard.tsx`
- etc.

### Phase 2: Extract Features
Extract business logic from `App.tsx` into feature modules:
- Quote management → `features/quotes/`
- Job management → `features/jobs/`
- etc.

### Phase 3: Create Service Layer
Move API integrations to dedicated service modules:
- `ssactivewear-api.ts` → `services/suppliers/ssactivewear.ts`
- `sanmar-api.ts` → `services/suppliers/sanmar.ts`
- etc.

### Phase 4: Implement Contexts
Extract global state from `App.tsx` into context providers:
- Auth state → `contexts/AuthContext.tsx`
- App data → `contexts/DataContext.tsx`

---

## Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Keep components under 300 lines
- Extract complex logic into custom hooks

### Commit Messages
- Use conventional commits format
- Be descriptive and specific
- Reference related issues/tasks

### Pull Requests
- Keep PRs focused on a single feature/fix
- Include tests for new functionality
- Update documentation as needed
- Request review from team members

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Spark Runtime SDK](./API_DOCUMENTATION.md)

---

## Support

For questions or issues, refer to:
- `TROUBLESHOOTING.md` - Common issues and solutions
- `API_DOCUMENTATION.md` - API integration guides
- `DOCUMENTATION.md` - Feature documentation
