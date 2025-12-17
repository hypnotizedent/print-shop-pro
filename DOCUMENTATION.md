# Mint Prints - Print Shop Management System
## Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Data Models](#data-models)
6. [User Workflows](#user-workflows)
7. [Component Library](#component-library)
8. [State Management](#state-management)
9. [API Integrations](#api-integrations)
10. [Development Guide](#development-guide)
11. [Feature Deep Dives](#feature-deep-dives)
12. [Design System](#design-system)

---

## Project Overview

**Mint Prints** is a comprehensive print shop management dashboard designed for screen printing and custom apparel businesses. It streamlines the entire workflow from quote creation through job production, delivery, and payment tracking.

### Primary Use Case
Print shops that need to:
- Create quotes for custom apparel orders
- Convert approved quotes to production jobs
- Track job progress through multiple production stages
- Manage customer relationships and order history
- Integrate with supplier APIs (S&S Activewear, SanMar)
- Handle purchase orders and inventory receiving
- Track payments and send automated reminders
- Manage artwork approval workflows

### Target Users
- Print shop owners
- Sales representatives
- Production managers
- Artwork/design teams
- Receiving/inventory staff

---

## Architecture & Technology Stack

### Frontend Framework
- **React 19.2.0** - UI library with hooks-based architecture
- **TypeScript 5.7.3** - Type-safe development
- **Vite 7.2.6** - Build tool and dev server

### UI Component Libraries
- **shadcn/ui v4** - 40+ pre-built components in `/src/components/ui`
- **Radix UI** - Headless component primitives
- **Tailwind CSS 4.1.17** - Utility-first styling
- **Framer Motion 12.23.25** - Animation library
- **Phosphor Icons 2.1.10** - Icon system

### State Management
- **useKV Hook** - Persistent state via Spark runtime (`@github/spark/hooks`)
- **React useState** - Transient UI state
- **Local Storage** - Theme color persistence

### Data & APIs
- **Spark KV Store** - Client-side persistence
- **S&S Activewear API** - Product catalog integration
- **SanMar API** - Product catalog integration
- **Spark LLM API** - AI-powered features (available but not currently used)

### Form Management
- **React Hook Form 7.67.0** - Form state and validation
- **Zod 3.25.76** - Schema validation

### Other Key Libraries
- **Sonner 2.0.7** - Toast notifications
- **date-fns 3.6.0** - Date manipulation
- **D3 7.9.0** - Data visualization
- **Recharts 2.15.4** - Chart components
- **marked 15.0.12** - Markdown rendering

---

## Project Structure

```
/workspaces/spark-template/
├── src/
│   ├── App.tsx                      # Main application component & routing
│   ├── ErrorFallback.tsx            # Error boundary fallback UI
│   ├── main.tsx                     # React mount point (DO NOT EDIT)
│   ├── main.css                     # Structural CSS (DO NOT EDIT)
│   ├── index.css                    # Theme variables & custom styles
│   │
│   ├── components/                  # React components
│   │   ├── ui/                      # shadcn components (40+ files)
│   │   ├── skeletons/              # Loading skeleton components
│   │   ├── Home.tsx                 # Dashboard overview
│   │   ├── Login.tsx                # Authentication page
│   │   ├── QuotesList.tsx           # Quote list view
│   │   ├── QuoteBuilder.tsx         # Quote creation/editing
│   │   ├── JobsBoard.tsx            # Job list & kanban view
│   │   ├── JobDetail.tsx            # Expanded job view
│   │   ├── CustomersList.tsx        # Customer list view
│   │   ├── CustomerDetail.tsx       # Customer profile & history
│   │   ├── ProductCatalog.tsx       # Supplier product browser
│   │   ├── Reports.tsx              # Analytics dashboard
│   │   ├── Settings.tsx             # Configuration & templates
│   │   ├── GlobalSearch.tsx         # Header search component
│   │   ├── LineItemGrid.tsx         # Spreadsheet-style line items
│   │   ├── PricingSummary.tsx       # Real-time quote totals
│   │   ├── StatusBadge.tsx          # Status indicator component
│   │   ├── DecorationManager.tsx    # Decoration editing UI
│   │   ├── ArtworkUpload.tsx        # File upload component
│   │   ├── ArtworkApprovalWorkflow.tsx  # Multi-stage approval
│   │   ├── PaymentTracker.tsx       # Payment history & recording
│   │   ├── PaymentReminders.tsx     # Automated reminder config
│   │   ├── ExpenseTracker.tsx       # Job COGS tracking
│   │   ├── PurchaseOrderManager.tsx # PO creation & receiving
│   │   ├── SupplierPerformance.tsx  # Supplier analytics
│   │   ├── EmailTemplatesManager.tsx # Email template editor
│   │   ├── EmailNotificationHistory.tsx # Sent email log
│   │   ├── CustomerEmailPreferences.tsx # Per-customer settings
│   │   ├── CustomerArtworkLibrary.tsx   # Reusable artwork files
│   │   ├── PricingRulesManager.tsx  # Discount rule configuration
│   │   ├── QuoteTemplateManager.tsx # Template CRUD
│   │   ├── ProductTemplateManager.tsx   # Product template CRUD
│   │   ├── TaxCertManager.tsx       # Tax certificate management
│   │   ├── FilterPresetManager.tsx  # Saved filter UI
│   │   ├── ProductionCalendar.tsx   # Weekly job calendar
│   │   ├── KeyboardShortcutsHelp.tsx # Shortcut reference modal
│   │   └── ...many more
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts            # Mobile breakpoint detection
│   │   ├── use-keyboard-shortcuts.ts # Keyboard navigation
│   │   └── use-loading-state.ts     # Loading state management
│   │
│   ├── lib/
│   │   ├── types.ts                 # TypeScript type definitions
│   │   ├── data.ts                  # Sample data & helper functions
│   │   ├── utils.ts                 # Utility functions (cn helper)
│   │   ├── ssactivewear-api.ts      # S&S API client
│   │   ├── sanmar-api.ts            # SanMar API client
│   │   ├── email-notifications.ts   # Email template builders
│   │   ├── invoice-generator.ts     # PDF invoice creation
│   │   ├── pricing-rules.ts         # Discount calculation logic
│   │   ├── decoration-templates.ts  # Decoration preset data
│   │   ├── sample-purchase-orders.ts # PO sample data
│   │   └── ...other utilities
│   │
│   └── styles/
│       └── theme.css                # Additional theme styles
│
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── PRD.md                           # Product Requirements Document
├── DOCUMENTATION.md                 # This file
├── README.md                        # Quick start guide
├── TROUBLESHOOTING.md              # Common issues & solutions
├── AUDIT.md                         # Code audit log
└── SECURITY.md                      # Security considerations
```

---

## Core Features

### 1. Authentication & User Management
- **Login System**: Email/password authentication with session persistence
- **Logout**: Clear session and return to login screen
- **Session Persistence**: Uses `useKV` to maintain login state across page refreshes

### 2. Dashboard (Home)
- **Quick Stats**: Active jobs, follow-up needed quotes, revenue metrics
- **Recent Activity**: Latest quotes and jobs
- **Quick Actions**: Create new quote/job buttons
- **Date Display**: Current date prominently shown instead of generic "Dashboard" title

### 3. Quote Management
- **Quote Builder**: Full-screen interface for creating/editing quotes
  - Customer selection with typeahead search
  - Optional nickname for easy identification
  - Line item grid with spreadsheet-style editing
  - Real-time price calculations
  - Decoration management with templates
  - Payment tracking
  - Email history
  - Status progression (draft → sent → approved/rejected)
  
- **Quote List View**:
  - Filter by status (all, draft, sent, approved, rejected, expired)
  - Search by quote number, customer name, or nickname
  - Sort by date, customer, total, status
  - Saved filter presets
  - Recent searches dropdown
  - Bulk actions (status change, send invoices, export ZIP, delete)
  - Quick status change via dropdown badge on each card

- **Quote Templates**:
  - Pre-configured quotes by category (Events, Retail, Corporate, etc.)
  - One-click quote creation from template
  - Saved line items, decorations, and default settings
  - Usage tracking and analytics

### 4. Job Management
- **Job List View**:
  - Expandable inline detail cards (no separate page)
  - Filter by status and due date
  - Search by job number, nickname, or customer
  - Saved filter presets
  - Production calendar toggle for weekly view
  - Bulk actions (status change, delete)
  - Quick status change via dropdown badge

- **Job Detail** (inline expansion):
  - Product mockup with front/back toggle
  - Customer info and dates
  - Compact status progression bar
  - Line items with artwork preview
  - Production notes (moved above line items)
  - Expense tracking (under "More Actions" menu)
  - Artwork approval workflow
  - Department notification system

- **Production Calendar**:
  - Weekly view organized by due date
  - Color-coded by job status
  - Daily piece count totals
  - Click job to jump to detail

- **Artwork Approval Workflow**:
  - Multi-stage review process (uploaded → internal → customer → final → approved/rejected)
  - Assign reviewers with email notifications
  - Comment and feedback tracking
  - Approval history with timestamps
  - Automated email notifications on approve/reject

### 5. Customer Management
- **Customer List**:
  - Search and filter customers
  - View customer stats (total quotes, jobs, revenue)
  - Customer tier badges (Bronze, Silver, Gold, Platinum)

- **Customer Detail Page**:
  - Contact information with address
  - Email preference management (13 notification types)
  - Quote history with inline status updates
  - Job history
  - Artwork library (reusable files for recurring orders)
  - Tax certificate management
  - Email notification history
  - Collapsible sections to reduce clutter

- **Artwork Library**:
  - Save frequently used artwork (logos, neck tags, labels)
  - Categorize by type
  - Version control with history
  - Quick-add to decorations from library

- **Email Preferences**:
  - Granular control over 13 notification types
  - Grouped by category (Quotes & Approvals, Order & Production, Artwork & Design, Payments & Invoices, Marketing)
  - Auto-save toggles
  - Default preferences for new customers

### 6. Product Catalog
- **Supplier Integration**:
  - S&S Activewear API integration
  - SanMar API integration
  - Product search by name or SKU
  - Color swatch previews
  - Product image previews
  - Stock level indicators
  - Historical stock trends

- **Favorites & Templates**:
  - Save favorite products for quick access
  - Create product templates with pre-configured decorations
  - Quick-add buttons in quote builder

### 7. Purchase Order Management
- **PO Creation**:
  - Select multiple quotes/jobs to consolidate
  - Products grouped by style/color/size
  - Shows which orders need each product
  - Shipping and tax calculations
  - Save as draft or mark as ordered

- **Inventory Receiving**:
  - Track received quantities by size
  - Assign received items to specific orders
  - Partial receive support
  - Receiving history tracking
  - Helps receiving team know which garments go to which customer

- **Supplier Performance**:
  - Delivery time tracking
  - Order accuracy metrics
  - Cost trend analysis

### 8. Payment & Financial Tracking
- **Payment Tracker**:
  - Record manual payments (cash, check, Venmo, Zelle, PayPal, etc.)
  - Payment history with method badges
  - Real-time balance calculations (total, paid, balance due)

- **Payment Reminders**:
  - Automated email reminders at configurable intervals (1, 3, 7, 14, 30, 60 days)
  - Manual reminder sending
  - SMS reminders for high-priority overdue payments via Twilio
  - Customizable email and SMS templates with dynamic variables
  - Customer SMS opt-out management

- **Expense Tracking**:
  - Record job expenses by category (materials, labor, shipping, etc.)
  - Quantity × unit cost calculations
  - Vendor and invoice number tracking
  - Real-time profit margin calculations
  - COGS visibility

- **Unpaid Balances Report**:
  - Dashboard showing all outstanding balances
  - Sort by amount or days overdue
  - High-priority indicators
  - Quick navigation to quotes

### 9. Invoice Generation
- **PDF Invoices**:
  - Professional formatted invoices from approved quotes
  - Includes all quote details, line items, pricing
  - Download as PDF or send via email
  - Bulk export as ZIP file
  - Email drafts pre-filled with customer info

### 10. Email & Communication
- **Email Templates**:
  - Customizable templates for all notification types
  - Dynamic variables (customer name, quote number, amounts, dates, etc.)
  - Logo attachment support for quote reminders
  - Preview with sample data
  - Active/inactive toggle

- **Email Notification History**:
  - Log of all sent emails
  - Searchable by customer, type, date
  - View email content and recipients

- **SMS Notifications**:
  - Twilio integration for SMS reminders
  - Customizable SMS templates
  - Character count and segment tracking
  - Customer opt-out management
  - Compliance warnings

### 11. Pricing & Discounts
- **Pricing Rules**:
  - Automatic discounts based on customer tier
  - Volume-based discounts by quantity
  - Product category discounts
  - Priority-based rule evaluation
  - Suggested discounts in quote builder (manual approval)

- **Manual Discounts**:
  - Percentage or fixed amount
  - Apply to entire quote or individual line items
  - Real-time total updates

### 12. Reports & Analytics
- **Revenue Metrics**:
  - Total revenue by time period
  - Quote value vs. approved value
  - Average quote size

- **Status Breakdowns**:
  - Quote status distribution
  - Job status distribution
  - Conversion rates

- **Customer Rankings**:
  - Top customers by revenue
  - Customer tier distribution
  - Quote/job counts per customer

- **Unpaid Balances**:
  - Total outstanding
  - Overdue amounts
  - Active reminder counts

### 13. Settings & Configuration
- **Quote Templates**: Create and manage quote templates by category
- **Email Templates**: Customize notification email content and styling
- **SMS Templates**: Create and manage SMS message templates
- **Purchase Orders**: View and manage all purchase orders
- **Pricing Rules**: Configure automatic discount rules
- **Customer Opt-Outs**: Manage SMS communication preferences
- **API Credentials**: Configure S&S Activewear and SanMar API keys
- **Theme Colors**: Customize primary and accent colors (stored in localStorage)

### 14. User Experience Enhancements
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + N`: New quote/job (context-aware)
  - `Cmd/Ctrl + S`: Save quote/job
  - `Cmd/Ctrl + K`: Focus global search
  - `Cmd/Ctrl + 1-7`: Navigate to views
  - `Shift + ?`: Show keyboard shortcuts help
  - `Escape`: Close modals, exit detail views

- **Global Search**:
  - Search across customers, quotes, and jobs
  - Shows results from all entity types
  - Quick navigation to detail view

- **Filter Presets**:
  - Save frequently used filter combinations
  - Pin favorites for quick access
  - Recent searches dropdown

- **Loading Skeletons**:
  - Smooth loading states for all views
  - Match final layout structure
  - Prevent layout shift

---

## Data Models

### Core Types

#### Quote
```typescript
{
  id: string                    // Q-XXXXXXXX
  quote_number: string          // Display number
  nickname?: string             // Optional friendly name
  customer: Customer            // Embedded customer object
  line_items: LineItem[]        // Products and decorations
  subtotal: number              // Before discounts
  discount: number              // Discount value
  discount_type: 'percent' | 'fixed'
  tax_rate: number              // Percentage
  tax_amount: number            // Calculated
  total: number                 // Final amount
  status: QuoteStatus           // draft | sent | approved | rejected | expired
  created_date: string          // ISO date
  due_date: string              // ISO date
  valid_until?: string          // ISO date
  notes_customer?: string       // Customer-facing notes
  notes_internal?: string       // Internal-only notes
  payments?: Payment[]          // Payment history
}
```

#### Job
```typescript
{
  id: string                    // j-XXXXXXXX
  job_number: string            // JOB-XXXXXXXX
  quote_id: string              // Reference to source quote
  nickname?: string             // Optional friendly name
  customer: Customer            // Embedded customer object
  line_items: LineItem[]        // Products and decorations
  status: JobStatus             // pending | art-approval | scheduled | printing | finishing | ready | shipped | delivered
  due_date: string              // ISO date
  ship_date?: string            // ISO date
  production_notes?: string     // Production instructions
  artwork_approved: boolean     // All artwork approved flag
  assigned_to: string[]         // Team member assignments
  progress: number              // 0-100
  expenses?: Expense[]          // COGS tracking
}
```

#### Customer
```typescript
{
  id: string                    // c-XXXXXXXX
  name: string                  // Full name
  email: string                 // Primary email
  phone?: string                // Phone number
  company?: string              // Company name
  tier?: CustomerTier           // bronze | silver | gold | platinum
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
  emailPreferences?: CustomerEmailPreferences  // 13 notification toggles
}
```

#### LineItem
```typescript
{
  id: string                    // li-XXXXXXXX
  product_name: string          // Product display name
  product_sku?: string          // Supplier SKU
  product_type: ProductType     // tshirt | hoodie | polo | hat | other
  color: string                 // Color name
  sizes: {
    [size: string]: number      // Size → quantity map
  }
  unit_price: number            // Per-item price
  setup_fee: number             // One-time setup
  decorations: Decoration[]     // Print/embroidery details
  subtotal: number              // Calculated
}
```

#### Decoration
```typescript
{
  id: string                    // Unique ID
  location: string              // Front, Back, Left Chest, etc.
  decoration_type: DecorationType  // screen-print | dtg | embroidery | vinyl | digital-print | digital-transfer | other
  colors: number                // Number of ink colors
  imprint_width: number         // Inches
  imprint_height: number        // Inches
  setup_fee: number             // Per-location setup
  unit_cost: number             // Per-item decoration cost
  artwork?: LegacyArtworkFile[] // Uploaded files (legacy)
  artworkFileId?: string        // Reference to CustomerArtworkFile
  notes?: string                // Special instructions
}
```

#### CustomerArtworkFile
```typescript
{
  id: string                    // Unique ID
  customerId: string            // Owner
  name: string                  // Display name
  category: 'neck-tag' | 'private-label' | 'logo' | 'graphic' | 'other'
  description?: string          // File description
  fileUrl: string               // Data URL or external URL
  fileSize: number              // Bytes
  fileName: string              // Original filename
  imprintWidth?: number         // Inches
  imprintHeight?: number        // Inches
  notes?: string                // Additional info
  currentVersion: number        // Version number
  versionHistory: ArtworkVersion[]  // Previous versions
  createdAt: string             // ISO date
  updatedAt: string             // ISO date
}
```

#### PurchaseOrder
```typescript
{
  id: string                    // po-XXXXXXXX
  poNumber: string              // PO-XXXXXXXX
  supplier: 'ssactivewear' | 'sanmar'
  orderDate: string             // ISO date
  expectedDelivery?: string     // ISO date
  status: 'draft' | 'ordered' | 'partially-received' | 'received' | 'cancelled'
  lineItems: POLineItem[]       // Consolidated products
  associatedOrders: {
    quoteId: string
    customerId: string
    customerName: string
    sizes: { [size: string]: number }
  }[]
  shipping: number              // Shipping cost
  tax: number                   // Tax amount
  total: number                 // Total cost
  trackingNumber?: string       // Shipping tracking
  notes?: string                // Order notes
  receivingHistory: ReceivingRecord[]  // Receive events
  createdAt: string             // ISO date
  updatedAt: string             // ISO date
}
```

#### EmailNotification
```typescript
{
  id: string                    // Unique ID
  customerId: string            // Recipient
  customerEmail: string         // Email address
  type: 'quote-approval-request' | 'quote-approved' | 'invoice' | 'artwork-approval' | 'payment-reminder' | ...
  subject: string               // Email subject
  body: string                  // Email body (HTML or plain text)
  sentAt: string                // ISO timestamp
  sentBy: string                // User who sent
  relatedEntityId?: string      // Quote/Job ID
  attachments?: EmailAttachment[]  // Files
}
```

#### PaymentReminder
```typescript
{
  quoteId: string               // Target quote
  enabled: boolean              // Active/inactive
  intervals: number[]           // Days array [1, 3, 7, 14, 30, 60]
  lastSent?: string             // ISO date
  nextScheduled?: string        // ISO date
  emailsSent: number            // Count
  highPriority: boolean         // SMS eligible
  smsEnabled: boolean           // Send SMS when overdue
  phoneNumber?: string          // Customer phone
  smsSent: number               // SMS count
  lastSmsSent?: string          // ISO date
}
```

#### FilterPreset
```typescript
{
  id: string                    // Unique ID
  name: string                  // Display name
  context: 'quotes' | 'jobs' | 'customers'
  filters: {
    status?: string[]           // Status filters
    dateRange?: { start: string, end: string }
    customerId?: string         // Customer filter
    searchQuery?: string        // Search term
  }
  isPinned: boolean             // Show in quick access
  createdAt: string             // ISO date
  lastUsed: string              // ISO date
}
```

---

## User Workflows

### Quote to Job Workflow
```
1. Create Quote
   ↓
2. Select Customer (or create new)
   ↓
3. Add Line Items (products + decorations)
   ↓
4. Set Pricing & Discounts (automatic pricing rules suggest discounts)
   ↓
5. Add Notes & Due Date
   ↓
6. Save as Draft
   ↓
7. Send to Customer (status → "sent", email notification sent)
   ↓
8. Customer Approves (status → "approved", email notification sent)
   ↓
9. Convert to Job (creates Job record, links to Quote)
   ↓
10. Upload Artwork to Job
   ↓
11. Artwork Approval Workflow (multi-stage review)
   ↓
12. Begin Production (status changes: pending → art-approval → scheduled → printing → finishing)
   ↓
13. Complete & Ship (status → shipped/delivered)
   ↓
14. Record Payments (track balance, send reminders if unpaid)
```

### Purchase Order Workflow
```
1. Approved Quotes/Jobs Ready for Production
   ↓
2. Navigate to Settings → Purchase Orders
   ↓
3. Click "New Purchase Order"
   ↓
4. Select Supplier (S&S or SanMar)
   ↓
5. Select Multiple Quotes/Jobs to Consolidate
   ↓
6. System Groups Products by Style/Color/Size
   ↓
7. Review Consolidated Line Items
      (shows "Associated Orders" for each product)
   ↓
8. Add Shipping, Tax, Tracking Number
   ↓
9. Save as Draft or Mark as Ordered
   ↓
10. When Inventory Arrives → Click "Receive"
   ↓
11. Enter Quantities Received by Size
   ↓
12. Optionally Assign to Specific Orders
      (receiving team knows: "these 50 shirts → Quote Q-12345 - ABC Company")
   ↓
13. Save Receiving Record
   ↓
14. PO Status Updates (partially-received → received)
```

### Artwork Approval Workflow
```
1. Upload Artwork to Job Line Item
   ↓
2. Click "Approval Workflow" in Artwork Library
   ↓
3. Artwork Status: "Uploaded"
   ↓
4. Assign Internal Reviewer → Review → Approve/Reject
   ↓
5. If Approved → Status: "Internal Review Complete"
   ↓
6. Assign Customer Reviewer → Email Notification Sent
   ↓
7. Customer Reviews → Approve/Reject (with comments)
   ↓
8. If Approved → Status: "Customer Review Complete"
   ↓
9. Assign Final Approver (Manager) → Review → Approve/Reject
   ↓
10. If Approved → Status: "Final Approval" → Mark as Production-Ready
   ↓
11. All Comments & Feedback Tracked in History
   ↓
12. Automated Email Sent to Customer on Approve/Reject
```

### Payment Reminder Workflow
```
1. Quote Approved with Balance Due
   ↓
2. Open Quote Detail → Payment Tracking Section
   ↓
3. Enable Payment Reminders Toggle
   ↓
4. Select Reminder Intervals (1, 3, 7, 14, 30, 60 days)
   ↓
5. (Optional) Mark as High Priority + Enable SMS
   ↓
6. System Calculates Next Reminder Date
   ↓
7. Automated Email Sent on Schedule
   ↓
8. If High Priority + Overdue → SMS Sent to Customer
   ↓
9. Customer Makes Payment → Record in Payment Tracker
   ↓
10. Balance Updates → Reminders Stop When Fully Paid
```

---

## Component Library

### Custom Components (Business Logic)

#### `QuoteBuilder`
- **Purpose**: Full-screen quote creation and editing interface
- **Key Props**: `quote`, `customers`, `onSave`, `onBack`
- **Features**: Customer search, line item grid, decoration manager, payment tracker, pricing summary
- **State**: Manages quote object with real-time calculations

#### `LineItemGrid`
- **Purpose**: Spreadsheet-style editable table for quote/job line items
- **Key Props**: `lineItems`, `onChange`
- **Features**: Inline editing, keyboard navigation (Tab, Enter, Arrow keys), size input rows, auto-calculation
- **Keyboard**: Tab/Enter to navigate, Escape to cancel edit

#### `DecorationManager`
- **Purpose**: Manage decorations for each line item
- **Key Props**: `lineItem`, `onChange`, `customerTemplates`, `customerArtworkFiles`
- **Features**: Collapsible cards, decoration templates, copy from previous quotes, bulk copy to all items, artwork library integration
- **Templates**: 13+ standard presets (Front Only, Front+Back, Team Jersey, etc.)

#### `JobDetail`
- **Purpose**: Expanded job view with all details
- **Key Props**: `job`, `onUpdateStatus`, `onUpdateArtwork`
- **Features**: Product mockup, status progression, artwork upload, expense tracking, production notes
- **Layout**: Mockup-first on left, compact status bar, inline production notes

#### `CustomerDetail`
- **Purpose**: Customer profile with history and settings
- **Key Props**: `customer`, `quotes`, `jobs`, `onUpdateCustomer`
- **Features**: Contact info editor, email preferences, artwork library, tax certificates, quote/job history
- **Sections**: Collapsible to reduce clutter

#### `PaymentTracker`
- **Purpose**: Record and display payment history
- **Key Props**: `quote`, `onAddPayment`
- **Features**: Payment form with method selection, reference numbers, balance calculations
- **Display**: Total paid, balance due, payment history with badges

#### `PaymentReminders`
- **Purpose**: Configure automated payment reminders
- **Key Props**: `quote`, `reminder`, `onUpdate`
- **Features**: Interval selection, high-priority toggle, SMS configuration, reminder history
- **Automation**: Calculates next send date, tracks sent count

#### `ExpenseTracker`
- **Purpose**: Track job expenses and calculate profit margins
- **Key Props**: `job`, `onAddExpense`
- **Features**: Expense form with categories, quantity × unit cost, vendor tracking
- **Display**: Total expenses, profit, margin % (turns red if negative)

#### `PurchaseOrderManager`
- **Purpose**: Create and manage supplier purchase orders
- **Key Props**: `quotes`, `jobs`, `purchaseOrders`, `onCreate`, `onUpdate`
- **Features**: Multi-order consolidation, receiving interface, order assignment
- **Consolidation**: Groups products by style/color/size, shows associated orders

#### `ArtworkApprovalWorkflow`
- **Purpose**: Multi-stage artwork review and approval
- **Key Props**: `artwork`, `onApprove`, `onReject`, `onAssignReviewer`
- **Features**: 5-stage workflow, reviewer assignment, comment tracking, email notifications
- **Stages**: Uploaded → Internal Review → Customer Review → Final Approval → Approved/Rejected

#### `EmailTemplatesManager`
- **Purpose**: Create and edit email notification templates
- **Key Props**: `templates`, `onSave`, `onDelete`
- **Features**: Dynamic variables, logo upload, preview with sample data, active/inactive toggle
- **Variables**: {customer_name}, {quote_number}, {total_amount}, {due_date}, etc.

#### `PricingRulesManager`
- **Purpose**: Configure automatic discount rules
- **Key Props**: `rules`, `onSave`, `onDelete`
- **Features**: Multiple rule types, condition builder, priority ordering
- **Rule Types**: Tier discount, volume discount, product discount, category discount

#### `ProductCatalog`
- **Purpose**: Browse and search supplier products
- **Key Props**: `favorites`, `templates`, `onAddFavorite`, `onSaveTemplate`
- **Features**: S&S/SanMar search, color swatches, stock levels, favorites, product templates
- **Integration**: Real-time API calls to supplier endpoints

#### `GlobalSearch`
- **Purpose**: Search across all entities from header
- **Key Props**: `quotes`, `jobs`, `customers`, `onSelectQuote`, `onSelectJob`, `onSelectCustomer`
- **Features**: Multi-entity search, keyboard navigation, recent searches
- **Performance**: Debounced input, limits to 10 results

#### `FilterPresetManager`
- **Purpose**: Save and manage filter combinations
- **Key Props**: `presets`, `context`, `onSave`, `onDelete`, `onTogglePin`
- **Features**: Named presets, pin favorites, context-aware (quotes/jobs/customers)

#### `ProductionCalendar`
- **Purpose**: Weekly view of jobs by due date
- **Key Props**: `jobs`, `onSelectJob`
- **Features**: 7-day view, color-coded status, piece count totals, week navigation
- **Display**: Up to 3 jobs per day with "+X more" indicator

### shadcn UI Components (Pre-built)

All located in `/src/components/ui/`:

- **Form Controls**: Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider
- **Layout**: Card, Separator, Tabs, Accordion, Collapsible, Sheet, Drawer, Sidebar
- **Overlays**: Dialog, Popover, Dropdown Menu, Context Menu, Hover Card, Tooltip
- **Feedback**: Alert, Alert Dialog, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Data Display**: Table, Badge, Avatar, Calendar, Chart, Carousel
- **Advanced**: Command (cmd+k), Resizable Panels, Scroll Area, Toggle, Toggle Group

### Icon Usage (Phosphor Icons)

Common icons throughout the app:
- **Plus**: Add new items
- **MagnifyingGlass**: Search inputs
- **Funnel**: Filter controls
- **Gear**: Settings
- **FileText**: Quotes
- **Briefcase**: Jobs
- **Users**: Customers
- **Package**: Products/Catalog
- **ChartBar**: Reports
- **Sparkle**: Logo/branding
- **SignOut**: Logout
- **Keyboard**: Keyboard shortcuts
- **Check**: Approve, complete
- **X**: Reject, cancel, close
- **Clock**: Pending status
- **Truck**: Delivery
- **Printer**: Production
- **Pencil**: Edit
- **Trash**: Delete
- **CaretDown**: Dropdowns
- **ArrowRight**: Progress, navigation

---

## State Management

### Persistent State (useKV)

All data that needs to survive page refreshes is stored using the `useKV` hook from `@github/spark/hooks`. This provides a key-value store with React state integration.

**Usage Pattern**:
```typescript
import { useKV } from '@github/spark/hooks'

const [quotes, setQuotes] = useKV<Quote[]>('quotes', [])

// ❌ WRONG - closure reference is stale
setQuotes([...quotes, newQuote])

// ✅ CORRECT - functional update
setQuotes((current) => [...current, newQuote])
```

**Stored Keys**:
- `is-logged-in`: Boolean - authentication state
- `quotes`: Quote[] - all quotes
- `jobs`: Job[] - all jobs
- `customers`: Customer[] - all customers
- `customer-decoration-templates`: CustomerDecorationTemplate[] - saved decoration templates
- `payment-reminders`: PaymentReminder[] - reminder configurations
- `customer-artwork-files`: CustomerArtworkFile[] - artwork library files
- `email-notifications`: EmailNotification[] - sent email history
- `email-templates`: EmailTemplate[] - custom email templates
- `filter-presets`: FilterPreset[] - saved filter combinations
- `recent-searches`: RecentSearch[] - search history
- `favorite-products`: FavoriteProduct[] - saved favorite products
- `product-templates`: ProductTemplate[] - product configuration templates
- `customer-pricing-rules`: CustomerPricingRule[] - automatic discount rules
- `quote-templates`: QuoteTemplate[] - quote templates by category
- `tax-certificates`: TaxCertificate[] - customer tax certificates
- `purchase-orders`: PurchaseOrder[] - purchase order records
- `ssactivewear-credentials`: SSActivewearCredentials - API credentials
- `sanmar-credentials`: SanMarCredentials - API credentials

### Transient State (useState)

UI state that doesn't need persistence:
- `currentPage`: Current view and navigation state
- `showKeyboardHelp`: Keyboard shortcuts modal visibility
- `isLoading`: Loading indicators
- `searchQuery`: Current search input
- `selectedItems`: Bulk action selections
- `expandedJobId`: Which job detail is currently expanded

### Local Storage (Theme)

Theme color customization stored in localStorage (not useKV):
- `theme-primary-color`: Primary color override
- `theme-accent-color`: Accent color override

Applied on app mount:
```typescript
useEffect(() => {
  const primaryColor = localStorage.getItem('theme-primary-color')
  const accentColor = localStorage.getItem('theme-accent-color')
  
  if (primaryColor) {
    document.documentElement.style.setProperty('--primary', primaryColor)
  }
  if (accentColor) {
    document.documentElement.style.setProperty('--accent', accentColor)
  }
}, [])
```

---

## API Integrations

### S&S Activewear API

**Configuration**: Settings → API tab → S&S Activewear section
- Account Number
- API Key

**Endpoints**:
- `/V2/products/` - Product search and details
- `/V2/styles/` - Style information
- `/V2/categories/` - Product categories

**Features**:
- Product search by name or SKU
- Color availability and swatches
- Stock level indicators
- Historical stock trends
- Image URLs for product previews

**Client**: `/src/lib/ssactivewear-api.ts`

### SanMar API

**Configuration**: Settings → API tab → SanMar section
- Customer ID
- API Key

**Endpoints**:
- Product catalog access
- Style and color information
- Inventory availability

**Features**:
- Product search
- Stock levels
- Product images
- Pricing information

**Client**: `/src/lib/sanmar-api.ts`

### Twilio SMS (Future Integration)

**Configuration**: Settings → SMS tab
- Account SID
- Auth Token
- From Phone Number

**Features**:
- Send payment reminder SMS for high-priority overdue quotes
- Customer opt-out management
- SMS template customization
- Character count and segment tracking

**Client**: `/src/lib/twilio-sms.ts`

---

## Development Guide

### Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Type Check**:
   ```bash
   npm run type-check
   ```

### Project Conventions

#### File Naming
- **Components**: PascalCase (e.g., `QuoteBuilder.tsx`)
- **Utilities**: kebab-case (e.g., `email-notifications.ts`)
- **Types**: PascalCase for interfaces, camelCase for type aliases

#### Component Structure
```typescript
import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from '@phosphor-icons/react'
import type { Quote } from '@/lib/types'

interface MyComponentProps {
  quote: Quote
  onSave: (quote: Quote) => void
}

export function MyComponent({ quote, onSave }: MyComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <Card>
      {/* Component content */}
    </Card>
  )
}
```

#### Styling
- **Tailwind First**: Use Tailwind utility classes
- **No Inline Styles**: Avoid `style` prop unless absolutely necessary
- **Theme Variables**: Use CSS variables from `:root` in `index.css`
- **Responsive**: Mobile-first approach with `md:` and `lg:` breakpoints

#### State Updates
- **Always use functional updates** with `useKV`:
  ```typescript
  setQuotes((current) => [...current, newQuote])  // ✅ Correct
  setQuotes([...quotes, newQuote])                // ❌ Wrong - stale closure
  ```

- **ID Generation**: Use helper functions from `/src/lib/data.ts`:
  ```typescript
  import { generateId } from '@/lib/data'
  const newQuote = { id: generateId('q'), ...otherFields }
  ```

#### Type Safety
- **Import types explicitly**:
  ```typescript
  import type { Quote, Customer } from '@/lib/types'
  ```
- **Define component props interfaces**
- **Use discriminated unions** for complex state (e.g., `Page` type in App.tsx)

### Adding New Features

#### 1. Add to PRD.md
Document the feature's purpose, trigger, progression, and success criteria.

#### 2. Define Types
Add necessary types to `/src/lib/types.ts`.

#### 3. Create Component
Create component file in `/src/components/`.

#### 4. Wire to App.tsx
Add state, handlers, and navigation logic in `App.tsx`.

#### 5. Update Navigation
If needed, add to sidebar or create new view.

#### 6. Test
- Test keyboard navigation
- Test with empty states
- Test bulk actions
- Test persistence (refresh page)

### Common Patterns

#### Modal Dialogs
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

#### Toast Notifications
```typescript
import { toast } from 'sonner'

toast.success('Quote saved successfully')
toast.error('Failed to save quote')
toast('Information message')
toast.warning('Warning message')
```

#### Conditional Rendering
```typescript
{isLoading ? (
  <QuoteListSkeleton />
) : quotes.length === 0 ? (
  <EmptyState message="No quotes yet" />
) : (
  <QuoteList quotes={quotes} />
)}
```

#### Inline Editing
```typescript
const [isEditing, setIsEditing] = useState(false)
const [value, setValue] = useState(initialValue)

{isEditing ? (
  <Input
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onBlur={() => {
      handleSave(value)
      setIsEditing(false)
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        handleSave(value)
        setIsEditing(false)
      }
      if (e.key === 'Escape') {
        setValue(initialValue)
        setIsEditing(false)
      }
    }}
    autoFocus
  />
) : (
  <span onClick={() => setIsEditing(true)}>
    {value}
  </span>
)}
```

---

## Feature Deep Dives

### Decoration Templates

**Location**: `/src/lib/decoration-templates.ts`

**Standard Presets** (13 templates):
1. Front Only
2. Front + Back
3. Left Chest Only
4. Left Chest + Full Back
5. Team Jersey (Front Number + Back Name/Number)
6. Event Tee (Front Logo + Back Sponsor)
7. Polo with Logo (Left Chest Embroidery)
8. Full Front + Sleeve
9. Hoodie Front + Hood
10. All-Over Print
11. Minimal Tag + Label
12. Three Location (Front + Back + Sleeve)
13. Premium Package (4 locations)

**Custom Templates**:
- Saved per customer
- Include all decoration details (location, method, colors, sizes, costs)
- Appear first in Templates dropdown
- Can be edited and deleted

### Pricing Rules Engine

**Rule Types**:
1. **Tier Discount**: Discount based on customer tier (Bronze/Silver/Gold/Platinum)
2. **Volume Discount**: Discount based on total quantity across all line items
3. **Product Discount**: Discount on specific products or SKUs
4. **Category Discount**: Discount on product categories

**Rule Evaluation**:
- Rules sorted by priority (highest first)
- Rules evaluated in order
- First matching rule wins (or can combine if configured)
- Suggested discount shown in quote builder (requires manual acceptance)

**Configuration**:
- Conditions: Customer tiers, min order value, min quantity, product categories
- Discount: Percentage or fixed amount
- Apply to: Product only, setup only, or total
- Active/inactive toggle
- Priority ordering

### Invoice Generation

**Features**:
- Professional PDF formatting
- Includes all quote details (line items, pricing, customer info, nickname)
- Email draft generation with pre-filled subject and body
- Bulk export as ZIP file
- Individual send via email client

**Template Variables**:
- {customer_name}
- {quote_number}
- {quote_nickname}
- {total_amount}
- {due_date}
- {line_items} (formatted table)
- {notes_customer}

**Implementation**: `/src/lib/invoice-generator.ts`

### Artwork Version Control

**Version History**:
- Each artwork file tracks version number
- Previous versions stored in `versionHistory` array
- Version includes: version number, file URL, updated date, updated by, notes

**Update Flow**:
1. User uploads new artwork file
2. Current version incremented
3. Old version moved to `versionHistory`
4. New file becomes current version
5. Timestamp and user recorded

**Approval Workflow**:
- Each version can have separate approval status
- Approval workflow tracks stage per version
- Comments and feedback tied to specific version

### Bulk Actions

**Quote Bulk Actions**:
- Select multiple quotes via checkboxes
- Status change (draft → sent, sent → approved, etc.)
- Send invoices (opens multiple email drafts)
- Export as ZIP (downloads all invoices in one file)
- Delete (with confirmation)

**Job Bulk Actions**:
- Select multiple jobs via checkboxes
- Status change (pending → scheduled, etc.)
- Delete (with confirmation)

**Implementation**:
- Selection state managed in list component
- Bulk action bar appears when items selected
- "Select All" checkbox in header
- Individual checkboxes on each card

### Keyboard Shortcuts

**Global Shortcuts**:
- `Cmd/Ctrl + N`: New quote/job (context-aware)
- `Cmd/Ctrl + S`: Save quote/job
- `Cmd/Ctrl + K`: Focus global search
- `Cmd/Ctrl + 1`: Home
- `Cmd/Ctrl + 2`: Quotes
- `Cmd/Ctrl + 3`: Jobs
- `Cmd/Ctrl + 4`: Customers
- `Cmd/Ctrl + 5`: Catalog
- `Cmd/Ctrl + 6`: Reports
- `Cmd/Ctrl + 7`: Settings
- `Shift + ?`: Show keyboard shortcuts help
- `Escape`: Close modals, exit detail views

**Context-Aware**:
- `Cmd/Ctrl + N` creates quote when on Quotes page
- `Cmd/Ctrl + N` creates job when on Jobs page
- `Cmd/Ctrl + N` creates customer when on Customers page

**Implementation**: `/src/hooks/use-keyboard-shortcuts.ts`

### Email Notification System

**Notification Types** (13 types):
1. Quote Approval Requests
2. Quote Approved Confirmations
3. Quote Reminders
4. Order Status Updates
5. Artwork Approval Requests
6. Artwork Status Updates
7. Payment Reminders
8. Payment Confirmations
9. Shipping Notifications
10. Pickup Notifications
11. Invoice Reminders
12. Marketing Messages
13. Production Updates

**Per-Customer Preferences**:
- Each customer has `emailPreferences` object
- Each notification type can be toggled on/off
- Preferences checked before sending any email
- Default preferences applied to new customers

**Email Templates**:
- Customizable subject and body
- Dynamic variables for personalization
- Logo attachment support
- Preview with sample data
- Active/inactive toggle

**Email History**:
- All sent emails logged
- Searchable by customer, type, date
- View email content and recipients

---

## Design System

### Color Palette

**Dark Theme** (default):
- **Background**: `oklch(0.15 0.01 249)` - Slate-900 (#0F172A)
- **Card**: `oklch(0.22 0.013 249)` - Slate-800 (#1E293B)
- **Border**: `oklch(0.3 0.016 249)` - Slate-700 (#334155)
- **Foreground**: `oklch(0.96 0.003 249)` - Slate-100 (#F1F5F9)
- **Muted Foreground**: `oklch(0.65 0.008 249)` - Slate-400

**Primary (Emerald)**:
- **Primary**: `oklch(0.7 0.17 166)` - Emerald-500 (#10B981)
- **Primary Foreground**: White
- **Accent**: `oklch(0.78 0.15 166)` - Emerald-400 (#34D399)

**Secondary**:
- **Secondary**: `oklch(0.3 0.016 249)` - Slate-700
- **Secondary Foreground**: `oklch(0.96 0.003 249)` - Slate-100

**Status Colors**:
- **Draft**: Slate-500 (#64748B)
- **Sent**: Blue-500 (#3B82F6)
- **Approved**: Emerald-500 (#10B981)
- **Rejected**: Red-500 (#EF4444)
- **Pending**: Yellow-500 (#EAB308)
- **In Progress**: Blue-500 (#3B82F6)
- **Complete**: Emerald-500 (#10B981)

### Typography

**Font Family**: Inter (Google Fonts)
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Feature settings: Tabular numbers (`'tnum' on, 'lnum' on`)

**Type Scale**:
- **H1** (Page Titles): Bold / 24px / -0.02em / line-height 1.2
- **H2** (Section Headers): Semibold / 14px / 0.05em / uppercase / line-height 1.4 / text-slate-400
- **Body**: Regular / 14px / normal / line-height 1.5
- **Data Tables**: Medium / 13px / tabular-nums / line-height 1.3
- **Small Labels**: Medium / 12px / text-slate-500 / line-height 1.4
- **Numbers**: Semibold / tabular-nums

### Spacing

**Tailwind Scale**:
- `gap-2`: 0.5rem (8px) - Inline elements
- `gap-4`: 1rem (16px) - Form fields
- `gap-6`: 1.5rem (24px) - Sections
- `p-4`: 1rem (16px) - Mobile card padding
- `p-6`: 1.5rem (24px) - Desktop card padding
- `p-8`: 2rem (32px) - Page margins
- `px-3 py-2`: Table cell padding

### Border Radius

**Tailwind Classes**:
- `rounded-sm`: calc(var(--radius) * 0.5) ≈ 4px
- `rounded-md`: var(--radius) = 8px
- `rounded-lg`: calc(var(--radius) * 1.5) ≈ 12px
- `rounded-xl`: calc(var(--radius) * 2) ≈ 16px
- `rounded-2xl`: calc(var(--radius) * 3) ≈ 24px
- `rounded-full`: 9999px

### Animations

**Durations**:
- Quick interactions: 100-150ms
- State changes: 200-300ms
- Page transitions: 150ms
- Feedback moments: 300ms

**Easing**:
- Default: `ease`
- Exits: `ease-in`
- Entrances: `ease-out`
- Complex: `cubic-bezier()`

**Effects**:
- Button press: `scale(0.98)`
- Focus rings: Emerald glow
- Checkbox toggles: Spring physics
- Status changes: Color transition 200ms
- Save confirmation: Emerald flash
- Error shake: 3px horizontal 300ms

### Breakpoints

**Mobile-First**:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

**Tailwind Prefixes**:
- `md:` - 768px and up
- `lg:` - 1024px and up

**Responsive Patterns**:
- Sidebar: 56px (mobile) → 224px (desktop)
- Header: Condensed logo (mobile) → Full logo (desktop)
- Buttons: Icon only (mobile) → Icon + label (desktop)
- Tables: Horizontal scroll (mobile) → Full width (desktop)

---

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

For security considerations, see [SECURITY.md](SECURITY.md).

For audit logs and code quality checks, see [AUDIT.md](AUDIT.md).

---

## Future Enhancements

**Potential Features**:
- Multi-user support with roles and permissions
- Real-time collaboration on quotes
- Customer portal for order tracking
- Automated production scheduling
- Machine/press assignment
- Inventory management beyond receiving
- Integrated payment processing (Stripe, Square)
- Advanced reporting with custom date ranges
- Export data to CSV/Excel
- Calendar integration (Google Calendar, Outlook)
- Barcode scanning for inventory
- Mobile app for production team
- Photo-based mockup generation
- AI-powered quote suggestions
- Automated artwork preparation
- Integration with shipping carriers (UPS, FedEx, USPS)

---

## Version History

**Current Version**: 1.0.0 (46 iterations)

**Major Milestones**:
1. Initial quote and job management (iterations 1-10)
2. Customer management and artwork library (iterations 11-20)
3. Payment tracking and reminders (iterations 21-30)
4. Purchase order system (iterations 31-35)
5. Email templates and preferences (iterations 36-40)
6. UI refinements and loading states (iterations 41-46)

---

## Contributing

When contributing to this project:

1. **Follow existing patterns** - Review similar components before creating new ones
2. **Type everything** - Use TypeScript types for all props and state
3. **Test thoroughly** - Keyboard navigation, empty states, edge cases
4. **Update documentation** - Keep this file and PRD.md current
5. **Use functional updates** - Always use functional form with `useKV`
6. **Mobile-first** - Design for mobile, enhance for desktop
7. **Accessibility** - Keyboard navigation, ARIA labels, focus states
8. **Performance** - Debounce searches, lazy load images, virtualize long lists

---

## License

See [LICENSE](LICENSE) file for details.

---

## Support

For questions or issues:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [PRD.md](PRD.md) for feature specifications
3. Examine similar components in codebase
4. Consult shadcn/ui documentation for component usage

---

**Last Updated**: 2024
**Maintained By**: Mint Prints Development Team
