export type WebhookEventType = 
  | 'inventory.updated'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'inventory.restocked'
  | 'product.updated'
  | 'product.discontinued'
  | 'pricing.updated'

export type WebhookStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'

export type SupplierSource = 'ssactivewear' | 'sanmar' | 'manual'

export interface WebhookEvent {
  id: string
  source: SupplierSource
  eventType: WebhookEventType
  payload: WebhookPayload
  status: WebhookStatus
  receivedAt: string
  processedAt?: string
  retryCount: number
  error?: string
  metadata?: Record<string, any>
}

export interface WebhookPayload {
  products: ProductInventoryUpdate[]
  timestamp: string
  batchId?: string
}

export interface ProductInventoryUpdate {
  sku: string
  styleId: string
  styleName: string
  brandName: string
  colorId: string
  colorName: string
  colorCode?: string
  sizeUpdates: SizeInventoryUpdate[]
  priceUpdate?: number
  discontinued?: boolean
}

export interface SizeInventoryUpdate {
  sizeId: string
  sizeName: string
  previousQuantity?: number
  currentQuantity: number
  priceChange?: number
  timestamp: string
}

export interface WebhookConfig {
  id: string
  name: string
  source: SupplierSource
  isActive: boolean
  endpointUrl?: string
  secret?: string
  events: WebhookEventType[]
  createdAt: string
  updatedAt: string
  lastTriggeredAt?: string
}

export interface InventorySnapshot {
  id: string
  sku: string
  styleId: string
  colorId: string
  sizeId: string
  quantity: number
  price: number
  supplier: SupplierSource
  updatedAt: string
  lowStockThreshold?: number
  isLowStock: boolean
  isOutOfStock: boolean
}

export interface WebhookNotification {
  id: string
  eventId: string
  type: 'low_stock' | 'out_of_stock' | 'restocked' | 'price_change' | 'discontinued'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  productSku: string
  productName: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export interface InventoryAlert {
  id: string
  sku: string
  styleName: string
  colorName: string
  sizeName: string
  alertType: 'low_stock' | 'out_of_stock' | 'restocked'
  currentQuantity: number
  threshold?: number
  supplier: SupplierSource
  affectedQuotes?: string[]
  affectedJobs?: string[]
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
}
