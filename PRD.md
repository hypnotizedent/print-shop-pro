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

### Global Search
- **Functionality**: Search across customers, quotes, and jobs from header search bar
- **Purpose**: Quick navigation to any entity without browsing through lists
- **Trigger**: Type in global search input in header
- **Progression**: Type search term → See filtered results (customers/quotes/jobs) → Click result → Navigate to detail view
- **Success criteria**: Search responds within 200ms; searches customer name, company, quote number, job number, and job nickname; results limited to 10; clicking result navigates correctly

### Quote Builder (Full Screen Mode)
- **Functionality**: Create and edit quotes with optional nickname, line items, customer info, pricing, and terms in dedicated full-screen view with filtering and sorting; export approved quotes as invoices; quick status changes via dropdown on each quote card
- **Purpose**: Primary revenue generation tool - converts customer requests into billable orders with professional invoicing and streamlined status management
- **Trigger**: Click "+ New Quote" button or click existing quote card from list
- **Progression**: Select customer → Add optional nickname → Add line items (product/decoration/sizes/quantity) → Set pricing/discount → Add notes/due date → Save/Send → Click status badge to change status → Export as invoice if approved
- **Success criteria**: Can create complete quote in under 60 seconds; totals update in real-time; Tab/Enter navigation works throughout; full screen provides maximum workspace; filter by status; sort by date; nickname field helps identify quotes; nickname displays prominently above customer name with quote number as small label; status can be changed with single click on dropdown badge; approved quotes can export as formatted PDF invoices

### Bulk Actions for Quotes
- **Functionality**: Select multiple quotes and perform batch operations (status changes, send invoices, export invoices as ZIP, delete)
- **Purpose**: Increase efficiency when managing large numbers of quotes and sending invoices to customers
- **Trigger**: Click checkboxes on quote cards or "Select All"
- **Progression**: Select quotes via checkbox → Bulk action bar appears → Choose action (change status/send invoices/export as ZIP/delete) → Confirm → Action applied to all selected
- **Success criteria**: Can select/deselect individual quotes; select all works; bulk status change updates all selected quotes; bulk send opens email drafts for each approved quote; bulk export creates ZIP file with all invoices; bulk delete removes selected quotes after confirmation

### Job Management (List View with Inline Expansion & Nickname Editing)
- **Functionality**: View jobs with editable nicknames in searchable/filterable list, click to expand details inline without leaving the list view; edit nicknames directly in job detail; quick status changes via dropdown on each job card; production scheduling calendar for visualizing job timelines and capacity
- **Purpose**: Quick job details review while maintaining context of overall job list; easier scanning than kanban; editable nicknames help identify and organize jobs quickly; calendar provides weekly production capacity overview
- **Trigger**: Navigate to Jobs page
- **Progression**: View job list → Filter by status/search by nickname → Sort by due date → Click job card → Details expand inline below card → Edit nickname inline → Click status badge to change status → Toggle calendar view to see weekly schedule → Review/update → Click to collapse or click another job
- **Success criteria**: Inline expansion is smooth (200ms animation); doesn't disrupt list layout; can switch between jobs quickly; filter by status works; search by job number/nickname/customer works; date sorting works; nickname displays prominently above customer name with job number as small label; clicking nickname or "+ Add nickname" enables inline editing; Enter saves, Escape cancels; status can be changed with single click on dropdown badge; production calendar shows jobs organized by due date with capacity totals; calendar job cards are color-coded by status

### Invoice Generation & Multi-channel Distribution
- **Functionality**: Generate professional invoices from approved quotes with PDF export and email sending capability; batch export multiple invoices as ZIP file
- **Purpose**: Provide customers with professional billing documentation through multiple delivery methods
- **Trigger**: Click "Invoice" dropdown on approved quote, or select multiple approved quotes and bulk export/send
- **Progression**: Approved quote selected → Click invoice dropdown → Choose "Send to Customer" or "Download PDF" → Email draft opens with invoice details OR PDF preview opens → For bulk: select multiple quotes → Click "Send Invoices" or "Export as ZIP" → Multiple email drafts open OR ZIP file downloads
- **Success criteria**: Invoice includes all quote details (line items, pricing, customer info, nickname); formatting is professional and print-ready; email draft pre-fills customer email and invoice details; bulk send opens individual email drafts; bulk export creates ZIP with all invoices named by quote number and nickname; ZIP downloads correctly

### Artwork Upload with File Size Recognition
- **Functionality**: Upload artwork files for each print location with automatic file size detection and display; visual mockup preview with imprint size estimation based on file size
- **Purpose**: Track artwork files for production with visibility into file sizes for quality and storage management; provide visual representation of print areas and estimated dimensions
- **Trigger**: Click upload area in line item decoration section or job detail; hover over preview icon in line item grid
- **Progression**: Click upload area → Select image file(s) → File uploads → File size automatically detected and displayed → Thumbnail shows with file info → Hover preview icon shows mockup with all artwork locations → Imprint dimensions estimated from file size → Approve/reject artwork
- **Success criteria**: File size displays in human-readable format (KB/MB); supports drag and drop; shows file size on artwork thumbnail; bulk upload supports multiple files; file size stored with artwork metadata; hovering over preview icon shows large mockup with artwork details and estimated imprint sizes (width × height in inches); dimensions calculated based on file size ranges; preview shows all artwork locations with color-coded status

### Enhanced Decoration Editing with Templates
- **Functionality**: Collapsible decoration cards with inline editing for all decoration properties after creation; visual completion status; quick expand/collapse to review multiple decorations efficiently; pre-built templates for common multi-location setups
- **Purpose**: Allow users to review and modify decoration details at any time; reduce visual clutter by collapsing complete decorations; provide clear visual feedback on decoration completeness; accelerate quote creation with industry-standard decoration templates
- **Trigger**: Click decoration card header to expand/collapse; edit any field within expanded decoration; click "Presets" button to apply multi-location templates
- **Progression**: Create decoration → All fields editable → Fill required fields → Decoration marked complete → Collapse to show summary → Click to expand and edit → Change location/method/colors/setup fee → Upload/replace artwork → Collapse again OR Click "Presets" → Select template (e.g., "Front + Back", "Team Jersey", "Hoodie Special") → Multiple decorations created instantly → Customize each as needed
- **Success criteria**: Decorations collapse to single line showing summary (location • method • colors • imprint size); complete decorations show green checkmark; incomplete decorations have normal border; all fields remain editable after creation; changing values updates immediately; collapsing preserves all data; artwork can be replaced by uploading new file; visual preview thumbnail shows in collapsed state if artwork exists; smooth 200ms animation for expand/collapse; preset dropdown displays 13+ templates with descriptions; templates create 1-4 decorations based on selection; common setups include: Front Only, Front+Back, Front+Back+Sleeve, Front+Both Sleeves, All-Over (4 locations), Embroidery variations, Hoodie Special (Front+Back+Hood), Team Jersey, Mixed Methods, DTG, and Vinyl options

### Production Scheduling Calendar
- **Functionality**: Weekly calendar view showing jobs organized by due date with visual capacity indicators
- **Purpose**: Visualize production workload and capacity across the week; identify bottlenecks and balance workload
- **Trigger**: Click "Show Calendar" button on Jobs page
- **Progression**: View calendar → See jobs grouped by due date → Color-coded by status → View daily piece count → Click job to see details → Navigate weeks with arrows → Click "Today" to return to current week
- **Success criteria**: Calendar displays 7 days starting Monday; jobs appear on their due date; color coding matches status badges; shows up to 3 jobs per day with "+X more" indicator; displays total piece count per day; shows weekly totals (job count and piece count); clicking job opens inline job detail; today's date highlighted with primary color; week navigation smooth; clicking job auto-closes calendar and scrolls to job in list

### Enhanced Job Detail Layout
- **Functionality**: Compact, mockup-first job detail view with streamlined status progression and customer information
- **Purpose**: Reduce vertical space consumption while maintaining all critical information; prioritize visual product representation
- **Trigger**: Click job card or expand job inline
- **Progression**: View mockup prominently on left → Customer + date on right in compact card → Compact status bar with dropdown → Line items with inline artwork → Production notes at bottom
- **Success criteria**: Status bar is compact (single row with smaller step indicators); mockup appears first on left side at large size (300x400px); customer and date info in compact card on right; Front/Back toggle for mockup view; status steps condensed with 24px circles instead of 32px; artwork approval count displayed as simple ratio (3/5) instead of large section; job detail works both full-screen and inline modes; layout responsive on mobile (stacks vertically)

### Bulk Actions for Jobs
- **Functionality**: Select multiple jobs and perform batch operations (status changes, delete)
- **Purpose**: Increase efficiency when managing production workflows
- **Trigger**: Click checkboxes on job cards or "Select All"
- **Progression**: Select jobs via checkbox → Bulk action bar appears → Choose action (change status/delete) → Confirm → Action applied to all selected
- **Success criteria**: Can select/deselect individual jobs; select all works; bulk status change updates all selected jobs; bulk delete removes selected jobs after confirmation

### Invoice Generation & Multi-channel Distribution
- **Functionality**: Generate professional invoices from approved quotes with PDF export and email sending capability; batch export multiple invoices as ZIP file
- **Purpose**: Provide customers with professional billing documentation through multiple delivery methods
- **Trigger**: Click "Invoice" dropdown on approved quote, or select multiple approved quotes and bulk export/send
- **Progression**: Approved quote selected → Click invoice dropdown → Choose "Send to Customer" or "Download PDF" → Email draft opens with invoice details OR PDF preview opens → For bulk: select multiple quotes → Click "Send Invoices" or "Export as ZIP" → Multiple email drafts open OR ZIP file downloads
- **Success criteria**: Invoice includes all quote details (line items, pricing, customer info, nickname); formatting is professional and print-ready; email draft pre-fills customer email and invoice details; bulk send opens individual email drafts; bulk export creates ZIP with all invoices named by quote number and nickname; ZIP downloads correctly

### Customer Management with Addresses
- **Functionality**: Browse customer list, view individual customer details with contact info, address, quote history, and job history
- **Purpose**: Centralized customer relationship management and order history tracking with shipping addresses
- **Trigger**: Navigate to Customers view from sidebar
- **Progression**: View customer list → Search/filter customers → Click customer → View profile with stats/history → Edit contact info and address → View related quotes/jobs
- **Success criteria**: Customer list searchable; customer detail shows all related quotes and jobs; contact info and full address editable; revenue stats calculated correctly; address displays properly when viewing

### Settings Page
- **Functionality**: Centralized settings for theme customization and data export
- **Purpose**: Allow users to customize app appearance and export data for backup or analysis
- **Trigger**: Navigate to Settings from sidebar
- **Progression**: View settings → Adjust theme colors → Save theme changes → Export data to CSV (quotes/jobs/customers)
- **Success criteria**: Theme colors update in real-time; color changes persist; CSV exports download correctly; export includes all relevant data fields

### Reports & Analytics
- **Functionality**: Dashboard showing business metrics, revenue stats, customer rankings, and status breakdowns
- **Purpose**: Provide insights into business performance and customer value
- **Trigger**: Navigate to Reports from sidebar
- **Progression**: View reports page → See revenue totals → Review quote/job status breakdowns → See top customers by revenue
- **Success criteria**: All metrics calculate correctly; top customers ranked by total approved quote value; status breakdowns show percentages; data updates when underlying data changes

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
  
- **Mobile & Responsive Design**:
  - **Header**: Logo condenses to "MINT" on mobile; search bar becomes full-width; logout shows icon only
  - **Sidebar**: Width reduces to 56px on mobile showing only icons; full labels appear on hover/tablet+
  - **Navigation**: Icons always visible; labels hidden on mobile (<768px)
  - **Search & Filters**: Stack vertically on mobile; full width on small screens; horizontal on desktop
  - **Bulk Actions**: Button labels condense ("Send Invoices" → "Send") on mobile; wrap to multiple rows
  - **Cards & Tables**: Maintain full functionality; adjust padding (p-6 → p-4 on mobile)
  - **Forms**: Single column layout on mobile; multi-column on tablet+
  - **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (1024px+)
  - **Touch Targets**: Minimum 44x44px for all interactive elements
  - **Overflow**: Horizontal scroll where necessary (job details, size grids) with scroll indicators
