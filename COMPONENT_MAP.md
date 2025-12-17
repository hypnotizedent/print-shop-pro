# Code Reorganization Guide

## Overview
This guide helps reorganize the Mint Prints codebase into a scalable, layered SaaS architecture.

---

## Current State Analysis

### Components (69 files in flat structure)
Currently all components live in `src/components/` at the root level, making it difficult to:
- Find related components quickly
- Understand dependencies
- Onboard new developers
- Scale the application

### Services & Libraries
- API integrations mixed with utilities in `src/lib/`
- No clear separation between data, services, and utilities

---

## Proposed Structure

### 1. Component Organization by Domain

```
src/components/
├── ui/                    # shadcn components (DO NOT MODIFY)
├── shared/                # Shared UI components
│   ├── GlobalSearch.tsx
│   ├── KeyboardShortcutsHelp.tsx
│   ├── StatusBadge.tsx
│   ├── StatusFilterPills.tsx
│   ├── FilterPresetManager.tsx
│   └── RecentSearchesDropdown.tsx
├── quotes/                # Quote domain
│   ├── QuotesList.tsx
│   ├── QuoteCard.tsx
│   ├── QuoteBuilder.tsx
│   ├── QuoteHistory.tsx
│   ├── QuoteTemplateManager.tsx
│   ├── QuoteReminderScheduler.tsx
│   ├── QuoteReminderTemplate.tsx
│   ├── BulkQuoteReminders.tsx
│   ├── PricingSummary.tsx
│   ├── LineItemGrid.tsx
│   ├── SizeInputRow.tsx
│   ├── DecorationManager.tsx
│   ├── CopyDecorationsDialog.tsx
│   ├── BulkCopyDecorationsDialog.tsx
│   └── SaveDecorationTemplateDialog.tsx
├── jobs/                  # Job domain
│   ├── JobsBoard.tsx
│   ├── JobCard.tsx
│   ├── JobDetail.tsx
│   ├── JobHistory.tsx
│   ├── JobArtworkReview.tsx
│   ├── JobDepartmentNotification.tsx
│   ├── ArtworkApprovalWorkflow.tsx
│   ├── ArtworkUpload.tsx
│   ├── ExpenseTracker.tsx
│   └── ProductionCalendar.tsx
├── customers/             # Customer domain
│   ├── CustomersList.tsx
│   ├── CustomerDetail.tsx
│   ├── CustomerSearch.tsx
│   ├── CustomerArtworkLibrary.tsx
│   ├── CustomerEmailPreferences.tsx
│   ├── CustomerSmsOptOuts.tsx
│   ├── TaxCertManager.tsx
│   ├── EmailNotificationHistory.tsx
│   ├── EmailPreferenceIndicator.tsx
│   ├── PaymentReminders.tsx
│   └── PaymentTracker.tsx
├── catalog/               # Product catalog domain
│   ├── ProductCatalog.tsx
│   ├── SKULookupDialog.tsx
│   ├── ProductMockup.tsx
│   ├── ProductMockupWithSize.tsx
│   ├── ProductStockTrends.tsx
│   ├── ProductTemplateManager.tsx
│   ├── ProductTemplateQuickAdd.tsx
│   ├── FavoriteProductQuickAdd.tsx
│   └── InventoryAlerts.tsx
├── inventory/             # Inventory & PO domain
│   ├── PurchaseOrderManager.tsx
│   ├── PurchaseOrderCard.tsx
│   ├── CreatePurchaseOrderDialog.tsx
│   ├── ReceiveInventoryDialog.tsx
│   ├── SupplierPerformance.tsx
│   ├── SupplierMetricsCard.tsx
│   ├── SupplierPerformanceChart.tsx
│   └── SupplierIssuesLog.tsx
├── settings/              # Settings domain
│   ├── Settings.tsx
│   ├── PricingRulesManager.tsx
│   ├── PricingRulesIndicator.tsx
│   ├── PricingRulesSuggestions.tsx
│   ├── EmailTemplatesManager.tsx
│   ├── SmsTemplates.tsx
│   ├── ScheduledEmailsManager.tsx
│   ├── SendCustomEmailDialog.tsx
│   ├── EmailStats.tsx
│   ├── WebhookManager.tsx
│   ├── WebhookDashboard.tsx
│   ├── WebhookAnalytics.tsx
│   └── WebhookEventViewer.tsx
├── reports/               # Reporting domain
│   ├── Reports.tsx
│   └── UnpaidBalancesReport.tsx
├── auth/                  # Authentication
│   └── Login.tsx
├── dashboard/             # Dashboard/Home
│   └── Home.tsx
└── skeletons/             # Loading skeletons
    └── ...existing skeletons
```

### 2. Service Layer Organization

```
src/services/
├── suppliers/
│   ├── ssactivewear.ts
│   └── sanmar.ts
├── email/
│   ├── notifications.ts
│   ├── templates.ts
│   └── preferences.ts
├── sms/
│   └── twilio.ts
├── webhooks/
│   ├── processor.ts
│   └── types.ts
└── export/
    ├── csv.ts
    ├── invoice.ts
    └── batch-invoice.ts
```

### 3. Library Organization

```
src/lib/
├── types/
│   ├── index.ts           # Re-export all types
│   ├── quote.ts
│   ├── job.ts
│   ├── customer.ts
│   ├── product.ts
│   └── webhook.ts
├── data/
│   ├── generators.ts      # Sample data generators
│   ├── samples.ts         # Sample data
│   └── constants.ts       # App constants
├── utils/
│   ├── index.ts           # Main utils (cn, etc)
│   ├── pricing.ts         # Pricing calculations
│   ├── decorations.ts     # Decoration templates
│   └── validators.ts      # Validation helpers
└── README.md              # Library documentation
```

---

## Migration Steps (For Future Implementation)

### Step 1: Create New Directory Structure
```bash
mkdir -p src/components/{shared,quotes,jobs,customers,catalog,inventory,settings,reports,auth,dashboard}
mkdir -p src/services/{suppliers,email,sms,webhooks,export}
mkdir -p src/lib/{types,data,utils}
```

### Step 2: Move Components by Domain

**Quotes**
```bash
mv QuotesList.tsx components/quotes/
mv QuoteCard.tsx components/quotes/
mv QuoteBuilder.tsx components/quotes/
# ... etc
```

**Jobs**
```bash
mv JobsBoard.tsx components/jobs/
mv JobCard.tsx components/jobs/
# ... etc
```

### Step 3: Update Import Paths
After moving files, update all imports:
```typescript
// Before
import { QuotesList } from '@/components/QuotesList'

// After
import { QuotesList } from '@/components/quotes/QuotesList'
```

### Step 4: Create Index Files for Easy Imports
```typescript
// src/components/quotes/index.ts
export * from './QuotesList'
export * from './QuoteCard'
export * from './QuoteBuilder'
// ...

// Usage
import { QuotesList, QuoteCard } from '@/components/quotes'
```

### Step 5: Reorganize Services
```bash
mv src/lib/ssactivewear-api.ts src/services/suppliers/ssactivewear.ts
mv src/lib/sanmar-api.ts src/services/suppliers/sanmar.ts
mv src/lib/email-notifications.ts src/services/email/notifications.ts
# ... etc
```

### Step 6: Split Types File
```bash
# Create type files by domain
src/lib/types/quote.ts
src/lib/types/job.ts
src/lib/types/customer.ts
# ... etc
```

---

## Benefits of New Structure

### Developer Experience
- **Discoverability**: Easy to find related components
- **Onboarding**: Clear structure helps new developers understand the codebase
- **Maintainability**: Changes are localized to specific domains

### Scalability
- **Independent Development**: Teams can work on different domains without conflicts
- **Feature Isolation**: New features can be added without affecting existing code
- **Code Reuse**: Shared components are clearly separated from domain-specific ones

### Performance
- **Code Splitting**: Easier to implement lazy loading by domain
- **Bundle Optimization**: Can optimize bundles per feature
- **Tree Shaking**: Better dead code elimination

---

## Component Map Reference

### Current → New Location

| Current File | New Location | Domain |
|-------------|--------------|---------|
| QuotesList.tsx | components/quotes/ | Quotes |
| QuoteCard.tsx | components/quotes/ | Quotes |
| QuoteBuilder.tsx | components/quotes/ | Quotes |
| JobsBoard.tsx | components/jobs/ | Jobs |
| JobCard.tsx | components/jobs/ | Jobs |
| CustomersList.tsx | components/customers/ | Customers |
| CustomerDetail.tsx | components/customers/ | Customers |
| ProductCatalog.tsx | components/catalog/ | Catalog |
| PurchaseOrderManager.tsx | components/inventory/ | Inventory |
| Settings.tsx | components/settings/ | Settings |
| Reports.tsx | components/reports/ | Reports |
| Home.tsx | components/dashboard/ | Dashboard |
| Login.tsx | components/auth/ | Auth |
| GlobalSearch.tsx | components/shared/ | Shared |
| StatusBadge.tsx | components/shared/ | Shared |

### Services Map

| Current File | New Location | Purpose |
|-------------|--------------|---------|
| ssactivewear-api.ts | services/suppliers/ssactivewear.ts | Supplier API |
| sanmar-api.ts | services/suppliers/sanmar.ts | Supplier API |
| email-notifications.ts | services/email/notifications.ts | Email service |
| email-preferences.ts | services/email/preferences.ts | Email service |
| twilio-sms.ts | services/sms/twilio.ts | SMS service |
| webhook-processor.ts | services/webhooks/processor.ts | Webhook handling |
| csv-export.ts | services/export/csv.ts | Export utilities |
| invoice-generator.ts | services/export/invoice.ts | Export utilities |

---

## Implementation Priority

### Phase 1 (High Priority - Foundation)
1. ✅ Create ARCHITECTURE.md documentation
2. ✅ Create COMPONENT_MAP.md reference
3. Create directory structure (without moving files yet)
4. Create index.ts files for barrel exports

### Phase 2 (Medium Priority - Documentation)
1. Document each domain's responsibilities
2. Create component dependency graphs
3. Update API documentation with new paths
4. Create migration scripts

### Phase 3 (Low Priority - Actual Migration)
1. Move shared components first
2. Move domain components (one domain at a time)
3. Update import paths progressively
4. Test each domain after migration
5. Remove old directories when complete

---

## Notes for Future Developers

### DO NOT Modify During Migration
- `src/components/ui/` - shadcn components
- `src/main.tsx` - Entry point
- `src/main.css` - Structural CSS
- `vite.config.ts` - Vite configuration

### Safe to Refactor
- All components in `src/components/` (except ui/)
- All files in `src/lib/`
- All hooks in `src/hooks/`
- `src/App.tsx` (with care)

### Testing After Migration
1. Build the app: `npm run build`
2. Check for TypeScript errors
3. Test all major workflows:
   - Create quote → convert to job
   - Customer management
   - Product catalog search
   - Settings configuration

---

## Questions?

Refer to:
- `ARCHITECTURE.md` - Overall architecture
- `DOCUMENTATION.md` - Feature documentation
- `API_DOCUMENTATION.md` - API guides
- `TROUBLESHOOTING.md` - Common issues
