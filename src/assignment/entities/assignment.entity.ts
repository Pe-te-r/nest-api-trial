// src/assignments/entities/assignment.entity.ts
import { Driver } from 'src/driver/entities/driver.entity'
import { OrderItem } from 'src/orders/entities/order.entity'
import { AssignmentStatus } from 'src/types/types'
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm'

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Driver, (driver) => driver.assignments)
  driver: Driver

  @OneToOne(() => OrderItem, (orderItem) => orderItem.assignment)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PENDING,
  })
  status: AssignmentStatus

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
