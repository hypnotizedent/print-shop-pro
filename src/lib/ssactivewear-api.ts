export interface SSActivewearProduct {
  styleID: string
  styleName: string
  brandName: string
  categoryName: string
  colorCount: number
  colors: SSActivewearColor[]
  styleImage?: string
}

export interface SSActivewearColor {
  colorID: number
  colorName: string
  colorCode: string
  sizes: SSActivewearSize[]
  colorFrontImage?: string
  colorBackImage?: string
  colorSideImage?: string
}

export interface SSActivewearSize {
  sizeID: number
  sizeName: string
  qty: number
  price: number
}

export interface SSActivewearCredentials {
  accountNumber: string
  apiKey: string
}

class SSActivewearAPIService {
  private baseUrl = 'https://api.ssactivewear.com'
  private credentials: SSActivewearCredentials | null = null

  setCredentials(credentials: SSActivewearCredentials) {
    this.credentials = credentials
  }

  hasCredentials(): boolean {
    return this.credentials !== null && 
           this.credentials.accountNumber !== '' && 
           this.credentials.apiKey !== ''
  }

  private getAuthHeader(): string {
    if (!this.credentials) {
      throw new Error('API credentials not set')
    }
    const auth = btoa(`${this.credentials.accountNumber}:${this.credentials.apiKey}`)
    return `Basic ${auth}`
  }

  async getProductByStyle(styleID: string): Promise<SSActivewearProduct | null> {
    if (!this.hasCredentials()) {
      throw new Error('API credentials not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/v2/products/?style=${encodeURIComponent(styleID)}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API credentials')
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data || data.length === 0) {
        return null
      }

      return data[0] as SSActivewearProduct
    } catch (error) {
      console.error('SS Activewear API error:', error)
      throw error
    }
  }

  async searchProducts(query: string): Promise<SSActivewearProduct[]> {
    if (!this.hasCredentials()) {
      throw new Error('API credentials not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/v2/products/?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API credentials')
        }
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return (data || []) as SSActivewearProduct[]
    } catch (error) {
      console.error('SS Activewear API error:', error)
      throw error
    }
  }
}

export const ssActivewearAPI = new SSActivewearAPIService()
