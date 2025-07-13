// src/customers/entities/customer.entity.ts
import { Order } from 'src/orders/entities/order.entity'
import { User } from 'src/users/entities/user.entity'
import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm'

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[]
}
