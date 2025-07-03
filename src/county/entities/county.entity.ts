import { Constituency } from 'src/constituency/entities/constituency.entity'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

@Entity()
export class County {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  county_code: string

  @Column({ unique: true })
  county_name: string

  @Column({ nullable: true, length: 10 })
  county_initials: string

  @OneToMany(() => Constituency, (constituency) => constituency.county)
  constituencies: Constituency[]
}
