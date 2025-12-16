import type { ProductType, Decoration, DecorationType } from './types'
import { generateId } from './data'

export interface ProductDecorationTemplate {
  productType: ProductType
  suggestedLocations: string[]
  sizeRestrictions: Record<string, { maxWidth: string; maxHeight: string; notes?: string }>
}

export const PRODUCT_DECORATION_TEMPLATES: Record<ProductType, ProductDecorationTemplate> = {
  'tshirt': {
    productType: 'tshirt',
    suggestedLocations: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Pocket'],
    sizeRestrictions: {
      'Front': { maxWidth: '12"', maxHeight: '16"', notes: 'Standard chest area' },
      'Back': { maxWidth: '14"', maxHeight: '18"', notes: 'Full back print area' },
      'Left Sleeve': { maxWidth: '3.5"', maxHeight: '4"', notes: 'Sleeve maximum' },
      'Right Sleeve': { maxWidth: '3.5"', maxHeight: '4"', notes: 'Sleeve maximum' },
      'Pocket': { maxWidth: '4"', maxHeight: '4"', notes: 'Left chest pocket area' },
    },
  },
  'hoodie': {
    productType: 'hoodie',
    suggestedLocations: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Hood'],
    sizeRestrictions: {
      'Front': { maxWidth: '12"', maxHeight: '16"', notes: 'Below hood/pocket area' },
      'Back': { maxWidth: '14"', maxHeight: '18"', notes: 'Full back print area' },
      'Left Sleeve': { maxWidth: '3.5"', maxHeight: '4"', notes: 'Sleeve maximum' },
      'Right Sleeve': { maxWidth: '3.5"', maxHeight: '4"', notes: 'Sleeve maximum' },
      'Hood': { maxWidth: '8"', maxHeight: '3"', notes: 'Hood interior/exterior' },
    },
  },
  'polo': {
    productType: 'polo',
    suggestedLocations: ['Left Chest', 'Right Chest', 'Back', 'Left Sleeve', 'Right Sleeve'],
    sizeRestrictions: {
      'Left Chest': { maxWidth: '4"', maxHeight: '4"', notes: 'Embroidery recommended' },
      'Right Chest': { maxWidth: '4"', maxHeight: '4"', notes: 'Embroidery recommended' },
      'Back': { maxWidth: '12"', maxHeight: '14"', notes: 'Full back area' },
      'Left Sleeve': { maxWidth: '3"', maxHeight: '3"', notes: 'Sleeve maximum' },
      'Right Sleeve': { maxWidth: '3"', maxHeight: '3"', notes: 'Sleeve maximum' },
    },
  },
  'hat': {
    productType: 'hat',
    suggestedLocations: ['Front Panel', 'Back Panel', 'Left Side', 'Right Side', 'Brim'],
    sizeRestrictions: {
      'Front Panel': { maxWidth: '4"', maxHeight: '2.5"', notes: 'Cap panel standard' },
      'Back Panel': { maxWidth: '4"', maxHeight: '2.5"', notes: 'Back embroidery area' },
      'Left Side': { maxWidth: '2.5"', maxHeight: '2"', notes: 'Side panel' },
      'Right Side': { maxWidth: '2.5"', maxHeight: '2"', notes: 'Side panel' },
      'Brim': { maxWidth: '3"', maxHeight: '1"', notes: 'Brim underside only' },
    },
  },
  'other': {
    productType: 'other',
    suggestedLocations: ['Front', 'Back', 'Left', 'Right', 'Custom'],
    sizeRestrictions: {
      'Front': { maxWidth: '12"', maxHeight: '16"', notes: 'Standard area' },
      'Back': { maxWidth: '12"', maxHeight: '16"', notes: 'Standard area' },
      'Left': { maxWidth: '4"', maxHeight: '4"', notes: 'Standard area' },
      'Right': { maxWidth: '4"', maxHeight: '4"', notes: 'Standard area' },
      'Custom': { maxWidth: 'Custom', maxHeight: 'Custom', notes: 'Specify dimensions' },
    },
  },
}

export function getProductTemplate(productType: ProductType): ProductDecorationTemplate {
  return PRODUCT_DECORATION_TEMPLATES[productType] || PRODUCT_DECORATION_TEMPLATES['other']
}

export function getSizeRestriction(productType: ProductType, location: string): { maxWidth: string; maxHeight: string; notes?: string } | null {
  const template = getProductTemplate(productType)
  return template.sizeRestrictions[location] || null
}

export function validateImprintSize(
  productType: ProductType,
  location: string,
  imprintSize: string
): { valid: boolean; warning?: string } {
  const restriction = getSizeRestriction(productType, location)
  if (!restriction) return { valid: true }

  const match = imprintSize.match(/([\d.]+)"?\s*[x×]\s*([\d.]+)"?/)
  if (!match) return { valid: true }

  const [, widthStr, heightStr] = match
  const width = parseFloat(widthStr)
  const height = parseFloat(heightStr)

  const maxWidth = parseFloat(restriction.maxWidth)
  const maxHeight = parseFloat(restriction.maxHeight)

  if (isNaN(maxWidth) || isNaN(maxHeight)) return { valid: true }

  if (width > maxWidth || height > maxHeight) {
    return {
      valid: false,
      warning: `Size ${imprintSize} exceeds maximum for ${location} on ${productType}. Max: ${restriction.maxWidth} × ${restriction.maxHeight}`,
    }
  }

  return { valid: true }
}

export interface CustomerDecorationTemplate {
  id: string
  customerId: string
  name: string
  description?: string
  decorations: Omit<Decoration, 'id'>[]
  createdAt: string
}

export function createCustomerTemplate(
  customerId: string,
  name: string,
  decorations: Decoration[],
  description?: string
): CustomerDecorationTemplate {
  return {
    id: generateId('tmpl'),
    customerId,
    name,
    description,
    decorations: decorations.map(d => {
      const { id, ...rest } = d
      return rest
    }),
    createdAt: new Date().toISOString(),
  }
}
