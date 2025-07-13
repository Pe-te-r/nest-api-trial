// src/assignments/entities/assignment.entity.ts
import { Order } from 'src/orders/entities/order.entity'
import { AssignmentStatus } from 'src/types/types'
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm'
import { Driver } from 'typeorm/browser'

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Driver, (driver) => driver.assignments)
  driver: Driver

  @ManyToOne(() => Order, (order) => order.assignments)
  order: Order

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
