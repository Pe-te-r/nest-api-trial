import { County } from 'src/county/entities/county.entity'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'

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
}
