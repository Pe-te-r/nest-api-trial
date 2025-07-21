// src/order-items/entities/order-item.entity.ts
import { Product } from 'src/products/entities/product.entity'
// src/orders/entities/order.entity.ts
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
import { User } from 'src/user/entities/user.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.orders)
  customer: User

  @ManyToOne(() => Constituency, (constituency) => constituency.orders, { nullable: true })
  constituency: Constituency | null

  @ManyToOne(() => PickStation, (station) => station.orders, { nullable: true })
  pickStation: PickStation | null

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  @Column({ type: 'text', nullable: true })
  specialInstructions: string

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true})
  items: OrderItem[]

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date

  @Column({ type: 'enum', enum: ['pickup', 'delivery'] })
  deliveryOption: 'pickup' | 'delivery'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deliveryFee: number

  @Column({ type: 'text', nullable: true })
  deliveryInstructions: string

  @Column({ type: 'enum', enum: ['mpesa', 'wallet'], default: 'mpesa' })
  paymentMethod: 'mpesa' | 'wallet'

  @Column({ type: 'varchar', nullable: true })
  paymentPhone: string

  get itemCount(): number {
    return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  get vendors(): Store[] {
    if (!this.items) return []
    return [...new Set(this.items.map((item) => item.vendor))]
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

  @Column({ type: 'varchar', nullable: true })
  batchGroupId: string

  // random code for each order item
  @Column({ type: 'varchar', nullable: true })
  randomCode: string

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Store

  @Column({ type: 'int' })
  quantity: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  itemStatus: OrderStatus

  @OneToOne(() => Assignment, (assignment) => assignment.orderItem, { cascade: true })
  assignment: Assignment
}
