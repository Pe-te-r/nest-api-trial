import { Category } from 'src/category/entities/category.entity'
import { Product } from 'src/products/entities/product.entity'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  category: Category

  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[]
}
