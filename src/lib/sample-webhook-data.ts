import { WebhookEvent, SupplierSource, WebhookEventType, WebhookStatus } from './webhook-types'

const EVENT_TYPES: WebhookEventType[] = [
  'inventory.updated',
  'inventory.low_stock',
  'inventory.out_of_stock',
  'inventory.restocked',
  'product.updated',
  'product.discontinued',
  'pricing.updated',
]

const SUPPLIERS: SupplierSource[] = ['ssactivewear', 'sanmar', 'manual']

function randomDate(daysAgo: number): string {
  const now = Date.now()
  const randomTime = now - (Math.random() * daysAgo * 24 * 60 * 60 * 1000)
  return new Date(randomTime).toISOString()
}

function randomStatus(): WebhookStatus {
  const rand = Math.random()
  if (rand > 0.95) return 'failed'
  if (rand > 0.90) return 'retrying'
  if (rand > 0.85) return 'processing'
  if (rand > 0.80) return 'pending'
  return 'completed'
}

function generateMockProduct() {
  const styles = [
    { id: 'G500', name: 'Gildan 5000 Heavy Cotton T-Shirt', brand: 'Gildan' },
    { id: 'PC61', name: 'Port & Company Essential T-Shirt', brand: 'Port & Company' },
    { id: '18500', name: 'Gildan Heavy Blend Hooded Sweatshirt', brand: 'Gildan' },
    { id: 'PC54', name: 'Port & Company Core Cotton Tee', brand: 'Port & Company' },
    { id: 'ST350', name: 'Sport-Tek PosiCharge Tee', brand: 'Sport-Tek' },
  ]
  
  const colors = [
    { id: '1', name: 'Black', code: '#000000' },
    { id: '12', name: 'Navy', code: '#000080' },
    { id: '23', name: 'Red', code: '#FF0000' },
    { id: '45', name: 'White', code: '#FFFFFF' },
    { id: '67', name: 'Royal Blue', code: '#4169E1' },
  ]
  
  const sizes = ['S', 'M', 'L', 'XL', '2XL']
  
  const style = styles[Math.floor(Math.random() * styles.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  
  return {
    sku: `${style.id}-${color.name.toUpperCase()}-${sizes[Math.floor(Math.random() * sizes.length)]}`,
    styleId: style.id,
    styleName: style.name,
    brandName: style.brand,
    colorId: color.id,
    colorName: color.name,
    colorCode: color.code,
    sizeUpdates: sizes.map(size => ({
      sizeId: size,
      sizeName: size,
      previousQuantity: Math.floor(Math.random() * 200),
      currentQuantity: Math.floor(Math.random() * 150),
      timestamp: new Date().toISOString(),
    })),
    priceUpdate: Math.random() > 0.8 ? Math.random() * 20 + 5 : undefined,
    discontinued: Math.random() > 0.95,
  }
}

export function generateSampleWebhookEvents(count: number, daysBack: number = 30): WebhookEvent[] {
  const events: WebhookEvent[] = []
  
  for (let i = 0; i < count; i++) {
    const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)]
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
    const status = randomStatus()
    const receivedAt = randomDate(daysBack)
    const receivedTime = new Date(receivedAt).getTime()
    
    const processingTime = Math.random() * 3000 + 200
    const processedAt = status === 'completed' || status === 'failed'
      ? new Date(receivedTime + processingTime).toISOString()
      : undefined
    
    const event: WebhookEvent = {
      id: `webhook_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      source: supplier,
      eventType,
      payload: {
        products: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, generateMockProduct),
        timestamp: receivedAt,
        batchId: `batch_${Math.random().toString(36).substr(2, 9)}`,
      },
      status,
      receivedAt,
      processedAt,
      retryCount: status === 'retrying' ? Math.floor(Math.random() * 3) + 1 : 0,
      error: status === 'failed' ? `Processing error: ${['Timeout', 'Invalid payload', 'Network error'][Math.floor(Math.random() * 3)]}` : undefined,
    }
    
    events.push(event)
  }
  
  return events.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
}

export function generateRealisticWebhookScenario(): WebhookEvent[] {
  const events: WebhookEvent[] = []
  
  const ssActiveWearEvents = Math.floor(Math.random() * 50) + 100
  for (let i = 0; i < ssActiveWearEvents; i++) {
    const receivedAt = randomDate(7)
    const status = Math.random() > 0.98 ? 'failed' : 'completed'
    const receivedTime = new Date(receivedAt).getTime()
    const processingTime = Math.random() * 800 + 150
    
    events.push({
      id: `webhook_ss_${i}`,
      source: 'ssactivewear',
      eventType: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      payload: {
        products: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, generateMockProduct),
        timestamp: receivedAt,
        batchId: `batch_ss_${i}`,
      },
      status,
      receivedAt,
      processedAt: new Date(receivedTime + processingTime).toISOString(),
      retryCount: 0,
      error: status === 'failed' ? 'API timeout' : undefined,
    })
  }
  
  const sanmarEvents = Math.floor(Math.random() * 40) + 80
  for (let i = 0; i < sanmarEvents; i++) {
    const receivedAt = randomDate(7)
    const status = Math.random() > 0.96 ? 'failed' : 'completed'
    const receivedTime = new Date(receivedAt).getTime()
    const processingTime = Math.random() * 1200 + 200
    
    events.push({
      id: `webhook_sm_${i}`,
      source: 'sanmar',
      eventType: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      payload: {
        products: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, generateMockProduct),
        timestamp: receivedAt,
        batchId: `batch_sm_${i}`,
      },
      status,
      receivedAt,
      processedAt: new Date(receivedTime + processingTime).toISOString(),
      retryCount: 0,
      error: status === 'failed' ? 'Invalid response' : undefined,
    })
  }
  
  const manualEvents = Math.floor(Math.random() * 10) + 5
  for (let i = 0; i < manualEvents; i++) {
    const receivedAt = randomDate(7)
    const receivedTime = new Date(receivedAt).getTime()
    const processingTime = Math.random() * 500 + 100
    
    events.push({
      id: `webhook_manual_${i}`,
      source: 'manual',
      eventType: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      payload: {
        products: [generateMockProduct()],
        timestamp: receivedAt,
        batchId: `batch_manual_${i}`,
      },
      status: 'completed',
      receivedAt,
      processedAt: new Date(receivedTime + processingTime).toISOString(),
      retryCount: 0,
    })
  }
  
  return events.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
}
