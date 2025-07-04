import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @OneToMany(() => SubCategory, (sub) => sub.category)
  subcategories: SubCategory[]
}
