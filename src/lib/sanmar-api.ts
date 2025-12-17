export interface SanMarProduct {
  styleID: string
  productName: string
  brandName: string
  categoryName: string
  colors: SanMarColor[]
  productImage?: string
}

export interface SanMarColor {
  colorID: string
  colorName: string
  colorCode: string
  sizes: SanMarSize[]
  colorImage?: string
}

export interface SanMarSize {
  sizeName: string
  inventory: number
  casePrice: number
  piecePrice: number
}

export interface SanMarCredentials {
  customerId: string
  apiKey: string
}

class SanMarAPIService {
  private baseUrl = 'https://www.sanmar.com/api/v2'
  private credentials: SanMarCredentials | null = null

  setCredentials(credentials: SanMarCredentials) {
    this.credentials = credentials
  }

  hasCredentials(): boolean {
    return this.credentials !== null && 
           this.credentials.customerId !== '' && 
           this.credentials.apiKey !== ''
  }

  private getAuthHeader(): string {
    if (!this.credentials) {
      throw new Error('API credentials not set')
    }
    const auth = btoa(`${this.credentials.customerId}:${this.credentials.apiKey}`)
    return `Basic ${auth}`
  }

  async getProductByStyle(styleID: string): Promise<SanMarProduct | null> {
    if (!this.hasCredentials()) {
      throw new Error('API credentials not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/products/${encodeURIComponent(styleID)}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API credentials')
        }
        if (response.status === 404) {
          return null
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return this.transformProductData(data)
    } catch (error) {
      console.error('SanMar API error:', error)
      throw error
    }
  }

  async searchProducts(query: string): Promise<SanMarProduct[]> {
    if (!this.hasCredentials()) {
      throw new Error('API credentials not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/products?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API credentials')
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data || !Array.isArray(data.Products)) {
        return []
      }

      return data.Products.map((product: any) => this.transformProductData(product))
    } catch (error) {
      console.error('SanMar API error:', error)
      throw error
    }
  }

  private transformProductData(data: any): SanMarProduct {
    const colors: SanMarColor[] = []
    
    if (data.Colors && Array.isArray(data.Colors)) {
      data.Colors.forEach((colorData: any) => {
        const sizes: SanMarSize[] = []
        
        if (colorData.Sizes && Array.isArray(colorData.Sizes)) {
          colorData.Sizes.forEach((sizeData: any) => {
            sizes.push({
              sizeName: sizeData.Size || sizeData.SizeName || '',
              inventory: sizeData.Inventory || sizeData.Qty || 0,
              casePrice: sizeData.CasePrice || 0,
              piecePrice: sizeData.PiecePrice || sizeData.Price || 0,
            })
          })
        }
        
        colors.push({
          colorID: colorData.ColorID || colorData.ColorCode || '',
          colorName: colorData.ColorName || '',
          colorCode: colorData.ColorCode || '',
          sizes,
          colorImage: colorData.ColorImage || colorData.FrontImage || undefined,
        })
      })
    }

    return {
      styleID: data.StyleID || data.ProductID || '',
      productName: data.ProductName || data.StyleName || '',
      brandName: data.BrandName || data.Brand || '',
      categoryName: data.CategoryName || data.Category || '',
      colors,
      productImage: data.ProductImage || data.StyleImage || undefined,
    }
  }
}

export const sanMarAPI = new SanMarAPIService()
