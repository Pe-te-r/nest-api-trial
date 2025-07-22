import { Constituency } from 'src/constituency/entities/constituency.entity'
import { Product } from 'src/products/entities/product.entity'
import { User } from 'src/user/entities/user.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  businessName: string

  @Column({ type: 'text', nullable: true })
  businessDescription: string

  @Column({ default: 'individual' })
  businessType: string // Could also be an enum

  @Column()
  businessContact: string

  @Column()
  streetAddress: string

  @Column({ default: false })
  termsAccepted: boolean

  @Column({ default: false })
  approved: boolean

  // One-to-one relationship with User
  @OneToOne(() => User, (user) => user.store)
  @JoinColumn()
  user: User

  // Many-to-one relationship with Constituency
  @ManyToOne(() => Constituency, (constituency) => constituency.stores)
  constituency: Constituency

  @OneToMany(() => Product, (product) => product.store)
  products: Product[]
}

