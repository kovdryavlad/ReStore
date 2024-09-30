export interface Basket {
    id: number
    buyerId: string
    items: BasketItem[]
  }
  
  export interface BasketItem {
    id: number
    name: string
    productId: number
    price: number
    pictureUrl: string
    brand: string
    type: string
    quantity: number
  }
  