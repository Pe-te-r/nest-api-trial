import { Constituency } from 'src/constituency/entities/constituency.entity'
import { Order } from 'src/orders/entities/order.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm'

@Entity('pick_stations')
export class PickStation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 20 })
  contactPhone: string

  @Column({ type: 'time' })
  openingTime: string // Format: 'HH:MM:SS'

  @Column({ type: 'time' })
  closingTime: string

  @OneToMany(() => Order, (order) => order.pickStation)
  orders: Order[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Constituency, (constituency) => constituency.pickStations)
  constituency: Constituency

  // Helper method to check if station is open (not stored in DB)
  isOpenNow(currentTime?: string): boolean {
    const now = currentTime || new Date().toTimeString().substring(0, 8)
    return now >= this.openingTime && now <= this.closingTime
  }
}
