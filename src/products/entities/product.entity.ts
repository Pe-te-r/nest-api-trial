import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { User } from 'src/user/entities/user.entity'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column('decimal', { precision: 10, scale: 2 })
  price: number

  @Column({ type: 'int', default: 0 })
  stock: number

  @Column({ nullable: true })
  imageUrl: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  //  Relation: many products to one subcategory
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, {
    onDelete: 'SET NULL',
  })
  subCategory: SubCategory

  //  Relation: many products to one user (who added/owns it)
  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  createdBy: User
}
