import { Order } from 'src/orders/entities/order.entity'
import { User } from 'src/user/entities/user.entity'
import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

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
