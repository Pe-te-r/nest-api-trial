import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { Store } from 'src/stores/entities/store.entity'

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

  @Column({ nullable: true })
  public_id: string

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
  @ManyToOne(() => Store, (store) => store.products, {
    onDelete: 'CASCADE',
  })
  store: Store
}
