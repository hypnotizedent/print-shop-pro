import { 
  WebhookEvent, 
  WebhookPayload, 
  ProductInventoryUpdate,
  InventorySnapshot,
  WebhookNotification,
  InventoryAlert,
  SupplierSource,
  WebhookEventType 
} from './webhook-types'

export class WebhookProcessor {
  private inventoryStore: Map<string, InventorySnapshot> = new Map()
  
  private generateInventoryKey(
    supplier: SupplierSource, 
    styleId: string, 
    colorId: string, 
    sizeId: string
  ): string {
    return `${supplier}:${styleId}:${colorId}:${sizeId}`
  }

  async processWebhookEvent(
    event: WebhookEvent,
    onNotification?: (notification: WebhookNotification) => void,
    onAlert?: (alert: InventoryAlert) => void
  ): Promise<{ success: boolean; notifications: WebhookNotification[]; alerts: InventoryAlert[] }> {
    const notifications: WebhookNotification[] = []
    const alerts: InventoryAlert[] = []

    try {
      const payload = event.payload

      for (const product of payload.products) {
        const productNotifications = await this.processProductUpdate(
          event.source,
          product,
          event.eventType
        )

        notifications.push(...productNotifications)

        const productAlerts = await this.generateAlerts(
          event.source,
          product
        )

        alerts.push(...productAlerts)
      }

      if (onNotification) {
        notifications.forEach(n => onNotification(n))
      }

      if (onAlert) {
        alerts.forEach(a => onAlert(a))
      }

      return { success: true, notifications, alerts }
    } catch (error) {
      console.error('Error processing webhook event:', error)
      return { success: false, notifications, alerts }
    }
  }

  private async processProductUpdate(
    supplier: SupplierSource,
    product: ProductInventoryUpdate,
    eventType: WebhookEventType
  ): Promise<WebhookNotification[]> {
    const notifications: WebhookNotification[] = []

    if (product.discontinued) {
      notifications.push(this.createNotification(
        'discontinued',
        `Product Discontinued`,
        `${product.styleName} (${product.colorName}) has been discontinued by ${supplier.toUpperCase()}`,
        'error',
        product.sku,
        product.styleName
      ))
    }

    if (product.priceUpdate !== undefined) {
      notifications.push(this.createNotification(
        'price_change',
        `Price Change`,
        `${product.styleName} (${product.colorName}) price updated to $${product.priceUpdate.toFixed(2)}`,
        'info',
        product.sku,
        product.styleName
      ))
    }

    for (const sizeUpdate of product.sizeUpdates) {
      const key = this.generateInventoryKey(
        supplier,
        product.styleId,
        product.colorId,
        sizeUpdate.sizeId
      )

      const previous = this.inventoryStore.get(key)

      const snapshot: InventorySnapshot = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sku: product.sku,
        styleId: product.styleId,
        colorId: product.colorId,
        sizeId: sizeUpdate.sizeId,
        quantity: sizeUpdate.currentQuantity,
        price: product.priceUpdate || previous?.price || 0,
        supplier,
        updatedAt: sizeUpdate.timestamp,
        lowStockThreshold: 10,
        isLowStock: sizeUpdate.currentQuantity > 0 && sizeUpdate.currentQuantity <= 10,
        isOutOfStock: sizeUpdate.currentQuantity === 0,
      }

      this.inventoryStore.set(key, snapshot)

      if (previous) {
        if (previous.quantity > 0 && snapshot.isOutOfStock) {
          notifications.push(this.createNotification(
            'out_of_stock',
            `Out of Stock`,
            `${product.styleName} - ${product.colorName} (${sizeUpdate.sizeName}) is now out of stock`,
            'warning',
            product.sku,
            product.styleName,
            { size: sizeUpdate.sizeName, color: product.colorName }
          ))
        } else if (previous.isOutOfStock && !snapshot.isOutOfStock) {
          notifications.push(this.createNotification(
            'restocked',
            `Restocked`,
            `${product.styleName} - ${product.colorName} (${sizeUpdate.sizeName}) is back in stock (${snapshot.quantity} available)`,
            'info',
            product.sku,
            product.styleName,
            { size: sizeUpdate.sizeName, color: product.colorName, quantity: snapshot.quantity }
          ))
        } else if (!previous.isLowStock && snapshot.isLowStock) {
          notifications.push(this.createNotification(
            'low_stock',
            `Low Stock Alert`,
            `${product.styleName} - ${product.colorName} (${sizeUpdate.sizeName}) is running low (${snapshot.quantity} remaining)`,
            'warning',
            product.sku,
            product.styleName,
            { size: sizeUpdate.sizeName, color: product.colorName, quantity: snapshot.quantity }
          ))
        }
      }
    }

    return notifications
  }

  private async generateAlerts(
    supplier: SupplierSource,
    product: ProductInventoryUpdate
  ): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = []

    for (const sizeUpdate of product.sizeUpdates) {
      const key = this.generateInventoryKey(
        supplier,
        product.styleId,
        product.colorId,
        sizeUpdate.sizeId
      )

      const snapshot = this.inventoryStore.get(key)

      if (!snapshot) continue

      if (snapshot.isOutOfStock) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sku: product.sku,
          styleName: product.styleName,
          colorName: product.colorName,
          sizeName: sizeUpdate.sizeName,
          alertType: 'out_of_stock',
          currentQuantity: 0,
          supplier,
          createdAt: new Date().toISOString(),
        })
      } else if (snapshot.isLowStock) {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sku: product.sku,
          styleName: product.styleName,
          colorName: product.colorName,
          sizeName: sizeUpdate.sizeName,
          alertType: 'low_stock',
          currentQuantity: snapshot.quantity,
          threshold: snapshot.lowStockThreshold,
          supplier,
          createdAt: new Date().toISOString(),
        })
      }
    }

    return alerts
  }

  private createNotification(
    type: WebhookNotification['type'],
    title: string,
    message: string,
    severity: WebhookNotification['severity'],
    productSku: string,
    productName: string,
    metadata?: Record<string, any>
  ): WebhookNotification {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId: `evt_${Date.now()}`,
      type,
      title,
      message,
      severity,
      productSku,
      productName,
      read: false,
      createdAt: new Date().toISOString(),
      metadata,
    }
  }

  getInventorySnapshot(
    supplier: SupplierSource,
    styleId: string,
    colorId: string,
    sizeId: string
  ): InventorySnapshot | undefined {
    const key = this.generateInventoryKey(supplier, styleId, colorId, sizeId)
    return this.inventoryStore.get(key)
  }

  getAllInventorySnapshots(): InventorySnapshot[] {
    return Array.from(this.inventoryStore.values())
  }

  clearInventoryCache() {
    this.inventoryStore.clear()
  }
}

export const webhookProcessor = new WebhookProcessor()

export function parseSSActivewearWebhook(rawPayload: any): WebhookPayload {
  const products: ProductInventoryUpdate[] = []

  if (Array.isArray(rawPayload.products)) {
    for (const item of rawPayload.products) {
      products.push({
        sku: item.styleID || item.sku,
        styleId: item.styleID,
        styleName: item.styleName,
        brandName: item.brandName,
        colorId: item.colorID?.toString(),
        colorName: item.colorName,
        colorCode: item.colorCode,
        sizeUpdates: (item.sizes || []).map((size: any) => ({
          sizeId: size.sizeID?.toString(),
          sizeName: size.sizeName,
          previousQuantity: size.previousQty,
          currentQuantity: size.qty || 0,
          priceChange: size.priceChange,
          timestamp: new Date().toISOString(),
        })),
        priceUpdate: item.priceUpdate,
        discontinued: item.discontinued || false,
      })
    }
  }

  return {
    products,
    timestamp: rawPayload.timestamp || new Date().toISOString(),
    batchId: rawPayload.batchId,
  }
}

export function parseSanMarWebhook(rawPayload: any): WebhookPayload {
  const products: ProductInventoryUpdate[] = []

  if (Array.isArray(rawPayload.items)) {
    for (const item of rawPayload.items) {
      products.push({
        sku: item.productKey || item.sku,
        styleId: item.productKey,
        styleName: item.productName,
        brandName: item.brandName || 'SanMar',
        colorId: item.colorId?.toString(),
        colorName: item.colorName,
        colorCode: item.colorCode,
        sizeUpdates: (item.inventory || []).map((inv: any) => ({
          sizeId: inv.sizeCode,
          sizeName: inv.sizeDescription,
          previousQuantity: inv.previousQuantity,
          currentQuantity: inv.quantity || 0,
          timestamp: new Date().toISOString(),
        })),
        priceUpdate: item.price,
        discontinued: item.status === 'discontinued',
      })
    }
  }

  return {
    products,
    timestamp: rawPayload.timestamp || new Date().toISOString(),
    batchId: rawPayload.batchId,
  }
}

export function generateMockWebhookEvent(supplier: SupplierSource): WebhookEvent {
  const payload: WebhookPayload = {
    products: [
      {
        sku: 'G500-NAVY-L',
        styleId: 'G500',
        styleName: 'Gildan 5000 Heavy Cotton T-Shirt',
        brandName: 'Gildan',
        colorId: '12',
        colorName: 'Navy',
        colorCode: '#000080',
        sizeUpdates: [
          {
            sizeId: 'L',
            sizeName: 'Large',
            previousQuantity: 150,
            currentQuantity: 45,
            timestamp: new Date().toISOString(),
          },
          {
            sizeId: 'XL',
            sizeName: 'X-Large',
            previousQuantity: 200,
            currentQuantity: 8,
            timestamp: new Date().toISOString(),
          },
        ],
      },
      {
        sku: 'PC61-BLACK-M',
        styleId: 'PC61',
        styleName: 'Port & Company Essential T-Shirt',
        brandName: 'Port & Company',
        colorId: '1',
        colorName: 'Black',
        colorCode: '#000000',
        sizeUpdates: [
          {
            sizeId: 'M',
            sizeName: 'Medium',
            previousQuantity: 100,
            currentQuantity: 0,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ],
    timestamp: new Date().toISOString(),
    batchId: `batch_${Date.now()}`,
  }

  return {
    id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source: supplier,
    eventType: 'inventory.updated',
    payload,
    status: 'pending',
    receivedAt: new Date().toISOString(),
    retryCount: 0,
  }
}
