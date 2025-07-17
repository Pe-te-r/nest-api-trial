export class CreateOrderItemDto {
  item_id: string
  quantity: number
  store_id: string
}

export class CreateOrderDeliveryDto {
  option: 'pickup' | 'delivery'
  fee: number
  instructions?: string
}

export class CreateOrderPaymentDto {
  method: 'mpesa' | 'wallet'
  phone?: string
}

export class CreateOrderDto {
  customer_id: string
  products: CreateOrderItemDto[]
  delivery: CreateOrderDeliveryDto
  payment: CreateOrderPaymentDto
  totalAmount: number
  subCounty: string;
}
