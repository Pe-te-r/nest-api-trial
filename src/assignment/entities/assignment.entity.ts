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
  OneToMany,
} from 'typeorm'

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Driver, (driver) => driver.assignments)
  driver: Driver

  @OneToMany(() => OrderItem, (orderItem) => orderItem.assignment)
  orderItems: OrderItem[];

  @Column({ type: 'varchar' })
  batchGroupId: string; 

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACCEPTED,
  })
  status: AssignmentStatus

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
