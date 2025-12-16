# Print Shop Dashboard - Quote to Job Flow

A modern print shop management dashboard for screen printing and custom apparel businesses, streamlining the Quote → Job → Production → Delivery workflow with customer management and authentication.

**Experience Qualities**:
1. **Efficient** - Keyboard-first navigation and inline editing eliminate unnecessary clicks and modal interruptions
2. **Immediate** - Real-time calculations and auto-save provide instant feedback without waiting
3. **Dense** - High information density with minimal whitespace maximizes workspace for production staff

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-view production management system with complex state management, real-time calculations, inline editing, keyboard navigation, interconnected data models (quotes converting to jobs), customer relationship management, and user authentication.

## Essential Features

### Login Authentication
- **Functionality**: Secure login page with email and password authentication
- **Purpose**: Control access to the print shop dashboard with user credentials
- **Trigger**: App loads without authenticated session
- **Progression**: View login page → Enter email/password → Submit credentials → Access granted → Redirect to quotes page
- **Success criteria**: Login form is styled consistently with app theme; credentials are validated; successful login persists session; logout option available in header

### Quote Builder (Full Screen Mode)
- **Functionality**: Create and edit quotes with line items, customer info, pricing, and terms in dedicated full-screen view
- **Purpose**: Primary revenue generation tool - converts customer requests into billable orders
- **Trigger**: Click "+ New Quote" button or click existing quote card from list
- **Progression**: Select customer → Add line items (product/decoration/sizes/quantity) → Set pricing/discount → Add notes/due date → Save/Send
- **Success criteria**: Can create complete quote in under 60 seconds; totals update in real-time; Tab/Enter navigation works throughout; full screen provides maximum workspace

### Job Management (Inline Expansion)
- **Functionality**: View jobs in kanban board, click to expand details inline without leaving the board view
- **Purpose**: Quick job details review while maintaining context of overall production pipeline
- **Trigger**: Click job card in kanban column
- **Progression**: View kanban board → Click job card → Details expand inline below card → Review/update → Click to collapse or click another job
- **Success criteria**: Inline expansion is smooth (200ms animation); doesn't disrupt kanban layout; can switch between jobs quickly

### Customer Management
- **Functionality**: Browse customer list, view individual customer details with contact info, quote history, and job history
- **Purpose**: Centralized customer relationship management and order history tracking
- **Trigger**: Navigate to Customers view from sidebar
- **Progression**: View customer list → Search/filter customers → Click customer → View profile with stats/history → Edit contact info → View related quotes/jobs
- **Success criteria**: Customer list searchable; customer detail shows all related quotes and jobs; contact info editable; revenue stats calculated correctly

### Inline Spreadsheet Editing
- **Functionality**: Click-to-edit cells for line items with keyboard navigation (Tab, Enter, Arrow keys, Escape)
- **Purpose**: Speed data entry by mimicking familiar spreadsheet UX
- **Trigger**: Single click selects cell, double click or typing enters edit mode
- **Progression**: Click cell → Edit value → Tab/Enter to save and move → Escape cancels
- **Success criteria**: Can navigate entire quote with keyboard; no modals required; edits save immediately

### Real-time Price Calculation
- **Functionality**: Automatically calculate line totals, subtotal, discount, tax, and final total as values change
- **Purpose**: Eliminate manual math errors and show accurate pricing instantly
- **Trigger**: Any change to quantity, unit price, discount, or tax rate
- **Progression**: Value changes → Calculations execute → All dependent fields update → Visual feedback confirms
- **Success criteria**: Totals update within 100ms of input; no "Calculate" button needed

### Quote to Job Conversion
- **Functionality**: Transform approved quote into production job with one click
- **Purpose**: Bridge sales and production workflows seamlessly
- **Trigger**: Click "Convert to Job" on approved quote
- **Progression**: Approved quote selected → Job created with quote data → Job number assigned → Status set to "pending" → Customer/items copied over
- **Success criteria**: Conversion happens instantly; all quote data transfers correctly; job appears in jobs board

### Production Status Kanban Board
- **Functionality**: Visual board showing jobs organized by production stage with inline detail expansion
- **Purpose**: Production team sees all active jobs and their current status at a glance
- **Trigger**: Navigate to Jobs page
- **Progression**: View board → See jobs grouped by status → Click job for inline details → Update status → Details collapse/job moves columns
- **Success criteria**: All jobs visible; inline details don't disrupt board layout; status changes reflect immediately; clear visual hierarchy

### Customer Search & Management
- **Functionality**: Typeahead search to find existing customers or quickly add new ones inline
- **Purpose**: Avoid duplicate customer records and speed up data entry
- **Trigger**: Start typing in customer field on quote builder
- **Progression**: Type name/email → See filtered results → Select existing or press Enter to create new → Customer populated
- **Success criteria**: Search responds within 200ms; can create new customer without leaving quote page

## Edge Case Handling

- **Empty States**: Show helpful prompts when no quotes/jobs/customers exist with "Create your first..." CTA
- **Unauthenticated Access**: Redirect to login page; session persists after successful login
- **Zero Quantity Line Items**: Automatically exclude from total calculations; show warning indicator
- **Missing Customer**: Prevent saving quote without customer; show inline validation error
- **Duplicate Quote Numbers**: Auto-generate sequential numbers to prevent conflicts
- **Invalid Dates**: Validate due dates are in future; show error for past dates
- **Division by Zero**: Handle zero quantity gracefully in unit price calculations
- **Negative Discounts**: Allow negative (upcharge) but show clear indicator
- **Keyboard Navigation Boundaries**: Tab wraps from last field to first; arrow keys stop at grid edges
- **Customer Without History**: Show "No quotes yet" and "No jobs yet" states on customer detail page

## Design Direction

The design should evoke a feeling of **professional command-center efficiency** - like mission control software or professional trading terminals. Dark theme reduces eye strain during long production days, while high-contrast emerald accents guide attention to actionable items. The interface should feel solid, precise, and purpose-built for production work, not consumer-facing polish.

## Color Selection

Dark slate foundation with vibrant emerald accents creates a technical, focused workspace with clear visual hierarchy.

- **Primary Color**: Emerald (#10B981 / oklch(0.7 0.17 166)) - Represents approval, go-ahead, production status; used for primary actions and positive states
- **Secondary Colors**: 
  - Slate-900 (#0F172A / oklch(0.15 0.01 249)) - Main background, provides dark foundation
  - Slate-800 (#1E293B / oklch(0.22 0.013 249)) - Card backgrounds, raised surfaces
  - Slate-700 (#334155 / oklch(0.3 0.016 249)) - Borders, dividers, subtle separation
- **Accent Color**: Emerald-400 (#34D399 / oklch(0.78 0.15 166)) - Bright highlight for CTAs, hover states, active elements
- **Foreground/Background Pairings**:
  - Slate-900 Background (#0F172A): Slate-100 text (#F1F5F9 / oklch(0.96 0.003 249)) - Ratio 13.2:1 ✓
  - Slate-800 Cards (#1E293B): Slate-100 text (#F1F5F9) - Ratio 11.8:1 ✓
  - Emerald-500 (#10B981): White text (#FFFFFF) - Ratio 4.7:1 ✓
  - Slate-700 Borders (#334155): Slate-300 text (#CBD5E1) - Ratio 5.1:1 ✓

## Font Selection

System-optimized sans-serif stack prioritizing clarity and readability for data-heavy interfaces, with tabular numerals for aligned pricing columns.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold / 24px / -0.02em letter spacing / line-height 1.2
  - H2 (Section Headers): Inter Semibold / 14px / 0.05em letter spacing / uppercase / line-height 1.4 / text-slate-400
  - Body (General Text): Inter Regular / 14px / normal spacing / line-height 1.5
  - Data Tables: Inter Medium / 13px / tabular-nums / line-height 1.3
  - Small Labels: Inter Medium / 12px / text-slate-500 / line-height 1.4
  - Numbers/Pricing: Inter Semibold / tabular-nums for alignment

## Animations

Animations should be minimal and functional - emphasizing state changes and providing feedback without slowing down power users.

- **Micro-interactions**: Button press feedback (scale 0.98), input focus rings (emerald glow), checkbox toggles (spring physics)
- **State transitions**: Status badge color changes (200ms ease), kanban card moves (300ms ease-out with slight lift), success confirmations (gentle scale + fade)
- **Navigation**: Page transitions fade only (150ms), no sliding or complex choreography
- **Feedback moments**: Save confirmation (brief emerald flash on save button), calculation updates (subtle pulse on total field), error shake (3px horizontal for 300ms)

## Component Selection

- **Components**:
  - **Button** (shadcn): Primary actions (emerald), secondary (slate-700), ghost for inline actions
  - **Input** (shadcn): Customer fields, line item cells, pricing inputs - modified with darker slate-700 borders and slate-800 backgrounds
  - **Card** (shadcn): Quote cards, job cards, section containers - slate-800 background with slate-700 borders
  - **Badge** (shadcn): Status indicators - heavily customized colors per status (draft/sent/approved/etc)
  - **Tabs** (shadcn): Main navigation between Quotes/Jobs/Customers
  - **Select** (shadcn): Dropdowns for product type, decoration method, discount type
  - **Separator** (shadcn): Section dividers with slate-700 color
  - **ScrollArea** (shadcn): Line items table, job lists
  - **Popover** (shadcn): Customer search results, date pickers
  - **Calendar** (shadcn): Due date selection
  
- **Customizations**:
  - **LineItemGrid** (custom): Spreadsheet-style editable table with keyboard navigation
  - **SizeInputRow** (custom): Inline size inputs (XS-3XL) with total calculation
  - **PricingSummary** (custom): Real-time calculation display with discount controls
  - **StatusProgressBar** (custom): Job status visualization with step indicators
  - **CustomerSearchCombobox** (custom): Typeahead search with create-new option
  - **QuickAddButtons** (custom): +/- increment buttons for size quantities

- **States**:
  - Inputs: Default (slate-700 border), Focus (emerald-500 ring), Error (red-500 border + shake), Disabled (slate-600 + reduced opacity)
  - Buttons: Default, Hover (brightness increase + subtle lift), Active (scale 0.98), Disabled (opacity 50%)
  - Cards: Default, Hover (slate-700 border → slate-600 subtle brighten), Selected (emerald-500/10 background + emerald-500 border)
  
- **Icon Selection**:
  - Plus (add line item, new quote)
  - MagnifyingGlass (search)
  - Pencil (edit inline)
  - Trash (delete)
  - Check (approve, complete)
  - X (reject, cancel)
  - Clock (pending status)
  - Truck (delivery)
  - Printer (production)
  - ArrowRight (progress, convert to job)
  - CaretDown (dropdowns)
  
- **Spacing**:
  - Card padding: p-6
  - Section gaps: gap-6
  - Form field gaps: gap-4
  - Inline elements: gap-2
  - Table cell padding: px-3 py-2
  - Page margins: p-8
  
- **Mobile**:
  - Sidebar collapses to hamburger menu
  - Line item grid switches to stacked cards (one item per card)
  - Size inputs wrap to multiple rows
  - Kanban columns scroll horizontally
  - Reduce font sizes by 1-2px
  - Padding reduces to p-4 for cards, p-4 for pages
