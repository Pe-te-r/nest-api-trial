import { County } from 'src/county/entities/county.entity'
import { PickStation } from 'src/pick_station/entities/pick_station.entity'
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

  @OneToMany(() => PickStation, (pickStation) => pickStation.constituency)
  pickStations: PickStation[]
}
