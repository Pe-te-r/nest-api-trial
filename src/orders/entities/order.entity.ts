import { PickStation } from 'src/pick_station/entities/pick_station.entity'
import { Product } from 'src/products/entities/product.entity'
import { OrderStatus } from 'src/types/types'
import { User } from 'src/user/entities/user.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (customer) => customer.orders)
  customer: User

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

  // Calculated field (not stored in DB)
  get itemCount(): number {
    return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }
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

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedVariant: string

  @Column({ type: 'text', nullable: true })
  specialRequest: string

  // Calculated field (not stored in DB)
  get totalPrice(): number {
    return this.priceAtPurchase * this.quantity
  }
}
