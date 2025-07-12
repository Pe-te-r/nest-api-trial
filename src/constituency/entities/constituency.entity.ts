import { County } from 'src/county/entities/county.entity'
import { Store } from 'src/stores/entities/store.entity'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'

@Entity()
export class Constituency {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToOne(() => County, (county) => county.constituencies, {
    onDelete: 'CASCADE',
  })
  county: County

  @OneToMany(() => Store, (store) => store.constituency)
  stores: Store[]
}
