# Feature Reference Guide

Complete reference of all features in Mint Prints with their locations and key files.

---

## Dashboard & Home

### Home Dashboard
**Location**: `src/components/Home.tsx`

**Features**:
- Active jobs overview (excluding quotes and completed)
- Follow-up needed section (quotes from past month not approved)
- Recent quotes
- Quick action buttons

**Related Components**:
- `QuoteCard.tsx` - Quote preview cards
- `JobCard.tsx` - Job preview cards
- `StatusBadge.tsx` - Status indicators

**Data Used**:
- `quotes` (KV: `quotes`)
- `jobs` (KV: `jobs`)
- `customers` (KV: `customers`)

---

## Quote Management

### Quote List View
**Location**: `src/components/QuotesList.tsx`

**Features**:
- Search and filter quotes
- Bulk operations (status change, delete)
- Filter presets (save/load/pin)
- Recent searches
- Send bulk emails
- Export to CSV

**Related Components**:
- `QuoteCard.tsx` - Individual quote cards
- `StatusFilterPills.tsx` - Quick status filters
- `FilterPresetManager.tsx` - Save/manage filter combinations
- `RecentSearchesDropdown.tsx` - Quick access to recent searches
- `BulkQuoteReminders.tsx` - Send reminder emails in bulk

**Data Used**:
- `quotes` (KV: `quotes`)
- `filterPresets` (KV: `filter-presets`)
- `recentSearches` (KV: `recent-searches`)
- `emailTemplates` (KV: `email-templates`)

### Quote Builder
**Location**: `src/components/QuoteBuilder.tsx`

**Features**:
- Create/edit quotes
- Customer selection and creation
- Product search (S&S Activewear, SanMar integration)
- Line item management
- Decoration configuration
- Pricing calculations with automatic rules
- Quote templates
- Payment reminders
- Email quote to customer
- Convert to job
- Duplicate quote

**Related Components**:
- `LineItemGrid.tsx` - Line items table
- `SizeInputRow.tsx` - Size breakdown input
- `DecorationManager.tsx` - Decoration configuration
- `PricingSummary.tsx` - Price breakdown
- `SKULookupDialog.tsx` - Product search dialog
- `CopyDecorationsDialog.tsx` - Copy decorations between items
- `BulkCopyDecorationsDialog.tsx` - Copy to multiple items
- `SaveDecorationTemplateDialog.tsx` - Save decoration template
- `ProductMockup.tsx` - Visual product preview
- `ProductMockupWithSize.tsx` - Product with size selection
- `FavoriteProductQuickAdd.tsx` - Quick add favorite products
- `ProductTemplateQuickAdd.tsx` - Quick add from templates
- `PricingRulesIndicator.tsx` - Show active pricing rules
- `PricingRulesSuggestions.tsx` - Suggest applicable rules

**Data Used**:
- `quotes` (KV: `quotes`)
- `customers` (KV: `customers`)
- `customerTemplates` (KV: `customer-decoration-templates`)
- `customerArtworkFiles` (KV: `customer-artwork-files`)
- `paymentReminders` (KV: `payment-reminders`)
- `emailTemplates` (KV: `email-templates`)
- `favoriteProducts` (KV: `favorite-products`)
- `productTemplates` (KV: `product-templates`)
- `pricingRules` (KV: `customer-pricing-rules`)

**Services Used**:
- `ssactivewear-api.ts` - S&S product catalog
- `sanmar-api.ts` - SanMar product catalog
- `pricing-rules.ts` - Pricing calculations

### Quote Templates
**Location**: `src/components/QuoteTemplateManager.tsx`

**Features**:
- Create reusable quote templates
- Save with default customer, line items, discounts, notes
- Track usage count and last used
- Quick create from template

**Related Components**:
- Used in: `Settings.tsx`

**Data Used**:
- `quoteTemplates` (KV: `quote-templates`)

### Quote History
**Location**: `src/components/QuoteHistory.tsx`

**Features**:
- View quote version history
- Track changes over time

**Related Components**:
- Used in: `CustomerDetail.tsx`

---

## Job Management

### Jobs Board
**Location**: `src/components/JobsBoard.tsx`

**Features**:
- Kanban-style job board
- Search and filter jobs
- Bulk operations (status change, delete)
- Filter presets
- Recent searches
- Job nickname editing
- Quick status updates

**Related Components**:
- `JobCard.tsx` - Individual job cards
- `StatusFilterPills.tsx` - Quick status filters
- `FilterPresetManager.tsx` - Filter management

**Data Used**:
- `jobs` (KV: `jobs`)
- `customers` (KV: `customers`)
- `filterPresets` (KV: `filter-presets`)
- `recentSearches` (KV: `recent-searches`)

### Job Detail
**Location**: `src/components/JobDetail.tsx`

**Features**:
- View complete job details
- Update production notes
- Track expenses
- Artwork approval workflow
- Department notifications

**Related Components**:
- `JobHistory.tsx` - Job change history
- `ExpenseTracker.tsx` - Track job expenses
- `JobArtworkReview.tsx` - Artwork approval interface
- `ArtworkApprovalWorkflow.tsx` - Multi-step artwork review
- `ArtworkUpload.tsx` - Upload artwork files
- `JobDepartmentNotification.tsx` - Notify departments

**Data Used**:
- `jobs` (KV: `jobs`)

### Production Calendar
**Location**: `src/components/ProductionCalendar.tsx`

**Features**:
- Calendar view of jobs
- Due date visualization
- Production scheduling

**Related Components**:
- Used in: `Reports.tsx`

---

## Customer Management

### Customer List
**Location**: `src/components/CustomersList.tsx`

**Features**:
- Search customers
- Filter by tier, activity
- Customer statistics (total spent, quote/job counts)
- Quick quote creation

**Related Components**:
- `CustomerSearch.tsx` - Customer search component

**Data Used**:
- `customers` (KV: `customers`)
- `quotes` (KV: `quotes`)
- `jobs` (KV: `jobs`)
- `filterPresets` (KV: `filter-presets`)
- `recentSearches` (KV: `recent-searches`)

### Customer Detail
**Location**: `src/components/CustomerDetail.tsx`

**Features**:
- Edit customer info
- Customer tier selection
- Collapsible email preferences
- Collapsible email notification history
- Collapsible artwork library
- Tax certificate management
- SMS opt-out management
- View customer quotes and jobs
- Quick quote creation
- Send custom emails

**Related Components**:
- `CustomerEmailPreferences.tsx` - Email preference settings
- `CustomerArtworkLibrary.tsx` - Customer artwork files
- `CustomerSmsOptOuts.tsx` - SMS preferences
- `TaxCertManager.tsx` - Tax exemption certificates
- `EmailNotificationHistory.tsx` - Email history view
- `EmailPreferenceIndicator.tsx` - Preference status badge
- `SendCustomEmailDialog.tsx` - Send custom email
- `PaymentReminders.tsx` - Payment reminder settings
- `PaymentTracker.tsx` - Track payments

**Data Used**:
- `customers` (KV: `customers`)
- `quotes` (KV: `quotes`)
- `jobs` (KV: `jobs`)
- `customerArtworkFiles` (KV: `customer-artwork-files`)
- `taxCertificates` (KV: `tax-certificates`)
- `emailNotifications` (KV: `email-notifications`)

**Services Used**:
- `email-preferences.ts` - Email preference defaults

---

## Product Catalog

### Product Catalog
**Location**: `src/components/ProductCatalog.tsx`

**Features**:
- Search S&S Activewear and SanMar products
- Save favorite products
- Create product templates
- View product images
- Color swatches
- Stock level indicators
- Historical stock trends

**Related Components**:
- `ProductStockTrends.tsx` - Stock history charts
- `ProductTemplateManager.tsx` - Manage product templates
- `InventoryAlerts.tsx` - Low stock alerts

**Data Used**:
- `favoriteProducts` (KV: `favorite-products`)
- `productTemplates` (KV: `product-templates`)

**Services Used**:
- `ssactivewear-api.ts` - S&S product data
- `sanmar-api.ts` - SanMar product data

---

## Inventory & Purchase Orders

### Purchase Order Manager
**Location**: `src/components/PurchaseOrderManager.tsx`

**Features**:
- Create purchase orders
- Track multiple quotes per PO
- Receive inventory
- Mark items for specific quotes
- Supplier tracking

**Related Components**:
- `PurchaseOrderCard.tsx` - PO cards
- `CreatePurchaseOrderDialog.tsx` - Create new PO
- `ReceiveInventoryDialog.tsx` - Receive shipments
- `SupplierPerformance.tsx` - Supplier metrics
- `SupplierMetricsCard.tsx` - Supplier KPIs
- `SupplierPerformanceChart.tsx` - Performance graphs
- `SupplierIssuesLog.tsx` - Track supplier problems

**Data Used**:
- `purchaseOrders` (KV: `purchase-orders`)
- `quotes` (KV: `quotes`)

**Services Used**:
- `sample-purchase-orders.ts` - Sample data generator

---

## Settings

### Settings Hub
**Location**: `src/components/Settings.tsx`

**Features**:
- Multi-tab settings interface
- Supplier API configuration
- Email template management
- SMS template management
- Pricing rules configuration
- Quote template management
- Webhook management
- Theme customization
- Purchase order management

**Related Components**:
- `EmailTemplatesManager.tsx` - Email templates
- `SmsTemplates.tsx` - SMS templates
- `ScheduledEmailsManager.tsx` - Scheduled emails
- `EmailStats.tsx` - Email analytics
- `PricingRulesManager.tsx` - Customer pricing rules
- `QuoteTemplateManager.tsx` - Quote templates
- `WebhookManager.tsx` - Webhook configuration
- `WebhookDashboard.tsx` - Webhook overview
- `WebhookAnalytics.tsx` - Webhook reliability metrics
- `WebhookEventViewer.tsx` - View webhook events
- `PurchaseOrderManager.tsx` - PO management

**Data Used**:
- All KV stores (settings is a hub)
- `ssActivewearCreds` (KV: `ssactivewear-credentials`)
- `sanMarCreds` (KV: `sanmar-credentials`)

**Services Used**:
- `ssactivewear-api.ts`
- `sanmar-api.ts`
- `webhook-processor.ts`

---

## Reporting

### Reports Dashboard
**Location**: `src/components/Reports.tsx`

**Features**:
- Sales analytics
- Quote conversion rates
- Job completion metrics
- Customer insights
- Revenue tracking
- Production calendar

**Related Components**:
- `UnpaidBalancesReport.tsx` - Outstanding invoices
- `ProductionCalendar.tsx` - Production schedule

**Data Used**:
- `quotes` (KV: `quotes`)
- `jobs` (KV: `jobs`)
- `customers` (KV: `customers`)

**Services Used**:
- `csv-export.ts` - Export reports
- `batch-invoice-export.ts` - Batch invoicing

---

## Shared Components

### Global Search
**Location**: `src/components/GlobalSearch.tsx`

**Features**:
- Search across quotes, jobs, customers
- Keyboard shortcut (⌘+K)
- Quick navigation

**Data Used**:
- `quotes`, `jobs`, `customers`

### Keyboard Shortcuts
**Location**: `src/components/KeyboardShortcutsHelp.tsx`

**Features**:
- Display all keyboard shortcuts
- Context-aware help

**Shortcuts**:
- `⌘+N` - New quote/job/customer
- `⌘+K` - Focus search
- `⌘+1-7` - Navigate sections
- `⌘+?` - Show shortcuts
- `Esc` - Close dialogs

### Status Components
**Location**: 
- `src/components/StatusBadge.tsx` - Status badges
- `src/components/StatusFilterPills.tsx` - Filter pills

**Features**:
- Visual status indicators
- Clickable to filter by status
- Consistent styling

---

## Email System

### Email Notifications
**Service**: `src/lib/email-notifications.ts`

**Features**:
- Quote approval requests
- Quote approved confirmations
- Invoice emails
- Custom emails
- Template-based emails

**Related Components**:
- `EmailNotificationHistory.tsx` - View sent emails
- `EmailTemplatesManager.tsx` - Manage templates
- `EmailStats.tsx` - Email analytics
- `ScheduledEmailsManager.tsx` - Schedule emails

**Data Used**:
- `emailNotifications` (KV: `email-notifications`)
- `emailTemplates` (KV: `email-templates`)

### Email Preferences
**Service**: `src/lib/email-preferences.ts`

**Features**:
- Per-customer email preferences
- Opt-in/opt-out management
- Default preferences for new customers

**Related Components**:
- `CustomerEmailPreferences.tsx`
- `EmailPreferenceIndicator.tsx`

---

## Webhook System

### Webhook Processing
**Service**: `src/lib/webhook-processor.ts`

**Features**:
- Real-time supplier inventory updates
- Price change notifications
- Order status changes
- Event validation and routing

**Types**: `src/lib/webhook-types.ts`

**Related Components**:
- `WebhookManager.tsx` - Configure webhooks
- `WebhookDashboard.tsx` - Monitor webhooks
- `WebhookAnalytics.tsx` - Reliability metrics
- `WebhookEventViewer.tsx` - View events

**Data Used**:
- Webhook events processed in real-time
- Analytics tracked separately

---

## Export & Integration

### CSV Export
**Service**: `src/lib/csv-export.ts`

**Features**:
- Export quotes to CSV
- Export jobs to CSV
- Export customers to CSV

### Invoice Generation
**Services**:
- `src/lib/invoice-generator.ts` - PDF generation
- `src/lib/invoice-email.ts` - Invoice emails
- `src/lib/batch-invoice-export.ts` - Bulk invoicing

### SMS Notifications
**Service**: `src/lib/twilio-sms.ts`

**Features**:
- Send SMS via Twilio
- Template-based SMS
- Customer opt-out management

**Related Components**:
- `SmsTemplates.tsx`
- `CustomerSmsOptOuts.tsx`

---

## Loading & Error Handling

### Loading Skeletons
**Location**: `src/components/skeletons/`

**Features**:
- Skeleton loaders for async operations
- Smooth loading experience
- Consistent patterns

### Error Boundary
**Location**: `src/components/AsyncBoundary.tsx`

**Features**:
- Catch React errors
- Display error fallback
- Error reporting

---

## Authentication

### Login
**Location**: `src/components/Login.tsx`

**Features**:
- Simple login interface
- Session management with KV

**Data Used**:
- `isLoggedIn` (KV: `is-logged-in`)

---

## Utility Hooks

**Location**: `src/hooks/`

### Available Hooks
- `use-mobile.ts` - Responsive breakpoint detection
- `use-keyboard-shortcuts.ts` - Keyboard shortcut registration
- `use-loading-state.ts` - Loading state management

---

## Data Flow Summary

### State Management
```
App.tsx (Root State)
    ↓
useKV hooks (Persistent Storage)
    ↓
Props passed to components
    ↓
Event handlers bubble back up
    ↓
State updates via setters
```

### Event Flow Example: Create Quote
```
1. User clicks "New Quote" button
2. handleNewQuote() in App.tsx
3. createEmptyQuote() generates template
4. setCurrentPage({ type: 'quote-builder', quote })
5. QuoteBuilder component renders
6. User edits quote
7. onSave(quote) bubbles up
8. handleSaveQuote(quote) in App.tsx
9. setQuotes() updates KV store
10. Component re-renders with new data
```

---

## Key Integration Points

### Supplier APIs
- **Entry Point**: Quote Builder product search
- **Configuration**: Settings > Suppliers tab
- **Files**: `ssactivewear-api.ts`, `sanmar-api.ts`

### Email System
- **Entry Point**: Quote Builder, Customer Detail
- **Configuration**: Settings > Email Templates
- **Files**: `email-notifications.ts`, `email-preferences.ts`

### Webhooks
- **Entry Point**: Settings > Webhooks tab
- **Processing**: `webhook-processor.ts`
- **Monitoring**: Webhook Dashboard

---

## Quick Reference: Where to Find Things

| I want to... | Go to... |
|-------------|----------|
| Add a quote field | `lib/types.ts` → `lib/data.ts` → `QuoteBuilder.tsx` |
| Change theme colors | `index.css` (CSS variables) |
| Add email template | `lib/data.ts` (sampleEmailTemplates) |
| Add new status | `lib/constants.ts` → `StatusBadge.tsx` |
| Configure supplier | Settings > Suppliers |
| Create report | `Reports.tsx` |
| Add keyboard shortcut | `App.tsx` (useKeyboardShortcuts) |
| Customize PO flow | `PurchaseOrderManager.tsx` |
| Add pricing rule | Settings > Pricing Rules |

---

## Related Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Developer onboarding
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) - Future organization plan
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API integration guides
