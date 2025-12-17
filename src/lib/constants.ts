/**
 * Application Constants
 * 
 * Centralized location for all application-wide constants, configuration values,
 * and magic numbers. This improves maintainability and makes it easier to update
 * values across the application.
 */

/**
 * Application Metadata
 */
export const APP_CONFIG = {
  name: 'Mint Prints',
  version: '1.0.0',
  description: 'Print Shop Management Dashboard',
} as const

/**
 * KV Store Keys
 * 
 * Centralized keys for the Spark KV store to prevent typos and ensure consistency.
 */
export const KV_KEYS = {
  // Auth
  IS_LOGGED_IN: 'is-logged-in',
  
  // Core Data
  QUOTES: 'quotes',
  JOBS: 'jobs',
  CUSTOMERS: 'customers',
  
  // Customer Related
  CUSTOMER_DECORATION_TEMPLATES: 'customer-decoration-templates',
  CUSTOMER_ARTWORK_FILES: 'customer-artwork-files',
  CUSTOMER_PRICING_RULES: 'customer-pricing-rules',
  TAX_CERTIFICATES: 'tax-certificates',
  
  // Quote Related
  QUOTE_TEMPLATES: 'quote-templates',
  PAYMENT_REMINDERS: 'payment-reminders',
  
  // Product Related
  FAVORITE_PRODUCTS: 'favorite-products',
  PRODUCT_TEMPLATES: 'product-templates',
  
  // Inventory
  PURCHASE_ORDERS: 'purchase-orders',
  
  // Communication
  EMAIL_NOTIFICATIONS: 'email-notifications',
  EMAIL_TEMPLATES: 'email-templates',
  
  // UI State
  FILTER_PRESETS: 'filter-presets',
  RECENT_SEARCHES: 'recent-searches',
  
  // Integrations
  SSACTIVEWEAR_CREDENTIALS: 'ssactivewear-credentials',
  SANMAR_CREDENTIALS: 'sanmar-credentials',
  
  // Theme
  THEME_PRIMARY_COLOR: 'theme-primary-color',
  THEME_ACCENT_COLOR: 'theme-accent-color',
} as const

/**
 * Status Values
 */
export const QUOTE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const

export const JOB_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  AWAITING_ARTWORK: 'awaiting_artwork',
  READY_TO_PRINT: 'ready_to_print',
  PRINTING: 'printing',
  QUALITY_CHECK: 'quality_check',
  COMPLETE: 'complete',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const

export const PURCHASE_ORDER_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  PARTIALLY_RECEIVED: 'partially_received',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

/**
 * Status Display Names
 */
export const QUOTE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  awaiting_artwork: 'Awaiting Artwork',
  ready_to_print: 'Ready to Print',
  printing: 'Printing',
  quality_check: 'Quality Check',
  complete: 'Complete',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
}

export const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  partially_received: 'Partially Received',
  received: 'Received',
  cancelled: 'Cancelled',
}

/**
 * Customer Tiers
 */
export const CUSTOMER_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const

export const CUSTOMER_TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

/**
 * Decoration Methods
 */
export const DECORATION_METHODS = [
  'Screen Print',
  'DTG (Direct to Garment)',
  'Embroidery',
  'Heat Transfer',
  'Vinyl',
  'Sublimation',
  'Patch',
] as const

/**
 * Decoration Locations
 */
export const DECORATION_LOCATIONS = [
  'Front Center',
  'Front Left Chest',
  'Front Right Chest',
  'Back Center',
  'Left Sleeve',
  'Right Sleeve',
  'Hood',
  'Pocket',
  'Custom',
] as const

/**
 * Tax Rates
 */
export const DEFAULT_TAX_RATE = 0.08 // 8%

/**
 * Pricing
 */
export const PRICING = {
  MIN_DISCOUNT_PERCENT: 0,
  MAX_DISCOUNT_PERCENT: 100,
  MIN_DISCOUNT_AMOUNT: 0,
  DEFAULT_MARKUP_PERCENT: 30,
} as const

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

/**
 * Search
 */
export const SEARCH = {
  DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_RECENT_SEARCHES: 50,
} as const

/**
 * File Upload
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

/**
 * Keyboard Shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  NEW_ITEM: 'n',
  SEARCH: 'k',
  HELP: '?',
  CLOSE: 'Escape',
  NAV_HOME: '1',
  NAV_QUOTES: '2',
  NAV_JOBS: '3',
  NAV_CUSTOMERS: '4',
  NAV_CATALOG: '5',
  NAV_REPORTS: '6',
  NAV_SETTINGS: '7',
} as const

/**
 * Supplier APIs
 */
export const SUPPLIERS = {
  SSACTIVEWEAR: {
    name: 'S&S Activewear',
    baseUrl: 'https://api.ssactivewear.com',
    docsUrl: 'https://api.ssactivewear.com/V2/Default.aspx',
  },
  SANMAR: {
    name: 'SanMar',
    baseUrl: 'https://api.sanmar.com',
    docsUrl: 'https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary',
  },
} as const

/**
 * Email Notification Types
 */
export const EMAIL_TYPES = {
  QUOTE_APPROVAL_REQUEST: 'quote_approval_request',
  QUOTE_APPROVED: 'quote_approved',
  QUOTE_REMINDER: 'quote_reminder',
  ORDER_STATUS_UPDATE: 'order_status_update',
  ARTWORK_APPROVAL_REQUEST: 'artwork_approval_request',
  ARTWORK_STATUS_UPDATE: 'artwork_status_update',
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  SHIPPING_NOTIFICATION: 'shipping_notification',
  PICKUP_NOTIFICATION: 'pickup_notification',
  INVOICE: 'invoice',
  CUSTOM: 'custom',
} as const

/**
 * Webhook Event Types
 */
export const WEBHOOK_EVENT_TYPES = {
  INVENTORY_UPDATE: 'inventory.update',
  PRICE_CHANGE: 'price.change',
  PRODUCT_DISCONTINUED: 'product.discontinued',
  ORDER_STATUS_CHANGE: 'order.status_change',
} as const

/**
 * Time Intervals
 */
export const TIME_INTERVALS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const

/**
 * Responsive Breakpoints (should match Tailwind config)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

/**
 * Report Date Ranges
 */
export const REPORT_DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
} as const

export const REPORT_DATE_RANGE_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_quarter: 'This Quarter',
  this_year: 'This Year',
  custom: 'Custom Range',
}

/**
 * Animation Durations (in ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

/**
 * Toast Durations (in ms)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 4000,
  LONG: 6000,
} as const

/**
 * Validation Rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?1?\d{9,15}$/,
  ZIP_REGEX: /^\d{5}(-\d{4})?$/,
  MIN_PASSWORD_LENGTH: 8,
  MIN_CUSTOMER_NAME_LENGTH: 2,
  MAX_CUSTOMER_NAME_LENGTH: 100,
  MAX_NOTES_LENGTH: 5000,
} as const

/**
 * Default Values
 */
export const DEFAULTS = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'America/New_York',
  QUOTE_EXPIRY_DAYS: 30,
  JOB_DEFAULT_LEAD_TIME_DAYS: 14,
} as const
