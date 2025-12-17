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
- **Functionality**: View jobs with editable nicknames in searchable/filterable list, click to expand details inline without leaving the list view; edit nicknames directly in job detail; quick status changes via dropdown on each job card; production scheduling calendar for visualizing job timelines and capacity; department notification system for job assignments
- **Purpose**: Quick job details review while maintaining context of overall job list; easier scanning than kanban; editable nicknames help identify and organize jobs quickly; calendar provides weekly production capacity overview; streamline communication with production departments about new jobs
- **Trigger**: Navigate to Jobs page
- **Progression**: View job list → Filter by status/search by nickname → Sort by due date → Click job card → Details expand inline below card → Edit nickname inline → Click status badge to change status → Toggle calendar view to see weekly schedule → Click "More Actions" → Select "Notify Departments" → Select relevant departments (Screen Printing, Embroidery, Digital, Artwork) → Send notifications → Review/update → Click to collapse or click another job
- **Success criteria**: Inline expansion is smooth (200ms animation); doesn't disrupt list layout; can switch between jobs quickly; filter by status works; search by job number/nickname/customer works; date sorting works; nickname displays prominently above customer name with job number as small label; clicking nickname or "+ Add nickname" enables inline editing; Enter saves, Escape cancels; status can be changed with single click on dropdown badge; production calendar shows jobs organized by due date with capacity totals; calendar job cards are color-coded by status; "Notify Departments" option appears in More Actions dropdown; department notification dialog auto-selects relevant departments based on decoration methods (screen printing jobs select Screen Printing dept); can select/deselect departments; email preview shows job details; notifications sent to department email addresses; success toast confirms send

### Invoice Generation & Multi-channel Distribution
- **Functionality**: Generate professional invoices from approved quotes with PDF export and email sending capability; batch export multiple invoices as ZIP file
- **Purpose**: Provide customers with professional billing documentation through multiple delivery methods
- **Trigger**: Click "Invoice" dropdown on approved quote, or select multiple approved quotes and bulk export/send
- **Progression**: Approved quote selected → Click invoice dropdown → Choose "Send to Customer" or "Download PDF" → Email draft opens with invoice details OR PDF preview opens → For bulk: select multiple quotes → Click "Send Invoices" or "Export as ZIP" → Multiple email drafts open OR ZIP file downloads
- **Success criteria**: Invoice includes all quote details (line items, pricing, customer info, nickname); formatting is professional and print-ready; email draft pre-fills customer email and invoice details; bulk send opens individual email drafts; bulk export creates ZIP with all invoices named by quote number and nickname; ZIP downloads correctly

### Loading States & Skeletons
- **Functionality**: Display skeleton loading screens during data fetching and page transitions for smooth UX
- **Purpose**: Provide visual feedback during async operations and prevent jarring layout shifts
- **Trigger**: Initial page load, navigation between views, API calls, data fetching operations
- **Progression**: Navigate to page → Show skeleton matching expected layout → Data loads → Fade to real content
- **Success criteria**: Skeletons match final layout structure; smooth fade transition (300ms); skeletons appear for operations >200ms; no layout shift when content loads; dark theme optimized with subtle pulse animation; specific skeletons for each view (quotes list, jobs board, customers, home dashboard, product catalog)

### Artwork Upload with File Size Recognition
- **Functionality**: Upload artwork files for each print location with automatic file size detection and display; visual mockup preview with imprint size estimation based on file size
- **Purpose**: Track artwork files for production with visibility into file sizes for quality and storage management; provide visual representation of print areas and estimated dimensions
- **Trigger**: Click upload area in line item decoration section or job detail; hover over preview icon in line item grid
- **Progression**: Click upload area → Select image file(s) → File uploads → File size automatically detected and displayed → Thumbnail shows with file info → Hover preview icon shows mockup with all artwork locations → Imprint dimensions estimated from file size → Approve/reject artwork
- **Success criteria**: File size displays in human-readable format (KB/MB); supports drag and drop; shows file size on artwork thumbnail; bulk upload supports multiple files; file size stored with artwork metadata; hovering over preview icon shows large mockup with artwork details and estimated imprint sizes (width × height in inches); dimensions calculated based on file size ranges; preview shows all artwork locations with color-coded status

### Enhanced Decoration Editing with Templates, Customer Artwork Library & Previous Quote Copying
- **Functionality**: Collapsible decoration cards with inline editing for all decoration properties after creation; visual completion status; quick expand/collapse to review multiple decorations efficiently; pre-built templates for common multi-location setups; copy decorations from customer's previous quotes; product-specific location suggestions and size limitations; save custom decoration templates for repeat customers; bulk copy decorations to all line items in quote; use artwork from customer artwork library when creating decorations; automated email notifications when artwork is approved or rejected
- **Purpose**: Allow users to review and modify decoration details at any time; reduce visual clutter by collapsing complete decorations; provide clear visual feedback on decoration completeness; accelerate quote creation with industry-standard decoration templates; enable repeat customers to quickly reuse proven decoration setups from past orders and their saved artwork files; prevent printing errors with automatic size validation; streamline recurring customer orders with saved templates and artwork library files; apply consistent decorations across multiple products in a quote; quickly access frequently used customer artwork like neck tags, private labels, and logos; keep customers informed of artwork approval status automatically
- **Trigger**: Click decoration card header to expand/collapse; edit any field within expanded decoration; click "Templates" button to apply multi-location presets or customer-specific saved templates; click "Copy from Previous Quotes" to select decorations from customer's order history; click "Copy to All Line Items" to apply current decorations to other products; change product type to see suggested locations; click "Use from Library" button to select artwork from customer's artwork library; click approve/reject button on artwork in job detail
- **Progression**: Create decoration → All fields editable → Product-specific locations auto-suggested (e.g., "Front Panel" for hats, "Front" for t-shirts) → Fill required fields → Upload artwork OR click "Use from Library" → Browse customer's saved artwork files (neck tags, labels, logos) → Select artwork → Artwork and imprint size auto-filled → Size automatically validated against product limits → Warning shown if exceeds max size → Decoration marked complete → Collapse to show summary → Click to expand and edit → Click "Templates" → View customer's saved templates first, then standard presets → Select template → Multiple decorations created instantly → Customize each as needed → Click "Save" to save current decorations as custom template for this customer → Name and describe template → Click "Copy from Previous Quotes" → Search customer's quotes → Select specific decorations → Click copy → Decorations added with artwork → Click "Copy to All Line Items" → Select target line items → Decorations copied to all selected items → In job detail, click approve/reject on artwork → Email draft opens automatically with customer email pre-filled → Email contains job details, artwork info, and approval status → Send email to notify customer → When all artwork approved, second email sent confirming all artwork ready for production
- **Success criteria**: Decorations collapse to single line showing summary (location • method • colors • imprint size); complete decorations show green checkmark; product-specific location suggestions based on product type (hats show "Front Panel", hoodies show "Hood", etc.); size restrictions displayed for each location (e.g., "Max 3.5" × 4" for sleeves"); artwork upload detects dimensions and validates against limits; warning toast appears if size exceeds maximum for that location; customer templates appear first in Templates dropdown separated from standard presets; "Save" button appears when decorations exist and customer is selected; saved templates stored with customer ID; templates can be applied to any new quote for that customer; "Copy to All Line Items" button appears when multiple line items exist; bulk copy dialog shows all other line items with decoration count; bulk copy replaces existing decorations with warning; 13+ standard presets include Front Only, Front+Back, Team Jersey, Embroidery variations, etc.; templates create 1-4 decorations based on selection; "Use from Library" button appears when customer has saved artwork files; artwork library dialog shows all customer's artwork with thumbnails, names, categories, and sizes; clicking artwork file applies it to decoration with imprint size pre-filled; artwork library organized by category (neck tag, private label, logo, graphic, other); artwork files searchable and filterable in library dialog; artwork approval/rejection triggers immediate email notification to customer; approval email includes job number, project name (nickname), product details, location, and file name; rejection email prompts customer to review and resubmit; when all artwork for a line item is approved, bulk approval email sent; emails open in default mail client with pre-filled subject, body, and recipient; email templates use consistent MINT PRINTS branding and formatting

### Production Scheduling Calendar
- **Functionality**: Weekly calendar view showing jobs organized by due date with visual capacity indicators
- **Purpose**: Visualize production workload and capacity across the week; identify bottlenecks and balance workload
- **Trigger**: Click "Show Calendar" button on Jobs page
- **Progression**: View calendar → See jobs grouped by due date → Color-coded by status → View daily piece count → Click job to see details → Navigate weeks with arrows → Click "Today" to return to current week
- **Success criteria**: Calendar displays 7 days starting Monday; jobs appear on their due date; color coding matches status badges; shows up to 3 jobs per day with "+X more" indicator; displays total piece count per day; shows weekly totals (job count and piece count); clicking job opens inline job detail; today's date highlighted with primary color; week navigation smooth; clicking job auto-closes calendar and scrolls to job in list

### Manual Payment Tracking
- **Functionality**: Record payments received outside the Mint OS system (cash, check, Venmo, Zelle, PayPal, bank transfers, etc.) with payment tracking dashboard showing total paid and balance due
- **Purpose**: Track all payments regardless of payment method; maintain accurate financial records; calculate remaining balance on quotes
- **Trigger**: Click "Add Payment" button in quote detail payment tracking section
- **Progression**: View payment tracker on quote → Click "Add Payment" → Enter amount and date → Select payment method (or specify custom) → Add reference number/transaction ID → Add notes → Submit → Payment added to history → Balance updates automatically
- **Success criteria**: Payment form validates amount is positive number; supports all major payment methods plus custom option; displays payment history with method badges; shows real-time totals (quote total, total paid, balance due); can delete payment records with confirmation; payment data persists with quote; quote total, total paid, and balance cards update immediately; payment history shows method, date, reference, and notes

### Payment Reminders & Automated Follow-up with SMS
- **Functionality**: Automated payment reminder system with configurable schedules; manual reminder sending; unpaid balances tracking and reporting; overdue payment alerts; SMS reminders via Twilio for high-priority overdue payments; customizable SMS templates with dynamic variables; customer opt-out management
- **Purpose**: Improve cash flow by automating payment follow-up; reduce manual effort tracking unpaid balances; ensure timely payment collection; provide visibility into accounts receivable; send urgent SMS notifications for critical overdue payments; maintain compliance with SMS regulations through customer preference management
- **Trigger**: Enable reminders in quote detail; view unpaid balances in Reports > Payment Tracking tab; configure Twilio in Settings > SMS tab; mark quotes as high priority; customize SMS templates in Settings > Templates tab; manage customer opt-outs in Settings > Opt-Outs tab
- **Progression**: Open quote with balance → Enable payment reminders toggle → Select reminder intervals (1, 3, 7, 14, 30, 60 days) → Mark as high priority for SMS capability → Enable SMS reminders toggle → Enter customer phone number → System calculates next reminder date → Automatic emails sent on schedule → SMS sent when overdue and high priority → View reminder history → Send manual reminder or SMS anytime → Create custom SMS templates with variables ({customer_name}, {quote_number}, {amount}, {balance}, etc.) → View/edit templates in Settings → Manage customer SMS preferences and opt-outs → View opted-out customers → Respect customer communication preferences → View all unpaid balances in Reports → Click quote to manage
- **Success criteria**: Reminder toggle enables/disables automated emails; can select multiple interval options; displays last sent date and next scheduled date; tracks total emails sent per quote; shows days overdue for past-due quotes; manual "Send Reminder Now" button works; email template shows balance, amount paid, and due date; high priority toggle visible and functional; SMS toggle only enabled when high priority is active; phone number field validates format; SMS only sent when payment overdue; SMS preview shows message content; Twilio configuration in Settings with validation; Account SID, Auth Token, and From Number fields masked; configuration status indicator shows whether SMS is enabled globally; Reports page shows total unpaid balance, overdue balance, active reminder count, and high-priority count; unpaid quotes list sortable by balance amount and overdue status; high-priority quotes highlighted with star icon and yellow border; SMS sent count tracked separately from email count; last SMS date displayed; clicking quote navigates to quote builder; overdue quotes highlighted in red; fully paid quotes show success state with no reminder options; SMS templates can be created, edited, duplicated, and deleted; templates support dynamic variables; character count and segment count displayed; templates can be marked active/inactive; customer opt-out preferences tracked per customer; can opt customers in/out of SMS; separate toggles for payment reminders, order updates, and marketing messages; opt-out reasons recorded; opted-out customers clearly indicated; compliance warnings displayed; SMS not sent to opted-out customers

### Job Expense & COGS Tracking
- **Functionality**: Record all job-related expenses (materials, labor, shipping, outsourcing, supplies) with automatic profit margin calculation
- **Purpose**: Track cost of goods sold (COGS) for accurate job profitability; identify high-cost jobs; calculate profit margins in real-time
- **Trigger**: Click "Add Expense" button in job detail expense tracking section
- **Progression**: View expense tracker on job → Click "Add Expense" → Select category → Enter description → Enter amount OR quantity + unit cost (auto-calculates total) → Add vendor and invoice number → Add date and notes → Submit → Expense added to history → Profit margin recalculates
- **Success criteria**: Expense form supports direct amount entry or quantity × unit cost calculation; categories include materials, labor, shipping, outsourcing, supplies, and custom; displays expense history with category color badges; shows real-time metrics (job total, total expenses, profit, margin %); profit and margin turn red when negative; can delete expense records with confirmation; expense data persists with job; supports vendor tracking and invoice number references; category badges are color-coded for quick scanning

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
- **Functionality**: Browse customer list, view individual customer details with contact info, address, quote history, job history, reusable artwork library, and email notification preferences
- **Purpose**: Centralized customer relationship management and order history tracking with shipping addresses, customer-specific artwork files for recurring orders, and granular control over which email notifications each customer receives
- **Trigger**: Navigate to Customers view from sidebar
- **Progression**: View customer list → Search/filter customers → Click customer → View profile with stats/history → Edit contact info and address → Manage email preferences (13 notification types) → Toggle specific notification types on/off → Manage artwork library → Add/edit/delete artwork files → View related quotes/jobs
- **Success criteria**: Customer list searchable; customer detail shows all related quotes and jobs; contact info and full address editable; revenue stats calculated correctly; address displays properly when viewing; email preferences section displays all 13 notification types grouped by category (Quotes & Approvals, Order & Production, Artwork & Design, Payments & Invoices, Marketing & Promotions); preferences toggle individually with switches; preferences save automatically; preference changes reflect in email sending functions; artwork library displays all saved files with categories; can add new artwork with name, description, category, size, and notes; can edit/delete existing artwork; artwork files persist with customer

### Customer Email Notification Preferences
- **Functionality**: Granular per-customer control over 13 types of email notifications including quote approvals, order updates, artwork notifications, payment reminders, and marketing messages
- **Purpose**: Respect customer communication preferences; reduce unwanted emails; improve customer satisfaction; maintain compliance with email best practices
- **Trigger**: Edit customer profile and navigate to Email Preferences section
- **Progression**: View customer detail → Enter edit mode → Scroll to Email Preferences card → Toggle notification types on/off → System auto-saves changes → Email sending functions check preferences before sending → Customer receives only enabled notification types
- **Success criteria**: All 13 notification types display in organized groups; each preference has descriptive label and explanation; switches toggle smoothly; changes save immediately; read-only view shows enabled/disabled count; preference check occurs in all email sending functions (invoice emails, artwork notifications, payment reminders); disabled notifications prevent emails from being sent; console logs indicate when email blocked by preference; default preferences applied to new customers (all essential notifications enabled, marketing disabled); existing customers migrated to default preferences on first load

### Email Template Management with Quote Reminders
- **Functionality**: Create and customize email templates for all notification types with special focus on quote reminder emails with logo attachment support; templates use dynamic variables for personalization; preview templates with sample data before sending
- **Purpose**: Maintain consistent branding and messaging across all customer communications; save time with reusable templates; personalize automated emails with customer and quote data; attach company logo to quote reminders for professional appearance
- **Trigger**: Navigate to Settings → Email Templates tab; switch between "Quote Reminders" and "All Templates" tabs
- **Progression**: View Email Templates → Select "Quote Reminders" tab → Customize subject line with variables → Edit email body with variables → Upload company logo (PNG/JPG/SVG, max 5MB) → Preview email with sample data → Toggle template active/inactive → Save template → System uses template for automated quote reminders → Switch to "All Templates" tab → Create custom templates for other notification types → Add attachments up to 10MB → Insert variables with quick-insert buttons → Duplicate existing templates → Edit/delete templates
- **Success criteria**: Quote Reminder template displays in dedicated tab with clear instructions; subject and body support 9+ variables (customer_name, quote_number, quote_nickname, total_amount, due_date, valid_until, days_since_sent, customer_email, customer_company); logo upload validates file type and size; preview tab shows rendered email with sample data replacing all variables; logo displays in preview at appropriate size; template saves with logo attachment; active/inactive toggle works; saved template persists across sessions; automated quote reminders use custom template when active; logo attachment included in automated emails; All Templates tab shows all custom templates with type badges; can create templates for all 15 notification types; supports multiple attachments per template; attachments display with file name, size, and type; quick-insert variable buttons add variables at cursor position; template editor shows character count; variables reference guide displays below editor; template list shows active/inactive status with badges; edit mode pre-fills form with existing template data; duplicate creates copy with "(Copy)" suffix and inactive status; delete requires confirmation; templates organized by active/inactive sections

### Reports & Analytics
- **Functionality**: Dashboard showing business metrics, revenue stats, customer rankings, and status breakdowns
- **Purpose**: Provide insights into business performance and customer value
- **Trigger**: Navigate to Reports from sidebar
- **Progression**: View reports page → See revenue totals → Review quote/job status breakdowns → See top customers by revenue
- **Success criteria**: All metrics calculate correctly; top customers ranked by total approved quote value; status breakdowns show percentages; data updates when underlying data changes

### Customer Pricing Rules
- **Functionality**: Create automatic pricing rules based on customer tier (Bronze/Silver/Gold/Platinum) or order volume with configurable discounts applied to products, setup fees, or total
- **Purpose**: Reward loyal customers and high-volume orders with automatic discounts; ensure consistent pricing across similar orders; incentivize larger orders
- **Trigger**: Navigate to Settings → Pricing tab; assign customer tier in customer profile
- **Progression**: Create pricing rule → Select rule type (tier discount, volume discount, product discount, category discount) → Set conditions (customer tiers, minimum quantity, minimum order value) → Configure discount (percentage or fixed amount) → Set priority and activate → Rule applies automatically when conditions met → Quote builder shows suggested discount → Manual approval to apply
- **Success criteria**: Can create multiple pricing rules with different conditions; rules sorted by priority; higher priority rules evaluated first; tier-based rules only apply to customers with assigned tiers; volume rules check total quantity across all line items; minimum order value rules check quote subtotal; discount calculation applies to specified target (product only, setup only, or total); active/inactive toggle works; quote builder displays applicable rules with suggested discount amount; pricing rules indicator shows which rules match current quote; suggested discount can be accepted or ignored; rules manageable from Settings with full CRUD operations

### Quote Templates by Category
- **Functionality**: Pre-configured quote templates organized by category (Events, Retail, Corporate, Non-Profit, Sports, School, Custom) with saved line items, decorations, pricing, and default settings
- **Purpose**: Accelerate quote creation for common order types; ensure consistency across similar projects; reduce data entry for recurring order patterns
- **Trigger**: Navigate to Settings → Templates tab; create new quote from template
- **Progression**: Create template → Select category → Name and describe template → Configure default line items with products and decorations → Set default discount and notes → Add tags for searchability → Save template → Browse templates by category or search → Click "Use Template" → New quote created with all template settings → Customize as needed → Save quote
- **Success criteria**: Templates organized into 7 categories with dedicated tabs; each template shows category icon, name, description, item count, and usage statistics; can filter templates by category; search across template names, descriptions, and tags; template preview shows all included line items and decorations; using template creates new quote with all line items, decorations, default customer tier, default discount, and default notes pre-filled; template line items fully editable after creation; templates track usage count and last used date; can create template from existing quote; can edit and delete templates; category customization allows for "Custom" category with user-defined name; templates include optional default customer info for recurring clients

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
