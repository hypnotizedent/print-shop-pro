# Developer Onboarding Guide

Welcome to the Mint Prints codebase! This guide will help you get up to speed quickly.

---

## Quick Start (5 minutes)

### 1. Understanding the App
Mint Prints is a **print shop management SaaS** that helps print shops manage:
- **Quotes** - Customer price quotes for print jobs
- **Jobs** - Active production jobs with artwork and tracking
- **Customers** - Customer database with preferences and history
- **Inventory** - Product catalog and purchase orders
- **Reporting** - Sales analytics and insights

### 2. Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui v4
- **Build**: Vite 7
- **Icons**: Phosphor Icons
- **Data**: Spark KV Store (persistent key-value storage)
- **Runtime**: GitHub Spark (special environment)

### 3. Key Files to Know
```
src/
├── App.tsx              # Main app component (start here!)
├── components/          # All UI components
│   └── ui/             # Base components (shadcn - don't modify)
├── lib/
│   ├── types.ts        # All TypeScript types
│   ├── constants.ts    # App constants
│   ├── data.ts         # Data generators & calculations
│   └── README.md       # Library documentation
├── hooks/              # Custom React hooks
└── index.css           # Theme and styles
```

### 4. Running the App
```bash
# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Core Concepts (15 minutes)

### Data Persistence with KV Store

**All data is stored using the Spark KV store**, not localStorage or databases.

```typescript
import { useKV } from '@github/spark/hooks'

// ✅ CORRECT - Persistent data
const [quotes, setQuotes] = useKV<Quote[]>('quotes', [])

// Always use functional updates!
setQuotes((current) => [...current, newQuote])  // ✅ CORRECT
setQuotes([...quotes, newQuote])                // ❌ WRONG - stale data!

// ✅ CORRECT - Ephemeral UI state
const [isOpen, setIsOpen] = useState(false)
```

**Why functional updates?**
The `quotes` variable in your closure might be stale. Using `(current) => ...` always gets the latest value.

### Component Architecture

Components follow a **domain-driven structure**:

```
components/
├── quotes/      # Everything quote-related
├── jobs/        # Everything job-related
├── customers/   # Everything customer-related
├── shared/      # Shared across domains
└── ui/          # Base components (shadcn)
```

### Type System

**All types are in `lib/types.ts`**. Import with `type` keyword:

```typescript
import type { Quote, Customer, Job } from '@/lib/types'

const quote: Quote = { ... }
```

### Constants

**Use constants instead of magic strings**:

```typescript
import { KV_KEYS, QUOTE_STATUSES } from '@/lib/constants'

const [quotes] = useKV(KV_KEYS.QUOTES, [])  // ✅ CORRECT
const [quotes] = useKV('quotes', [])        // ❌ AVOID
```

---

## Common Tasks (30 minutes)

### Task 1: Adding a New Field to a Quote

**Step 1**: Update the type in `lib/types.ts`
```typescript
export interface Quote {
  // ... existing fields
  new_field: string  // Add your field
}
```

**Step 2**: Update the quote generator in `lib/data.ts`
```typescript
export const createEmptyQuote = (customer?: Customer): Quote => ({
  // ... existing fields
  new_field: '',  // Add default value
})
```

**Step 3**: Update UI in `components/QuoteBuilder.tsx`
```typescript
<Input
  value={quote.new_field}
  onChange={(e) => setQuote({ ...quote, new_field: e.target.value })}
/>
```

**Step 4**: Test the change
- Create a new quote
- Verify the field persists
- Check TypeScript has no errors

### Task 2: Adding a New Status Filter

**Step 1**: Add constant in `lib/constants.ts`
```typescript
export const QUOTE_STATUSES = {
  // ... existing
  NEW_STATUS: 'new_status',
} as const
```

**Step 2**: Update status badge in `components/StatusBadge.tsx`
```typescript
const statusConfig = {
  new_status: { label: 'New Status', variant: 'default' },
  // ... existing
}
```

**Step 3**: Add to filters in `components/QuotesList.tsx`

### Task 3: Creating a New Email Template

**Step 1**: Add template to `lib/data.ts`
```typescript
export const sampleEmailTemplates: EmailTemplate[] = [
  // ... existing
  {
    id: generateId('et'),
    name: 'My New Template',
    subject: 'Subject Line',
    body: 'Email body...',
    category: 'general',
  }
]
```

**Step 2**: Use in email notification
```typescript
import { createCustomEmail } from '@/lib/email-notifications'

const email = createCustomEmail(
  customer.email,
  'Subject',
  'Message body',
  'Sender Name'
)
addEmailNotification(email)
```

### Task 4: Adding a Supplier API Integration

**Step 1**: Create API client (e.g., `lib/new-supplier-api.ts`)
```typescript
export const newSupplierAPI = {
  baseUrl: 'https://api.newsupplier.com',
  
  setCredentials(creds: { apiKey: string }) {
    this.credentials = creds
  },
  
  async searchProducts(query: string) {
    const response = await fetch(`${this.baseUrl}/products?q=${query}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`
      }
    })
    return response.json()
  }
}
```

**Step 2**: Store credentials in KV
```typescript
const [newSupplierCreds] = useKV('new-supplier-credentials', {
  apiKey: ''
})
```

**Step 3**: Initialize in App.tsx
```typescript
useEffect(() => {
  if (newSupplierCreds?.apiKey) {
    newSupplierAPI.setCredentials(newSupplierCreds)
  }
}, [newSupplierCreds])
```

---

## Understanding App.tsx (30 minutes)

`App.tsx` is the **heart of the application**. It manages:

### 1. Global State
All data is stored at the top level:
```typescript
const [quotes, setQuotes] = useKV<Quote[]>('quotes', sampleQuotes)
const [jobs, setJobs] = useKV<Job[]>('jobs', sampleJobs)
const [customers, setCustomers] = useKV<Customer[]>('customers', sampleCustomers)
// ... etc
```

### 2. Navigation State
```typescript
type Page = 
  | { type: 'list'; view: View }
  | { type: 'quote-builder'; quote: Quote }
  | { type: 'customer-detail'; customer: Customer }

const [currentPage, setCurrentPage] = useState<Page>({ type: 'list', view: 'home' })
```

### 3. Event Handlers
All CRUD operations flow through App.tsx:
```typescript
const handleSaveQuote = (quote: Quote) => { ... }
const handleUpdateCustomer = (customer: Customer) => { ... }
const handleConvertToJob = (quote: Quote) => { ... }
```

### 4. Component Rendering
Conditional rendering based on navigation state:
```typescript
{currentPage.type === 'quote-builder' && (
  <QuoteBuilder
    quote={currentPage.quote}
    onSave={handleSaveQuote}
    // ... props
  />
)}
```

**Key Insight**: App.tsx is large (~1100 lines) because it manages all state and coordination. In a refactor, this would be split into:
- Context providers (AuthContext, DataContext)
- Feature-specific state management
- Route-based navigation

---

## Working with Components (30 minutes)

### shadcn/ui Components

**DO NOT modify files in `components/ui/`**. These are third-party components.

**Available components**:
- Button, Input, Select, Dialog, Card, Badge, Table, Tabs
- 40+ more (see `components/ui/` directory)

**Usage**:
```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<Button variant="default" size="sm">Click Me</Button>
```

### Custom Components

**Follow the existing patterns**:

```typescript
// components/quotes/QuoteCard.tsx
import type { Quote } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuoteCardProps {
  quote: Quote
  onSelect: (quote: Quote) => void
}

export const QuoteCard = ({ quote, onSelect }: QuoteCardProps) => {
  return (
    <Card onClick={() => onSelect(quote)}>
      <h3>{quote.customer.name}</h3>
      <p>${quote.total}</p>
      <Button>View</Button>
    </Card>
  )
}
```

**Best Practices**:
1. Extract props to an interface
2. Use TypeScript for all props
3. Import types with `type` keyword
4. Use shadcn components as base
5. Keep components focused (single responsibility)

---

## Styling Guide (20 minutes)

### Tailwind Classes

**Use utility classes**:
```typescript
<div className="flex items-center gap-4 p-6 bg-card rounded-lg border border-border">
  <h2 className="text-xl font-bold text-foreground">Title</h2>
</div>
```

### Theme Colors

**Use CSS variables from the theme**:
```typescript
// Theme colors (from index.css)
bg-background     // Main background
text-foreground   // Main text color
bg-card          // Card background
text-primary     // Primary/brand color
bg-accent        // Accent highlights
border-border    // Border color
```

### Custom Styles

**Add custom CSS to `index.css`**:
```css
/* index.css */
@layer base {
  .my-custom-class {
    @apply bg-primary text-primary-foreground rounded-lg;
  }
}
```

### Class Merging

**Use `cn()` for conditional classes**:
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-variant'
)}>
```

---

## Testing Your Changes (15 minutes)

### Manual Testing Checklist

After making changes, test these workflows:

**Quotes**:
1. Create new quote
2. Add line items
3. Save quote
4. Send quote (changes status)
5. Convert to job

**Jobs**:
1. View jobs board
2. Update job status
3. Upload artwork
4. Approve artwork

**Customers**:
1. Create customer
2. View customer detail
3. Create quote for customer
4. Upload artwork to library

**Persistence**:
1. Make a change
2. Refresh the page
3. Verify change persisted

### TypeScript Errors

**Always check for TypeScript errors**:
```bash
npm run build
```

Look for errors in the console. Fix before committing.

---

## Common Pitfalls (10 minutes)

### 1. Stale Closures with useKV
```typescript
// ❌ WRONG - Uses stale 'quotes' from closure
setQuotes([...quotes, newQuote])

// ✅ CORRECT - Gets current value
setQuotes((current) => [...current, newQuote])
```

### 2. Forgetting to Update Types
```typescript
// If you add a field to the database, update the type!
interface Quote {
  // Add new fields here
}
```

### 3. Importing from Wrong Paths
```typescript
// ❌ WRONG
import { Quote } from '../../../lib/types'

// ✅ CORRECT - Use @ alias
import type { Quote } from '@/lib/types'
```

### 4. Modifying shadcn Components
```typescript
// ❌ WRONG - Don't edit components/ui/button.tsx

// ✅ CORRECT - Create a wrapper
// components/shared/PrimaryButton.tsx
import { Button } from '@/components/ui/button'

export const PrimaryButton = (props) => (
  <Button variant="default" {...props} />
)
```

### 5. Not Using Constants
```typescript
// ❌ WRONG
const [quotes] = useKV('quotes', [])

// ✅ CORRECT
import { KV_KEYS } from '@/lib/constants'
const [quotes] = useKV(KV_KEYS.QUOTES, [])
```

---

## Next Steps

### Week 1: Explore the Codebase
- [ ] Read ARCHITECTURE.md
- [ ] Explore App.tsx
- [ ] Review lib/types.ts
- [ ] Browse components directory
- [ ] Test the app locally

### Week 2: Make Small Changes
- [ ] Add a new field to Quote
- [ ] Create a new email template
- [ ] Add a filter to a list view
- [ ] Style a component

### Week 3: Build a Feature
- [ ] Plan a small feature
- [ ] Create necessary components
- [ ] Update types and data
- [ ] Test thoroughly
- [ ] Document your changes

---

## Resources

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - App architecture
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) - Component organization plan
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API integrations
- [src/lib/README.md](./src/lib/README.md) - Library documentation

### External Resources
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

### Getting Help
1. Check TROUBLESHOOTING.md for common issues
2. Search existing code for similar patterns
3. Review type definitions in lib/types.ts
4. Ask team members for guidance

---

## Welcome!

You're now ready to contribute to Mint Prints. Start small, ask questions, and don't be afraid to explore the codebase.

Happy coding! 🚀
