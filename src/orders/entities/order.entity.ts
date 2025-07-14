// src/order-items/entities/order-item.entity.ts
import { Product } from 'src/products/entities/product.entity'
// src/orders/entities/order.entity.ts
import { Customer } from 'src/customers/entities/customer.entity'
import { OrderStatus } from 'src/types/types'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import { Store } from 'src/stores/entities/store.entity'
import { PickStation } from 'src/pick_station/entities/pick_station.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer

  @ManyToOne(() => PickStation, (station) => station.orders)
  pickStation: PickStation

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  @Column({ type: 'timestamp', nullable: true })
  scheduledPickupTime: Date

  @Column({ type: 'text', nullable: true })
  specialInstructions: string

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Calculated fields (not stored in DB)
  get itemCount(): number {
    return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  get vendors(): Store[] {
    if (!this.items) return []
    return [...new Set(this.items.map((item) => item.vendor))]
  }

  // get itemsByVendor(): { [vendorId: string]: OrderItem[] } {
  //   if (!this.items) return {}
  //   return this.items.reduce((acc, item) => {
  //     const vendorId = item.vendor.id
  //     if (!acc[vendorId]) acc[vendorId] = []
  //     acc[vendorId].push(item)
  //     return acc
  //   }, {})
  // }
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Store

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedVariant: string

  @Column({ type: 'text', nullable: true })
  specialRequest: string

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  itemStatus: OrderStatus // Individual item status

  @OneToOne(() => Assignment, (assignment) => assignment.orderItem, { cascade: true })
  assignment: Assignment

  // Calculated field (not stored in DB)
  get totalPrice(): number {
    return this.priceAtPurchase * this.quantity
  }
}
